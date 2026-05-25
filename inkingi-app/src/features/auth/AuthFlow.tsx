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

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ImageBackground, 
  ScrollView, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useAuth, AuthStep } from '../../contexts/AuthContext';
import { simulateExternalRegistryCheck } from '../../data/mockAdminService';

/**
 * ============================================================================
 * 🔧 FUNCTION: AuthFlow
 * ============================================================================
 * WHAT IT DOES: Main hub coordinate rendering of login, signup, OTPs, and uploads
 * PARAMETERS: None
 * RETURNS: JSX.Element - Active state screen
 * WHO CALLS IT: Layout loader
 * PRINCIPLE: SOLID
 * ============================================================================
 */
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
    handleAdminSimulateDecision
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
  const [cooldown, setCooldown] = useState(0);

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
    Alert.alert('OTP Resent', 'A new 6-digit code has been sent successfully (Hint: 123456).');
  };

  /**
   * ============================================================================
   * 🔧 FUNCTION: maskEmailAddress
   * ============================================================================
   * WHAT IT DOES: Masks the email except first 2 characters for security
   * PARAMETERS:
   *   - raw (string) : full email string
   * RETURNS: string - masked email
   * WHO CALLS IT: verify-email screen renderer
   * PRINCIPLE: DRY
   * ============================================================================
   */
  const maskEmailAddress = (raw: string): string => {
    if (!raw || !raw.includes('@')) return 'gr****@gmail.com';
    const [name, domain] = raw.split('@');
    if (name.length <= 2) return `${name}****@${domain}`;
    return `${name.slice(0, 2)}****@${domain}`;
  };

  /**
   * 🧱 CODE BLOCK: Handle Registration Submit
   * WHAT IT IS DOING: Validates parameters, updates UI loader, invokes context registration
   * WHY IT IS HERE  : Business rule validation rules REG-01 through REG-11
   * PRINCIPLE       : KISS
   */
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧱 CODE BLOCK: Handle Login Submit
   * WHAT IT IS DOING: Authenticates using credentials, triggers OTP verification or dashboard
   * WHY IT IS HERE  : Authentication entry point
   * PRINCIPLE       : KISS
   */
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

  /**
   * 🧱 CODE BLOCK: Validate Email OTP Code
   * WHAT IT IS DOING: Confirms standard 6-digit format and verifies with auth manager
   * WHY IT IS HERE  : OTP-01 through OTP-06 validation compliance
   * PRINCIPLE       : KISS
   */
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
      } else {
        setErrorMsg('Invalid code entered. Use 123456 for simulator.');
      }
    } catch (err) {
      setErrorMsg('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧱 CODE BLOCK: Validate Phone OTP Code
   * WHAT IT IS DOING: Submits phone verification code
   * WHY IT IS HERE  : Dual verification policy
   * PRINCIPLE       : KISS
   */
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
      } else {
        setErrorMsg('Invalid code entered. Use 123456 for simulator.');
      }
    } catch (err) {
      setErrorMsg('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🧱 CODE BLOCK: Verify Professional License check
   * WHAT IT IS DOING: Checks engineer license against online registry simulator
   * WHY IT IS HERE  : Auto validation of qualified engineers
   * PRINCIPLE       : SOLID
   */
  const checkProfessionalLicense = async () => {
    if (!licenseId) {
      Alert.alert('Input License', 'Please type in a license code (Example format: IER-2026-123).');
      return;
    }
    setLoading(true);
    const valid = await simulateExternalRegistryCheck(licenseId);
    setIsLicenseValid(valid);
    setLoading(false);
    if (valid) {
      setLicenseUri('https://res.cloudinary.com/demo/image/upload/license');
      Alert.alert('Valid License', 'License verified successfully in IER portal database!');
    } else {
      Alert.alert('Invalid License', 'License was not found. Must start with "IER-2026-" for this simulation.');
    }
  };

  /**
   * 🧱 CODE BLOCK: Submit KYC Documents payload
   * WHAT IT IS DOING: Validates role-specific requirements, pushes files to state machine
   * WHY IT IS HERE  : Compliance with KYC rules KYC-01 to KYC-07
   * PRINCIPLE       : SOLID
   */
  const submitKYCDocuments = async () => {
    if (!idCardUri) {
      Alert.alert('Missing ID card', 'National ID or Passport photo is required for all roles.');
      return;
    }

    if (role === 'ENGINEER') {
      if (!isLicenseValid || !licenseId) {
        Alert.alert('License required', 'You must verify your IER professional license first.');
        return;
      }
      if (!insuranceUri) {
        Alert.alert('Insurance required', 'Professional indemnity insurance is required.');
        return;
      }
    }

    if (role === 'SUPERVISOR') {
      if (!licenseId) {
        Alert.alert('Certificate required', 'Quality control certificate ID is required.');
        return;
      }
      if (!insuranceUri) {
        Alert.alert('Insurance required', 'Professional indemnity insurance is required.');
        return;
      }
    }

    if (role === 'SUPPLIER') {
      if (!bizRegUri || !taxCertUri) {
        Alert.alert('Documents required', 'RDB registration & RRA Tax certificates are required.');
        return;
      }
    }

    setLoading(true);
    try {
      await handleUploadKYC({
        idCard: idCardUri,
        license: licenseId,
        insurance: insuranceUri,
        bizReg: bizRegUri,
        taxCert: taxCertUri
      });
    } catch (err) {
      Alert.alert('Upload Failed', 'Error uploading documents to server.');
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete file templates for quick simulation testing
  const autoFillDocuments = () => {
    setIdCardUri('https://res.cloudinary.com/demo/image/upload/national_id.jpg');
    if (role === 'ENGINEER') {
      setLicenseId('IER-2026-8942');
      setIsLicenseValid(true);
      setLicenseUri('https://res.cloudinary.com/demo/image/upload/ier_license.pdf');
      setInsuranceUri('https://res.cloudinary.com/demo/image/upload/indemnity_insurance.pdf');
    } else if (role === 'SUPERVISOR') {
      setLicenseId('SUP-QC-4019');
      setInsuranceUri('https://res.cloudinary.com/demo/image/upload/indemnity_insurance.pdf');
    } else if (role === 'SUPPLIER') {
      setBizRegUri('https://res.cloudinary.com/demo/image/upload/rdb_biz_reg.pdf');
      setTaxCertUri('https://res.cloudinary.com/demo/image/upload/rra_tax_compliance.pdf');
    }
  };

  /**
   * 🧱 CODE BLOCK: Landing screen UI renderer
   * WHAT IT IS DOING: Renders the hero background screen with overlays, texts, and buttons
   * WHY IT IS HERE  : Stunning high premium landing visual experience
   * PRINCIPLE       : KISS
   */
  if (step === 'landing') {
    return (
      <ImageBackground
        source={require('../../../assets/inkingi-banner.jpg')}
        className="flex-1"
        resizeMode="cover"
      >
        {/* Dark opacity overlay */}
        <View className="flex-1 bg-black/60 justify-between px-6 py-16">
          {/* Top Spacing */}
          <View />

          {/* Logo & Headline */}
          <View className="items-center">
            {/* Center Logo/Icon */}
            <View className="w-20 h-20 bg-emerald-600 rounded-2xl items-center justify-center mb-6 shadow-xl border border-emerald-400">
              <Text className="text-white text-4xl font-extrabold">I</Text>
            </View>
            <Text className="text-white text-3xl font-extrabold tracking-wide mb-3 text-center">
              Welcome to Inkingi
            </Text>
            <Text className="text-gray-200 text-base leading-6 text-center font-medium px-4">
              Bridging trust between Diaspora investors and local construction professionals in Rwanda
            </Text>
          </View>

          {/* Buttons */}
          <View className="space-y-4">
            <TouchableOpacity 
              className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg border border-emerald-500"
              onPress={() => setStep('register')}
            >
              <Text className="text-white text-center font-bold text-lg">Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white/10 active:bg-white/20 py-4 rounded-xl border border-white/20"
              onPress={() => setStep('login')}
            >
              <Text className="text-white text-center font-bold text-lg">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  /**
   * 🧱 CODE BLOCK: Login screen UI renderer
   * WHAT IT IS DOING: Renders standard login forms
   * WHY IT IS HERE  : Access gate for returning profiles
   * PRINCIPLE       : KISS
   */
  if (step === 'login') {
    return (
      <View className="flex-1 bg-slate-900 justify-center px-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-emerald-600 rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-3xl font-extrabold">I</Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center">Login to your account</Text>
            <Text className="text-slate-400 mt-2 text-center">Enter your registered email and password</Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-sm font-medium">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-4 mb-6">
            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-base focus:border-emerald-500"
                placeholder="email@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                value={loginEmail}
                onChangeText={setLoginEmail}
              />
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-300 text-sm font-semibold ml-1">Password</Text>
                <TouchableOpacity onPress={() => setStep('forgot-password')}>
                  <Text className="text-emerald-400 text-sm font-medium mr-1">Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-base focus:border-emerald-500"
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
                value={loginPass}
                onChangeText={setLoginPass}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center"
            onPress={submitLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-lg">Sign In</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => setStep('register')}>
              <Text className="text-emerald-400 text-sm font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: Registration screen UI renderer
   * WHAT IT IS DOING: Renders the signup flow with fields: Full Name, Email, Phone, Password, and Role selection
   * WHY IT IS HERE  : Self-service account onboarding entry point
   * PRINCIPLE       : KISS
   */
  if (step === 'register') {
    return (
      <View className="flex-1 bg-slate-900 justify-center px-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}>
          <View className="items-center mb-6">
            <View className="w-14 h-14 bg-emerald-600 rounded-xl items-center justify-center mb-3">
              <Text className="text-white text-2xl font-extrabold">I</Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center">Create your account</Text>
            <Text className="text-slate-400 text-sm mt-1 text-center">Select your profile category and start onboarding</Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-sm font-medium">{errorMsg}</Text>
            </View>
          ) : null}

          <View className="space-y-4 mb-6">
            {/* Role dropdown options */}
            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Choose Role</Text>
              <View className="flex-row flex-wrap gap-2">
                {(['CLIENT', 'ENGINEER', 'SUPERVISOR', 'SUPPLIER'] as const).map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium ${
                      role === r 
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Text className={role === r ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Full Name</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-base focus:border-emerald-500"
                placeholder="Grace Uwase"
                placeholderTextColor="#64748b"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Email</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-base focus:border-emerald-500"
                placeholder="grace.uwase@example.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                value={regEmail}
                onChangeText={setRegEmail}
              />
            </View>

            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Phone Number (Rwanda format)</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-base focus:border-emerald-500"
                placeholder="+250788123456"
                placeholderTextColor="#64748b"
                keyboardType="phone-pad"
                value={regPhone}
                onChangeText={setRegPhone}
              />
            </View>

            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Password</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-base focus:border-emerald-500"
                placeholder="Minimum 8 characters"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View>
              <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Confirm Password</Text>
              <TextInput
                className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-base focus:border-emerald-500"
                placeholder="Confirm password"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center"
            onPress={submitRegistration}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-lg">Continue</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-400 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => setStep('login')}>
              <Text className="text-emerald-400 text-sm font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: Forgot Password renderer
   * WHAT IT IS DOING: Takes user email and sends code
   * WHY IT IS HERE  : Standard self password recover logic
   * PRINCIPLE       : KISS
   */
  if (step === 'forgot-password') {
    return (
      <View className="flex-1 bg-slate-900 justify-center px-6">
        <View className="items-center mb-8">
          <Text className="text-white text-3xl font-extrabold mb-3">Reset Password</Text>
          <Text className="text-slate-400 text-center">
            Enter your email address and we'll send a 6-digit OTP code to verify identity
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">Email Address</Text>
          <TextInput
            className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-base focus:border-emerald-500"
            placeholder="email@example.com"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          className="bg-emerald-600 py-4 rounded-xl shadow-lg mb-4"
          onPress={() => {
            Alert.alert('OTP Sent', 'Password reset code has been sent successfully (Hint: 123456).');
            setStep('verify-email');
          }}
        >
          <Text className="text-white text-center font-bold text-lg">Send Verification Code</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="py-2.5"
          onPress={() => setStep('login')}
        >
          <Text className="text-slate-400 text-center text-sm font-bold">Back to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: Email verification OTP entry UI renderer
   * WHAT IT IS DOING: Generates chevron navigation, visual mask, and OTP input box
   * WHY IT IS HERE  : Email confirmation rules
   * PRINCIPLE       : KISS
   */
  if (step === 'verify-email') {
    return (
      <View className="flex-1 bg-slate-900 px-6 pt-16">
        {/* Back header */}
        <TouchableOpacity 
          className="flex-row items-center mb-6" 
          onPress={() => setStep('landing')}
        >
          <Text className="text-emerald-400 text-xl font-bold">←</Text>
          <Text className="text-emerald-400 text-sm font-semibold ml-2">Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-emerald-500/20">
              <Text className="text-emerald-400 text-2xl">✉</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-2">Verify your email</Text>
            <Text className="text-slate-400 text-center px-4 leading-5">
              We've sent a 6-digit OTP code to verify your account registration.
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-sm font-medium">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Masked display box */}
          <View className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 flex-row items-center justify-between mb-6">
            <Text className="text-slate-300 font-semibold text-base">{maskEmailAddress(email)}</Text>
            <View className="bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Text className="text-emerald-400 text-xs font-semibold">Verification Code Sent</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1 text-center">
              Enter 6-Digit OTP (Hint: 123456)
            </Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[8px] focus:border-emerald-500"
              placeholder="000000"
              placeholderTextColor="#475569"
              maxLength={6}
              keyboardType="number-pad"
              value={otpVal}
              onChangeText={setOtpVal}
            />
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center mb-6"
            onPress={submitEmailOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-lg">Verify Email</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-slate-400 text-sm">Didn't receive a code?</Text>
            <TouchableOpacity 
              onPress={triggerResend}
              disabled={cooldown > 0}
              className="mt-2"
            >
              <Text className={`font-bold text-sm ${cooldown > 0 ? 'text-slate-600' : 'text-emerald-400'}`}>
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: Verify Phone (SMS OTP) UI renderer
   * WHAT IT IS DOING: Renders OTP field for phone confirmation
   * WHY IT IS HERE  : Rwanda phone verification workflow
   * PRINCIPLE       : KISS
   */
  if (step === 'verify-phone') {
    return (
      <View className="flex-1 bg-slate-900 px-6 pt-16">
        <TouchableOpacity 
          className="flex-row items-center mb-6" 
          onPress={() => setStep('verify-email')}
        >
          <Text className="text-emerald-400 text-xl font-bold">←</Text>
          <Text className="text-emerald-400 text-sm font-semibold ml-2">Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}>
          <View className="items-center mb-8">
            <View className="w-16 h-16 bg-slate-800 rounded-full items-center justify-center mb-4 border border-emerald-500/20">
              <Text className="text-emerald-400 text-2xl">📱</Text>
            </View>
            <Text className="text-white text-2xl font-bold mb-2">Verify your phone</Text>
            <Text className="text-slate-400 text-center px-4 leading-5">
              An SMS containing your verification code was sent to:
            </Text>
          </View>

          {errorMsg ? (
            <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
              <Text className="text-red-400 text-center text-sm font-medium">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Masked display box */}
          <View className="bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 flex-row items-center justify-between mb-6">
            <Text className="text-slate-300 font-semibold text-base">{phone || '+250 788 ••• ••1'}</Text>
            <View className="bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Text className="text-emerald-400 text-xs font-semibold">SMS Sent</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1 text-center">
              Enter 6-Digit OTP (Hint: 123456)
            </Text>
            <TextInput
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-4 text-center text-2xl font-bold tracking-[8px] focus:border-emerald-500"
              placeholder="000000"
              placeholderTextColor="#475569"
              maxLength={6}
              keyboardType="number-pad"
              value={otpVal}
              onChangeText={setOtpVal}
            />
          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg flex-row justify-center items-center mb-6"
            onPress={submitPhoneOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-lg">Verify Phone</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-slate-400 text-sm">Didn't receive an SMS?</Text>
            <TouchableOpacity 
              onPress={triggerResend}
              disabled={cooldown > 0}
              className="mt-2"
            >
              <Text className={`font-bold text-sm ${cooldown > 0 ? 'text-slate-600' : 'text-emerald-400'}`}>
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend SMS'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: KYC Document Upload screen UI renderer
   * WHAT IT IS DOING: Generates responsive layout containing role specific upload inputs
   * WHY IT IS HERE  : Flexible compliance rules based on customer profiles
   * PRINCIPLE       : SOLID
   */
  if (step === 'kyc-upload') {
    return (
      <View className="flex-1 bg-slate-900 px-6 pt-16">
        {/* Header Title */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Identity Verification</Text>
            <Text className="text-slate-400 text-sm mt-0.5">Upload requirements for your role: {role}</Text>
          </View>
          <TouchableOpacity 
            onPress={autoFillDocuments}
            className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-emerald-400 text-xs font-bold">🪄 Autofill Docs</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View className="space-y-6">
            
            {/* Core Requirement: National ID (For all roles) */}
            <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
              <View className="flex-row items-center mb-3">
                <Text className="text-emerald-400 text-lg mr-2">📌</Text>
                <Text className="text-white font-bold text-base">National ID or Passport</Text>
              </View>
              <Text className="text-slate-400 text-sm mb-4">
                Please upload a clear scanned color copy or photo of your official government issue identification.
              </Text>
              
              {idCardUri ? (
                <View className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex-row items-center justify-between">
                  <Text className="text-emerald-400 text-sm font-semibold truncate flex-1">📄 national_id_scan.jpg</Text>
                  <TouchableOpacity onPress={() => setIdCardUri('')}>
                    <Text className="text-red-400 text-xs font-bold px-2 py-1">Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setIdCardUri('https://res.cloudinary.com/demo/image/upload/id')}
                  className="bg-slate-900/50 border border-dashed border-slate-700 h-28 rounded-xl items-center justify-center active:bg-slate-800/30"
                >
                  <Text className="text-slate-400 text-sm font-semibold">📷 Capture photo or Upload from gallery</Text>
                  <Text className="text-slate-500 text-xs mt-1">PNG, JPG up to 10MB</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ENGINEER specific requirements */}
            {role === 'ENGINEER' && (
              <View className="space-y-6">
                {/* IER License check */}
                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">🛠️</Text>
                    <Text className="text-white font-bold text-base">IER Professional License</Text>
                  </View>
                  <Text className="text-slate-400 text-sm mb-4">
                    Enter license ID to perform an instant validation registry check with IER.
                  </Text>
                  
                  <View className="flex-row gap-2 mb-4">
                    <TextInput
                      className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm flex-1 focus:border-emerald-500"
                      placeholder="IER-2026-8942"
                      placeholderTextColor="#475569"
                      value={licenseId}
                      onChangeText={setLicenseId}
                    />
                    <TouchableOpacity 
                      onPress={checkProfessionalLicense}
                      className="bg-emerald-600 px-4 rounded-xl justify-center active:bg-emerald-700"
                    >
                      <Text className="text-white font-bold text-xs">Verify</Text>
                    </TouchableOpacity>
                  </View>

                  {isLicenseValid === true ? (
                    <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex-row items-center">
                      <Text className="text-emerald-400 text-sm font-semibold">✓ License confirmed valid inside IER Registry.</Text>
                    </View>
                  ) : isLicenseValid === false ? (
                    <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex-row items-center">
                      <Text className="text-red-400 text-sm font-semibold">✗ Verification failed. Try again.</Text>
                    </View>
                  ) : null}
                </View>

                {/* Indemnity Insurance */}
                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">🛡️</Text>
                    <Text className="text-white font-bold text-base">Professional Indemnity Insurance</Text>
                  </View>
                  <Text className="text-slate-400 text-sm mb-4">
                    Provide certificate confirming liability cover of minimum 10M RWF.
                  </Text>

                  {insuranceUri ? (
                    <View className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex-row items-center justify-between">
                      <Text className="text-emerald-400 text-sm font-semibold flex-1">📄 insurance_policy.pdf</Text>
                      <TouchableOpacity onPress={() => setInsuranceUri('')}>
                        <Text className="text-red-400 text-xs font-bold px-2 py-1">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setInsuranceUri('https://res.cloudinary.com/demo/image/upload/insurance')}
                      className="bg-slate-900/50 border border-dashed border-slate-700 h-24 rounded-xl items-center justify-center active:bg-slate-800/30"
                    >
                      <Text className="text-slate-400 text-sm font-semibold">📷 Upload Policy Document</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* SUPERVISOR specific requirements */}
            {role === 'SUPERVISOR' && (
              <View className="space-y-6">
                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">🎓</Text>
                    <Text className="text-white font-bold text-base">QC Inspection Certificate</Text>
                  </View>
                  <Text className="text-slate-400 text-sm mb-4">
                    Provide your professional registration/certifying reference number.
                  </Text>
                  <TextInput
                    className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:border-emerald-500 mb-2"
                    placeholder="SUP-QC-4019"
                    placeholderTextColor="#475569"
                    value={licenseId}
                    onChangeText={setLicenseId}
                  />
                </View>

                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">🛡️</Text>
                    <Text className="text-white font-bold text-base">Indemnity Liability Insurance</Text>
                  </View>
                  {insuranceUri ? (
                    <View className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex-row items-center justify-between">
                      <Text className="text-emerald-400 text-sm font-semibold flex-1">📄 insurance_policy.pdf</Text>
                      <TouchableOpacity onPress={() => setInsuranceUri('')}>
                        <Text className="text-red-400 text-xs font-bold px-2 py-1">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setInsuranceUri('https://res.cloudinary.com/demo/image/upload/insurance')}
                      className="bg-slate-900/50 border border-dashed border-slate-700 h-24 rounded-xl items-center justify-center active:bg-slate-800/30"
                    >
                      <Text className="text-slate-400 text-sm font-semibold">📷 Upload Policy Document</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* SUPPLIER specific requirements */}
            {role === 'SUPPLIER' && (
              <View className="space-y-6">
                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">🏢</Text>
                    <Text className="text-white font-bold text-base">Business Registration Certificate (RDB)</Text>
                  </View>
                  {bizRegUri ? (
                    <View className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex-row items-center justify-between">
                      <Text className="text-emerald-400 text-sm font-semibold flex-1">📄 rdb_registration.pdf</Text>
                      <TouchableOpacity onPress={() => setBizRegUri('')}>
                        <Text className="text-red-400 text-xs font-bold px-2 py-1">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setBizRegUri('https://res.cloudinary.com/demo/image/upload/biz')}
                      className="bg-slate-900/50 border border-dashed border-slate-700 h-24 rounded-xl items-center justify-center active:bg-slate-800/30"
                    >
                      <Text className="text-slate-400 text-sm font-semibold">📷 Upload RDB Document</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="bg-slate-800 border border-slate-700/80 rounded-2xl p-4">
                  <View className="flex-row items-center mb-3">
                    <Text className="text-emerald-400 text-lg mr-2">📊</Text>
                    <Text className="text-white font-bold text-base">Tax Compliance Certificate (RRA)</Text>
                  </View>
                  {taxCertUri ? (
                    <View className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex-row items-center justify-between">
                      <Text className="text-emerald-400 text-sm font-semibold flex-1">📄 rra_tax_compliance.pdf</Text>
                      <TouchableOpacity onPress={() => setTaxCertUri('')}>
                        <Text className="text-red-400 text-xs font-bold px-2 py-1">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setTaxCertUri('https://res.cloudinary.com/demo/image/upload/tax')}
                      className="bg-slate-900/50 border border-dashed border-slate-700 h-24 rounded-xl items-center justify-center active:bg-slate-800/30"
                    >
                      <Text className="text-slate-400 text-sm font-semibold">📷 Upload RRA Certificate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

          </View>

          <TouchableOpacity 
            className="bg-emerald-600 active:bg-emerald-700 py-4 rounded-xl shadow-lg mt-8 flex-row justify-center items-center"
            onPress={submitKYCDocuments}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#white" size="small" className="mr-2" />
            ) : null}
            <Text className="text-white text-center font-bold text-lg">Submit for Verification</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /**
   * 🧱 CODE BLOCK: KYC pending review UI renderer with simulation control bar
   * WHAT IT IS DOING: Informs users documents are processing, renders interactive mock buttons
   * WHY IT IS HERE  : Simulated admin flow lets users easily test both approval states in a mock context
   * PRINCIPLE       : SOLID
   */
  if (step === 'kyc-pending') {
    return (
      <View className="flex-1 bg-slate-900 px-6 pt-20 justify-between pb-8">
        <View />

        {/* Center message info */}
        <View className="items-center">
          <View className="w-20 h-20 bg-slate-800 rounded-full items-center justify-center mb-6 border border-emerald-500/20 shadow-lg">
            <Text className="text-emerald-400 text-4xl">🕒</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-3">KYC Under Review</Text>
          <Text className="text-slate-300 text-center px-4 leading-6 text-base mb-2 font-medium">
            Your identity is being verified by our operations team.
          </Text>
          <Text className="text-slate-500 text-center px-8 text-sm">
            This typically takes less than 24 hours. You will receive an email and push alert once approved.
          </Text>
        </View>

        {/* Admin simulator bar */}
        <View className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-xl">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 text-center">
            🔐 Developer Testing Simulator Console
          </Text>
          <Text className="text-slate-500 text-xs text-center mb-4">
            Simulate administrative decisions on your KYC registration payload:
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => handleAdminSimulateDecision('APPROVE')}
              className="bg-emerald-600 py-3 rounded-xl flex-1 active:bg-emerald-700 border border-emerald-500 shadow-md"
            >
              <Text className="text-white text-center font-bold text-sm">🟢 Approve KYC</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleAdminSimulateDecision('REJECT', 'Scanned ID card is too blurry.')}
              className="bg-red-600 py-3 rounded-xl flex-1 active:bg-red-700 border border-red-500 shadow-md"
            >
              <Text className="text-white text-center font-bold text-sm">🔴 Reject KYC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
