import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LogoProps {
  size?: 'large' | 'small';
  color?: 'white' | 'navy';
}

const Logo: React.FC<LogoProps> = ({ size = 'large', color = 'white' }) => {
  const isLarge = size === 'large';
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.iconContainer, 
        { backgroundColor: color === 'white' ? 'white' : '#001E60' }
      ]}>
        <Ionicons 
          name="leaf-outline" 
          size={isLarge ? 40 : 24} 
          color={color === 'white' ? '#001E60' : 'white'} 
        />
      </View>
      <Text style={[
        styles.text, 
        { color: color, fontSize: isLarge ? 24 : 18 }
      ]}>
        Universidad de{'\n'}La Sabana
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default Logo;