'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const LoginPage = () => {
  const router = useRouter();
  const { user, loginUser, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'builder') {
        router.push('/builder/dashboard');
      } else if (user.role === 'contractor') {
        router.push('/contractor/dashboard');
      } else if (user.role === 'admin') {
        router.push('/admin/dashboard');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email || !password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    try {
      const response = await loginUser(email, password);
      if (response.success && response.data?.user) {
        const loggedInUser = response.data.user;
        if (loggedInUser.role === 'builder') {
          router.push('/builder/dashboard');
        } else if (loggedInUser.role === 'contractor') {
          router.push('/contractor/dashboard');
        } else if (loggedInUser.role === 'admin') {
          router.push('/admin/dashboard');
        }
      }
    } catch (err: any) {
      // Handled by AuthContext error state
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-brand-cream relative overflow-hidden">
      {/* Decorative gradient glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-slate-light/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center mb-2 shadow-lg shadow-brand-orange/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-syne font-bold text-brand-slate">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-brand-slate-light">
            Enter your credentials to access BuildConnect
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />

            {(validationError || error) && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {validationError || error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-brand-slate-light">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-brand-orange font-semibold hover:underline hover:text-brand-orange-dark transition-colors"
            >
              Create an account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
