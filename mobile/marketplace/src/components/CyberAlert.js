import React from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../constants/theme'
import { LinearGradient } from 'expo-linear-gradient'

export default function CyberAlert({ 
    visible, 
    title, 
    message, 
    onClose, 
    onConfirm, 
    type = 'info',
    confirmText = "CONFIRM",
    cancelText = "CANCEL"
}) {
    if (!visible) return null

    let headerColor = COLORS.primary
    let icon = '!'
    
    if (type === 'danger') {
        headerColor = COLORS.danger
        icon = 'X'
    } else if (type === 'success') {
        headerColor = COLORS.success
        icon = '✓'
    } else if (type === 'confirm') {
        headerColor = COLORS.secondary
        icon = '?'
    }

    return (
        <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        >
        <View style={styles.overlay}>
            <View style={styles.alertContainer}>
                <LinearGradient
                    colors={[headerColor, 'transparent']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={[styles.headerLine, { backgroundColor: headerColor }]} 
                />
                
                <View style={styles.content}>
                    <View style={[styles.iconBadge, { borderColor: headerColor }]}>
                        <Text style={[styles.iconText, { color: headerColor }]}>{icon}</Text>
                    </View>

                    <Text style={[styles.title, { color: headerColor }]}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity 
                            style={[styles.btn, styles.btnCancel, type === 'confirm' ? {} : { width: '100%' }]} 
                            onPress={onClose}
                        >
                            <Text style={styles.btnTextCancel}>
                                {type === 'confirm' ? cancelText : "Dismiss"}
                            </Text>
                        </TouchableOpacity>

                        {type === 'confirm' && (
                            <TouchableOpacity style={[styles.btn, styles.btnConfirm, { backgroundColor: headerColor }]} onPress={onConfirm}>
                                <Text style={styles.btnTextConfirm}>{confirmText}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)', 
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertContainer: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#1e293b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    headerLine: {
        height: 4,
        width: '100%',
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    iconBadge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    message: {
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
        fontSize: 15,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        gap: 10,
    },
    btn: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    btnCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#475569',
    },
    btnConfirm: {
        // Background handled by inline style
    },
    btnTextCancel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    btnTextConfirm: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
})