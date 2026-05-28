/**
 * ============================================================================
 * FILE NAME        : AuthFlow.tsx
 * WHAT THIS FILE DOES : Auth & KYC onboarding screens
 * HOW IT DOES IT      : Conditional renders based on AuthContext step state
 * PRINCIPLE APPLIED   : SOLID — screen isolation, role-tailored views
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { FormInput } from '@/components/ui/FormInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { OtpInput } from '@/components/ui/OtpInput';
import { simulateExternalRegistryCheck } from '@/data/mockAdminService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Theme tokens ────────────────────────────────────────────────────────────

const LIGHT = {
  bg:             '#FFFFFF',
  bgSurface:      '#F8FAFC',
  bgCard:         '#FFFFFF',
  border:         '#E2E8F0',
  text:           '#0F172A',
  textSub:        '#475569',
  textMuted:      '#94A3B8',
  accent:         '#10B981',
  accentLight:    'rgba(16,185,129,0.10)',
  accentBorder:   'rgba(16,185,129,0.25)',
  danger:         '#EF4444',
  dangerLight:    'rgba(239,68,68,0.08)',
  dangerBorder:   'rgba(239,68,68,0.20)',
  inputBg:        '#F8FAFC',
  switchTrack:    '#CBD5E1',
  shadow:         'rgba(15,23,42,0.06)',
};

const DARK = {
  bg:             '#0F172A',
  bgSurface:      '#1E293B',
  bgCard:         '#1E293B',
  border:         '#334155',
  text:           '#F8FAFC',
  textSub:        '#CBD5E1',
  textMuted:      '#64748B',
  accent:         '#10B981',
  accentLight:    'rgba(16,185,129,0.12)',
  accentBorder:   'rgba(16,185,129,0.25)',
  danger:         '#F87171',
  dangerLight:    'rgba(239,68,68,0.10)',
  dangerBorder:   'rgba(239,68,68,0.22)',
  inputBg:        '#0F172A',
  switchTrack:    '#334155',
  shadow:         'rgba(0,0,0,0.30)',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function AuthFlow() {
  const insets = useSafeAreaInsets();
  const { spacing, typography, radius, moderateScale, contentMaxWidth } = useResponsive();

  const {
    step,
    setStep,
    role,
    setRole,
    handleRegister,
    handleLogin,
    email,
    phone,
    handleVerifyEmail,
    handleVerifyPhone,
    handleResendOTP,
    handleUploadKYC,
    handleAdminSimulateDecision,
    theme,
  } = useAuth();

  // Use light theme as default; fallback if theme is undefined
  const isDark = theme === 'dark';
  const C = isDark ? DARK : LIGHT;

  const [loading, setLoading]           = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');

  // Form
  const [fullName, setFullName]                   = useState('');
  const [regEmail, setRegEmail]                   = useState('');
  const [regPhone, setRegPhone]                   = useState('');
  const [password, setPassword]                   = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [loginEmail, setLoginEmail]               = useState('');
  const [loginPass, setLoginPass]                 = useState('');
  const [otpCode, setOtpCode]                     = useState('');
  const [cooldown, setCooldown]                   = useState(0);

  // KYC
  const [idCardUri, setIdCardUri]         = useState('');
  const [licenseUri, setLicenseUri]       = useState('');
  const [licenseId, setLicenseId]         = useState('');
  const [bizRegUri, setBizRegUri]         = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const triggerResend = () => {
    handleResendOTP();
    setCooldown(30);
    setOtpCode('');
    Alert.alert('Code Resent', 'A new 6-digit code has been sent. (Hint: 123456)');
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.removeMany(['token', 'user', 'refreshToken']);
      setStep('landing');
      setRole(null);
    } catch {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitRegistration = async () => {
    setErrorMsg('');
    if (!fullName || !regEmail || !regPhone || !password) {
      setErrorMsg('All fields are required.'); return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.'); return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.'); return;
    }
    setLoading(true);
    try {
      await handleRegister(fullName, regEmail, regPhone, password);
      setFullName(''); setRegEmail(''); setRegPhone('');
      setPassword(''); setConfirmPassword(''); setOtpCode('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const submitLogin = async () => {
    setErrorMsg('');
    if (!loginEmail || !loginPass) {
      setErrorMsg('Please enter your email and password.'); return;
    }
    setLoading(true);
    try {
      const ok = await handleLogin(loginEmail, loginPass);
      if (!ok) setErrorMsg('Incorrect email or password.');
      else { setLoginEmail(''); setLoginPass(''); }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  const submitEmailOTP = async () => {
    setErrorMsg('');
    if (otpCode.length !== 6) { setErrorMsg('Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const ok = await handleVerifyEmail(otpCode);
      if (ok) setOtpCode('');
      else setErrorMsg('Incorrect code. Hint: 123456');
    } catch { setErrorMsg('Verification failed.'); }
    finally { setLoading(false); }
  };

  const submitPhoneOTP = async () => {
    setErrorMsg('');
    if (otpCode.length !== 6) { setErrorMsg('Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const ok = await handleVerifyPhone(otpCode);
      if (ok) setOtpCode('');
      else setErrorMsg('Incorrect code. Hint: 123456');
    } catch { setErrorMsg('Verification failed.'); }
    finally { setLoading(false); }
  };

  const submitKYCDocumentation = async () => {
    setErrorMsg('');
    if (!idCardUri) { setErrorMsg('National ID / Passport is required.'); return; }
    if ((role === 'ENGINEER' || role === 'SUPERVISOR') && !licenseUri) {
      setErrorMsg('Professional licence is required for this role.'); return;
    }
    if (role === 'SUPPLIER' && !bizRegUri) {
      setErrorMsg('Business Registration Certificate is required.'); return;
    }
    setLoading(true);
    try {
      await handleUploadKYC({ idCard: idCardUri, license: licenseUri, bizReg: bizRegUri });
    } catch { setErrorMsg('Failed to upload documents.'); }
    finally { setLoading(false); }
  };

  // ─── Shared sub-components ─────────────────────────────────────────────────

  const ErrorBanner = ({ msg }: { msg: string }) => (
    <View style={{
      backgroundColor: C.dangerLight,
      borderWidth: 1,
      borderColor: C.dangerBorder,
      borderRadius: radius.md,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginBottom: 16,
    }}>
      <Text style={{ color: C.danger, fontSize: 13, textAlign: 'center', fontWeight: '500' }}>
        {msg}
      </Text>
    </View>
  );

  const BackButton = ({ onPress }: { onPress: () => void }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: C.bgSurface,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name="arrow-back" size={20} color={C.textSub} />
    </TouchableOpacity>
  );

  const Divider = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      <Text style={{ color: C.textMuted, fontSize: 12 }}>OR</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );

  // ─── Screen wrapper ────────────────────────────────────────────────────────
  // Landing uses full-bleed image with uniform dark overlay.
  // All other screens use plain theme background — no image.

  const ScreenBase = ({ children, scrollable = true }: {
    children: React.ReactNode;
    scrollable?: boolean;
  }) => (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={{ flex: 1 }}>
        {scrollable ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 32,
                paddingTop: 8,
              }}
            >
              <View style={{ alignSelf: 'center', width: '100%', maxWidth: 480 }}>
                {children}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        ) : (
          <View style={{
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 24,
          }}>
            <View style={{ alignSelf: 'center', width: '100%', maxWidth: 480, flex: 1 }}>
              {children}
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // 1. LANDING
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'landing') {
    return (
      <ImageBackground
        source={require('@/assets/inkingi-banner.jpg')}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 1 }}
      >
        {/* Uniform semi-transparent overlay over entire image */}
        <View style={{
          ...{ flex: 1 },
          backgroundColor: 'rgba(0,0,0,0.52)',
        }}>
          <StatusBar style="light" />
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 20,
            }}>

              {/* ── Logo ── */}
              <View style={{
                width: 72, height: 72,
                backgroundColor: '#10B981',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
                shadowColor: '#10B981',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 14,
                elevation: 10,
              }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 32 }}>I</Text>
              </View>

              {/* ── Title ── */}
              <Text style={{
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: 28,
                textAlign: 'center',
                marginBottom: 8,
                letterSpacing: -0.3,
              }}>
                InkingiPro Build
              </Text>

              <Text style={{
                color: '#10B981',
                fontWeight: '600',
                fontSize: 11,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                Escrow & Onboarding Vault
              </Text>

              <Text style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: 14,
                textAlign: 'center',
                lineHeight: 21,
                marginBottom: 40,
                maxWidth: 300,
              }}>
                Secure payments, verified professionals, and transparent procurement for diaspora investors.
              </Text>

              {/* ── CTAs ── */}
              <View style={{ width: '100%', maxWidth: 340, gap: 12 }}>
                <TouchableOpacity
                  onPress={() => setStep('login')}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 10,
                    elevation: 6,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep('register')}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: 'rgba(255,255,255,0.40)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>Create Account</Text>
                </TouchableOpacity>
              </View>

              <Text style={{
                color: 'rgba(255,255,255,0.28)',
                fontSize: 11,
                marginTop: 28,
                textAlign: 'center',
              }}>
                Trusted by diaspora investors across Rwanda
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. LOGIN
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'login') {
    return (
      <ScreenBase>
        {/* Header */}
        <View style={{ paddingTop: 12, marginBottom: 32 }}>
          <BackButton onPress={() => setStep('landing')} />
        </View>

        {/* Title */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 26, marginBottom: 6, letterSpacing: -0.3 }}>
            Welcome back
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Sign in to your account
          </Text>
        </View>

        {errorMsg ? <ErrorBanner msg={errorMsg} /> : null}

        <FormInput
          label="Email address"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={loginEmail}
          onChangeText={setLoginEmail}
          leftIcon={<Ionicons name="mail-outline" size={18} color={C.textMuted} />}
        />

        <FormInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={loginPass}
          onChangeText={setLoginPass}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={C.textMuted} />}
        />

        <TouchableOpacity
          onPress={() => setStep('forgot-password')}
          style={{ alignSelf: 'flex-end', marginTop: -8, marginBottom: 24 }}
        >
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={submitLogin}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
            flexDirection: 'row',
            gap: 8,
          }}
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        <Divider />

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => setStep('register')}>
            <Text style={{ color: C.accent, fontSize: 13, fontWeight: '700' }}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScreenBase>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. REGISTER
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'register') {
    return (
      <ScreenBase>
        <View style={{ paddingTop: 12, marginBottom: 28 }}>
          <BackButton onPress={() => setStep('landing')} />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 26, marginBottom: 6, letterSpacing: -0.3 }}>
            Create account
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14 }}>
            Choose your role, then fill in your details
          </Text>
        </View>

        {/* Role pill selector */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: C.bgSurface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: C.border,
          padding: 4,
          marginBottom: 24,
          gap: 4,
        }}>
          {(['CLIENT', 'ENGINEER', 'SUPERVISOR', 'SUPPLIER'] as const).map(r => (
            <TouchableOpacity
              key={r}
              onPress={() => {
                setRole(r);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 9,
                backgroundColor: role === r ? C.accent : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: role === r ? '#FFFFFF' : C.textMuted,
                letterSpacing: 0.3,
              }}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {errorMsg ? <ErrorBanner msg={errorMsg} /> : null}

        <FormInput
          label="Full name / Company name"
          placeholder="Grace Uwase"
          value={fullName}
          onChangeText={setFullName}
          leftIcon={<Ionicons name="person-outline" size={18} color={C.textMuted} />}
        />
        <FormInput
          label="Email address"
          placeholder="grace.uwase@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={regEmail}
          onChangeText={setRegEmail}
          leftIcon={<Ionicons name="mail-outline" size={18} color={C.textMuted} />}
        />
        <FormInput
          label="MTN MoMo phone number"
          placeholder="+250 788 100 000"
          keyboardType="phone-pad"
          value={regPhone}
          onChangeText={setRegPhone}
          leftIcon={<Ionicons name="call-outline" size={18} color={C.textMuted} />}
        />
        <FormInput
          label="Password"
          placeholder="Minimum 8 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={C.textMuted} />}
        />
        <FormInput
          label="Confirm password"
          placeholder="Re-enter your password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={C.textMuted} />}
        />

        <TouchableOpacity
          onPress={submitRegistration}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
            flexDirection: 'row',
            gap: 8,
            marginTop: 4,
          }}
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 20 }}>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => setStep('login')}>
            <Text style={{ color: C.accent, fontSize: 13, fontWeight: '700' }}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScreenBase>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. VERIFY EMAIL
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'verify-email') {
    return (
      <ScreenBase>
        <View style={{ paddingTop: 12, marginBottom: 32 }}>
          <BackButton onPress={() => setStep('landing')} />
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 64, height: 64,
            backgroundColor: C.accentLight,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: C.accentBorder,
            marginBottom: 20,
          }}>
            <Ionicons name="mail-outline" size={28} color={C.accent} />
          </View>

          <Text style={{ color: C.text, fontWeight: '800', fontSize: 22, marginBottom: 8, textAlign: 'center' }}>
            Check your email
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            We sent a 6-digit verification code to
          </Text>
          <Text style={{ color: C.accent, fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            {email}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>
            Hint: 123456
          </Text>
        </View>

        {errorMsg ? <ErrorBanner msg={errorMsg} /> : null}

        <OtpInput length={6} onComplete={submitEmailOTP} onChange={setOtpCode} />

        <TouchableOpacity
          onPress={submitEmailOTP}
          disabled={loading || otpCode.length < 6}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (loading || otpCode.length < 6) ? 0.5 : 1,
            flexDirection: 'row',
            gap: 8,
            marginTop: 24,
          }}
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Verifying…' : 'Verify Email'}
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 20, gap: 8 }}>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>Didn't receive a code?</Text>
          <TouchableOpacity onPress={triggerResend} disabled={cooldown > 0}>
            <Text style={{
              color: cooldown > 0 ? C.textMuted : C.accent,
              fontSize: 13,
              fontWeight: '600',
            }}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenBase>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. VERIFY PHONE
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'verify-phone') {
    return (
      <ScreenBase>
        <View style={{ paddingTop: 12, marginBottom: 32 }}>
          <BackButton onPress={() => setStep('landing')} />
        </View>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{
            width: 64, height: 64,
            backgroundColor: C.accentLight,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: C.accentBorder,
            marginBottom: 20,
          }}>
            <Ionicons name="phone-portrait-outline" size={28} color={C.accent} />
          </View>

          <Text style={{ color: C.text, fontWeight: '800', fontSize: 22, marginBottom: 8, textAlign: 'center' }}>
            Verify your phone
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            We sent a 6-digit code via SMS to
          </Text>
          <Text style={{ color: C.accent, fontSize: 14, fontWeight: '600', marginTop: 4 }}>
            {phone}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 8 }}>
            Hint: 123456
          </Text>
        </View>

        {errorMsg ? <ErrorBanner msg={errorMsg} /> : null}

        <OtpInput length={6} onComplete={submitPhoneOTP} onChange={setOtpCode} />

        <TouchableOpacity
          onPress={submitPhoneOTP}
          disabled={loading || otpCode.length < 6}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (loading || otpCode.length < 6) ? 0.5 : 1,
            flexDirection: 'row',
            gap: 8,
            marginTop: 24,
          }}
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Verifying…' : 'Verify Phone'}
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginTop: 20, gap: 8 }}>
          <Text style={{ color: C.textMuted, fontSize: 13 }}>Didn't receive a code?</Text>
          <TouchableOpacity onPress={triggerResend} disabled={cooldown > 0}>
            <Text style={{
              color: cooldown > 0 ? C.textMuted : C.accent,
              fontSize: 13,
              fontWeight: '600',
            }}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend SMS'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenBase>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 6. KYC UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'kyc-upload') {
    const UploadSlot = ({
      label,
      uri,
      onAttach,
      onRemove,
      iconName,
    }: {
      label: string;
      uri: string;
      onAttach: () => void;
      onRemove: () => void;
      iconName: any;
    }) => (
      <View style={{
        backgroundColor: C.bgSurface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        marginBottom: 12,
      }}>
        <Text style={{ color: C.text, fontWeight: '600', fontSize: 14, marginBottom: 10 }}>
          {label}
        </Text>
        {uri ? (
          <View style={{
            backgroundColor: C.accentLight,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: C.accentBorder,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={18} color={C.accent} />
              <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>Document attached</Text>
            </View>
            <TouchableOpacity onPress={onRemove}>
              <Text style={{ color: C.danger, fontSize: 13, fontWeight: '500' }}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onAttach}
            style={{
              backgroundColor: C.bg,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: C.border,
              borderStyle: 'dashed',
              padding: 20,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name={iconName} size={24} color={C.textMuted} />
            <Text style={{ color: C.textMuted, fontSize: 13 }}>Tap to upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );

    return (
      <ScreenBase>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 12,
          marginBottom: 24,
        }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 22 }}>KYC Verification</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: C.dangerLight,
              borderWidth: 1,
              borderColor: C.dangerBorder,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 7,
            }}
          >
            <Text style={{ color: C.danger, fontSize: 12, fontWeight: '600' }}>Log out</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 24 }}>
          To protect investor escrow funds and comply with Rwandan financial regulations, please upload the required documents below.
        </Text>

        {errorMsg ? <ErrorBanner msg={errorMsg} /> : null}

        <UploadSlot
          label="1. National ID or Passport"
          uri={idCardUri}
          onAttach={() => setIdCardUri('https://res.cloudinary.com/demo/image/upload/idcard')}
          onRemove={() => setIdCardUri('')}
          iconName="card-outline"
        />

        {(role === 'ENGINEER' || role === 'SUPERVISOR') && (
          <View style={{
            backgroundColor: C.bgSurface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: C.border,
            padding: 16,
            marginBottom: 12,
          }}>
            <Text style={{ color: C.text, fontWeight: '600', fontSize: 14, marginBottom: 10 }}>
              2. IER Professional Practice Licence
            </Text>
            <FormInput
              label="Licence registration number"
              placeholder="e.g. IER-2026-8821"
              value={licenseId}
              onChangeText={setLicenseId}
              containerStyle={{ marginBottom: 10 }}
            />
            {licenseUri ? (
              <View style={{
                backgroundColor: C.accentLight,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: C.accentBorder,
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="checkmark-circle" size={18} color={C.accent} />
                  <Text style={{ color: C.accent, fontSize: 13, fontWeight: '600' }}>Licence uploaded</Text>
                </View>
                <TouchableOpacity onPress={() => setLicenseUri('')}>
                  <Text style={{ color: C.danger, fontSize: 13 }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setLicenseUri('https://res.cloudinary.com/demo/image/upload/license')}
                style={{
                  backgroundColor: C.bg,
                  borderRadius: 8,
                  borderWidth: 1.5,
                  borderColor: C.border,
                  borderStyle: 'dashed',
                  padding: 20,
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons name="document-text-outline" size={24} color={C.textMuted} />
                <Text style={{ color: C.textMuted, fontSize: 13 }}>Upload licence scan</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {role === 'SUPPLIER' && (
          <UploadSlot
            label="2. Business Registration Certificate (RGB/RDB)"
            uri={bizRegUri}
            onAttach={() => setBizRegUri('https://res.cloudinary.com/demo/image/upload/bizreg')}
            onRemove={() => setBizRegUri('')}
            iconName="business-outline"
          />
        )}

        <TouchableOpacity
          onPress={submitKYCDocumentation}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            backgroundColor: C.accent,
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.7 : 1,
            flexDirection: 'row',
            gap: 8,
            marginTop: 8,
          }}
        >
          {loading && <ActivityIndicator color="#fff" size="small" />}
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {loading ? 'Submitting…' : 'Submit Documents for Review'}
          </Text>
        </TouchableOpacity>
      </ScreenBase>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 7. KYC PENDING
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'kyc-pending') {
    return (
      <ScreenBase scrollable={false}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 }}>
          {/* Icon */}
          <View style={{
            width: 72, height: 72,
            backgroundColor: 'rgba(245,158,11,0.10)',
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(245,158,11,0.22)',
            marginBottom: 20,
          }}>
            <Ionicons name="time-outline" size={34} color="#F59E0B" />
          </View>

          <Text style={{ color: C.text, fontWeight: '800', fontSize: 22, textAlign: 'center', marginBottom: 10 }}>
            Under review
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 36 }}>
            Our compliance team is checking your documents against Rwanda registry databases. This typically takes less than 24 hours.
          </Text>

          {/* Dev simulator */}
          <View style={{
            backgroundColor: C.bgSurface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            padding: 18,
            marginBottom: 16,
            width: '100%',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 }}>
                ⚡ DEV — ADMIN SIMULATOR
              </Text>
            </View>
            <Text style={{ color: C.textMuted, fontSize: 12, marginBottom: 14, lineHeight: 17 }}>
              Simulate an admin decision to preview the active dashboard:
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => handleAdminSimulateDecision('APPROVE')}
                style={{
                  flex: 1,
                  backgroundColor: C.accent,
                  borderRadius: 10,
                  paddingVertical: 11,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAdminSimulateDecision('REJECT', 'Document scans are blurry')}
                style={{
                  flex: 1,
                  backgroundColor: C.dangerLight,
                  borderWidth: 1,
                  borderColor: C.dangerBorder,
                  borderRadius: 10,
                  paddingVertical: 11,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: C.danger, fontWeight: '700', fontSize: 13 }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: 14,
              paddingVertical: 13,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ color: C.textSub, fontSize: 14, fontWeight: '600' }}>Log out & check later</Text>
          </TouchableOpacity>
        </View>
      </ScreenBase>
    );
  }

  return null;
}