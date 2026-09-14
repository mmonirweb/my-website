'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/domains/auth/types/schema';
import { useAuth } from '@/domains/auth/hooks/useAuth';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',      // খালি করে দেওয়া হলো
      password: '',   // খালি করে দেওয়া হলো
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
    } catch {
      // Error handled by react-query state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-800">NRG Solar ERP</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Access Portal</p>
        </div>

        {loginError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
            {(loginError as any)?.response?.data?.message || 'Invalid credentials or connection issue.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@nrgsolar.com"
              {...register('email')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 mt-2"
          >
            {isLoggingIn ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}