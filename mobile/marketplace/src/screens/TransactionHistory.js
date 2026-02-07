import React, { useState, useCallback } from 'react'
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    Modal,
    Image
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native' // updates data when tab is pressed
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import api from '../services/api' 
import { COLORS } from '../constants/theme'
import { GlassInput, NeonButton } from '../components/UI'
import useAlert from '../hooks/useAlert'
import CyberAlert from '../components/CyberAlert'

export default function TransactionScreen() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const { showAlert, alertConfig, closeAlert } = useAlert()

    const [modalVisible, setModalVisible] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const insets = useSafeAreaInsets()

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/history')
            setOrders(data.data)
        } catch (error) {
            console.log("Failed to fetch orders:", error)
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchOrders()
        }, [])
    )

    const handleOpenRateModal = (orderId, product) => {
        setSelectedOrder(orderId)
        setSelectedProduct(product)
        setRating(5)
        setComment('')
        setModalVisible(true)
    }

    const submitRating = async () => {
        if (!selectedProduct || !selectedOrder) return

        setSubmitting(true)
        try {
            await api.post(`/orders/${selectedProduct.product}/reviews`, {
                rating,
                comment,
                orderId: selectedOrder
            })
            
            setModalVisible(false)
            showAlert("Success", "Thanks for your feedback!")
            showAlert("Success", "Successfully rated product!", "success")
            fetchOrders() 
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to submit review"
            showAlert("Error", msg, "danger")
        } finally {
            setSubmitting(false)
        }
    }

    const renderOrderItem = (orderId, item) => (
        <View key={item._id} style={styles.itemRow}>
            <Image
                source={{ uri: item.image.startsWith('http') ? item.image : `${process.env.EXPO_PUBLIC_API_URL}/${item.image}` }} 
                style={styles.itemImage} 
            />
            <View style={{flex: 1, paddingHorizontal: 10}}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>Rp {item.price.toLocaleString()} x {item.qty}</Text>
            </View>
            
            {/* RATING BUTTON LOGIC */}
            {!item.isRated ? (
                <TouchableOpacity 
                    style={styles.rateBtn}
                    onPress={() => handleOpenRateModal(orderId, item)}
                >
                    <Text style={styles.rateBtnText}>Rate</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.ratedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                    <Text style={styles.ratedText}>Rated</Text>
                </View>
            )}
        </View>
    )

    const renderCard = ({ item }) => {
        const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        })

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                    </View>
                    <View style={{flex: 1, marginLeft: 10}}>
                        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
                        <Text style={styles.date}>{date}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Success</Text>
                    </View>
                </View>
                
                <View style={styles.divider} />
                
                {/* Render Individual Items */}
                <View style={styles.itemsContainer}>
                    {item.orderItems.map((orderItem) => renderOrderItem(item._id, orderItem))}
                </View>

                <View style={styles.divider} />
                
                <View style={styles.cardFooter}>
                    <Text style={styles.totalLabel}>Total Payment</Text>
                    <Text style={styles.totalPrice}>Rp {item.totalPrice.toLocaleString()}</Text>
                </View>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <Text style={styles.headerTitle}>Transactions</Text>
            </View>

            {
            orders.length === 0 ? (
                <View style={[styles.center, {backgroundColor: COLORS.background}]}>
                    <Ionicons name="receipt-outline" size={80} color={COLORS.textDim} />
                    <Text style={{color: COLORS.textDim, marginTop: 10}}>No transactions yet.</Text>
                </View>
            ) : 
                loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item._id}
                    renderItem={renderCard}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} tintColor={COLORS.primary}/>}
                />
                )
            }

            {/* RATING MODAL */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Rate Product</Text>
                        <Text style={styles.modalSubtitle}>{selectedProduct?.name}</Text>
                        
                        <View style={styles.starsContainer}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                    <Ionicons 
                                        name={star <= rating ? "star" : "star-outline"} 
                                        size={32} 
                                        color={COLORS.warning} 
                                        style={{marginHorizontal: 5}}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <GlassInput
                            style={styles.commentInput}
                            placeholder="Write a review (optional)..."
                            placeholderTextColor={COLORS.textDim}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                        />

                        <View style={styles.modalButtons}>
                            <NeonButton 
                                title="SUBMIT" 
                                onPress={submitRating} 
                                loading={submitting} 
                                style={{flex: 1, marginRight: 10}}
                            />
                            <NeonButton
                                title="CANCEL" 
                                variant="secondary" 
                                onPress={() => setModalVisible(false)} 
                                style={{flex: 1}}
                            />
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    header: { paddingHorizontal: 20, paddingBottom: 15 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    iconContainer: { 
        width: 40, height: 40, borderRadius: 20, 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        justifyContent: 'center', alignItems: 'center' 
    },
    orderId: { color: COLORS.text, fontWeight: 'bold', fontSize: 16 },
    date: { color: COLORS.textDim, fontSize: 12 },
    statusBadge: { backgroundColor: 'rgba(76, 175, 80, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
    
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 12 },
    
    // Item Styles
    itemsContainer: { marginBottom: 10 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    itemImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#333' },
    itemName: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
    itemPrice: { color: COLORS.textDim, fontSize: 12 },
    
    // Rate Button Styles
    rateBtn: { 
        backgroundColor: COLORS.primary, 
        paddingHorizontal: 12, 
        paddingVertical: 6, 
        borderRadius: 20 
    },
    rateBtnText: { color: '#000', fontWeight: 'bold', fontSize: 12 },
    
    ratedBadge: { flexDirection: 'row', alignItems: 'center' },
    ratedText: { color: COLORS.textDim, fontSize: 12, marginLeft: 4 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { color: COLORS.textDim, fontSize: 14 },
    totalPrice: { color: COLORS.primary, fontWeight: 'bold', fontSize: 18 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
    modalContent: { 
        backgroundColor: COLORS.card, 
        padding: 24, 
        borderRadius: 24, 
        borderWidth: 1, 
        borderColor: COLORS.primary 
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center' },
    modalSubtitle: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginBottom: 20 },
    starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    commentInput: { 
        backgroundColor: 'rgba(0,0,0,0.3)', 
        color: COLORS.text, 
        padding: 15, 
        borderRadius: 12, 
        height: 100, 
        textAlignVertical: 'top',
        marginBottom: 20 
    },
    modalButtons: { flexDirection: 'row' }
})