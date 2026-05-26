import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { 
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import {
  RobotoMono_400Regular,
  RobotoMono_700Bold,
} from '@expo-google-fonts/roboto-mono';

import "../global.css";

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthContextProvider, useAuth } from '@/contexts/AuthContext';
import AuthFlow from '@/features/auth/AuthFlow';
import HomeScreen from './index';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <AuthFlow />;
  }

  return <HomeScreen />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
    RobotoMono_400Regular,
    RobotoMono_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContextProvider>
        <AnimatedSplashOverlay />
        <AppContent />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
