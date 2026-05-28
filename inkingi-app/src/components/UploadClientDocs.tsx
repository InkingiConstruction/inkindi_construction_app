import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
const UploadClientDocs = () => {
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
    toggleTheme,
  } = useAuth();
  const [nationalIdUri, setNationalIdUri] = useState<string | null>(null);
  const [addressUri, setAddressUri] = useState<string | null>(null);
  const [propertyUri, setPropertyUri] = useState<string | null>(null);

  const [uploadingNationalId, setUploadingNationalId] = useState(false);
  const [uploadingAddress, setUploadingAddress] = useState(false);
  const [uploadingProperty, setUploadingProperty] = useState(false);

  const [nationalIdProgress, setNationalIdProgress] = useState(0);
  const [addressProgress, setAddressProgress] = useState(0);
  const [propertyProgress, setPropertyProgress] = useState(0);

  const [verifying, setVerifying] = useState(false);
  const isDark = theme === "dark";
  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-50",
    text: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-300" : "text-slate-700",
    textMuted: isDark ? "text-slate-400" : "text-slate-500",
    card: isDark
      ? "bg-slate-800 border-slate-700"
      : "bg-white border-slate-200 shadow-sm",
    input: isDark
      ? "bg-slate-800 border-slate-700 text-white"
      : "bg-white border-slate-350 text-slate-900",
  };
const openPicker = async (
  setUri: any,
  setUploading: any,
  setProgress: any,
) => {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Permission Required",
      "Please allow gallery access."
    );
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
  });

  if (result.canceled) return;

  const uri = result.assets?.[0]?.uri;

  if (!uri) return;

  setUploading(true);

  let progress = 0;

  const interval = setInterval(() => {
    progress += 20;

    setProgress(progress);

    if (progress >= 100) {
      clearInterval(interval);

      setUploading(false);

      setUri(uri);
    }
  }, 300);
};

  const pickNationalId = () => {
    openPicker(setNationalIdUri, setUploadingNationalId, setNationalIdProgress);
  };

  const pickAddressDocument = () => {
    openPicker(setAddressUri, setUploadingAddress, setAddressProgress);
  };

  const pickPropertyDocument = () => {
    openPicker(setPropertyUri, setUploadingProperty, setPropertyProgress);
  };

  const continueToEmailVerification = async () => {
    setVerifying(true);
    try {
      // Proceed to OTP flow handled by `AuthFlow`.
      setStep('verify-email');
    } finally {
      setVerifying(false);
    }
  };
  return (
    <View className={`flex-1 ${colors.bg} px-6 pt-14`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4">
            <Text className="text-4xl">📄</Text>
          </View>

          <Text className="text-emerald-700 text-2xl font-extrabold text-center">
            Identity Verification
          </Text>

          <Text className={`${colors.textMuted} text-center mt-2 text-base`}>
            Upload Documents
          </Text>
        </View>

        {/* Description */}
        <View className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
          <Text className="text-emerald-800 text-sm leading-6">
            To verify your account, please upload the required KYC documents.
          </Text>
        </View>

        {/* National ID */}
        <View className="border border-gray-200 rounded-2xl p-4 mb-4 bg-white">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-black font-bold text-base">
                National ID or Passport
              </Text>

              <Text className="text-gray-500 text-sm mt-1">
                Required document
              </Text>
            </View>

            {nationalIdUri ? (
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="text-emerald-700 text-xs font-bold">
                  Uploaded
                </Text>
              </View>
            ) : null}
          </View>

          {uploadingNationalId ? (
            <View className="mb-3">
              <ActivityIndicator color="#047857" />

              <View className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-2 bg-emerald-600 rounded-full"
                  style={{ width: `${nationalIdProgress}%` }}
                />
              </View>

              <Text className="text-xs text-gray-500 mt-2">
                Uploading {nationalIdProgress}%
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="bg-emerald-700 py-3 rounded-xl items-center"
            onPress={pickNationalId}
          >
            <Text className="text-white font-bold">
              {nationalIdUri ? "Re-upload" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Proof of Address */}
        <View className="border border-gray-200 rounded-2xl p-4 mb-4 bg-white">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-black font-bold text-base">
                Proof of Address
              </Text>

              <Text className="text-gray-500 text-sm mt-1">
                Optional but recommended
              </Text>
            </View>

            {addressUri ? (
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="text-emerald-700 text-xs font-bold">
                  Uploaded
                </Text>
              </View>
            ) : null}
          </View>

          {uploadingAddress ? (
            <View className="mb-3">
              <ActivityIndicator color="#047857" />

              <View className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-2 bg-emerald-600 rounded-full"
                  style={{ width: `${addressProgress}%` }}
                />
              </View>

              <Text className="text-xs text-gray-500 mt-2">
                Uploading {addressProgress}%
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="bg-emerald-700 py-3 rounded-xl items-center"
            onPress={pickAddressDocument}
          >
            <Text className="text-white font-bold">
              {addressUri ? "Re-upload" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Property Ownership */}
        <View className="border border-gray-200 rounded-2xl p-4 mb-8 bg-white">
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className="text-black font-bold text-base">
                Proof of Property Ownership
              </Text>

              <Text className="text-gray-500 text-sm mt-1">
                Upload if applicable
              </Text>
            </View>

            {propertyUri ? (
              <View className="bg-emerald-100 px-3 py-1 rounded-full">
                <Text className="text-emerald-700 text-xs font-bold">
                  Uploaded
                </Text>
              </View>
            ) : null}
          </View>

          {uploadingProperty ? (
            <View className="mb-3">
              <ActivityIndicator color="#047857" />

              <View className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <View
                  className="h-2 bg-emerald-600 rounded-full"
                  style={{ width: `${propertyProgress}%` }}
                />
              </View>

              <Text className="text-xs text-gray-500 mt-2">
                Uploading {propertyProgress}%
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            className="bg-emerald-700 py-3 rounded-xl items-center"
            onPress={pickPropertyDocument}
          >
            <Text className="text-white font-bold">
              {propertyUri ? "Re-upload" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Continue */}
        <TouchableOpacity
          className="bg-emerald-700 py-4 rounded-2xl items-center justify-center"
          onPress={continueToEmailVerification}
          disabled={!nationalIdUri || verifying}
        >
          {verifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default UploadClientDocs;
