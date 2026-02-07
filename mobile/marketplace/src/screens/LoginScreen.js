import React, { useState } from 'react'
import { View, Text, Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '../services/api'
import { useAuthStore } from '../store/useStore'
import { COLORS } from '../constants/theme'
import { NeonButton, GlassInput } from '../components/UI'
import useAlert from '../hooks/useAlert'
import CyberAlert from '../components/CyberAlert'

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const login = useAuthStore((state) => state.login)

    const {alertConfig, showAlert, closeAlert} = useAlert()

    const handleLogin = async () => {
        setLoading(true)
        try {
        const { data } = await api.post('/auth/login', { email, password })
        login(data.data, data.data.token) 
        } catch (error) {
        showAlert('Error', error.response?.data?.message || 'Login Failed', 'danger')
        } finally {
        setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
        <View style={styles.content}>
            <Text style={styles.title}>BION<Text style={{color: COLORS.primary}}>MARKET</Text></Text>
            <Text style={styles.subtitle}>Welcome back, binusian.</Text>
            
            <GlassInput placeholder="Email Address" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <GlassInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            
            <NeonButton title="LOGIN" onPress={handleLogin} loading={loading} />
            
            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
            New User? <Text style={{color: COLORS.primary}}>Create Account</Text>
            </Text>
        </View>

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
    container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' },
    content: { padding: 24 },
    title: { fontSize: 32, fontWeight: '900', color: COLORS.text, marginBottom: 5, letterSpacing: 2 },
    subtitle: { color: COLORS.textDim, marginBottom: 40, fontSize: 16 },
    link: { color: COLORS.textDim, marginTop: 20, textAlign: 'center' }
})