/**
 * ============================================================================
 * FILE NAME        : AuthFlow.tsx
 * WHAT THIS FILE DOES : Auth & KYC onboarding screens
 * HOW IT DOES IT      : Conditional renders based on AuthContext step state
 * PRINCIPLE APPLIED   : SOLID — screen isolation, role-tailored views
 * ============================================================================
 */

import React, { useState, useEffect,useRef } from 'react';
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
import { HomeIcon } from 'lucide-react-native';

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

  // Form states
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Verification state
  const [otpVal, setOtpVal] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);

  // Split Digit References
  const pin1Ref = useRef<any>(null);
  const pin2Ref = useRef<any>(null);
  const pin3Ref = useRef<any>(null);
  const pin4Ref = useRef<any>(null);
  const pin5Ref = useRef<any>(null);
  const pin6Ref = useRef<any>(null);
  const pinRefs = [pin1Ref, pin2Ref, pin3Ref, pin4Ref, pin5Ref, pin6Ref];

  // KYC States
  const [idCardUri, setIdCardUri] = useState('');
  const [licenseUri, setLicenseUri] = useState('');
  const [licenseId, setLicenseId] = useState('');
  const [isLicenseValid, setIsLicenseValid] = useState<boolean | null>(null);
  const [insuranceUri, setInsuranceUri] = useState('');
  const [bizRegUri, setBizRegUri] = useState('');
  const [taxCertUri, setTaxCertUri] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const triggerResend = () => {
    handleResendOTP();
    setCooldown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpVal('');
    Alert.alert('OTP Resent', 'A new 6-digit code has been sent successfully (Hint: 123456).');
  };

  const handleOtpDigitChange = (val: string, idx: number) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[idx] = cleanVal;
    setOtpDigits(newDigits);
    setOtpVal(newDigits.join(''));

    // Move focus forward
    if (cleanVal && idx < 5) {
      pinRefs[idx + 1].current?.focus();
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'refreshToken']);
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
      setErrorMsg('Passwords do not match.');
      return;
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
      const match = await handleVerifyEmail(otpVal);
      if (match) {
        setOtpVal('');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMsg('Invalid code entered. Use 123456 for simulator.');
      }
    } catch (err) {
      setErrorMsg('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const submitPhoneOTP = async () => {
    setErrorMsg('');
    if (otpCode.length !== 6) { setErrorMsg('Enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const match = await handleVerifyPhone(otpVal);
      if (match) {
        setOtpVal('');
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        setErrorMsg('Invalid code. Try 123456.');
      }
    } catch (err) {
      setErrorMsg('Phone verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLicenseExternally = () => {
    if (!licenseId) {
      Alert.alert('Missing ID', 'Please enter a valid IER / Professional license ID first.');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      try {
        const isValid = await simulateExternalRegistryCheck(licenseId);
        if (isValid) {
          setIsLicenseValid(true);
          Alert.alert(
            'Registry Match Found!',
            `Verified License ID: ${licenseId}\nStatus: Active Licensed Professional\nVerification Authority: Institution of Engineers Rwanda (IER)`
          );
        } else {
          setIsLicenseValid(false);
          Alert.alert('No Match', 'License ID not found in Rwanda IER external database API. Hint: Use IER-2026- prefix.');
        }
      } catch (err) {
        setIsLicenseValid(false);
        Alert.alert('Validation Error', 'Failed to communicate with external IER API.');
      }
    }, 1500);
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
      source={require('../../../assets/inkingi-banner.jpg')}
      className="flex-1"
    >
      {/* Dark overlay with centered content layout */}
      <View className="flex-1 bg-black/60 justify-between items-center px-8 pt-24 pb-16">
        
        {/* Top/Middle Content Section */}
        <View className="items-center flex-1 justify-center max-w-xs">
          {/* Logo Icon Placeholder */}
          <View className="mb-4">
            <HomeIcon size={44} color="#34D399" />
          </View>

          {/* Heading */}
          <Text className="text-[#8AF2BB] text-2xl font-bold tracking-widest text-center uppercase">
            Welcome To
          </Text>
          <Text className="text-[#8AF2BB] text-2xl font-bold tracking-widest text-center uppercase mb-6">
            Inkingi
          </Text>

          {/* Subtitle / Description */}
          <Text className="text-white text-lg text-center leading-6">
            Bridging trust between Diaspora investors and local construction professionals in Rwanda
          </Text>
        </View>

        {/* Bottom Actions Section */}
        <View className="w-full space-y-6">
          {/* Create Account Button */}
          <TouchableOpacity 
            className="bg-[#007A64] py-4 rounded-xl items-center shadow-sm"
            onPress={() => setStep('register')}
          >
            <Text className="text-white font-bold text-base tracking-wider uppercase">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-[#B08D49] py-4 rounded-xl items-center shadow-sm mt-4"
            onPress={() => setStep('login')}
          >
            <Text className="text-white font-bold text-base tracking-wider uppercase">
              Login
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. LOGIN
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'login') {
    return (
      <View className={`flex-1 ${colors.bg} justify-center px-6 pt-10`}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          {/* Header Switch */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => setStep('landing')} className="w-10 h-10 bg-slate-200/50 dark:bg-slate-800/50 rounded-full items-center justify-center border border-slate-300/30 dark:border-slate-700/30">
              <Text className="text-emerald-500 font-bold text-lg">←</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Text className={`${colors.textMuted} text-xs font-semibold`}>Dark Mode</Text>
              <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
            </View>
          </View>

          <View className="items-center mb-6">
            <View className="w-14 h-14 bg-emerald-600 rounded-2xl items-center justify-center mb-3">
              <Text className="text-white text-2xl font-black">I</Text>
            </View>
            <Text className={`${colors.text} text-xl font-bold text-center`}>Login to your account</Text>
            <Text className={`${colors.textMuted} mt-1 text-xs text-center`}>Enter your registered email and password</Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-4 mb-6">
            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1.5 ml-1`}>Email Address</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3.5 text-sm ${colors.input}`}
                placeholder="email@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginEmail}
                onChangeText={setLoginEmail}
              />
            </View>

            <View>
              <View className="flex-row justify-between mb-1.5">
                <Text className={`${colors.textSecondary} text-xs font-bold ml-1`}>Password</Text>
                <TouchableOpacity onPress={() => setStep('forgot-password')}>
                  <Text className="text-emerald-500 text-xs font-bold mr-1">Forgot?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                className={`border rounded-xl px-4 py-3.5 text-sm ${colors.input}`}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                value={loginPass}
                onChangeText={setLoginPass}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl shadow-md flex-row justify-center items-center"
            onPress={submitLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-sm">Sign In</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className={`${colors.textMuted} text-xs`}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => setStep('register')}>
              <Text className="text-emerald-500 text-xs font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Quick-Access Seeded Credentials Drawer */}
          <View className="bg-slate-200/50 dark:bg-slate-800/40 p-4 rounded-2xl mt-6 border border-slate-300/30 dark:border-slate-700/30">
            <Text className="text-slate-600 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-wider mb-2">⚡ Tester Autofill Panel</Text>
            <Text className="text-slate-500 text-[10px] mb-3">Click any pre-seeded profile below to instantly load credentials:</Text>
            <View className="space-y-2">
              {mockUsers.map(u => (
                <TouchableOpacity
                  key={u.id}
                  onPress={() => {
                    setLoginEmail(u.email);
                    setLoginPass(u.password || 'password123');
                  }}
                  className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-xl flex-row justify-between items-center border border-slate-300/20"
                >
                  <View>
                    <Text className="text-[10px] text-slate-800 dark:text-white font-bold">{u.name} ({u.role})</Text>
                    <Text className="text-[9px] text-slate-500 font-mono mt-0.5">{u.email}</Text>
                  </View>
                  <Text className="text-emerald-500 text-[10px] font-bold">Autofill ➔</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 3. REGISTER SCREEN
  if (step === 'register') {
    return (
      <View className={`flex-1 ${colors.bg} justify-center px-6 pt-12`}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => setStep('landing')} className="w-10 h-10 bg-slate-200/50 dark:bg-slate-800/50 rounded-full items-center justify-center border border-slate-300/30 dark:border-slate-700/30">
              <Text className="text-emerald-500 font-bold text-lg">←</Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Text className={`${colors.textMuted} text-xs font-semibold`}>Dark Mode</Text>
              <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ true: '#10b981', false: '#cbd5e1' }} />
            </View>
          </View>

          <View className="items-center mb-6">
            <Text className={`${colors.text} text-xl font-bold`}>Create Onboarding Profile</Text>
            <Text className={`${colors.textMuted} mt-1 text-xs text-center`}>Choose your structural ecosystem role and sign up</Text>
          </View>

          {/* Role Pill Switcher */}
          <View className="flex-row bg-slate-200 dark:bg-slate-800 p-1 rounded-xl mb-5 gap-1">
            {(['CLIENT', 'ENGINEER', 'SUPERVISOR', 'SUPPLIER'] as const).map(r => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg items-center ${role === r ? 'bg-emerald-650 shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`text-[10px] font-extrabold ${role === r ? 'text-white' : colors.textMuted}`}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-3 mb-6">
            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1 ml-1`}>Full Name / Company Name</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-xs ${colors.input}`}
                placeholder="Grace Uwase"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1 ml-1`}>Email Address</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-xs ${colors.input}`}
                placeholder="grace.uwase@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={regEmail}
                onChangeText={setRegEmail}
              />
            </View>

            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1 ml-1`}>MTN MoMo Mobile Number</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-xs ${colors.input}`}
                placeholder="+250788100000"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
              />
            </View>

            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1 ml-1`}>Create Password</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-xs ${colors.input}`}
                placeholder="•••••••• (Min 8 chars)"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View>
              <Text className={`${colors.textSecondary} text-xs font-bold mb-1 ml-1`}>Confirm Password</Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-xs ${colors.input}`}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl shadow-md flex-row justify-center items-center"
            onPress={submitRegistration}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-sm">Register Account</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className={`${colors.textMuted} text-xs`}>Already have an account? </Text>
            <TouchableOpacity onPress={() => setStep('login')}>
              <Text className="text-emerald-500 text-xs font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 4. VERIFY EMAIL (Custom requested Centered Header with Left Checkground only + 6 Split Digit Inputs)
  if (step === 'verify-email') {
    return (
      <View className={`flex-1 ${colors.bg} px-6 pt-16`}>
        
        {/* Custom centered Header with only Left Checkground back button */}
        <View className="flex-row items-center justify-between mb-8 h-12 relative">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 items-center justify-center border border-slate-350 dark:border-slate-700 absolute left-0"
            onPress={() => setStep('landing')}
          >
            <Text className="text-emerald-500 text-xl font-bold">←</Text>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className={`${colors.text} text-base font-bold text-center`}>Verify your email</Text>
          </View>
          <View className="w-10 h-10 absolute right-0" /> {/* Spacer */}
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-6">
            <View className="w-14 h-14 bg-emerald-500/10 rounded-full items-center justify-center mb-3 border border-emerald-500/20">
              <Text className="text-emerald-500 text-xl">✉</Text>
            </View>
            <Text className={`${colors.textMuted} text-center px-4 leading-5 text-xs`}>
              We've sent a 6-digit OTP code to verify your account registration.
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Masked display box */}
          <View className={`border rounded-xl py-2 px-4 flex-row items-center justify-between mb-6 ${colors.card}`}>
            <Text className={`${colors.textSecondary} font-semibold text-xs`}>{maskEmailAddress(email)}</Text>
            <View className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Text className="text-emerald-500 text-[10px] font-semibold">OTP Code Sent</Text>
            </View>
          </View>

          {/* 6 Split Digits Input Layout */}
          <View className="mb-6">
            <Text className={`${colors.text} text-xs font-bold mb-3 ml-1 text-center`}>
              Enter 6-Digit OTP (Hint: 123456)
            </Text>
            
            <View className="flex-row justify-between mb-4 px-2 gap-2">
              {pinRefs.map((ref, idx) => (
                <TextInput
                  key={idx}
                  ref={ref}
                  className={`w-11 h-14 border rounded-xl text-center text-lg font-bold ${colors.input} focus:border-emerald-500`}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otpDigits[idx]}
                  onChangeText={(val) => handleOtpDigitChange(val, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl shadow-md flex-row justify-center items-center mb-5"
            onPress={submitEmailOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-sm">Verify Email</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className={`${colors.textMuted} text-xs`}>Didn't receive a code?</Text>
            <TouchableOpacity 
              onPress={triggerResend}
              disabled={cooldown > 0}
              className="mt-2"
            >
              <Text className={`font-bold text-xs ${cooldown > 0 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5. VERIFY PHONE
  // ══════════════════════════════════════════════════════════════════════════
  if (step === 'verify-phone') {
    return (
      <View className={`flex-1 ${colors.bg} px-6 pt-16`}>
        <View className="flex-row items-center justify-between mb-8 h-12 relative">
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-slate-200/50 dark:bg-slate-800/50 items-center justify-center border border-slate-350 dark:border-slate-700 absolute left-0"
            onPress={() => setStep('landing')}
          >
            <Text className="text-emerald-500 text-xl font-bold">←</Text>
          </TouchableOpacity>
          <View className="flex-1 items-center justify-center">
            <Text className={`${colors.text} text-base font-bold text-center`}>Verify your phone</Text>
          </View>
          <View className="w-10 h-10 absolute right-0" />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-6">
            <View className="w-14 h-14 bg-emerald-500/10 rounded-full items-center justify-center mb-3 border border-emerald-500/20">
              <Text className="text-emerald-500 text-xl">📱</Text>
            </View>
            <Text className={`${colors.textMuted} text-center px-4 leading-5 text-xs`}>
              We've issued a 6-digit verification code to your Rwanda MTN partner number.
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className={`border rounded-xl py-2 px-4 flex-row items-center justify-between mb-6 ${colors.card}`}>
            <Text className={`${colors.textSecondary} font-semibold text-xs`}>{maskPhoneNumber(phone)}</Text>
            <View className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <Text className="text-emerald-500 text-[10px] font-semibold">SMS Transmitted</Text>
            </View>
          </View>

          {/* 6 Split Digits Input Layout */}
          <View className="mb-6">
            <Text className={`${colors.text} text-xs font-bold mb-3 ml-1 text-center`}>
              Enter 6-Digit OTP (Hint: 123456)
            </Text>
            
            <View className="flex-row justify-between mb-4 px-2 gap-2">
              {pinRefs.map((ref, idx) => (
                <TextInput
                  key={idx}
                  ref={ref}
                  className={`w-11 h-14 border rounded-xl text-center text-lg font-bold ${colors.input} focus:border-emerald-500`}
                  maxLength={1}
                  keyboardType="number-pad"
                  value={otpDigits[idx]}
                  onChangeText={(val) => handleOtpDigitChange(val, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl shadow-md flex-row justify-center items-center mb-5"
            onPress={submitPhoneOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-sm">Verify Phone</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className={`${colors.textMuted} text-xs`}>Didn't receive a code?</Text>
            <TouchableOpacity 
              onPress={triggerResend}
              disabled={cooldown > 0}
              className="mt-2"
            >
              <Text className={`font-bold text-xs ${cooldown > 0 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {cooldown > 0 ? `Resend SMS in ${cooldown}s` : 'Resend SMS'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
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
      <View className={`flex-1 ${colors.bg} px-6 justify-center`}>
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-amber-500/10 rounded-full items-center justify-center mb-4 border border-amber-500/20">
            <Text className="text-amber-500 text-3xl font-bold">⏳</Text>
          </View>
          <Text className={`${colors.text} text-xl font-bold text-center`}>KYC Onboarding Under Review</Text>
          <Text className={`${colors.textMuted} text-xs mt-2 text-center px-4 leading-5`}>
            Our compliance desk is checking your uploaded credentials against Rwanda registry databases. This generally takes less than 24 hours.
          </Text>
        </View>

        {/* Dynamic bypass dashboard triggers */}
        <View className={`p-5 rounded-3xl border mb-6 ${colors.card} space-y-3`}>
          <Text className="text-emerald-500 font-bold text-xs uppercase tracking-wider text-center">⚡ Tester Review Simulator</Text>
          <Text className="text-slate-500 text-[10px] text-center leading-4">
            Simulate an admin action to instantly approve or reject this user account so you can preview the fully active role dashboard:
          </Text>
          
          <View className="flex-row gap-3 pt-2">
            <TouchableOpacity 
              onPress={() => handleAdminSimulateDecision('APPROVE')}
              className="bg-emerald-600 active:bg-emerald-700 py-2.5 rounded-xl flex-1 items-center"
            >
              <Text className="text-white font-bold text-xs">Instantly Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleAdminSimulateDecision('REJECT', 'Submitted document scans are blurry')}
              className="bg-red-500/15 border border-red-500/30 py-2.5 rounded-xl flex-1 items-center"
            >
              <Text className="text-red-500 font-bold text-xs">Simulate Reject</Text>
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