import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { supabase, money } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { colors, ui } from '../lib/theme';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return setOrders([]);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  if (!user) return <View style={ui.center}><Text style={ui.muted}>Sign in to see your orders.</Text></View>;
  if (!orders) return <View style={ui.center}><ActivityIndicator /></View>;

  return (
    <ScrollView
      style={ui.screen}
      contentContainerStyle={ui.pad}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <Text style={ui.h1}>Your orders</Text>
      {!orders.length && <Text style={ui.muted}>No orders yet.</Text>}
      {orders.map((o) => (
        <View key={o.id} style={{ backgroundColor: colors.soft, borderRadius: 16, padding: 14, marginBottom: 12, gap: 4 }}>
          <Text style={{ fontWeight: '700' }}>Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</Text>
          {o.order_items.map((i) => (
            <Text key={i.id}>{i.quantity} × {i.name} — {money(i.price_cents * i.quantity)}</Text>
          ))}
          <Text style={{ fontWeight: '700' }}>Total: {money(o.total_cents)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
