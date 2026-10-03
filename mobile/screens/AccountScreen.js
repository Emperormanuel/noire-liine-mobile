import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { colors, ui } from '../lib/theme';

export default function AccountScreen() {
  const { user, signInWithGoogle, sendEmailCode, verifyEmailCode, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(fn) {
    setError('');
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (user)
    return (
      <View style={ui.center}>
        <Text style={ui.h1}>Hello, {(user.user_metadata?.full_name || user.email).split(' ')[0]}</Text>
        <Text style={[ui.muted, { marginBottom: 20 }]}>{user.email}</Text>
        <Pressable style={ui.btn} onPress={signOut}><Text style={ui.btnText}>Log out</Text></Pressable>
      </View>
    );

  return (
    <View style={[ui.center, { alignItems: 'stretch' }]}>
      <Text style={[ui.h1, { textAlign: 'center' }]}>Sign in</Text>
      <Text style={[ui.muted, { marginBottom: 16, textAlign: 'center' }]}>
        Use the same account as on the website.
      </Text>
      {!!error && <Text style={ui.error}>{error}</Text>}

      <Pressable style={ui.btn} disabled={busy} onPress={() => run(signInWithGoogle)}>
        <Text style={ui.btnText}>Continue with Google</Text>
      </Pressable>

      <Text style={[ui.muted, { textAlign: 'center', marginVertical: 16 }]}>or get a code by email</Text>

      <TextInput
        style={ui.input}
        placeholder="Your email (same as your Google account)"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!codeSent}
      />
      {codeSent && (
        <TextInput
          style={ui.input}
          placeholder="Code from the email"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
      )}
      <Pressable
        style={[ui.btn, ui.btnLight, (busy || !email.trim() || (codeSent && !code.trim())) && { opacity: 0.5 }]}
        disabled={busy || !email.trim() || (codeSent && !code.trim())}
        onPress={() =>
          run(async () => {
            if (!codeSent) {
              await sendEmailCode(email);
              setCodeSent(true);
            } else {
              await verifyEmailCode(email, code);
            }
          })
        }
      >
        <Text style={ui.btnLightText}>{codeSent ? 'Sign in with code' : 'Email me a code'}</Text>
      </Pressable>
      {codeSent && (
        <Pressable onPress={() => { setCodeSent(false); setCode(''); setError(''); }}>
          <Text style={[ui.muted, { textAlign: 'center', marginTop: 12, color: colors.text }]}>Use a different email</Text>
        </Pressable>
      )}
    </View>
  );
}
