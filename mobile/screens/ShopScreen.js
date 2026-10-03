import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
import { supabase, money, imageUrl } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { colors, ui } from '../lib/theme';

const CATEGORIES = ['All', 'Women', 'Men', 'Accessories', 'Footwear'];

export default function ShopScreen({ goToAccount }) {
  const { user } = useAuth();
  const { add } = useCart();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .order('name')
      .then(({ data, error }) => (error ? setError(error.message) : setProducts(data)));
  }, []);

  function onAdd(p) {
    if (!user) {
      Alert.alert('Sign in first', 'Sign in to keep one cart across the website and this app.', [
        { text: 'Not now' },
        { text: 'Sign in', onPress: goToAccount },
      ]);
      return;
    }
    add(p);
  }

  if (error) return <View style={ui.center}><Text style={ui.error}>Could not load products: {error}</Text></View>;
  if (!products) return <View style={ui.center}><ActivityIndicator /></View>;

  const shown = products.filter(
    (p) => (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <View style={ui.screen}>
      <View style={ui.pad}>
        <TextInput style={ui.input} placeholder="Search styles…" value={q} onChangeText={setQ} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(c) => c}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setCat(item)}
              style={[ui.btn, { marginRight: 8, paddingVertical: 8 }, cat !== item && ui.btnLight]}
            >
              <Text style={cat === item ? ui.btnText : ui.btnLightText}>{item}</Text>
            </Pressable>
          )}
        />
      </View>
      <FlatList
        data={shown}
        keyExtractor={(p) => p.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        ListEmptyComponent={<Text style={[ui.muted, { textAlign: 'center', marginTop: 30 }]}>No products found.</Text>}
        renderItem={({ item: p }) => (
          <View style={{ flex: 1, margin: 6, backgroundColor: colors.soft, borderRadius: 16, overflow: 'hidden' }}>
            {imageUrl(p) ? (
              <Image source={{ uri: imageUrl(p) }} style={{ height: 150, backgroundColor: p.color || colors.line }} />
            ) : (
              <View style={{ height: 150, backgroundColor: p.color || colors.line, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 48 }}>{p.emoji}</Text>
              </View>
            )}
            <View style={{ padding: 10, gap: 4 }}>
              <Text style={{ fontWeight: '600', color: colors.text }} numberOfLines={1}>{p.name}</Text>
              <Text style={ui.muted}>{money(p.price_cents)}</Text>
              <Pressable style={[ui.btn, { paddingVertical: 8 }]} onPress={() => onAdd(p)}>
                <Text style={ui.btnText}>Add to cart</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}
