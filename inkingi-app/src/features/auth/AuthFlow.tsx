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
import { Picker } from '@react-native-picker/picker';
import UploadClientDocs from '@/components/UploadClientDocs';
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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    Alert.alert('OTP Resent', 'A new 6-digit code has been sent successfully.');
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

    await AsyncStorage.multiRemove([
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
    // if (password !== confirmPassword) {
    //   setErrorMsg('Passwords do not match.');
    //   return;
    // }
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
        setErrorMsg('Invalid code entered. Please try again.');
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
        setErrorMsg('Invalid code. Please try again.');
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
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={() => setStep('landing')} className="w-10 h-10 rounded-full items-center justify-center">
              <Text className="text-[#007E6E] font-bold text-2xl">‹</Text>
            </TouchableOpacity>
            <View className="w-10 h-10" />
          </View>

          <View className="items-center mb-6">
            <View className="mb-3">
              <HomeIcon size={44} color="#007E6E" />
            </View>
            <Text className="text-[#007E6E] text-2xl font-extrabold text-center">Hi, WELCOME BACK</Text>
            <Text className={`${colors.textMuted} mt-1 text-sm text-center`}>Sign in to contiue</Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-4 mb-6">
            <View>
              <Text className={`${colors.textSecondary} text-sm font-semibold mb-2 ml-1`}>Email</Text>
              <View className={`flex-row items-center border rounded-xl px-4 ${colors.input}`}>
                <Text className="text-slate-400 text-lg mr-3">✉️</Text>
                <TextInput
                  className={`flex-1 py-3 text-sm ${colors.text}`}
                  placeholder="Enter your Email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                />
              </View>
            </View>

            <View>
              <Text className={`${colors.textSecondary} text-sm font-semibold mb-2 ml-1`}>Password</Text>
              <View className={`flex-row items-center border rounded-xl px-4 ${colors.input}`}>
                <Text className="text-slate-400 text-lg mr-3">🔒</Text>
                <TextInput
                  className={`flex-1 py-3 text-sm ${colors.text}`}
                  placeholder="Enter password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showLoginPassword}
                  autoCapitalize="none"
                  value={loginPass}
                  onChangeText={setLoginPass}
                />
                <TouchableOpacity onPress={() => setShowLoginPassword((p) => !p)} className="py-2 pl-3">
                  <Text className="text-slate-500 text-base">{showLoginPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity onPress={() => setRememberMe((p) => !p)} className="flex-row items-center">
              <View className={`w-4 h-4 rounded border mr-2 ${rememberMe ? 'bg-[#007E6E] border-[#007E6E]' : 'border-slate-400'}`} />
              <Text className={`${colors.textMuted} text-xs`}>Remember me</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('forgot-password')}>
              <Text className="text-[#007E6E] text-xs font-semibold">Forget password</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            className="bg-[#007E6E] active:bg-[#00685B] py-3.5 rounded-xl shadow-md flex-row justify-center items-center"
            onPress={submitLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-base">Login</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-5">
            <Text className={`${colors.textMuted} text-xs`}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => setStep('register')}>
              <Text className="text-[#007E6E] text-xs font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 3. REGISTER SCREEN
  if (step === 'register') {
    return (
    <View className={`flex-1 ${colors.bg} px-6 pt-14`}>
  <ScrollView
    contentContainerStyle={{
      flexGrow: 1,
      paddingBottom: 40,
    }}
    showsVerticalScrollIndicator={false}
  >
    {/* Logo / Header */}
    <View className="items-center mb-10">
      <View className="mb-4">
            <HomeIcon size={44} color="#007E6E" />
          </View>

      <Text className="text-[#007E6E] text-3xl font-extrabold tracking-wide">
        JOIN INKINGI
      </Text>

      <Text
        className={`${colors.textMuted} text-base mt-2 text-center`}
      >
        Create your account to get started
      </Text>
    </View>

    {/* Error Message */}
    {errorMsg ? (
      <View className="bg-red-100 border border-red-300 rounded-2xl p-3 mb-5">
        <Text className="text-red-600 text-center text-sm font-medium">
          {errorMsg}
        </Text>
      </View>
    ) : null}

    {/* Full Name */}
    <View className="mb-5">
      <Text
        className={`${colors.textSecondary} text-base font-semibold mb-2 ml-1`}
      >
        Full Name
      </Text>

      <View
        className={`flex-row items-center border rounded-2xl px-4 py-1 ${colors.input}`}
      >
        <Text className="text-slate-400 text-xl mr-3">👤</Text>

        <TextInput
          className={`flex-1 border-[#D5D5D5] py-3 text-base ${colors.text}`}
          placeholder="Enter your name"
          placeholderTextColor="#9ca3af"
          value={fullName}
          onChangeText={setFullName}
        />
      </View>
    </View>

    {/* Email */}
    <View className="mb-5">
      <Text
        className={`${colors.textSecondary} text-base font-semibold mb-2 ml-1`}
      >
        Email Address
      </Text>

      <View
        className={`flex-row items-center border rounded-2xl px-4 py-1 ${colors.input}`}
      >
        <Text className="text-slate-400 text-xl mr-3">✉️</Text>

        <TextInput
          className={`flex-1 border-[#D5D5D5] py-3 text-base ${colors.text}`}
          placeholder="Enter your Email"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={regEmail}
          onChangeText={setRegEmail}
        />
      </View>
    </View>

    {/* Phone */}
    <View className="mb-5">
      <Text
        className={`${colors.textSecondary} text-base font-semibold mb-2 ml-1`}
      >
        Phone Number
      </Text>

      <View
        className={`flex-row items-center border rounded-2xl px-4 py-1 ${colors.input}`}
      >
        <Text className="text-slate-400 text-xl mr-3">📞</Text>

        <TextInput
          className={`flex-1 border-[#D5D5D5] py-3 text-base ${colors.text}`}
          placeholder="Enter phone number"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
          value={regPhone}
          onChangeText={setRegPhone}
        />
      </View>
    </View>

    {/* Password */}
    <View className="mb-5">
      <Text
        className={`${colors.textSecondary} text-base font-semibold mb-2 ml-1`}
      >
        Password
      </Text>

      <View
        className={`flex-row items-center border rounded-2xl px-4 py-1 ${colors.input}`}
      >
        <Text className="text-slate-400 text-xl mr-3">🔒</Text>

        <TextInput
          className={`flex-1 py-3 border-[#D5D5D5] text-base ${colors.text}`}
          placeholder="Enter password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity>
          <Text className="text-slate-400 text-lg">👁️</Text>
        </TouchableOpacity>
      </View>
    </View>

    {/* Select Role */}
    <View className="mb-8">
      <Text
        className={`${colors.textSecondary} text-base font-semibold mb-2 ml-1`}
      >
        Select Role
      </Text>

      <View
        className={`border rounded-2xl px-4 ${colors.input}`}
      >
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={{
            color: theme === 'dark' ? '#fff' : '#111827',
          }}
        >
          <Picker.Item label="Choose role" value="" />
          <Picker.Item label="Client" value="CLIENT" />
          <Picker.Item label="Engineer" value="ENGINEER" />
          <Picker.Item label="Supervisor" value="SUPERVISOR" />
          <Picker.Item label="Supplier" value="SUPPLIER" />
          <Picker.Item label="Admin" value="ADMIN" />
        </Picker>
      </View>
    </View>

    {/* Continue Button */}
    <TouchableOpacity
      className="bg-emerald-600 py-4 rounded-2xl shadow-md"
      onPress={()=>setStep("kyc-upload")}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className="text-white text-center font-bold text-lg">
          Continue
        </Text>
      )}
    </TouchableOpacity>

    {/* Sign In */}
    <View className="flex-row justify-center mt-8">
      <Text className={`${colors.textMuted} text-base`}>
        Already have an account!{' '}
      </Text>

      <TouchableOpacity onPress={() => setStep('login')}>
        <Text className="text-emerald-600 text-base font-bold">
          Sign In
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</View>
    );
  }
