import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SITE_URL, supabase, money, imageUrl } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { colors, ui } from '../lib/theme';

export default function CartScreen({ goToAccount, goToOrders }) {
  const { user } = useAuth();
  const { items, setQty, total, clear, live } = useCart();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!user)
    return (
      <View style={ui.center}>
        <Text style={ui.h1}>Your cart</Text>
        <Text style={[ui.muted, { marginBottom: 16, textAlign: 'center' }]}>Sign in to see the cart you started on the website.</Text>
        <Pressable style={ui.btn} onPress={goToAccount}><Text style={ui.btnText}>Sign in</Text></Pressable>
      </View>
    );

  // Uses the SAME endpoint as the website: POST /api/checkout (token sent in the Authorization header).
  async function checkout() {
    setError('');
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${SITE_URL}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ name, address, items: items.map((i) => ({ id: i.id, quantity: i.quantity })) }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Checkout failed');
      await clear();
      setName('');
      setAddress('');
      Alert.alert('Order placed', `Order #${body.orderId.slice(0, 8)} saved.${body.emailSent ? ' Confirmation email sent.' : ''}`, [
        { text: 'View orders', onPress: goToOrders },
      ]);
    } catch (e) {
      setError(e.message.includes('Network') ? `Cannot reach the website at ${SITE_URL}. Is it running?` : e.message);
    } finally {
      setBusy(false);
    }
  }

  const disabled = busy || !name.trim() || !address.trim();

  return (
    <ScrollView style={ui.screen} contentContainerStyle={ui.pad} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={ui.h1}>Your cart</Text>
        <Text style={{ color: live === 'live' ? '#0a8f3c' : colors.muted }}>● {live === 'live' ? 'Synced live' : live}</Text>
      </View>

      {!items.length && <Text style={ui.muted}>Your cart is empty. Add something on the website or here, and it shows up everywhere.</Text>}

      {items.map((i) => (
        <View key={i.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.line, gap: 10 }}>
          {imageUrl(i) ? (
            <Image source={{ uri: imageUrl(i) }} style={{ width: 48, height: 48, borderRadius: 8 }} />
          ) : (
            <Text style={{ fontSize: 30 }}>{i.emoji}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600' }} numberOfLines={1}>{i.name}</Text>
            <Text style={ui.muted}>{money(i.price_cents * i.quantity)}</Text>
          </View>
          <Pressable style={[ui.btn, ui.btnLight, { paddingHorizontal: 12 }]} onPress={() => setQty(i.id, i.quantity - 1)}><Text style={ui.btnLightText}>−</Text></Pressable>
          <Text style={{ minWidth: 18, textAlign: 'center' }}>{i.quantity}</Text>
          <Pressable style={[ui.btn, ui.btnLight, { paddingHorizontal: 12 }]} onPress={() => setQty(i.id, i.quantity + 1)}><Text style={ui.btnLightText}>+</Text></Pressable>
        </View>
      ))}

      {!!items.length && (
        <View style={{ marginTop: 16 }}>
          <Text style={[ui.h1, { fontSize: 20 }]}>Total: {money(total)}</Text>
          <TextInput style={ui.input} placeholder="Full name" value={name} onChangeText={setName} />
          <TextInput style={[ui.input, { height: 80 }]} placeholder="Shipping address" value={address} onChangeText={setAddress} multiline />
          {!!error && <Text style={ui.error}>{error}</Text>}
          <Pressable style={[ui.btn, disabled && { opacity: 0.5 }]} disabled={disabled} onPress={checkout}>
            <Text style={ui.btnText}>{busy ? 'Placing order…' : 'Place order'}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}
