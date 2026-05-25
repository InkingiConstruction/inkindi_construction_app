import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import "../global.css";

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthContextProvider, useAuth } from '@/contexts/AuthContext';
import AuthFlow from '@/features/auth/AuthFlow';
import HomeScreen from './index';

function AppContent() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <AuthFlow />;
  }

  return <HomeScreen />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContextProvider>
        <AnimatedSplashOverlay />
        <AppContent />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
