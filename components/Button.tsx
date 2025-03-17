import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const getButtonStyle = () => {
    let style = [styles.button];
    
    // Size
    if (size === 'small') style.push(styles.buttonSmall);
    if (size === 'large') style.push(styles.buttonLarge);
    
    // Variant
    if (variant === 'primary') style.push(styles.buttonPrimary);
    if (variant === 'secondary') style.push(styles.buttonSecondary);
    if (variant === 'outline') style.push(styles.buttonOutline);
    
    // Width
    if (fullWidth) style.push(styles.buttonFullWidth);
    
    // Disabled
    if (disabled || loading) style.push(styles.buttonDisabled);
    
    return style;
  };
  
  const getTextStyle = () => {
    let style = [styles.buttonText];
    
    // Size
    if (size === 'small') style.push(styles.buttonTextSmall);
    if (size === 'large') style.push(styles.buttonTextLarge);
    
    // Variant
    if (variant === 'primary') style.push(styles.buttonTextPrimary);
    if (variant === 'secondary') style.push(styles.buttonTextSecondary);
    if (variant === 'outline') style.push(styles.buttonTextOutline);
    
    // Disabled
    if (disabled || loading) style.push(styles.buttonTextDisabled);
    
    return style;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? colors.primary : '#fff'} 
          size="small" 
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextSmall: {
    fontSize: 14,
  },
  buttonTextLarge: {
    fontSize: 18,
  },
  buttonTextPrimary: {
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#fff',
  },
  buttonTextOutline: {
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: '#fff',
  },
});