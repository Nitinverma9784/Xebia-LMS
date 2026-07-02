import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldAlert, CheckCircle, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { useStudentAuth } from '@/auth/student/studentAuthHooks';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';

export default function StudentLoginPage() {
  const { sendOtp, verifyOtp } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login credentials states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMsg || '');

  // OTP Verification Flow states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [otpSentName, setOtpSentName] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [pendingUserSession, setPendingUserSession] = useState(null);

  const otpInputsRef = useRef([]);

  // Redirect target
  const from = location.state?.from?.pathname || '/student/dashboard';

  // Clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // OTP Countdown timer
  useEffect(() => {
    let interval = null;
    if (showOtpScreen && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, resendTimer]);

  const validate = () => {
    const e = {};
    if (!email) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      e.password = 'Password is required';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit credentials -> Verify against local registry, then send dynamic OTP via backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      let matchedUser = null;
      
      // Look up locally registered students database to verify password
      const registeredRaw = localStorage.getItem('registered-students');
      if (registeredRaw) {
        const registered = JSON.parse(registeredRaw);
        const match = registered.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (match && match.password === password) {
          matchedUser = match;
        }
      }
      
      // Support default fallback test account dynamically if credentials match
      if (email.toLowerCase() === 'aarav.sharma@xebia.com' && password === 'password123') {
        matchedUser = { email: 'aarav.sharma@xebia.com', fullName: 'Aarav Sharma' };
      }

      if (!matchedUser) {
        throw new Error('Invalid email or password. If you are new, please sign up first.');
      }

      // Dynamic email and name captured
      const targetEmail = matchedUser.email;
      const targetName = matchedUser.fullName;

      // Request backend to generate and dispatch unique OTP via SMTP
      await sendOtp(targetEmail, targetName);

      setPendingUserSession({ type: 'credentials', email: targetEmail, password, fullName: targetName });
      setOtpSentEmail(targetEmail);
      setOtpSentName(targetName);
      setResendTimer(30);
      setOtpAttempts(0);
      setOtpError('');
      setOtpValues(['', '', '', '', '', '']);
      setShowOtpScreen(true);
      
    } catch (err) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Google Login simulator -> Sends unique OTP dynamically to Google email account
  const handleGoogleSignIn = async () => {
    setServerError('');
    setSuccessMessage('');
    
    // Prompt dynamically for email if not entered in field to make it fully dynamic
    let googleEmail = email;
    if (!googleEmail || !/\S+@\S+\.\S+/.test(googleEmail)) {
      googleEmail = prompt('Please enter your Google account email:', 'student@xebia.com');
    }
    
    if (!googleEmail || !/\S+@\S+\.\S+/.test(googleEmail)) {
      setServerError('A valid email is required to sign in with Google.');
      return;
    }

    setGoogleLoading(true);
    const googleName = googleEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    try {
      // Trigger dynamic OTP to Google account via backend SMTP
      await sendOtp(googleEmail, googleName);

      setPendingUserSession({ 
        type: 'google', 
        email: googleEmail, 
        fullName: googleName,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleName)}`
      });
      setOtpSentEmail(googleEmail);
      setOtpSentName(googleName);
      setResendTimer(30);
      setOtpAttempts(0);
      setOtpError('');
      setOtpValues(['', '', '', '', '', '']);
      setShowOtpScreen(true);

    } catch (err) {
      setServerError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newValues = [...otpValues];
    newValues[index] = value.substring(value.length - 1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = async (e) => {
    if (e) e.preventDefault();
    setOtpError('');
    
    const code = otpValues.join('');
    if (code.length < 6) {
      setOtpError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    try {
      // Call backend to verify the OTP dynamically
      await verifyOtp(
        pendingUserSession.email, 
        code, 
        pendingUserSession.fullName, 
        pendingUserSession.type === 'google'
      );
      
      // Successfully authenticated. Redirect
      navigate(from, { replace: true });
    } catch (err) {
      const nextAttempts = otpAttempts + 1;
      setOtpAttempts(nextAttempts);
      
      if (nextAttempts >= 3) {
        setShowOtpScreen(false);
        setServerError('Maximum OTP verification attempts exceeded. Please login again.');
      } else {
        setOtpError(err.message || `Invalid verification code. You have ${3 - nextAttempts} attempts remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      await sendOtp(otpSentEmail, otpSentName);
      setResendTimer(30);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setOtpError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const floatingElements = [
    { id: 1, delay: 0, x: '5%', y: '18%', size: 'w-20 h-20', color: 'bg-purple-300/10' },
    { id: 2, delay: 3, x: '85%', y: '10%', size: 'w-24 h-24', color: 'bg-violet-400/10' },
    { id: 3, delay: 1, x: '80%', y: '75%', size: 'w-28 h-28', color: 'bg-indigo-300/10' },
    { id: 4, delay: 5, x: '10%', y: '70%', size: 'w-16 h-16', color: 'bg-purple-400/10' }
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#faf5ff] via-[#ffffff] to-[#eef2ff] px-4 py-12 overflow-hidden select-none">
      
      {/* ── Floating elements ── */}
      {floatingElements.map(el => (
        <motion.div
          key={el.id}
          className={`absolute rounded-2xl ${el.size} ${el.color} blur-[2px]`}
          style={{ top: el.y, left: el.x }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-login-otp" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(167, 139, 250, 0.35)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-login-otp)" />
        </svg>
      </div>

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-brand-border/70 bg-white p-8 shadow-2xl space-y-8"
        >
          {/* Header logo */}
          <div className="flex flex-col items-center justify-center text-center font-semibold">
            <Logo className="mb-2" variant="light" size="lg" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-2">
              Xebia Login Portal
            </span>
          </div>

          <AnimatePresence mode="wait">
            {!showOtpScreen ? (
              // ── Screen A: Login Credentials Form ──
              <motion.div
                key="login-form-screen"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Xebia Login Portal
                  </h2>
                </div>

                {successMessage && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-600 mb-4">
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="font-semibold">{successMessage}</p>
                  </div>
                )}

                {serverError && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 mb-4">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="font-semibold">{serverError}</p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    
                    {/* Email Input */}
                    <div className="relative">
                      <Input
                        label="Email Address"
                        type="text"
                        required
                        placeholder="Enter your email address"
                        value={email}
                        error={errors.email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                      />
                      <Mail className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        error={errors.password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        defaultChecked
                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-xs text-brand-text-secondary cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    
                    <Link
                      to="/student/forgot-password"
                      className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      disabled={loading || googleLoading}
                      className="w-full py-3 text-base font-semibold text-white bg-[#A78BFA] hover:bg-[#906ef5] transition-all rounded-xl shadow-lg shadow-purple-400/20 flex items-center justify-center gap-2 border-0 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending OTP...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading || googleLoading}
                      variant="outline"
                      className="w-full py-3 text-sm font-semibold border border-brand-border/60 hover:bg-brand-surface transition-all flex items-center justify-center gap-2 rounded-xl text-brand-text-primary cursor-pointer"
                    >
                      {googleLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.06,-1.2 -0.17,-1.72z" fill="#4285F4" />
                          <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.18l-2.92,-2.28c-0.81,0.54 -1.85,0.87 -3.04,0.87c-2.34,0 -4.33,-1.58 -5.04,-3.71H3.54v2.36C5.02,18.6 8.3,20.62 12,20.62z" fill="#34A853" />
                          <path d="M6.96,13.32a5.2,5.2 0 0 1 0,-3.34V7.62H3.54a8.62,8.62 0 0 0 0,8.06l3.42,-2.36z" fill="#FBBC05" />
                          <path d="M12,6.97c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,4.2 14.43,3.38 12,3.38c-3.7,0 -6.98,2.02 -8.46,4.94l3.42,2.66c0.71,-2.13 2.7,-3.71 5.04,-3.71z" fill="#EA4335" />
                        </svg>
                      )}
                      Continue with Google
                    </Button>
                  </div>
                </form>

                <div className="text-center text-sm text-brand-text-secondary mt-6 pt-3 border-t border-brand-border/40">
                  Don't have an account?{' '}
                  <Link
                    to="/student/register"
                    className="font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>
            ) : (
              // ── Screen B: OTP Verification Form ──
              <motion.div
                key="otp-verification-screen"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 mb-4">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Verify Your Identity</h3>
                  <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                    Verify your login by entering the 6-digit OTP sent to <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded select-all font-semibold">{otpSentEmail}</code>.
                  </p>
                </div>

                {otpError && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 mb-4">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                    <p className="font-semibold leading-snug">{otpError}</p>
                  </div>
                )}

                <form onSubmit={verifyOtpCode} className="space-y-6">
                  {/* OTP Codes Inputs Row */}
                  <div className="flex justify-between gap-2">
                    {otpValues.map((val, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputsRef.current[index] = el)}
                        type="text"
                        maxLength="1"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={val}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-12 w-12 text-center text-lg font-bold border border-slate-300 rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2">
                    {resendTimer > 0 ? (
                      <span className="text-xs text-brand-text-secondary">
                        Resend code in <strong className="text-purple-600 font-semibold">{resendTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-xs font-bold text-brand-primary hover:text-brand-primary/80 flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
                      >
                        <RefreshCw className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} /> Resend OTP Code
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOtpScreen(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-brand-text-secondary cursor-pointer"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 py-2.5 rounded-xl text-white bg-[#A78BFA] hover:bg-[#906ef5] border-0 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
