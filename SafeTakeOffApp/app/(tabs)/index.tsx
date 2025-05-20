import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>🛩️</Text>
        </View>
      </View>
      <Text style={styles.title}>Welcome to Safe2Fly</Text>
      <Text style={styles.subtitle}>
        Access online drone safety tools and view live aircraft nearby.
      </Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/map')}>
          <Text style={styles.buttonText}>View Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/login')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2563eb',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
    color: '#2563eb',
  },
  title: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#444',
    fontSize: 15,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonGroup: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});
