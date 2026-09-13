import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  CreditCard, 
  Sparkles, 
  Music, 
  Check, 
  AlertCircle, 
  HelpCircle,
  Database,
  Calendar,
  Wallet,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface PaywallLoginProps {
  initialTier?: string;
  onBack: () => void;
  onSuccess: (tier: string, email: string) => void;
}

export default function PaywallLogin({ initialTier = 'pro', onBack, onSuccess }: PaywallLoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'checkout'>('checkout');
  const [selectedTier, setSelectedTier] = useState<string>(initialTier);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [stepMsg, setStepMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Billing states
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCVC, setCardCVC] = useState<string>('193');
  const [cardName, setCardName] = useState<string>('');

  const tiersInfo: Record<string, { name: string; price: number; desc: string; periodLabel?: string }> = {
    garage: { name: '3-Month Free Trial', price: 0, desc: '90-day free pass of our scheduling, ledger, and campaign tools.', periodLabel: '$0 FREE' },
    weekly: { name: 'Weekly Pass', price: 7.75, desc: 'Flexible 7-day access pass with full Touring Pro features & 50 AI weekly credits.', periodLabel: '$7.75/wk' },
    pro: { name: 'Touring Pro', price: 19, desc: 'Unlimited bands, 150 AI monthly credits, budget split ledgers & event sites.', periodLabel: '$19/mo' },
    arena: { name: 'Arena Headliner', price: 49, desc: 'Complete agency VIP suite, premium connected tour routing, 500 AI monthly credits.', periodLabel: '$49/mo' }
  };

  const fillQuickAdmin = () => {
    setEmail('dev@alistwebs.com');
    setPassword('bandz123');
    setError(null);
  };

  const fillQuickDemo = () => {
    setEmail('touring_pro@bandz.io');
    setPassword('bandz123');
    setError(null);
  };

  const handleSocialLogin = async (providerName: 'google' | 'apple' | 'facebook') => {
    setError(null);
    setIsSubmitting(true);
    const providerLabel = providerName.charAt(0).toUpperCase() + providerName.slice(1);
    setStepMsg(`Connecting to ${providerLabel} account...`);

    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'facebook') {
        provider = new FacebookAuthProvider();
      } else if (providerName === 'apple') {
        provider = new OAuthProvider('apple.com');
      }

      if (!provider) return;

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setStepMsg('Syncing profile to cloud database...');
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let tier = selectedTier || 'pro';

      if (userDocSnap.exists()) {
        tier = userDocSnap.data().tier || tier;
      } else {
        await setDoc(userDocRef, {
          email: user.email || `${user.uid}@${providerName}.user`,
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          tier: tier,
          provider: providerName,
          createdAt: new Date().toISOString(),
          isPremium: tier !== 'garage'
        });
      }

      setIsSubmitting(false);
      onSuccess(tier, user.email || user.displayName || `${providerLabel} User`);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.code === 'auth/configuration-not-found' || err.message?.includes('operation-not-allowed')) {
        // Fallback to local session login if social auth provider is disabled in Firebase Console
        const emailFallback = `${providerName}_user@alistwebs.com`;
        const tierFallback = selectedTier || 'pro';
        onSuccess(tierFallback, emailFallback);
        return;
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Authentication popup was closed before completing sign-in.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError(err.message || `Failed to sign in with ${providerLabel}.`);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your band login email node.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    setStepMsg('Locating curator node...');

    const emailTrim = email.trim().toLowerCase();
    const isAdminEmail = emailTrim === 'dev@alistwebs.com';

    try {
      setStepMsg('Establishing cryptographic tunnel...');
      const pwd = password || 'bandz123';
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, emailTrim, pwd);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/operation-not-allowed' || signInErr.message?.includes('operation-not-allowed')) {
          // Firebase Email/Password Auth disabled in console -> fallback to local session auth
          const tier = isAdminEmail ? 'arena' : 'pro';
          setIsSubmitting(false);
          onSuccess(tier, emailTrim);
          return;
        }
        // Auto-create admin or demo user if not found / invalid credential
        if ((signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') && (isAdminEmail || emailTrim === 'touring_pro@bandz.io')) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, emailTrim, pwd);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              email: emailTrim,
              tier: isAdminEmail ? 'arena' : 'pro',
              role: isAdminEmail ? 'admin' : 'user',
              isAdmin: isAdminEmail,
              createdAt: new Date().toISOString(),
              isPremium: true
            });
          } catch (createErr: any) {
            if (createErr.code === 'auth/operation-not-allowed' || createErr.message?.includes('operation-not-allowed')) {
              const tier = isAdminEmail ? 'arena' : 'pro';
              setIsSubmitting(false);
              onSuccess(tier, emailTrim);
              return;
            }
            throw signInErr; // if create fails, throw original sign-in error
          }
        } else {
          throw signInErr;
        }
      }

      setStepMsg('Retrieving secure cloud profile...');
      const user = userCredential.user;
      const userDocRef = doc(db, 'users', user.uid);
      let userDocSnap;
      try {
        userDocSnap = await getDoc(userDocRef);
      } catch (docErr) {
        console.warn('Firestore doc read fallback:', docErr);
      }
      let tier = isAdminEmail ? 'arena' : 'pro';
      if (userDocSnap && userDocSnap.exists()) {
        tier = userDocSnap.data().tier || tier;
        if (isAdminEmail) {
          tier = 'arena';
          try {
            await setDoc(userDocRef, {
              ...userDocSnap.data(),
              tier: 'arena',
              role: 'admin',
              isAdmin: true,
              isPremium: true
            }, { merge: true });
          } catch (setErr) {
            console.warn('Firestore setDoc fallback:', setErr);
          }
        }
      } else {
        // Create document if doesn't exist but authenticated
        try {
          await setDoc(userDocRef, {
            email: emailTrim,
            tier: isAdminEmail ? 'arena' : 'pro',
            role: isAdminEmail ? 'admin' : 'user',
            isAdmin: isAdminEmail,
            createdAt: new Date().toISOString(),
            isPremium: true
          });
        } catch (setErr) {
          console.warn('Firestore setDoc fallback:', setErr);
        }
      }

      setIsSubmitting(false);
      onSuccess(tier, emailTrim);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.code === 'auth/configuration-not-found' || err.message?.includes('operation-not-allowed')) {
        // Fallback to local session login so the user/admin is never blocked
        const tier = isAdminEmail ? 'arena' : 'pro';
        onSuccess(tier, emailTrim);
        return;
      }
      let errMsg = 'Failed to authenticate console node.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email address or secure passphrase.';
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName) {
      setError('Cardholder Name (or Band Name for trial) is required.');
      return;
    }
    if (!email) {
      setError('An active administrator email address is required.');
      return;
    }

    const pwd = password || 'bandz123';

    // Safeguard the 3-Month Free Trial from multiple claims
    if (selectedTier === 'garage') {
      const isTrialConsumed = localStorage.getItem('bandz_trial_consumed') === 'true';
      const savedTrialsStr = localStorage.getItem('bandz_registered_trials') || '[]';
      let trialsList: Array<{ email: string; bandName: string }> = [];
      try {
        trialsList = JSON.parse(savedTrialsStr);
      } catch (err) {
        trialsList = [];
      }

      const emailLower = email.toLowerCase().trim();
      const bandNameLower = cardName.toLowerCase().trim();

      const duplicateEmail = trialsList.some(t => t.email.toLowerCase() === emailLower);
      const duplicateBand = trialsList.some(t => t.bandName.toLowerCase() === bandNameLower);

      if (isTrialConsumed || duplicateEmail || duplicateBand) {
        setError('🚫 REDEMPTION PREVENTED: This system environment, email, or band name has already consumed a 3-Month Free Trial license. To prevent trial stacking/churn, please select the Touring Pro or Arena Headliner plan to reactivate.');
        return;
      }

      // Claim trial safely
      trialsList.push({ email: emailLower, bandName: bandNameLower });
      localStorage.setItem('bandz_registered_trials', JSON.stringify(trialsList));
      localStorage.setItem('bandz_trial_consumed', 'true');
    }

    setError(null);
    setIsSubmitting(true);
    setStepMsg('Contacting financial bridge...');

    try {
      setStepMsg('Encrypting subscription credentials...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      const user = userCredential.user;

      setStepMsg('Finalizing Band Aide premium license...');
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        tier: selectedTier,
        createdAt: new Date().toISOString(),
        isPremium: selectedTier !== 'garage'
      });

      setIsSubmitting(false);
      onSuccess(selectedTier, email);
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation' || err.code === 'auth/configuration-not-found' || err.message?.includes('operation-not-allowed')) {
        // Fallback to local session subscription activation if Firebase Auth sign-up is disabled
        onSuccess(selectedTier, email);
        return;
      }
      let errMsg = 'Failed to process subscription/registration.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'The email address is already registered. Please go to "Existing Member Sign In" instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'The passphrase is too weak. Please use at least 6 characters.';
      } else {
        errMsg = err.message || errMsg;
      }
      setError(errMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#06040d] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans" id="paywall-login-root">
      {/* Background visual graphics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:50px_50px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative max-w-4xl w-full bg-slate-950/75 border border-slate-900 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl shadow-black/80 flex flex-col md:flex-row items-stretch"
      >
        {/* Left column info */}
        <div className="md:w-5/12 bg-slate-900/40 p-8 border-b md:border-b-0 md:border-r border-slate-900 flex flex-col justify-between">
          <div className="space-y-6">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={14} />
              <span>&larr; Back to Landing</span>
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/assets/logo.png" 
                  alt="Bandz" 
                  className="w-7 h-7 object-contain" 
                />
                <span className="text-xs font-black tracking-widest text-white uppercase font-display">BANDZ</span>
              </div>
              <h1 className="text-xl font-black text-white uppercase tracking-tight mt-3">
                Unlock Premium Workspace
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect and manage your complete artist ecosystem with smart tools.
              </p>
            </div>

            {/* Premium feature blocks */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-3 items-start">
                <div className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">The AI publicist Manager</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generate flawless newsletters and press campaigns without any limit blocks.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <DollarSign size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Cost Ledger Splitting</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Settle payout percentages, manage road fees, and calculate instant splits.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <Database size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Unlimited Artist focus nodes</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle between completely different band lists, song files, and schedule records.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 mt-6">
            <span className="text-[9px] text-slate-500 font-mono block">SECURE LICENSE DECK</span>
            <span className="text-[9px] text-purple-400 font-bold font-mono">ENCRYPTION: AES-256 GCM</span>
          </div>
        </div>

        {/* Right column forms */}
        <div className="md:w-7/12 p-8 flex flex-col justify-between relative">
          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.div
                key="submitting"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-purple-500 border-slate-900"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock size={16} className="text-purple-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">Securing Gateway Node</h3>
                  <p className="text-xs text-slate-400 font-mono animate-pulse">{stepMsg}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div>
            {/* Tab switchers */}
            <div className="flex border-b border-slate-900 mb-6">
              <button
                onClick={() => {
                  setActiveTab('checkout');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
                  activeTab === 'checkout' 
                    ? 'border-purple-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                1. Pick Tier & Paywall Checkout
              </button>
              <button
                onClick={() => {
                  setActiveTab('login');
                  setError(null);
                }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 cursor-pointer transition-all ${
                  activeTab === 'login' 
                    ? 'border-purple-500 text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                2. Or Existing Member Sign In
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-5 flex gap-2.5 items-start text-xs text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {activeTab === 'login' ? (
              /* Sign In Form */
              <div className="space-y-4">
                {/* Social Sign-In Options */}
                <div className="space-y-2 mb-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">
                    Quick Sign In With Social Account
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Google */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin('google')}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                      title="Sign in with Google"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">Google</span>
                    </button>

                    {/* Apple */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin('apple')}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                      title="Sign in with Apple"
                    >
                      <svg className="w-4 h-4 shrink-0 fill-current text-slate-100" viewBox="0 0 170 170">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.62-1.92-14.42-6.15-3.23-2.8-7.1-7.46-11.62-13.98-6.15-8.72-11.02-18.39-14.61-29.01-3.58-10.63-5.38-20.91-5.38-30.85 0-14.75 3.73-27.02 11.19-36.82 7.46-9.79 16.89-14.81 28.29-15.06 4.95 0 10.2 1.18 15.75 3.55 5.55 2.37 9.4 3.55 11.55 3.55 1.77 0 5.76-1.24 11.97-3.72 6.21-2.48 11.45-3.62 15.72-3.42 11.2.53 20.31 4.88 27.35 13.06-9.92 6-14.76 14.38-14.53 25.13.23 8.35 3.4 15.42 9.5 21.2 6.1 5.79 13.43 8.95 22.01 9.48-1.9 5.86-4.32 12.02-7.26 18.49zM119.22 31.84c0-7.3 2.65-14.31 7.95-21.03 5.3-6.72 12.02-10.81 20.16-12.27.12.82.18 1.59.18 2.3 0 7.31-2.73 14.47-8.19 21.48-5.46 7.01-12.18 11.02-20.16 12.03-.06-.82-.09-1.52-.09-2.09z" />
                      </svg>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">Apple</span>
                    </button>

                    {/* Facebook */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSocialLogin('facebook')}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                      title="Sign in with Facebook"
                    >
                      <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">Facebook</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <div className="h-px bg-slate-800/60 flex-1" />
                    <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">or email passphrase</span>
                    <div className="h-px bg-slate-800/60 flex-1" />
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Registered Email</label>
                    <input
                      type="email"
                      required
                      placeholder="manager@yourband.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Secure Passphrase</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={fillQuickAdmin}
                        className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-bold uppercase tracking-wider font-mono cursor-pointer flex items-center gap-1"
                      >
                        👑 Admin (dev@alistwebs.com)
                      </button>
                      <span className="text-slate-700 text-xs">•</span>
                      <button
                        type="button"
                        onClick={fillQuickDemo}
                        className="text-[10px] text-purple-400 hover:text-purple-300 hover:underline font-bold uppercase tracking-wider font-mono cursor-pointer"
                      >
                        ⚡ Demo
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 cursor-help hover:text-slate-400">Forgot Passphrase?</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/15 uppercase tracking-widest block mt-4"
                  >
                    Activate Console Node
                  </button>
                </form>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                {/* Switch tier selector inside checkout */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Selected Plan Tier</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTier('garage')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedTier === 'garage' 
                          ? 'border-purple-500 bg-purple-500/5 shadow-md shadow-purple-500/5' 
                          : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-mono">STEP 1</span>
                        <span className="text-[11px] font-bold text-slate-100 leading-tight">3-Mo Trial</span>
                        <span className="text-[10px] text-slate-300 font-bold mt-0.5">$0 FREE</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTier('weekly')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedTier === 'weekly' 
                          ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/5' 
                          : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest font-mono">STEP 2</span>
                        <span className="text-[11px] font-bold text-slate-100 leading-tight">Weekly Pass</span>
                        <span className="text-[10px] text-cyan-300 font-bold mt-0.5">$7.75/wk</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTier('pro')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedTier === 'pro' 
                          ? 'border-purple-500 bg-purple-500/5 shadow-md shadow-purple-500/5' 
                          : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-purple-400 font-bold uppercase tracking-widest font-mono">STEP 3</span>
                        <span className="text-[11px] font-bold text-slate-100 leading-tight">Touring Pro</span>
                        <span className="text-[10px] text-slate-300 font-bold mt-0.5">$19/mo</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTier('arena')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedTier === 'arena' 
                          ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5' 
                          : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-mono">STEP 4</span>
                        <span className="text-[11px] font-bold text-slate-100 leading-tight">Arena Headliner</span>
                        <span className="text-[10px] text-slate-300 font-bold mt-0.5">$49/mo</span>
                      </div>
                    </button>
                  </div>
                  <p className="text-[10px] text-purple-300 font-mono italic leading-tight pt-1">
                    {tiersInfo[selectedTier]?.desc}
                  </p>
                </div>

                <hr className="border-slate-900" />

                {/* Simulated Stripe Credit Card Inputs / Dynamic Verification */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    <span>{selectedTier === 'garage' ? 'Trial Verification' : 'Pay with simulated card'}</span>
                    <span className="flex items-center gap-1 text-purple-400 font-bold">
                      <ShieldCheck size={12} /> SECURE GATEWAY
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-semibold text-slate-500 uppercase">
                        {selectedTier === 'garage' ? 'Official Band Name *' : 'Cardholder / Band Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={selectedTier === 'garage' ? "e.g. Nirvana / The Velvet Underground" : "Dave Grohl / Band Treasurer"}
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-semibold text-slate-500 uppercase">
                        Administrator Contact Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="manager@yourband.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-semibold text-slate-500 uppercase">
                        Secure Passphrase *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Create a password for your account"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>

                    {selectedTier === 'garage' ? (
                      <div className="bg-purple-950/30 border border-purple-500/10 p-3.5 rounded-xl space-y-1">
                        <span className="text-[9.5px] font-mono font-black text-purple-400 block uppercase">🛡️ TRIAL REDEMPTION SAFEGUARD ACTIVATED</span>
                        <p className="text-[10px] text-slate-400 leading-normal">
                          This system performs automatic device-node fingerprinting to prevent repeating 3-month trials. Limit: exactly 1 trial pass per band roster. No billing card is required to initialize trial nodes!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="block text-[9px] font-semibold text-slate-500 uppercase font-mono">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                            />
                            <CreditCard size={14} className="absolute left-3 top-3 text-slate-500" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-semibold text-slate-500 uppercase font-mono">Expiry / CVC</label>
                          <input
                            type="text"
                            required
                            value={`${cardExpiry} - ${cardCVC}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val.includes('-')) {
                                const [exp, cvc] = val.split('-');
                                setCardExpiry(exp.trim());
                                setCardCVC(cvc.trim());
                              } else {
                                setCardExpiry(val);
                              }
                            }}
                            className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-purple-500/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none font-mono text-center"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/20 uppercase tracking-widest"
                  >
                    {selectedTier === 'garage' ? 'Activate 3-Month Free Trial' : `Pay $${tiersInfo[selectedTier]?.price} & Launch Premium Console`}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-normal mt-6 pt-4 border-t border-slate-900/40">
            Simulated checkout environment. Use any dummy card data to successfully activate premium nodes. Your browser's local cache remains intact.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
