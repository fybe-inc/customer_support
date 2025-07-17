'use client';

import { useState } from 'react';
import OtpRequestForm from '@/components/auth/OtpRequestForm';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

export default function AuthPage() {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');

  const handleOtpSent = (userEmail: string) => {
    setEmail(userEmail);
    setShowOtpInput(true);
  };

  const handleBack = () => {
    setShowOtpInput(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {showOtpInput ? 'OTP認証' : 'ログイン'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            LINE Customer Support System
          </p>
        </div>
        
        {!showOtpInput ? (
          <OtpRequestForm onSuccess={handleOtpSent} />
        ) : (
          <OtpVerifyForm email={email} onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
