import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export const CustomInput = ({ value, onChangeText, placeholder, secureTextEntry, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 55,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    flex: 1,
  },
});
