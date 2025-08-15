import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Github } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useAppStore } from '@/stores';
import { cn } from '@/utils';
import type { User as UserType } from '@/types';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAppStore();
  
  const [isSignUp, setIsSignUp] = useState(location.pathname.includes('signup'));
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful authentication
      const mockUser: UserType = {
        id: 'user-1',
        email: formData.email,
        name: formData.name || 'Demo User',
        subscriptionTier: 'free',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setAuth({
        user: mockUser,
        token: 'mock-jwt-token',
        isAuthenticated: true,
        subscriptionTier: 'free'
      });

      // Redirect to dashboard
      const from = (location.state as any)?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'github') => {
    console.log(`${provider} auth not implemented yet`);
    // TODO: Implement OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">DevbrainAI</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start building your MVP with AI guidance'
                : 'Sign in to continue your projects'
              }
            </p>
          </div>

          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}
              onClick={() => handleSocialAuth('google')}
              className="w-full justify-center"
            >
              Continue with Google
            </Button>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Github className="w-4 h-4" />}
              onClick={() => handleSocialAuth('github')}
              className="w-full justify-center"
            >
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                leftIcon={<User className="w-4 h-4" />}
                placeholder="Enter your full name"
                required
              />
            )}

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              leftIcon={<Lock className="w-4 h-4" />}
              placeholder="Enter your password"
              showPasswordToggle
              required
            />

            {isSignUp && (
              <Input
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                leftIcon={<Lock className="w-4 h-4" />}
                placeholder="Confirm your password"
                showPasswordToggle
                error={
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? "Passwords don't match"
                    : undefined
                }
                required
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-6"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Terms */}
          {isSignUp && (
            <p className="text-xs text-gray-500 text-center mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </a>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export { AuthPage };