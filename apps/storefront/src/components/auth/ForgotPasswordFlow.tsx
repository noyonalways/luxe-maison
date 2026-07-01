import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, CheckCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'email' | 'code' | 'reset' | 'done';

interface ForgotPasswordFlowProps {
  onBack: () => void;
  variant?: 'staff' | 'customer';
}

export default function ForgotPasswordFlow({ onBack, variant = 'customer' }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MOCK_CODE = '123456';

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code !== MOCK_CODE) {
      setError('Invalid code. Use 123456 for demo.');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('done');
    }, 600);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth mb-2"
      >
        <ArrowLeft size={14} />
        Back to sign in
      </button>

      <AnimatePresence mode="wait">
        {step === 'email' && (
          <motion.form
            key="email"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onSubmit={handleSendCode}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Mail size={20} className="text-primary" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Forgot Password?</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Enter your email and we'll send a reset code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder={variant === 'staff' ? 'admin@maison.com' : 'you@example.com'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </motion.form>
        )}

        {step === 'code' && (
          <motion.form
            key="code"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onSubmit={handleVerifyCode}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <KeyRound size={20} className="text-primary" />
              </div>
              <h2 className="font-heading text-lg font-semibold">Enter Code</h2>
              <p className="text-xs text-muted-foreground mt-1">
                We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reset-code">Verification Code</Label>
              <Input
                id="reset-code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="text-center text-lg tracking-[0.5em]"
              />
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Demo code: <span className="font-mono font-medium text-foreground">123456</span>
            </p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full">Verify Code</Button>

            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setError(''); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-smooth text-center"
            >
              Didn't receive a code? Try again
            </button>
          </motion.form>
        )}

        {step === 'reset' && (
          <motion.form
            key="reset"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onSubmit={handleResetPassword}
            className="space-y-4"
          >
            <div className="text-center mb-4">
              <h2 className="font-heading text-lg font-semibold">Set New Password</h2>
              <p className="text-xs text-muted-foreground mt-1">Choose a strong new password</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </motion.form>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-center space-y-4 py-4"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle size={24} className="text-primary" />
            </div>
            <h2 className="font-heading text-lg font-semibold">Password Reset!</h2>
            <p className="text-xs text-muted-foreground">
              Your password has been updated successfully. You can now sign in with your new password.
            </p>
            <Button onClick={onBack} className="w-full">
              Back to Sign In
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
