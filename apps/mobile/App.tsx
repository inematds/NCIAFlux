import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import { RootNavigator } from './src/navigation/RootNavigator';

function DemoModeBanner() {
  const { isDemoMode } = useAuth();
  if (!isDemoMode) return null;

  return (
    <View style={styles.demoBanner}>
      <Text style={styles.demoText}>Modo Demo</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
          <DemoModeBanner />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 24,
  },
  status: {
    fontSize: 16,
    color: '#1B5E20',
    marginBottom: 8,
  },
  demoBanner: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFA726',
    paddingVertical: 4,
    alignItems: 'center',
  },
  demoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
