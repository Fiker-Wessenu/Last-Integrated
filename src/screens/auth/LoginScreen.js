import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
// import AntennaTip from '../../assets/images/antenna-tip.svg';
// import LogoSVG from '../../assets/images/logo.svg';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await auth().signInWithEmailAndPassword(email, password);
      // Navigation happens automatically via AppNavigator's onAuthStateChanged listener,
      // which also routes unverified users to VerifyEmailScreen — no need to check here.
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.hillContainer} />
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#1B5674' }}>ORBIT</Text>
            </View>

            {/* Title */}
            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>SIGN IN TO</Text>
              <Text style={styles.appName}>Orbit Chat</Text>
              <Text style={styles.subtitle}>FROM EARTH TO SPACE</Text>
            </View>

            {/* Antenna with Signal Waves */}
            <View style={styles.broadcastContainer}>
              <View style={styles.signalWrapper}>
                <Animated.View
                  style={[
                    styles.signalWave,
                    styles.signalWave1,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.signalWave,
                    styles.signalWave2,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.signalWave,
                    styles.signalWave3,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
              </View>
              <View style={styles.antennaContainer}>
                <View style={{ width: 80, height: 100, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 10 }} />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="yourname@ssgi.gov.et"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setError('');
                  setEmail(text);
                }}
                editable={!loading}
                selectionColor="#DD984B"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter your password"
                placeholderTextColor="rgba(0,0,0,0.35)"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setError('');
                  setPassword(text);
                }}
                editable={!loading}
                selectionColor="#DD984B"
              />
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading || !email.trim() || password.length < 6}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            {/* ===== SIGN UP OPTION ===== */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <Text style={styles.signUpLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Please use your institutional email
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.53,
    backgroundColor: '#DD984B',
    borderTopLeftRadius: height * 0.92,
    borderTopRightRadius: height * 0.92,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0, 0, 0, 0.59)',
    textTransform: 'uppercase',
    letterSpacing: 6,
    marginBottom: 2,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.59)',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  broadcastContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
    marginTop: 50,
    marginBottom: 20,
  },
  signalWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  signalWave: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(125, 125, 125, 0.4)',
  },
  signalWave1: {
    width: 100,
    height: 100,
    borderWidth: 2,
  },
  signalWave2: {
    width: 140,
    height: 140,
    borderWidth: 1.5,
    borderColor: 'rgba(105, 105, 105, 0.25)',
  },
  signalWave3: {
    width: 180,
    height: 180,
    borderWidth: 1,
    borderColor: 'rgba(105, 105, 105, 0.18)',
  },
  antennaContainer: {
    position: 'absolute',
    top: 30,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 1)',
    marginBottom: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#c0392b',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1B5674',
    shadowColor: '#1B5674',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,107,53,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  signUpText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  signUpLink: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5674',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
