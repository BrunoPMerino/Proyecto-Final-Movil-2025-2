import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const Header: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo/image 1.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Comida{"\n"}Sabana</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#001E60',
    lineHeight: 28,
    textAlign: 'left',
  },
});

export default Header;