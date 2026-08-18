import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Mail,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] font-sans grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] overflow-x-hidden selection:bg-[#18C99A]/30">

      {/* =====================================================
          LEFT BRANDING SECTION
      ====================================================== */}
      <section className="relative w-full min-h-[500px] lg:min-h-screen flex flex-col justify-between px-6 sm:px-10 lg:px-16 xl:px-20 py-10 lg:py-16 bg-[#050816] border-b lg:border-b-0 lg:border-r border-white/[0.04]">

        {/* Subtle upper-left glow */}
        <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-[#4F46E5]/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Subtle lower-right glow */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#18C99A]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-[13px] flex items-center justify-center bg-gradient-to-br from-[#18C99A] to-[#0EA5E9] shadow-[0_8px_30px_rgba(24,201,154,0.25)] group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>

            <span className="text-[24px] font-bold tracking-[-0.5px]">
              Finance<span className="text-[#18C99A]">Flow</span>
            </span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-[580px] w-full mx-auto lg:mx-0 my-auto py-12 lg:py-0">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[#18C99A]/20 bg-[#18C99A]/5 text-[#5ee7c0] text-xs sm:text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18C99A] shadow-[0_0_8px_#18C99A]" />
            Smart personal finance management
          </div>

          <h1 className="text-[38px] sm:text-5xl xl:text-[58px] font-extrabold leading-[1.05] tracking-[-2px] mb-6 text-[#F8FAFC]">
            Take Control of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18C99A] via-[#22D3A8] to-[#0EA5E9]">
              Your Finances
            </span>
          </h1>

          <p className="text-[16px] sm:text-[18px] text-[#94A3B8] leading-7 max-w-[500px]">
            Track expenses, manage budgets, and understand your
            spending habits with a simple and intelligent finance
            tracker.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-x-10 gap-y-6 mt-10">
            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">
                Smart
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                Budget Tracking
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">
                Real-time
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                Analytics
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold text-[#F8FAFC]">
                100%
              </p>
              <p className="text-sm text-[#64748B] mt-1">
                Secure
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs sm:text-sm text-[#64748B]">
            © 2026 FinanceFlow. All rights reserved.
          </p>
        </div>
      </section>

      {/* =====================================================
          RIGHT LOGIN SECTION
      ====================================================== */}
      <section className="relative w-full min-h-[600px] lg:min-h-screen flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 lg:py-16 bg-[#050816]">

        {/* Subtle background glow behind the card */}
        <div className="absolute w-[450px] h-[450px] bg-[#3B82F6]/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Login card */}
        <div className="relative z-10 w-full max-w-[480px] mx-4 flex flex-col justify-center">

          <div className="rounded-[26px] border border-white/[0.10] bg-[#0B1022]/95 shadow-[0_25px_80px_rgba(0,0,0,0.45)] p-8 sm:p-9 lg:p-10">

            {/* Header */}
            <div className="mb-8">
              <div className="w-11 h-11 rounded-xl bg-[#18C99A]/10 border border-[#18C99A]/20 flex items-center justify-center mb-5">
                <Lock className="w-5 h-5 text-[#18C99A]" />
              </div>

              <h2 className="text-[30px] sm:text-[32px] font-bold tracking-[-1px] text-[#F8FAFC]">
                Welcome back
              </h2>

              <p className="mt-2 text-[14px] sm:text-[15px] text-[#94A3B8]">
                Sign in to your FinanceFlow account
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-[13px] font-semibold text-[#CBD5E1] mb-2"
                >
                  Email address
                </label>

                <div className="relative group">

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="w-[18px] h-[18px] text-[#64748B] group-focus-within:text-[#18C99A] transition-colors duration-200" />
                  </div>

                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    style={{ paddingLeft: '48px' }}
                    className="
                      w-full
                      h-[58px]
                      pr-4
                      rounded-xl
                      bg-[#080D1C]
                      border border-[#263247]
                      text-[#F8FAFC]
                      text-[15px]
                      outline-none
                      placeholder-[#64748B]
                      hover:border-[#3A475E]
                      focus:border-[#18C99A]
                      focus:ring-4
                      focus:ring-[#18C99A]/10
                      shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
                      transition-all
                      duration-200
                    "
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="login-password"
                    className="block text-[13px] font-semibold text-[#CBD5E1]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-[#64748B] hover:text-[#18C99A] transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative group">

                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="w-[18px] h-[18px] text-[#64748B] group-focus-within:text-[#18C99A] transition-colors duration-200" />
                  </div>

                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ paddingLeft: '48px' }}
                    className="
                      w-full
                      h-[58px]
                      pr-12
                      rounded-xl
                      bg-[#080D1C]
                      border border-[#263247]
                      text-[#F8FAFC]
                      text-[15px]
                      outline-none
                      placeholder-[#64748B]
                      hover:border-[#3A475E]
                      focus:border-[#18C99A]
                      focus:ring-4
                      focus:ring-[#18C99A]/10
                      shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]
                      transition-all
                      duration-200
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      -translate-y-1/2
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-[#64748B]
                      hover:text-white
                      hover:bg-white/5
                      transition-all
                    "
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="
                  relative
                  w-full
                  h-[58px]
                  mt-2
                  rounded-xl
                  overflow-hidden
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[15px]
                  font-bold
                  text-white
                  bg-gradient-to-r
                  from-[#18C99A]
                  to-[#0EA5E9]
                  shadow-[0_10px_30px_rgba(24,201,154,0.20)]
                  hover:shadow-[0_12px_35px_rgba(24,201,154,0.30)]
                  hover:-translate-y-[1px]
                  active:translate-y-0
                  disabled:opacity-60
                  disabled:hover:translate-y-0
                  disabled:hover:shadow-none
                  transition-all
                  duration-300
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <p className="mt-6 text-center text-[14px] text-[#64748B]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#18C99A] hover:text-[#5ee7c0] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;