import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Singleton RecaptchaVerifier instance
let recaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Get singleton RecaptchaVerifier instance
 */
const getRecaptchaVerifier = (containerId: string = 'recaptcha-container'): RecaptchaVerifier => {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: (response: any) => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      }
    });
  }
  return recaptchaVerifier;
};

/**
 * Clear the RecaptchaVerifier instance
 */
const clearRecaptcha = (): void => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
};

export class FirebasePhoneAuthService {

  /**
   * Send OTP to phone number
   */
  async sendOTP(phoneNumber: string, containerId?: string): Promise<ConfirmationResult> {
    try {
      // Ensure phone number has country code
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const verifier = getRecaptchaVerifier(containerId);

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhoneNumber,
        verifier
      );

      return confirmationResult;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(confirmationResult: ConfirmationResult, otpCode: string) {
    try {
      const result = await confirmationResult.confirm(otpCode);
      return result;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Get Firebase ID token
   */
  async getFirebaseToken(): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      const token = await user.getIdToken();
      return token;
    } catch (error: any) {
      console.error('Error getting Firebase token:', error);
      throw new Error('Failed to get authentication token');
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await auth.signOut();
      clearRecaptcha();
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get user-friendly error messages
   */
  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/invalid-phone-number':
        return 'Invalid phone number format';
      case 'auth/too-many-requests':
        return 'Too many requests. Please try again later';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA verification failed. Please try again';
      case 'auth/invalid-verification-code':
        return 'Invalid OTP code. Please check and try again';
      case 'auth/code-expired':
        return 'OTP code has expired. Please request a new one';
      case 'auth/credential-already-in-use':
        return 'This phone number is already registered';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return error.message || 'An error occurred during authentication';
    }
  }
}

// Export singleton instance and utility functions
export const firebasePhoneAuth = new FirebasePhoneAuthService();
export { clearRecaptcha };
