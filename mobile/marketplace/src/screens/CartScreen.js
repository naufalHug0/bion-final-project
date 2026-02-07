import React, { useState } from 'react'
import { View, Text, FlatList, Image, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { useCartStore } from '../store/useStore'
import { COLORS } from '../constants/theme'
import { NeonButton, GlassInput } from '../components/UI'
import { Ionicons } from '@expo/vector-icons'
import api from '../services/api'
import useAlert from '../hooks/useAlert'
import CyberAlert from '../components/CyberAlert'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function CartScreen({ navigation }) {
    const { cartItems, removeFromCart, getSummary, clearCart, addToCart } = useCartStore()
    const [modalVisible, setModalVisible] = useState(false)
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [loading, setLoading] = useState(false)
    const { alertConfig, showAlert, closeAlert } = useAlert()
    const { itemsPrice, shippingPrice, taxPrice, totalPrice } = getSummary()

    const updateQty = (item, change) => {
        if (change === -1 && item.qty <= 1) {
            removeFromCart(item.product)
            return
        } 
        
        const productPayload = { 
            ...item, 
            _id: item.product 
        }
        
        addToCart(productPayload, change)
    }

    const handleCheckout = async () => {
        if (!address || !city) {
            showAlert('Missing Info', 'Please fill in address details', 'danger')
            return
        }

        setLoading(true)
        const orderData = {
            orderItems: cartItems,
            shippingAddress: { address, city, postalCode: "00000", country: "Indonesia" },
            paymentMethod: "Bank Transfer",
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        }

        try {
            await api.post('/orders', orderData)
            setModalVisible(false)
            showAlert("Success", "Transaction Completed Successfully!", "success", () => navigation.navigate("Home"))
            clearCart()
        } catch (error) {
            showAlert("Transaction Failed", "Error: " + error.message, "danger")
            console.log(error.response)
        } finally {
            setLoading(false)
        }
    }

    const renderCartItem = ({ item }) => (
        <View style={styles.cartItemCard}>
            <Image 
                source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL}/${item.image}` }} 
                style={styles.cartImg} 
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rp {(item.price * item.qty).toLocaleString()}</Text>
            </View>
            
            <View style={styles.miniController}>
                <TouchableOpacity onPress={() => updateQty(item, -1)} style={styles.ctrlBtn}>
                    <Ionicons name={item.qty === 1 ? "trash" : "remove"} size={16} color={item.qty === 1 ? COLORS.danger : COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.qty}</Text>
                <TouchableOpacity onPress={() => updateQty(item, 1)} style={[styles.ctrlBtn, {backgroundColor: COLORS.primary}]}>
                    <Ionicons name="add" size={16} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    )

    if (cartItems.length === 0) {
        return (
            <View style={[styles.center, {backgroundColor: COLORS.background}]}>
                <Ionicons name="cart-outline" size={80} color={COLORS.textDim} />
                <Text style={{color: COLORS.textDim, marginTop: 10}}>Your cart is empty.</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}> 
        <FlatList
                data={cartItems}
                keyExtractor={item => item.product}
                renderItem={renderCartItem}
                contentContainerStyle={{ padding: 20, paddingBottom: 150 }} 
                showsVerticalScrollIndicator={false}
            />

            {cartItems.length > 0 && (
                <View style={styles.summaryContainer}> 
                    <View style={styles.row}>
                        <Text style={styles.txt}>Subtotal</Text>
                        <Text style={styles.txtVal}>Rp {itemsPrice.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.txt}>Tax</Text>
                        <Text style={styles.txtVal}>Rp {taxPrice.toLocaleString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.txt}>Shipping</Text>
                        <Text style={styles.txtVal}>Rp {shippingPrice.toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <Text style={styles.txtTotal}>Grand Total</Text>
                        <Text style={styles.txtTotalVal}>Rp {totalPrice.toLocaleString()}</Text>
                    </View>
                    <NeonButton title="CHECKOUT" onPress={() => setModalVisible(true)} />
                </View>
            )}

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Express Checkout</Text>
                        <View style={{marginVertical: 10}}>
                            <Text style={{color: COLORS.textDim}}>Payment will be processed immediately.</Text>
                        </View>
                        <GlassInput placeholder="Address" value={address} onChangeText={setAddress} />
                        <GlassInput placeholder="City" value={city} onChangeText={setCity} />
                        
                        <View style={{marginTop: 10}}>
                            <NeonButton title="PAY NOW" onPress={handleCheckout} loading={loading} />
                            <NeonButton title="CANCEL" variant="secondary" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            <CyberAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={closeAlert}
                onConfirm={closeAlert} 
            />
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    screenTitle: { fontSize: 28, fontWeight:'bold', color: COLORS.text, marginHorizontal: 20, marginBottom: 10 },
    cartItemCard: { 
        flexDirection: 'row', 
        backgroundColor: COLORS.card, 
        borderRadius: 16, 
        padding: 12, 
        marginBottom: 15, 
        alignItems: 'center' 
    },
    cartImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#000' },
    itemInfo: { flex: 1, paddingHorizontal: 12 },
    itemTitle: { color: COLORS.text, fontWeight:'bold', fontSize: 16, marginBottom: 4 },
    itemPrice: { color: COLORS.primary, fontWeight:'600' },
    
    miniController: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 20, padding: 4 },
    ctrlBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
    qtyText: { color: COLORS.text, width: 30, textAlign: 'center', fontWeight: 'bold' },
    
    summaryContainer: { 
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.card, 
        borderTopLeftRadius: 24, borderTopRightRadius: 24, 
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24, // Extra padding for iOS home indicator
        shadowColor: "#000", shadowOffset: {width:0, height:-4}, shadowOpacity:0.3, shadowRadius:4
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    txt: { color: COLORS.textDim, fontSize: 14 },
    txtVal: { color: COLORS.text, fontSize: 14 },
    txtTotal: { color: COLORS.text, fontSize: 18, fontWeight: 'bold' },
    txtTotalVal: { color: COLORS.primary, fontSize: 20, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: COLORS.card, padding: 25, borderRadius: 20, borderColor: COLORS.primary, borderWidth: 1 },
    modalTitle: { color: COLORS.text, fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }
})