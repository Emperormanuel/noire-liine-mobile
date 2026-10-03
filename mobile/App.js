import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './lib/auth';
import { CartProvider, useCart } from './lib/cart';
import { colors, ui } from './lib/theme';
import ShopScreen from './screens/ShopScreen';
import CartScreen from './screens/CartScreen';
import OrdersScreen from './screens/OrdersScreen';
import AccountScreen from './screens/AccountScreen';

function Tabs() {
  const { ready } = useAuth();
  const { count } = useCart();
  const insets = useSafeAreaInsets(); // sizes of the status bar (top) and navigation bar (bottom)
  const [tab, setTab] = useState('Shop');

  if (!ready) return <View style={ui.center}><ActivityIndicator /></View>;

  const screens = {
    Shop: <ShopScreen goToAccount={() => setTab('Account')} />,
    Cart: <CartScreen goToAccount={() => setTab('Account')} goToOrders={() => setTab('Orders')} />,
    Orders: <OrdersScreen />,
    Account: <AccountScreen />,
  };

  return (
    <View style={[ui.screen, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: 1 }}>NOIRE <Text style={{ color: '#d6336c' }}>LIINE</Text></Text>
      </View>
      <View style={{ flex: 1 }}>{screens[tab]}</View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: colors.line }}>
        {Object.keys(screens).map((t) => (
          <Pressable key={t} style={{ flex: 1, alignItems: 'center', padding: 14 }} onPress={() => setTab(t)}>
            <Text style={{ fontWeight: tab === t ? '700' : '400', color: tab === t ? colors.text : colors.muted }}>
              {t === 'Cart' ? `Cart (${count})` : t}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <Tabs />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
