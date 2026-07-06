import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, BookOpen, GraduationCap, Hash, ChevronRight, Moon, Sun } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  enrollmentNumber: z.string().min(3, 'Enter a valid enrollment number'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const StudentLogin: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      const res = await authService.studentLogin(data);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/student/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const res = await authService.studentRegister(data);
      login(res.user, res.token);
      toast.success(`Account created! Welcome, ${res.user.name}!`);
      navigate('/student/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--brand-surface)]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#01AC9F] via-[#0B7F76] to-[#01AC9F] relative overflow-hidden flex-col justify-center items-center p-12">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#6C1D5F]/10 blur-3xl" />

        <div className="relative z-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto">
            <BookOpen size={40} className="text-white" />
          </div>
          <div>
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest">Xebia LMS</p>
            <h1 className="text-4xl font-bold text-white mt-2">Student Portal</h1>
            <p className="text-white/70 mt-3 text-lg leading-relaxed">
              View assignments, submit your work,<br />and track your progress.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {['View Assignments', 'Submit Work', 'Download Files', 'View Feedback'].map((f) => (
              <div key={f} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <ChevronRight size={14} className="text-white/70" />
                <span className="text-white/80 text-xs font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#01AC9F] to-[#0B7F76] flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Xebia LMS</p>
              <p className="text-sm font-bold text-[var(--text-primary)]">Student Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-7">
            {isRegister
              ? 'Register as a student to access assignments'
              : 'Sign in to your student account'}
          </p>

          {isRegister ? (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                required
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                label="Enrollment Number"
                placeholder="e.g. ENR2024001"
                required
                leftIcon={<Hash size={16} />}
                error={registerForm.formState.errors.enrollmentNumber?.message}
                {...registerForm.register('enrollmentNumber')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="student@school.edu"
                required
                leftIcon={<Mail size={16} />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full mt-2"
                loading={registerForm.formState.isSubmitting}
              >
                Create Account
              </Button>
            </form>
          ) : (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="student@school.edu"
                required
                leftIcon={<Mail size={16} />}
                error={loginForm.formState.errors.email?.message}
                {...loginForm.register('email')}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={loginForm.formState.errors.password?.message}
                  {...loginForm.register('password')}
                />
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="w-full mt-2"
                loading={loginForm.formState.isSubmitting}
              >
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); loginForm.reset(); registerForm.reset(); }}
              className="text-sm text-[#01AC9F] hover:underline font-medium cursor-pointer"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--brand-border)]">
            <p className="text-xs text-center text-[var(--text-secondary)] mb-3">Other Portals</p>
            <Link
              to="/teacher/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--brand-border)] text-sm text-[var(--text-secondary)] hover:border-[#6C1D5F] hover:text-[#6C1D5F] transition-all"
            >
              <GraduationCap size={16} />
              Teacher Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
