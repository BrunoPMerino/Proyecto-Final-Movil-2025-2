import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getAllProducts } from "../../../api/productsApi";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../utils/supabase";

// Tipos
interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  created_at: string;
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

const CACHE_KEY = "chat_history_cache";

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [menuContext, setMenuContext] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Cargar mensajes y menú al iniciar
  useEffect(() => {
    loadMessages();
    loadMenuContext();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadMenuContext = async () => {
    try {
      const products = await getAllProducts();
      if (products) {
        const context = products
          .map(
            (p: any) =>
              `- ${p.name}: $${p.price} (${p.description || "Sin descripción"})`
          )
          .join("\n");
        setMenuContext(context);
      }
    } catch (error) {
      console.error("Error loading menu context:", error);
    }
  };

  const loadMessages = async () => {
    try {
      // 1. Cargar de caché primero para velocidad
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setMessages(JSON.parse(cached));
      }

      // 2. Cargar de Supabase y actualizar
      if (user) {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data) {
          setMessages(data);
          // Actualizar caché
          await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const saveMessage = async (message: Omit<ChatMessage, "id">) => {
    try {
      if (!user) return;

      // Guardar en Supabase
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role: message.role,
          content: message.content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      return null;
    }
  };

  const handleClearMessages = () => {
    Alert.alert(
      "Borrar historial",
      "¿Estás seguro de que quieres borrar todo el historial de chat? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              if (user) {
                // Borrar de Supabase
                const { error } = await supabase
                  .from("chat_messages")
                  .delete()
                  .eq("user_id", user.id);

                if (error) throw error;
              }

              // Borrar localmente y de caché
              setMessages([]);
              await AsyncStorage.removeItem(CACHE_KEY);
            } catch (error) {
              console.error("Error clearing messages:", error);
              Alert.alert("Error", "No se pudo borrar el historial.");
            }
          },
        },
      ]
    );
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText("");
    setIsLoading(true);

    // 1. Agregar mensaje del usuario localmente
    const tempUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      created_at: new Date().toISOString(),
    };

    const newMessages = [...messages, tempUserMsg];
    setMessages(newMessages);
    
    // Guardar usuario en DB asíncronamente
    saveMessage(tempUserMsg);

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("API Key is missing!");
        throw new Error("API Key is missing");
      }

      // Construir el prompt con contexto del menú
      const systemInstruction = `Eres un asistente virtual amable para la app "ComidaSabanaApp". 
      Tu objetivo principal es ayudar a los usuarios y recomendar platos del menú.
      
      Aquí está el MENÚ ACTUAL:
      ${menuContext}
      
      Instrucciones:
      1. Responde de manera concisa y amigable.
      2. Si el usuario pide recomendaciones, usa el menú proporcionado.
      3. Si no sabes algo, dilo honestamente.
      4. Usa emojis ocasionalmente para ser amigable.
      5. Usa formato Markdown para resaltar platos (negrita) o hacer listas.
      `;

      const fullPrompt = `${systemInstruction}\n\nUsuario: ${userText}`;

      // 2. Llamar a Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: fullPrompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      // console.log("Gemini Response:", JSON.stringify(data, null, 2));

      if (data.error) {
        throw new Error(data.error.message || "API Error");
      }
      
      if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
        throw new Error("Invalid response structure from Gemini");
      }

      const aiText = data.candidates[0].content.parts[0].text;

      // 3. Agregar respuesta de IA
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: aiText,
        created_at: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
      
      // Guardar IA en DB y actualizar caché
      await saveMessage(aiMsg);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(updatedMessages));

    } catch (error) {
      console.error("Error calling Gemini:", error);
      // Opcional: Mostrar mensaje de error en el chat
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#4facfe", "#00f2fe"]}
              style={styles.avatar}
            >
              <Ionicons name="sparkles" size={16} color="white" />
            </LinearGradient>
          </View>
        )}
        <LinearGradient
          colors={
            isUser ? ["#001E60", "#003399"] : ["#ffffff", "#f8f9fa"]
          }
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          {isUser ? (
            <Text style={[styles.messageText, styles.userText]}>
              {item.content}
            </Text>
          ) : (
            <Markdown
              style={{
                body: { color: "#333", fontSize: 15, lineHeight: 22 },
                strong: { fontWeight: "bold", color: "#001E60" },
                link: { color: "#00f2fe" },
              }}
            >
              {item.content}
            </Markdown>
          )}
        </LinearGradient>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <LinearGradient
        colors={["#f5f7fa", "#c3cfe2"]}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Asistente Virtual</Text>
        <TouchableOpacity onPress={handleClearMessages} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </Animated.View>

      {/* Input Area */}
      <View style={[styles.inputContainer]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu pregunta..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#001E60",
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "85%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
    justifyContent: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: "white",
  },
  aiText: {
    color: "#333",
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    maxHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "center",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#001E60",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
});
