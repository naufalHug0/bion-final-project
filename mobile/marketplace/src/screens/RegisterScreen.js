import React, { useState } from 'react'
import { View, Text, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../services/api' 
import { COLORS } from '../constants/theme'
import { NeonButton, GlassInput } from '../components/UI'
import CyberAlert from '../components/CyberAlert'
import useAlert from '../hooks/useAlert'

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const {alertConfig, showAlert, closeAlert} = useAlert()

    const handleRegister = async () => {
        if (!name || !email || !password) {
        showAlert('Missing Data', 'Please fill in all fields to proceed.', 'danger')
        return
        }

        setLoading(true)
        try {
        const response = await api.post('/auth/register', {
            name,
            email,
            password,
        })

        if (response.status === 200 || response.status === 201) {
            showAlert(
                'Success', 
                'Account created successfully. Redirecting to login.', 
                'success', 
                () => navigation.navigate('Login') 
            )
        }
        } catch (error) {
        const msg = error.response?.data?.message || 'Registration failed'
        showAlert('Error', msg, 'danger')
        } finally {
        setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>NEW <Text style={{color: COLORS.primary}}>ACCOUNT</Text></Text>
                    <Text style={styles.subtitle}>Join the market.</Text>
                </View>
                
                <View style={styles.form}>
                    <GlassInput 
                        placeholder="Full Name" 
                        value={name} 
                        onChangeText={setName} 
                        icon="person"
                    />
                    <GlassInput 
                        placeholder="Email Address" 
                        value={email} 
                        onChangeText={setEmail} 
                        autoCapitalize="none" 
                        keyboardType="email-address"
                    />
                    <GlassInput 
                        placeholder="Password" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry 
                    />
                    
                    <View style={{ marginTop: 20 }}>
                        <NeonButton 
                            title="CREATE ACCOUNT" 
                            onPress={handleRegister} 
                            loading={loading}
                        />
                    </View>

                    <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                    Already have an account? <Text style={{color: COLORS.primary}}>Login</Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>

        <CyberAlert
            visible={alertConfig.visible}
            title={alertConfig.title}
            message={alertConfig.message}
            type={alertConfig.type}
            onClose={closeAlert}
            onConfirm={closeAlert} 
        />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    header: { marginBottom: 40, alignItems: 'center' },
    title: { fontSize: 36, fontWeight: '900', color: COLORS.text, letterSpacing: 2 },
    subtitle: { color: COLORS.textDim, fontSize: 16, marginTop: 5, letterSpacing: 1 },
    form: { width: '100%' },
    link: { color: COLORS.textDim, marginTop: 25, textAlign: 'center', fontSize: 14 }
})