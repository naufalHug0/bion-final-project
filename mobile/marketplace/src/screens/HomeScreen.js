import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import api from '../services/api'
import { COLORS } from '../constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore, useCartStore } from '../store/useStore'
import useAlert from '../hooks/useAlert'
import CyberAlert from '../components/CyberAlert'
import { RefreshControl } from 'react-native-gesture-handler'

export default function HomeScreen({ navigation }) {
    const { logout } = useAuthStore()
    const {alertConfig, showAlert, closeAlert} = useAlert()


    const handleLogout = () => {
        showAlert(
            'Logout',
            'Are you sure you want to logout?',
            'confirm'
        )
    }

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const insets = useSafeAreaInsets() 

    const cartItems = useCartStore(state => state.cartItems)
    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data } = await api.get('/products')
            setProducts(data.data || [])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
        >
            <Image 
                source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL}/${item.image}` }} 
                style={styles.image} 
            />
            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.price}>Rp {item.price.toLocaleString()}</Text>
                    <View style={styles.rating}>
                        <Ionicons name="star" size={12} color={COLORS.warning} />
                        <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View>
                    <Text style={styles.headerTitle}>Products</Text>
                    <Text style={styles.headerSubtitle}>Welcome back, {useAuthStore.getState().user?.name || 'User'}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <TouchableOpacity 
                        style={styles.iconBtn} 
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Ionicons name="cart-outline" size={24} color={COLORS.text} />
                        
                        {cartCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {cartCount > 99 ? '99+' : cartCount}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.logoutBtn}
                        onPress={handleLogout}
                    >
                        <Ionicons name="exit-outline" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

                        
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : 
            <FlatList
                data={products}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }} 
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} tintColor={COLORS.primary}/>}
            />
            }

            <CyberAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={closeAlert}
                onConfirm={() => logout()} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: { fontSize: 28, color: COLORS.text, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 14, color: COLORS.textDim },
    
    // Updated Icon Button Style
    iconBtn: { 
        backgroundColor: COLORS.card, 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative', // Crucial for badge positioning
        // Removed overflow: 'hidden' so badge can stick out
    },

    logoutBtn: { 
        backgroundColor: 'red', 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center',
        position: 'relative', // Crucial for badge positioning
        // Removed overflow: 'hidden' so badge can stick out
    },
    
    // Badge Styles
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.danger, 
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: COLORS.background 
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },

    card: {
        width: '48%',
        backgroundColor: COLORS.card,
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    image: { width: '100%', height: 160, resizeMode: 'cover' },
    cardContent: { padding: 12, justifyContent: 'space-between', flex: 1 },
    name: { color: COLORS.text, fontWeight: '700', fontSize: 14, marginBottom: 2 },
    category: { color: COLORS.textDim, fontSize: 10, textTransform: 'uppercase', marginBottom: 8 },
    priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    price: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
    rating: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    ratingText: { color: COLORS.text, fontSize: 10, marginLeft: 3, fontWeight:'bold' }
})