import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native'
import api from '../services/api'
import { useCartStore } from '../store/useStore'
import { COLORS } from '../constants/theme'
import { NeonButton } from '../components/UI'
import useAlert from '../hooks/useAlert'
import { Ionicons } from '@expo/vector-icons'
import CyberAlert from '../components/CyberAlert'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ProductDetailScreen({ route, navigation }) {
    const { id } = route.params
    const [product, setProduct] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const { showAlert, alertConfig, closeAlert } = useAlert()
    
    const cartItems = useCartStore(state => state.cartItems)
    const addToCart = useCartStore(state => state.addToCart)
    const removeFromCart = useCartStore(state => state.removeFromCart)

    const cartItem = cartItems.find(x => x.product === id)
    const qtyInCart = cartItem ? cartItem.qty : 0

    useEffect(() => {
        setLoading(true)
        api.get(`/products/${id}`).then(res => {
            setProduct(res.data.data)
            setReviews(res.data.data.reviews || [])
        }).finally(() => {
            setLoading(false)
        })
    }, [id])

    if (!product) return <View style={{flex:1, backgroundColor: COLORS.background}} />

    const handleIncrease = () => {
        if (product.countInStock === 0) return

        if (product.countInStock > qtyInCart) {
            addToCart(product, 1) 
        } else {
            showAlert('Max stock reached', 'You have reached the maximum stock available for this product.', 'danger')
        }
    }

    const handleDecrease = () => {
        if (qtyInCart > 1) {
            addToCart(product, -1) 
        } else {
            removeFromCart(id)
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Ionicons 
                key={i} 
                name={i < rating ? "star" : "star-outline"} 
                size={14} 
                color={COLORS.warning} 
            />
        ))
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            {loading ? (
                            <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                        ) : 
            <>
            <ScrollView contentContainerStyle={{paddingBottom: 120}} showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: product.image.startsWith('http') ? product.image : `${process.env.EXPO_PUBLIC_API_URL}/${product.image}` }} 
                        style={styles.detailImage} 
                    />
                    <View style={styles.imageOverlay} />
                </View>

                <View style={styles.detailContainer}>
                    <View style={styles.headerRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.detailName}>{product.name}</Text>
                            <Text style={styles.detailBrand}>{product.brand}</Text>
                        </View>
                        <View style={styles.ratingTag}>
                            <Ionicons name="star" color="#FFD700" size={16}/>
                            <Text style={styles.ratingText}>{product.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.detailPrice}>Rp {product.price.toLocaleString()}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.detailDesc}>{product.description}</Text>
                    
                    <View style={styles.divider} />
                    <Text style={{color: product.countInStock > 0 ? COLORS.success : COLORS.danger}}>
                        {product.countInStock > 0 ? `In Stock: ${product.countInStock}` : 'Out of Stock'}
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.reviewsHeader}>
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        <Text style={{color: COLORS.textDim}}>{product.numReviews} total</Text>
                    </View>

                    {reviews.length === 0 ? (
                        <Text style={{color: COLORS.textDim, fontStyle: 'italic', marginTop: 10}}>
                            No reviews yet. Be the first to review!
                        </Text>
                    ) : (
                        reviews.map((review) => (
                            <View key={review._id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewerName}>{review.name}</Text>
                                    <Text style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View style={styles.starsRow}>
                                    {renderStars(review.rating)}
                                </View>
                                {review.comment ? (
                                    <Text style={styles.reviewComment}>{review.comment}</Text>
                                ) : null}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                {qtyInCart === 0 ? (
                    <NeonButton 
                        title={product.countInStock > 0 ? "ADD TO CART" : "OUT OF STOCK"} 
                        onPress={handleIncrease} 
                        disabled={product.countInStock === 0}
                        style={{width: '100%'}}
                    />
                ) : (
                    <View style={styles.qtyControllerBig}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrease}>
                            <Ionicons name="remove" size={28} color="#FFF" />
                        </TouchableOpacity>
                        
                        <View style={styles.qtyTextContainer}>
                            <Text style={styles.qtyValue}>{qtyInCart}</Text>
                            <Text style={styles.qtyLabel}>in cart</Text>
                        </View>
                        
                        <TouchableOpacity style={[styles.qtyBtn, {backgroundColor: COLORS.primary}]} onPress={handleIncrease}>
                            <Ionicons name="add" size={28} color="#000" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <CyberAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={closeAlert}
                onConfirm={closeAlert} 
            />
            </>
        }
        </View>
    )
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageContainer: { height: 350, width: '100%', position: 'relative' },
    detailImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
    backBtn: {
        position: 'absolute', left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8
    },
    
    detailContainer: { 
        padding: 24, marginTop: -30, 
        backgroundColor: COLORS.background, 
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        minHeight: 500
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    
    detailName: { fontSize: 26, fontWeight: 'bold', color: COLORS.text, marginBottom: 5 },
    detailBrand: { color: COLORS.primary, fontWeight: '600', textTransform: 'uppercase', fontSize: 12 },
    ratingTag: { flexDirection:'row', alignItems:'center', backgroundColor:'#FFF', paddingHorizontal:10, paddingVertical:6, borderRadius:20 },
    ratingText: { color:'#000', fontWeight:'bold', marginLeft:4 },
    reviewCount: { color:'#666', fontSize:10, marginLeft: 2 },
    
    detailPrice: { fontSize: 32, color: COLORS.text, fontWeight: 'bold', marginVertical: 20 },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
    sectionTitle: { color: COLORS.text, fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    detailDesc: { color: COLORS.textDim, lineHeight: 24, fontSize: 15 },
    
    // Review Styles
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    reviewCard: { 
        backgroundColor: COLORS.card, 
        padding: 15, 
        borderRadius: 16, 
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    reviewerName: { color: COLORS.text, fontWeight: 'bold', fontSize: 14 },
    reviewDate: { color: COLORS.textDim, fontSize: 12 },
    starsRow: { flexDirection: 'row', marginBottom: 8 },
    reviewComment: { color: COLORS.textDim, fontSize: 14, lineHeight: 20 },
    
    showMoreBtn: { 
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 15, marginTop: 5 
    },
    showMoreText: { color: COLORS.primary, fontWeight: 'bold', marginRight: 5 },

    // Footer
    footer: { 
        position: 'absolute', bottom: 0, left: 0, right: 0, 
        zIndex: 1000, // <--- Add this
        elevation: 10,
        padding: 20, 
        backgroundColor: COLORS.card, 
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' 
    },
    qtyControllerBig: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    qtyBtn: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    qtyTextContainer: { alignItems: 'center' },
    qtyValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
    qtyLabel: { fontSize: 12, color: COLORS.textDim }
})