import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, fontSize } from '../../src/lib/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.brand}>Storyteller</Text>
        <Text style={styles.subtitle}>Create your artist account</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password (min 8 characters)"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.link}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={{ color: colors.primary }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  brand: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
  subtitle: { fontSize: fontSize.md, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: spacing.md, fontSize: fontSize.md, color: colors.foreground,
    backgroundColor: colors.background, marginBottom: spacing.md,
  },
  button: {
    backgroundColor: colors.primary, borderRadius: 8, padding: spacing.md,
    alignItems: 'center', marginTop: spacing.sm,
  },
  buttonText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
  link: { marginTop: spacing.lg, alignItems: 'center' },
  linkText: { fontSize: fontSize.sm, color: colors.mutedForeground },
});
