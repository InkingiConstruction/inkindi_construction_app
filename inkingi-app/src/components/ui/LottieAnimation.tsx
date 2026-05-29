import { View, Platform, ActivityIndicator, Text } from "react-native";

let LottieView: any = null;
if (Platform.OS !== "web") {
  try {
    LottieView = require("lottie-react-native");
    // Ensure we resolve the default export if packaged as ES modules
    if (LottieView && LottieView.default) {
      LottieView = LottieView.default;
    }
  } catch (e) {
    console.warn("Lottie is not fully loaded. Fallback spinner will be used.");
  }
}

interface LottieAnimationProps {
  type: "loading" | "success" | "construction" | "empty" | "secure";
  size?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

const animationMap: Record<string, any> = {
  loading: require("@/assets/lottie/construction_progress.json"), // using as fallback
  success: require("@/assets/lottie/secure_payment.json"), // using as fallback
  construction: require("@/assets/lottie/construction_progress.json"),
  empty: require("@/assets/lottie/inspection_checklist.json"), // using as fallback
  secure: require("@/assets/lottie/secure_payment.json"),
};

export default function LottieAnimation({
  type,
  size = 120,
  loop = true,
  autoPlay = true,
}: LottieAnimationProps) {
  const source = animationMap[type];

  // If running on web or if Lottie is not available, render a premium SVG-like fallback
  if (Platform.OS === "web" || !LottieView) {
    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {type === "loading" && (
          <View className="items-center justify-center space-y-2">
            <ActivityIndicator size="large" color="#007E6E" />
            <Text className="text-primary-500 font-openSans text-[10px] uppercase font-bold tracking-wider">
              Loading...
            </Text>
          </View>
        )}
        {type === "success" && (
          <View className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-full">
            <Text
              className="text-emerald-500 font-bold"
              style={{ fontSize: size * 0.3 }}
            >
              ✓
            </Text>
          </View>
        )}
        {type === "construction" && (
          <View className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-full">
            <Text style={{ fontSize: size * 0.3 }}>🏗️</Text>
          </View>
        )}
        {type === "empty" && (
          <View className="items-center justify-center p-3">
            <Text style={{ fontSize: size * 0.25 }}>📁</Text>
            <Text className="text-slate-400 font-openSans text-xs mt-1">
              No Data Available
            </Text>
          </View>
        )}
        {type === "secure" && (
          <View className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-full">
            <Text style={{ fontSize: size * 0.3 }}>🔒</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <LottieView
      source={source}
      style={{ width: size, height: size }}
      autoPlay={autoPlay}
      loop={loop}
    />
  );
}
