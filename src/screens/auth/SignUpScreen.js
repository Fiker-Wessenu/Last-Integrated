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
import firestore from '@react-native-firebase/firestore';
// import LogoSVG from '../../assets/images/logo.svg';

const { width, height } = Dimensions.get('window');

function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one capital letter' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character' };
  }
  return { valid: true };
}

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scrollViewRef = useRef(null);
  const confirmPasswordRef = useRef(null);

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
  }, []);

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!email.toLowerCase().endsWith('@ssgi.gov.et')) {
      setError('Email must be @ssgi.gov.et');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Set the display name on the Firebase Auth account itself
      await user.updateProfile({
        displayName: fullName.trim(),
      });

      await user.sendEmailVerification();

      // Create the user's Firestore profile — required by your
      // security rules, and used by the rest of the app.
      await firestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        fullName: fullName.trim(),
        email: user.email,
        photoURL: null, // default avatar shown client-side until they upload one
        emailVerified: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // No manual navigation here — AppNavigator's onAuthStateChanged listener
      // picks up the new signed-in user and routes to VerifyEmailScreen automatically,
      // since that screen only exists in the "!user.emailVerified" stack, not this one.
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
          >
            <View style={styles.logoContainer}>
              <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#FFFFFF' }}>ORBIT</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.welcomeText}>CREATE ACCOUNT</Text>
              <Text style={styles.appName}>Orbit Chat</Text>
              <Text style={styles.subtitle}>JOIN THE SPACE COMMUNITY</Text>
            </View>

            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={fullName}
                  onChangeText={(text) => {
                    setError('');
                    setFullName(text);
                  }}
                  editable={!loading}
                  returnKeyType="next"
                  onSubmitEditing={() => {}}
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="yourname@ssgi.gov.et"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setError('');
                    setEmail(text);
                  }}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Min 8 characters, 1 capital, 1 special"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry
                  value={password}
                  onChangeText={(text) => {
                    setError('');
                    setPassword(text);
                  }}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <TextInput
                  ref={confirmPasswordRef}
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Re-enter your password"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setError('');
                    setConfirmPassword(text);
                  }}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.signInRow}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.signInText}>Already have an account?</Text>
                <Text style={styles.signInLink}> Sign In</Text>
              </TouchableOpacity>
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
    backgroundColor: '#0A0A1A',
  },
  hillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.53,
    backgroundColor: '#FF6B35',
    borderTopLeftRadius: height * 0.42,
    borderTopRightRadius: height * 0.42,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 10,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 6,
    marginBottom: 2,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  formContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
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
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  signInText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
  signInLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
});