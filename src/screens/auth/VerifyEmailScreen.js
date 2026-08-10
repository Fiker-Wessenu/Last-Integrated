import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function VerifyEmailScreen({ navigation }) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const email = auth().currentUser?.email;

  // Countdown for the resend button so users can't spam it
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleCheckVerified() {
    setChecking(true);
    try {
      // reload() pulls the latest state from Firebase's servers
      await auth().currentUser.reload();
      const user = auth().currentUser;

      if (user.emailVerified) {
        // Update the Firestore profile to reflect verification
        await firestore().collection('users').doc(user.uid).update({
          emailVerified: true,
        });
        // Your auth-state listener higher up should now route to
        // the main app automatically. If not, navigate manually:
        // navigation.navigate('Home');
      } else {
        Alert.alert(
          'Not Verified Yet',
          "We haven't detected your verification yet. Please check your inbox (and spam folder) and tap the link, then try again."
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong checking your status. Please try again.');
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setResending(true);
    try {
      await auth().currentUser.sendEmailVerification();
      Alert.alert('Email Sent', 'Verification email resent — check your inbox.');
      setCooldown(30); // 30 second cooldown before allowing another resend
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        Alert.alert('Please Wait', 'Too many requests. Try again in a few minutes.');
      } else {
        Alert.alert('Error', 'Could not resend verification email.');
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.body}>
        We sent a verification link to{'\n'}
        <Text style={styles.email}>{email}</Text>
        {'\n\n'}Please check your inbox and tap the link to activate your account.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleCheckVerified}
        disabled={checking}
      >
        {checking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>I've Verified — Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleResend}
        disabled={resending || cooldown > 0}
      >
        <Text style={[styles.link, (resending || cooldown > 0) && styles.linkDisabled]}>
          {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => auth().signOut()}>
        <Text style={styles.signOut}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0d1117',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    color: '#8b949e',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  email: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2f81f7',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 20,
  },
  link: {
    color: '#2f81f7',
    textAlign: 'center',
    fontSize: 14,
  },
  linkDisabled: {
    color: '#484f58',
  },
  signOut: {
    color: '#8b949e',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
});