if (step === 'kyc-upload') {
  return <UploadClientDocs />;
}
  // 4. VERIFY EMAIL (Custom requested Centered Header with Left Checkground only + 6 Split Digit Inputs)
  if (step === 'verify-email') {
    return (
      <View className={`flex-1 ${colors.bg} px-6 pt-14`}>
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => setStep('landing')} className="w-10 h-10 items-center justify-center">
            <Text className="text-[#007E6E] text-2xl font-bold">‹</Text>
          </TouchableOpacity>
          <Text className="text-[#007E6E] text-lg font-bold">OTP Verification</Text>
          <View className="w-10 h-10" />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="items-center mt-10 mb-10">
            <View className="w-16 h-16 bg-[#007E6E] rounded-2xl items-center justify-center mb-6">
              <Text className="text-white text-2xl font-bold">✉️</Text>
            </View>
            <Text className={`${colors.textSecondary} text-base text-center`}>
              Enter the OTP code sent to{'\n'}your email
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
              <Text className="text-red-500 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          {/* 6 Split Digits Input Layout */}
          <View className="mb-10">
            <View className="flex-row justify-between mb-4 px-2">
              {pinRefs.map((ref, idx) => (
                <TextInput
                  key={idx}
                  ref={ref}
                  className={`w-12 h-12 border rounded-xl text-center text-lg font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
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
            className="bg-[#007E6E] active:bg-[#00685B] py-4 rounded-xl shadow-md flex-row justify-center items-center mb-6"
            onPress={submitEmailOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-base">Verify</Text>
          </TouchableOpacity>

          <View className="items-center">
            <TouchableOpacity onPress={triggerResend} disabled={cooldown > 0} className="mt-2">
              <Text className={`font-semibold text-xs ${cooldown > 0 ? 'text-slate-400' : 'text-[#007E6E]'}`}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
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
      <View className={`flex-1 ${colors.bg} px-6 pt-14`}>
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => setStep('landing')} className="w-10 h-10 items-center justify-center">
            <Text className="text-[#007E6E] text-2xl font-bold">‹</Text>
          </TouchableOpacity>
          <Text className="text-[#007E6E] text-lg font-bold">OTP Verification</Text>
          <View className="w-10 h-10" />
        </View>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="items-center mt-10 mb-10">
            <View className="w-16 h-16 bg-[#007E6E] rounded-2xl items-center justify-center mb-6">
              <Text className="text-white text-2xl font-bold">📱</Text>
            </View>
            <Text className={`${colors.textSecondary} text-base text-center`}>
              Enter the OTP code sent to{'\n'}your phone
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6">
              <Text className="text-red-500 text-center text-xs font-semibold">{errorMsg}</Text>
            </View>
          ) : null}

          {/* 6 Split Digits Input Layout */}
          <View className="mb-10">
            <View className="flex-row justify-between mb-4 px-2">
              {pinRefs.map((ref, idx) => (
                <TextInput
                  key={idx}
                  ref={ref}
                  className={`w-12 h-12 border rounded-xl text-center text-lg font-bold ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
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
            className="bg-[#007E6E] active:bg-[#00685B] py-4 rounded-xl shadow-md flex-row justify-center items-center mb-6"
            onPress={submitPhoneOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-base">Verify</Text>
          </TouchableOpacity>

          <View className="items-center">
            <TouchableOpacity 
              onPress={triggerResend}
              disabled={cooldown > 0}
              className="mt-2"
            >
              <Text className={`font-semibold text-xs ${cooldown > 0 ? 'text-slate-400' : 'text-[#007E6E]'}`}>
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
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