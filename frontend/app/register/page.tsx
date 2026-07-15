'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

const RegisterPage = () => {
  const router = useRouter();
  const { registerUser, verifyOtpUser, loading, error, clearError } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'builder' | 'contractor'>('builder');
  const [profileName, setProfileName] = useState('');
  const [otp, setOtp] = useState('');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Submit registration form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email || !password || !profileName) {
      setValidationError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await registerUser(email, password, role, profileName);
      if (response.success) {
        setSuccessMessage('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: any) {
      // Handled by AuthContext
    }
  };

  // Submit OTP Verification
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (otp.length !== 6) {
      setValidationError('OTP must be exactly 6 digits.');
      return;
    }

    try {
      const response = await verifyOtpUser(email, otp);
      if (response.success) {
        setSuccessMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (err: any) {
      // Handled by AuthContext
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-brand-cream relative overflow-hidden">
      {/* Glow elements */}
      <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-slate-light/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-orange flex items-center justify-center mb-2 shadow-lg shadow-brand-orange/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          
          <CardTitle className="text-2xl font-syne font-bold text-brand-slate">
            {step === 1 ? 'Create Account' : 'Verify Your Email'}
          </CardTitle>
          
          <CardDescription className="text-brand-slate-light">
            {step === 1 
              ? 'Join BuildConnect to hire or bid on work packages' 
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* STEP 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              
              {/* Role Toggle Selector */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-brand-slate-light uppercase tracking-wider select-none">
                  Select Role
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('builder')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      role === 'builder'
                        ? 'bg-brand-orange-pale border-brand-orange text-brand-orange'
                        : 'bg-white border-brand-border text-brand-slate-light hover:border-brand-slate-medium'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('contractor')}
                    className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      role === 'contractor'
                        ? 'bg-brand-orange-pale border-brand-orange text-brand-orange'
                        : 'bg-white border-brand-border text-brand-slate-light hover:border-brand-slate-medium'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21h6" />
                    </svg>
                    Contractor
                  </button>
                </div>
              </div>

              <Input
                label={role === 'builder' ? 'Company Name' : 'Business Name'}
                type="text"
                placeholder={role === 'builder' ? 'Skyline Builders Inc.' : 'Apex Electricals'}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                disabled={loading}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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
                Sign Up
              </Button>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium text-center">
                  {successMessage}
                </div>
              )}

              <Input
                label="Enter 6-Digit OTP"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="text-center text-lg tracking-[8px] font-bold"
              />

              {validationError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {validationError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full mt-2"
              >
                Verify Code
              </Button>

              <div className="text-center text-xs text-brand-slate-light">
                Wrong email?{' '}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-brand-orange font-semibold hover:underline"
                >
                  Go back
                </button>
              </div>
            </form>
          )}

          {step === 1 && (
            <div className="mt-6 text-center text-xs text-brand-slate-light">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-brand-orange font-semibold hover:underline hover:text-brand-orange-dark transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
