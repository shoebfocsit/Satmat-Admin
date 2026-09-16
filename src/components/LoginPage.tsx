import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginAdmin } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await loginAdmin(phone.trim(), password.trim());
      onLogin();
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please check phone/password.');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="bg-[#F8FAFC] text-[#0F172A] min-h-screen relative flex flex-col justify-between selection:bg-[#0EA5E9] selection:text-white font-sans overflow-x-hidden">
      {/* Background soft dot grid pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* Center Login Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 w-full max-w-7xl mx-auto">
        <div className="relative w-full max-w-[430px]">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-80 h-80 bg-[#38BDF8]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-[#0284C7]/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* White Card */}
          <div className="w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_15px_40px_-10px_rgba(0,0,0,0.06)] p-7 sm:p-9 relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#10B981]"></div>

            {/* Card Header */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* Emblem & Admin Title */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white shadow-sm select-none">
                  <span className="font-display tracking-tight text-xl font-black">S</span>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#0F172A] text-base tracking-tight uppercase font-display">SATMAT</span>
                    <span className="px-1.5 py-0.5 bg-[#0EA5E9] text-white text-[10px] font-bold uppercase tracking-wider rounded">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[9px] tracking-widest uppercase font-semibold text-[#64748B]">
                    OPERATIONS &amp; SETTLEMENT
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1 font-display">
                Welcome Back
              </h1>
              <p className="text-xs text-[#64748B]">
                Enter your operator credentials to access the portal.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Phone Number */}
              <div className="text-left">
                <label className="text-xs font-semibold text-[#1E293B] mb-1.5 block" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none stroke-[1.8]" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter registered phone number"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="text-left">
                <label className="text-xs font-semibold text-[#1E293B] mb-1.5 block" htmlFor="password">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none stroke-[1.8]" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] bg-white focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 focus:outline-none transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3 text-[#94A3B8] hover:text-[#475569] transition-colors focus:outline-none flex items-center p-1 rounded-md"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-left pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#CBD5E1] text-[#0EA5E9] focus:ring-[#0EA5E9]/20 cursor-pointer h-4 w-4"
                  />
                  <span className="text-xs text-[#334155]">Remember me</span>
                </label>
                <span className="text-xs font-medium text-[#64748B]">
                  Forgot Password?
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 rounded-lg bg-[#FFDAD6] text-[#BA1A1A] text-[11px] font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {/* Sign In Button (Premium Vector Icon) */}
              <div className="pt-1">
                <button
                  id="submitBtn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 stroke-[2.2]" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* Bottom Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-[#64748B]">
                Don't have an account?{' '}
                <span className="text-[#64748B] font-semibold inline-flex items-center gap-1 ml-0.5">
                  <span>Contact administrator</span>
                  <ArrowRight className="w-3 h-3 stroke-[2]" />
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer with Shield Check */}
      <footer className="w-full z-10 px-5 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#10B981] stroke-[2]" />
          <span>Encrypted connection</span>
        </div>
        <div>
          <span>© 2025 SATMAT Operations. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
