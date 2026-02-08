import React, { useLayoutEffect } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useAuthStore } from '../store/useStore'
import { COLORS } from '../constants/theme'
import { Ionicons } from '@expo/vector-icons'

import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import HomeScreen from '../screens/HomeScreen'
import ProductDetailScreen from '../screens/ProductDetailScreen'
import CartScreen from '../screens/CartScreen'
import TransactionHistory from '../screens/TransactionHistory' 
import { Platform } from 'react-native'
import { useNavigation } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

const TabNavigator = () => {
    const insets = useSafeAreaInsets()
    const androidPadding = 30
    const iosPadding = 20

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: COLORS.card,
                    borderTopWidth: 0,
                    position: 'absolute',
                    elevation: 0,
                    // Use insets.bottom to handle iPhone notches automatically
                    height: Platform.OS === 'ios' ? 60 + insets.bottom : 70,
                    paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textDim,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName
                    if (route.name === 'Home') iconName = focused ? 'grid' : 'grid-outline'
                    else if (route.name === 'Transactions') iconName = focused ? 'receipt' : 'receipt-outline'
                    return <Ionicons name={iconName} size={size} color={color} />
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Transactions" component={TransactionHistory} />
        </Tab.Navigator>
    )
}

// 2. The Main Stack Navigator
export default function AppNavigator() {
    const navigation = useNavigation()
    const token = useAuthStore((state) => state.token)

    // Fix for Expo Router "index" header
    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation])

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
            {token ? (
                <>
                    {/* The Tabs are the main view */}
                    <Stack.Screen name="Main" component={TabNavigator} />
                    
                    {/* These screens sit ON TOP of the tabs */}
                    <Stack.Screen 
                        name="Cart" 
                        component={CartScreen} 
                        options={{ 
                            headerShown: true, 
                            headerTintColor: COLORS.text, 
                            headerStyle: { backgroundColor: COLORS.background, shadowOpacity: 0, elevation: 0 },
                            headerTitle: 'My Cart' 
                        }} 
                    />
                    <Stack.Screen 
                        name="ProductDetail" 
                        component={ProductDetailScreen} 
                        options={{ 
                            headerShown: true, 
                            headerTransparent: true, 
                            headerTintColor: '#fff', 
                            title: '',
                            headerLeftContainerStyle: { paddingLeft: 10 }
                        }} 
                    />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    )
}