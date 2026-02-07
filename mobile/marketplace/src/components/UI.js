import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View, TextInput, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../constants/theme'

export const NeonButton = ({ title, onPress, loading, variant = 'primary', style, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={loading || disabled} style={[styles.btnContainer, disabled && styles.disabledBtn, style]}>
        <LinearGradient
        colors={
            
            disabled ? ['#555', '#333'] : 
            variant === 'primary' ? [COLORS.primary, '#0ea5e9'] : [COLORS.secondary, '#db2777']
        }
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.gradient}
        >
        {loading ? <ActivityIndicator color="#000" /> : 
            <Text style={styles.btnText}>{title}</Text>
        }
        </LinearGradient>
    </TouchableOpacity>
)

export const GlassInput = ({ value, onChangeText, placeholder, secureTextEntry, ...props }) => (
    <View style={styles.inputContainer}>
        <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textDim}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        {...props}
        />
    </View>
)

const styles = StyleSheet.create({
    btnContainer: { width: '100%', borderRadius: 12, marginVertical: 10, shadowColor: COLORS.primary, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5 },
    gradient: { padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { color: '#000', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginVertical: 8,
    },
    disabledBtn: { shadowColor: 'none', elevation: 0 },
    input: { padding: 15, color: COLORS.text, fontSize: 16 },
})