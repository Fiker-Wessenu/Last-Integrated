import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { TYPOGRAPHY } from '../constants/Typography';
import { useTheme } from '../firebase/context/ThemeContext';

const Typography = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const textColor = color || theme?.textPrimary || '#ffffff';

  const getStyles = () => {
    switch (variant) {
      case 'heading1':
        return styles.heading1;
      case 'heading2':
        return styles.heading2;
      case 'heading3':
        return styles.heading3;
      case 'body':
        return styles.body;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      default:
        return styles.body;
    }
  };

  return (
    <Text
      style={[
        getStyles(),
        { color: textColor, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading1: {
    fontSize: TYPOGRAPHY.sizes['4xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    lineHeight: TYPOGRAPHY.sizes['4xl'] * TYPOGRAPHY.lineHeights.tight,
  },
  heading2: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
    lineHeight: TYPOGRAPHY.sizes['3xl'] * TYPOGRAPHY.lineHeights.tight,
  },
  heading3: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    lineHeight: TYPOGRAPHY.sizes['2xl'] * TYPOGRAPHY.lineHeights.normal,
  },
  body: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.normal,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    lineHeight: TYPOGRAPHY.sizes.base * TYPOGRAPHY.lineHeights.normal,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.normal,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    lineHeight: TYPOGRAPHY.sizes.sm * TYPOGRAPHY.lineHeights.normal,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    letterSpacing: TYPOGRAPHY.letterSpacing.wider,
    textTransform: 'uppercase',
  },
});

export default Typography;
