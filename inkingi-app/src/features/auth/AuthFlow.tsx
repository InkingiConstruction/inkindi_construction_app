/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : AuthFlow.tsx
 * WHAT THIS FILE DOES : Comprehensive authentication and KYC onboarding screens flow
 * HOW IT DOES IT      : Conditional renders based on AuthContext state with beautiful UI
 * DATA SOURCE         : User input forms and simulated camera actions
 * DATA DESTINATION    : AuthContext triggers and local state storage
 * PRINCIPLE APPLIED   : SOLID (Auth screen isolation & role-tailored view management)
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Switch
} from 'react-native';
import { useAuth, AuthStep } from '../../contexts/AuthContext';
import { simulateExternalRegistryCheck } from '../../data/mockAdminService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeIcon } from 'lucide-react-native';

export default function AuthFlow() {
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
    mockUsers,
    theme,
    toggleTheme
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  // OTP resend timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
  try {
    setLoading(true);

    await AsyncStorage.removeMany([
      'token',
      'user',
      'refreshToken',
    ]);

    setStep('landing');
    setRole(null);

    Alert.alert('Logged out', 'You have been successfully logged out.');
  } catch (error) {
    console.log('Logout error:', error);
    Alert.alert('Error', 'Failed to logout. Try again.');
  } finally {
    setLoading(false);
  }
};

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otpDigits[idx] && idx > 0) {
        const newDigits = [...otpDigits];
        newDigits[idx - 1] = '';
        setOtpDigits(newDigits);
        setOtpVal(newDigits.join(''));
        pinRefs[idx - 1].current?.focus();
      }
    }
  };

  const maskEmailAddress = (emailStr: string) => {
    if (!emailStr) return '';
    const parts = emailStr.split('@');
    if (parts.length !== 2) return emailStr;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `**@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const maskPhoneNumber = (phoneStr: string) => {
    if (!phoneStr) return '';
    if (phoneStr.length < 5) return phoneStr;
    return `${phoneStr.substring(0, 4)}***${phoneStr.substring(phoneStr.length - 3)}`;
  };

  const submitRegistration = async () => {
    setErrorMsg('');
    if (!fullName || !regEmail || !regPhone || !password) {
      setErrorMsg('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await handleRegister(fullName, regEmail, regPhone, password);
      // Clean states
      setFullName('');
      setRegEmail('');
      setRegPhone('');
      setPassword('');
      setConfirmPassword('');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpVal('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const submitLogin = async () => {
    setErrorMsg('');
    if (!loginEmail || !loginPass) {
      setErrorMsg('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const success = await handleLogin(loginEmail, loginPass);
      if (!success) {
        setErrorMsg('Invalid email or password.');
      } else {
        setLoginEmail('');
        setLoginPass('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const submitEmailOTP = async () => {
    setErrorMsg('');
    if (otpVal.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

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
    if (otpVal.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

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
    if (!idCardUri) {
      setErrorMsg('Proof of identity (National ID / Passport) is mandatory.');
      return;
    }
    if ((role === 'ENGINEER' || role === 'SUPERVISOR') && !licenseUri) {
      setErrorMsg('Professional practice certificate license is required for this role.');
      return;
    }
    if (role === 'SUPPLIER' && !bizRegUri) {
      setErrorMsg('Business Registration Certificate (RGB/RDB) is required.');
      return;
    }

    setLoading(true);
    try {
      await handleUploadKYC({
        idCard: idCardUri,
        license: licenseUri,
        insurance: insuranceUri,
        bizReg: bizRegUri,
        taxCert: taxCertUri
      });
    } catch (err) {
      setErrorMsg('Failed to process documents upload.');
    } finally {
      setLoading(false);
    }
  };

  // Theme support styles
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? 'bg-slate-900' : 'bg-slate-50',
    text: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-slate-300' : 'text-slate-700',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    card: isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm',
    input: isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-350 text-slate-900',
  };

  // 1. LANDING SCREEN (Always Dark cover themed)
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

  // 2. LOGIN SCREEN
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

  // 5. VERIFY PHONE SCREEN
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

  // 6. KYC DOCUMENTATION UPLOAD SCREEN
  if (step === 'kyc-upload') {
    return (
      <View className={`flex-1 ${colors.bg} px-6 pt-16`}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`${colors.text} text-lg font-bold`}>KYC Verification</Text>
          <TouchableOpacity onPress={handleLogout} className="bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            <Text className="text-red-500 text-xs font-bold">Logout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text className={`${colors.textSecondary} text-xs mb-5 leading-5`}>
            To protect investor escrow funds and comply with financial regulations in Rwanda, please attach structural certifications.
          </Text>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-4 mb-6">
            
            {/* Identity Proof (All roles) */}
            <View className={`p-4 rounded-2xl border ${colors.card} space-y-2`}>
              <Text className={`${colors.text} text-xs font-bold`}>1. National ID / Passport Photo</Text>
              
              {idCardUri ? (
                <View className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex-row justify-between items-center">
                  <Text className="text-emerald-500 font-bold text-[10px]">✓ id_passport.jpg Attached</Text>
                  <TouchableOpacity onPress={() => setIdCardUri('')}>
                    <Text className="text-red-500 text-[10px] font-bold">Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setIdCardUri('https://res.cloudinary.com/demo/image/upload/idcard')}
                  className="bg-slate-200/50 dark:bg-slate-800/60 h-16 border border-dashed border-slate-350 dark:border-slate-700 rounded-xl justify-center items-center"
                >
                  <Text className={`${colors.textMuted} text-xs font-bold`}>📷 Tap to Capture or Load ID Card</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Engineer & Supervisor Licensure */}
            {(role === 'ENGINEER' || role === 'SUPERVISOR') && (
              <View className={`p-4 rounded-2xl border ${colors.card} space-y-3`}>
                <Text className={`${colors.text} text-xs font-bold`}>2. Rwanda IER Professional Practice License</Text>
                
                <TextInput
                  className={`border rounded-xl px-4 py-2.5 text-xs ${colors.input}`}
                  placeholder="Enter License Registration Number (e.g. IER-8821)"
                  placeholderTextColor="#94a3b8"
                  value={licenseId}
                  onChangeText={setLicenseId}
                />

                <TouchableOpacity 
                  onPress={handleVerifyLicenseExternally}
                  className="bg-emerald-600/15 border border-emerald-500/25 py-2 rounded-xl items-center"
                >
                  <Text className="text-emerald-500 text-xs font-bold">🔍 Run Registry Verification Check</Text>
                </TouchableOpacity>

                {licenseUri ? (
                  <View className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex-row justify-between items-center">
                    <Text className="text-emerald-500 font-bold text-[10px]">✓ license_certificate.jpg Attached</Text>
                    <TouchableOpacity onPress={() => setLicenseUri('')}>
                      <Text className="text-red-500 text-[10px] font-bold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setLicenseUri('https://res.cloudinary.com/demo/image/upload/license')}
                    className="bg-slate-200/50 dark:bg-slate-800/60 h-16 border border-dashed border-slate-350 dark:border-slate-700 rounded-xl justify-center items-center"
                  >
                    <Text className={`${colors.textMuted} text-xs font-bold`}>📷 Upload License Scan</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Supplier Business Registration */}
            {role === 'SUPPLIER' && (
              <View className={`p-4 rounded-2xl border ${colors.card} space-y-2`}>
                <Text className={`${colors.text} text-xs font-bold`}>2. Business Registration Certificate (RGB/RDB)</Text>
                
                {bizRegUri ? (
                  <View className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 flex-row justify-between items-center">
                    <Text className="text-emerald-500 font-bold text-[10px]">✓ rgb_registration.pdf Attached</Text>
                    <TouchableOpacity onPress={() => setBizRegUri('')}>
                      <Text className="text-red-500 text-[10px] font-bold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => setBizRegUri('https://res.cloudinary.com/demo/image/upload/bizreg')}
                    className="bg-slate-200/50 dark:bg-slate-800/60 h-16 border border-dashed border-slate-350 dark:border-slate-700 rounded-xl justify-center items-center"
                  >
                    <Text className={`${colors.textMuted} text-xs font-bold`}>📷 Attach RDB/RGB Certificate</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl shadow-md flex-row justify-center items-center"
            onPress={submitKYCDocumentation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-sm">Submit Documents For Review</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // 7. KYC PENDING REVIEW SCREEN
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
          className="border border-slate-350 dark:border-slate-700 py-3.5 rounded-xl items-center"
        >
          <Text className={`${colors.textSecondary} font-bold text-xs`}>Logout & Check Later</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}
