import { StyleSheet } from 'react-native';

export const colors = { text: '#16161d', muted: '#7a7a8c', soft: '#f6f6f8', line: '#ececf1', pink: '#f9c5d1', bg: '#fff' };

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 16 },
  h1: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 },
  muted: { color: colors.muted },
  btn: { backgroundColor: colors.text, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnLight: { backgroundColor: colors.soft },
  btnLightText: { color: colors.text, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, marginBottom: 10, fontSize: 15 },
  error: { color: '#b00020', marginBottom: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
