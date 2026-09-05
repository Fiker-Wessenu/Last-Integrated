import React from 'react';
import { Text, StyleSheet } from 'react-native';

const Typography = ({ children, style, ...props }) => {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default Typography;