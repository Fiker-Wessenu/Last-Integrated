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
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../firebase/context/AuthContext';
import { LogoSVG } from '../../components/Branding';

const { width, height } = Dimensions.get('window');

const Icon = ({ name, size = 24, color = '#000' }) => {
  let path = '';
  if (name === 'eye') path = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z';
  if (name === 'eye-off') path = 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d={path} />
    </Svg>
  );
};

function validatePassword(password) {
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one capital letter' };
  }
  if ((password.match(/\d/g) || []).length < 3) {
    return { valid: false, message: 'Password must include at least 3 numbers' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(password)) {
    return { valid: false, message: 'Password must include at least one special character' };
  }
  return { valid: true };
}

export default function SignUpScreen({ navigation }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [meetsLength, setMeetsLength] = useState(false);
  const [meetsUppercase, setMeetsUppercase] = useState(false);
  const [meetsNumbers, setMeetsNumbers] = useState(false);
  const [meetsSpecialChar, setMeetsSpecialChar] = useState(false);

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

  const checkPasswordRequirements = (text) => {
    setError('');
    setPassword(text);
    setMeetsLength(text.length >= 12);
    setMeetsUppercase(/[A-Z]/.test(text));
    setMeetsNumbers((text.match(/\d/g) || []).length >= 3);
    setMeetsSpecialChar(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/.test(text));
  };

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid phone number (min 10 digits)');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Invalid email address (must be @gmail.com)');
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
      await signUp(email, password, fullName, { phone: phone.trim() });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <View style={styles.requirementRow}>
      <Text style={[styles.requirementBullet, met ? styles.bulletMet : styles.bulletNotMet]}>
        {met ? '✓' : '*'}
      </Text>
      <Text style={[styles.requirementText, met ? styles.textMet : styles.textNotMet]}>
        {text}
      </Text>
    </View>
  );

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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <LogoSVG width={200} height={90} />
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
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  value={fullName}
                  onChangeText={(text) => {
                    setError('');
                    setFullName(text);
                  }}
                  editable={!loading}
                  selectionColor="#0088cc"
                />
              </View>

              {/* Phone */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your phone number"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(text) => {
                    setError('');
                    setPhone(text);
                  }}
                  editable={!loading}
                  selectionColor="#0088cc"
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="normal@gmail.com"
                  placeholderTextColor="rgba(0,0,0,0.35)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setError('');
                    setEmail(text);
                  }}
                  editable={!loading}
                  selectionColor="#0088cc"
                />
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, error && styles.inputError]}
                    placeholder="Min 12 chars, 1 cap, 3 nums, 1 special"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={checkPasswordRequirements}
                    editable={!loading}
                    selectionColor="#0088cc"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={22}
                      color="rgba(0,0,0,0.4)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Live password requirements */}
              <View style={styles.requirementsContainer}>
                <RequirementItem met={meetsLength} text="At least 12 characters" />
                <RequirementItem met={meetsUppercase} text="At least one capital letter" />
                <RequirementItem met={meetsNumbers} text="At least 3 numbers" />
                <RequirementItem met={meetsSpecialChar} text="At least one special character" />
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, error && styles.inputError]}
                    placeholder="Re-enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setError('');
                      setConfirmPassword(text);
                    }}
                    editable={!loading}
                    selectionColor="#0088cc"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye' : 'eye-off'}
                      size={22}
                      color="rgba(0,0,0,0.4)"
                    />
                  </TouchableOpacity>
                </View>
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
                style={styles.signInContainer}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.signInText}>
                  Already have an account?<Text style={styles.signInLink}> Sign In</Text>
                </Text>
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
    backgroundColor: '#ffffff',
  },
  hillContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: height * 0.52,
    backgroundColor: '#DD984B',
    borderTopLeftRadius: height * 0.92,
    borderTopRightRadius: height * 0.92,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0, 0, 0, 0.59)',
    letterSpacing: 4,
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
    color: 'rgba(0, 0, 0, 1)',
    marginBottom: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 14,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  requirementBullet: {
    fontSize: 14,
    marginRight: 10,
    width: 16,
  },
  bulletMet: {
    color: '#4CAF50',
  },
  bulletNotMet: {
    color: '#FF6B6B',
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.4)',
  },
  textMet: {
    color: '#4CAF50',
  },
  textNotMet: {
    color: '#FF6B6B',
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
    backgroundColor: '#0088cc',
    shadowColor: '#0088cc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,136,204,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,136,204,0.3)',
  },
  signInText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  signInLink: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0088cc',
    textDecorationLine: 'underline',
    marginLeft: 4,
  },
});
