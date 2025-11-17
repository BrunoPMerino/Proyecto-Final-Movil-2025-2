# 🎨 Estructura de la Aplicación - Comida Sabana

## 📁 Estructura de Carpetas

```
ComidaSabanaApp/
├── app/
│   ├── (auth)/                    # Stack de autenticación
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── reset.tsx
│   │   └── splashScreen.tsx
│   ├── (main)/                    # Tabs del flujo principal
│   │   ├── _layout.tsx            # Tabs (Home, Historial, etc.)
│   │   ├── home.tsx
│   │   ├── historial.tsx
│   │   ├── carrito.tsx
│   │   ├── mapa.tsx
│   │   ├── chatbot.tsx
│   │   └── perfil.tsx
│   ├── screens/                   # ✨ NUEVAS PANTALLAS
│   │   ├── tabs/
│   │   │   ├── HomeCatalogoScreen.tsx    # Home con grid de productos
│   │   │   ├── HistorialScreen.tsx       # Historial de pedidos
│   │   │   ├── CarritoScreen.tsx         # Carrito de compras
│   │   │   ├── MapaScreen.tsx            # Mapa de sucursales
│   │   │   ├── ChatbotScreen.tsx         # Chatbot
│   │   │   └── PerfilScreen.tsx          # Perfil + QR Room link
│   │   ├── modals/
│   │   │   └── ProductDetailsScreen.tsx  # Modal de producto
│   │   └── QRRoomScreen.tsx              # QR Room (pantalla completa)
│   ├── product-modal.tsx          # Modal del detalle de producto
│   ├── qr-room.tsx                # Modal del QR Room
│   ├── index.tsx                  # Entry point
│   └── _layout.tsx                # Root layout (Expo Router Stack)
│
├── components/
│   ├── common/                    # Componentes reutilizables
│   │   ├── TabBar.tsx             # (opcional) Custom tab bar
│   │   └── SafeAreaView.tsx       # (opcional) Safe area wrapper
│   ├── tabs/                      # Componentes específicos de tabs
│   ├── modals/                    # Componentes de modales
│   ├── Header.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Link.tsx
│
├── contexts/
│   ├── AuthContext.tsx
│   └── DataContext.tsx
│
├── api/
│   ├── productsApi.ts
│   ├── ordersApi.ts
│   └── storageApi.ts
│
├── utils/
│   ├── supabase.ts
│   ├── auth.ts
│   ├── tokenStorage.ts
│   └── secureStorage.ts
│
└── assets/
    └── images/
        └── logo/
```

## 🗺️ Navegación (Expo Router)

- `app/_layout.tsx` define el stack raíz:
  - `"(auth)"` grupo para login/register/reset/splash
  - `"(main)"` grupo con los 6 tabs
  - `"product-modal"` modal transparente para `ProductDetailsScreen`
  - `"qr-room"` modal tipo pantalla completa

- `app/(main)/_layout.tsx` levanta las tabs con íconos personalizados y respeta los safe areas del dispositivo.

### Tabs disponibiliades

1. `/(main)/home` → `HomeCatalogoScreen`
2. `/(main)/historial` → `HistorialScreen`
3. `/(main)/carrito` → `CarritoScreen`
4. `/(main)/mapa` → `MapaScreen`
5. `/(main)/chatbot` → `ChatbotScreen`
6. `/(main)/perfil` → `PerfilScreen`

### Modales

- `/product-modal`: detalle de producto (modal bottom sheet).
- `/qr-room`: pantalla QR accesible desde Home o Perfil.

## 🎯 Cómo Navegar

```tsx
import { useRouter } from "expo-router";

const router = useRouter();

// Home → Product modal
router.push({
  pathname: "/product-modal",
  params: { productId: product.id, productName: product.name },
});

// Perfil → QR Room
router.push("/qr-room");

// Volver
router.back();
```

## 🔄 Flujo de Autenticación

```
SplashScreen → Login/Register → /(main)/home (Tabs)
                    ↑
                   Reset
```

## 📦 Estados Globales

- **AuthContext**: Autenticación del usuario
- **DataContext**: Productos, sucursales, etc.

## 🚀 Próximas Implementaciones

- [ ] Carrito de compras (estado global + persistence)
- [ ] Historial de pedidos (fetch desde API)
- [ ] Mapa interactivo
- [ ] Chatbot integrado
- [ ] Sistema de reviews
- [ ] Métodos de pago
