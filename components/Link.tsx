import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface LinkProps {
  title: string;
  onPress: () => void;
  align?: 'left' | 'center' | 'right';
  size?: 'small' | 'medium';
}

const Link: React.FC<LinkProps> = ({ title, onPress, align = 'left', size = 'medium' }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.container,
        align === 'center' && styles.center,
        align === 'right' && styles.right
      ]}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text,
        size === 'small' && styles.smallText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  center: {
    alignItems: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  text: {
    color: '#001E60',
    fontSize: 14,
    fontWeight: '500',
  },
  smallText: {
    fontSize: 12,
  },
});

export default Link;