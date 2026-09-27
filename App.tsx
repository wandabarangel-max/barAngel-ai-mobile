import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { signIn, signUp, supabase } from './src/lib/supabase';

type Tab = 'Home' | 'Study' | 'Chat' | 'Money';

const colors = { bg: '#020617', card: '#0f172a', border: '#1e293b', text: '#f8fafc', muted: '#94a3b8', accent: '#8b5cf6', green: '#34d399' };

function Button({ title, onPress, secondary = false }: { title: string; onPress: () => void; secondary?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, secondary && styles.secondaryButton]}><Text style={styles.buttonText}>{title}</Text></Pressable>;
}

function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!email || !password || (mode === 'signup' && !name)) return Alert.alert('Missing information', 'Complete all fields.');
    setBusy(true);
    try { const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password, name); if (mode === 'signup' && !result.session) Alert.alert('Check your email', 'Confirm your email, then sign in.'); }
    catch (error) { Alert.alert('Authentication failed', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  };
  return <SafeAreaView style={styles.safe}><View style={styles.auth}><Text style={styles.logo}>barAngel AI</Text><Text style={styles.subtitle}>Learn, create, and grow in one place.</Text><View style={styles.card}>{mode === 'signup' && <TextInput placeholder="Full name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} style={styles.input} />}<TextInput placeholder="Email" placeholderTextColor={colors.muted} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} /><TextInput placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry value={password} onChangeText={setPassword} style={styles.input} /><Button title={busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'} onPress={submit} /><Button title={mode === 'signin' ? 'Create an account' : 'I already have an account'} onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')} secondary /></View></View></SafeAreaView>;
}

function Home({ session }: { session: Session }) {
  const [joke, setJoke] = useState<{ setup: string; punchline: string } | null>(null); const [loading, setLoading] = useState(false);
  const getJoke = async () => { setLoading(true); try { const response = await fetch('https://official-joke-api.appspot.com/random_joke'); const data = await response.json(); setJoke(data); } catch { Alert.alert('Could not load joke', 'Check your internet connection.'); } finally { setLoading(false); } };
  return <ScrollView contentContainerStyle={styles.content}><Text style={styles.greeting}>Welcome back 👋</Text><Text style={styles.email}>{session.user.email}</Text><View style={styles.grid}><View style={styles.stat}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Study plans</Text></View><View style={styles.stat}><Text style={styles.statValue}>0</Text><Text style={styles.statLabel}>Notes saved</Text></View></View><View style={styles.card}><Text style={styles.sectionTitle}>Quick break</Text><Text style={styles.muted}>Need a little energy? Generate a joke.</Text>{joke && <View style={styles.joke}><Text style={styles.jokeText}>{joke.setup}</Text><Text style={styles.punchline}>{joke.punchline}</Text></View>}<Button title={loading ? 'Loading...' : 'Generate a joke'} onPress={getJoke} /></View><View style={styles.card}><Text style={styles.sectionTitle}>Your workspace</Text><Text style={styles.muted}>Use the tabs below to plan your studies, chat with AI, and track income.</Text></View></ScrollView>;
}

function Placeholder({ title, description }: { title: string; description: string }) { return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.muted}>{description}</Text><Text style={styles.coming}>More tools are coming soon.</Text></View>; }

export default function App() {
  const [session, setSession] = useState<Session | null>(null); const [tab, setTab] = useState<Tab>('Home');
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next)); return () => listener.subscription.unsubscribe(); }, []);
  if (!session) return <AuthScreen />;
  const screen = tab === 'Home' ? <Home session={session} /> : tab === 'Study' ? <Placeholder title="Study planner" description="Create plans, save notes, and keep your learning organized." /> : tab === 'Chat' ? <Placeholder title="AI chat" description="Your AI assistant will live here." /> : <Placeholder title="Money tracker" description="Track income streams and progress toward your goals." />;
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Text style={styles.logoSmall}>barAngel AI</Text><Pressable onPress={() => supabase.auth.signOut()}><Text style={styles.signOut}>Sign out</Text></Pressable></View>{screen}<View style={styles.nav}>{(['Home', 'Study', 'Chat', 'Money'] as Tab[]).map(item => <Pressable key={item} onPress={() => setTab(item)} style={styles.navItem}><Text style={[styles.navText, tab === item && styles.activeNav]}>{item}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.bg }, auth: { flex: 1, justifyContent: 'center', padding: 24 }, logo: { color: colors.text, fontSize: 34, fontWeight: '800', textAlign: 'center' }, logoSmall: { color: colors.text, fontSize: 20, fontWeight: '800' }, subtitle: { color: colors.muted, textAlign: 'center', marginTop: 8, marginBottom: 28 }, card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 18, marginBottom: 16 }, input: { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: 12, color: colors.text, padding: 14, marginBottom: 12 }, button: { backgroundColor: colors.accent, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 8 }, secondaryButton: { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 }, buttonText: { color: colors.text, fontWeight: '700' }, content: { padding: 20, paddingBottom: 100 }, greeting: { color: colors.text, fontSize: 28, fontWeight: '800' }, email: { color: colors.muted, marginTop: 5, marginBottom: 20 }, grid: { flexDirection: 'row', gap: 12, marginBottom: 16 }, stat: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 18, borderColor: colors.border, borderWidth: 1 }, statValue: { color: colors.accent, fontSize: 28, fontWeight: '800' }, statLabel: { color: colors.muted, marginTop: 4 }, sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: 6 }, muted: { color: colors.muted, lineHeight: 22 }, joke: { backgroundColor: colors.bg, borderRadius: 12, padding: 14, marginTop: 16 }, jokeText: { color: colors.text, fontSize: 16 }, punchline: { color: colors.green, fontSize: 16, fontWeight: '700', marginTop: 10 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomColor: colors.border, borderBottomWidth: 1 }, signOut: { color: '#fda4af' }, nav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 1, paddingVertical: 14 }, navItem: { flex: 1, alignItems: 'center' }, navText: { color: colors.muted, fontWeight: '600' }, activeNav: { color: colors.accent }, empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 }, emptyTitle: { color: colors.text, fontSize: 26, fontWeight: '800', marginBottom: 10 }, coming: { color: colors.accent, marginTop: 18, fontWeight: '700' } });
