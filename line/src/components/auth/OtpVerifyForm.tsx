'use client';

import { useState } from 'react';
import { verifyOtp } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

interface OtpVerifyFormProps {
  email: string;
  onBack: () => void;
}

export default function OtpVerifyForm({ email, onBack }: OtpVerifyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await verifyOtp(email, otp);
      if (error) throw error;
      router.push('/');
    } catch (error: unknown) {
      setError((error as Error).message || 'OTPコードが無効です');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
        OTPコードがメールに送信されました。確認してください。
      </div>
      
      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          OTPコード
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="6桁のOTPコードを入力"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '認証中...' : 'ログイン'}
        </button>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          戻る
        </button>
      </div>
    </form>
  );
}