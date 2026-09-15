import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLoginRole, setSelectedLoginRole, login, isLoading } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [forgotPasswordModal, setForgotPasswordModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync URL search params with portal role
  useEffect(() => {
    const portalParam = searchParams.get('portal');
    if (portalParam === 'admin') {
      setSelectedLoginRole('super_admin');
    } else if (portalParam === 'business-owner') {
      setSelectedLoginRole('business_owner');
    } else {
      setSelectedLoginRole(null);
    }
    setEmail('');
    setPassword('');
    setErrorMessage(null);
  }, [searchParams, setSelectedLoginRole]);

  // Validation for email or business owner username
  const isInputValid = (val: string): boolean => {
    if (selectedLoginRole === 'business_owner') {
      return val.trim().length >= 3;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const isFormValid =
    selectedLoginRole !== null &&
    isInputValid(email) &&
    password.trim().length > 0;

  const handleSelectPortal = (role: UserRole) => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSelectedLoginRole(role);
    setSearchParams({ portal: role === 'super_admin' ? 'admin' : 'business-owner' });
  };

  const handleBackToPortalSelection = () => {
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSelectedLoginRole(null);
    setSearchParams({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !selectedLoginRole || isLoading) return;

    setErrorMessage(null);

    const result = await login(email, password, selectedLoginRole);

    if (result.success) {
      if (selectedLoginRole === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else {
        navigate('/business-owner/dashboard', { replace: true });
      }
    } else {
      setErrorMessage(
        result.error ||
          (selectedLoginRole === 'super_admin'
            ? 'Invalid administrator email or password.'
            : 'Invalid username/email or password for this business portal.')
      );
    }
  };

  return (
    <main
      id="tellerbud-auth-main"
      className="relative w-full min-h-[100dvh] md:h-[100dvh] md:max-h-[100dvh] bg-white flex flex-col justify-between overflow-x-hidden md:overflow-hidden select-none"
      style={{
        paddingTop: 'clamp(20px, 3vh, 32px)',
      }}
    >
      {/* Subtle Oceanic-Green Radial Background Accent (Minimal & Financial Grade) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(13,147,170,0.06)_0%,rgba(13,147,170,0.015)_45%,rgba(255,255,255,0)_75%)]"
        aria-hidden="true"
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex-1 flex flex-col justify-center items-center">
        
        {/* ========================================================= */}
        {/* 2 & 3. HORIZONTAL BRANDING ROW (Logo on Left, Text on Right) */}
        {/* ========================================================= */}
        <section
          id="tellerbud-branding-header"
          aria-label="TellerBud Brand Identity"
          className="w-full flex items-center justify-center px-4 shrink-0"
        >
          <div className="flex items-center justify-center gap-3.5 sm:gap-4">
            {/* Official Transparent TellerBud Logo (68–76px) */}
            <div className="w-[68px] h-[68px] sm:w-[72px] sm:h-[72px] shrink-0 flex items-center justify-center transition-transform duration-200 hover:scale-[1.03]">
              <img
                src="/assets/branding/tellerbud-logo-transparent.png"
                alt="TellerBud official logo"
                className="max-h-full max-w-full object-contain object-center select-none"
                loading="eager"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('/tellerbud-logo-transparent.png')) {
                    target.src = '/tellerbud-logo-transparent.png';
                  } else if (!target.src.endsWith('/assets/branding/tellerbud-admin-logo.png')) {
                    target.src = '/assets/branding/tellerbud-admin-logo.png';
                    target.classList.add('mix-blend-multiply');
                  }
                }}
              />
            </div>

            {/* Brand Title and Management Web Application Subtitle */}
            <div className="flex flex-col justify-center text-left">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#102025] tracking-tight leading-none">
                TellerBud
              </span>
              <span className="text-[10px] sm:text-[11.5px] font-bold text-[#0D93AA] uppercase tracking-[0.2em] leading-tight mt-1 whitespace-nowrap">
                MANAGEMENT WEB APPLICATION
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4, 5 & 6. PORTAL-SELECTION VIEW OR DEDICATED SIGN-IN VIEW */}
        {/* ========================================================= */}
        {!selectedLoginRole ? (
          /* ------------------------------------------------------- */
          /* PORTAL-SELECTION SECTION                                */
          /* ------------------------------------------------------- */
          <section
            id="portal-selection-section"
            aria-label="Portal Selection"
            className="w-full flex-1 flex flex-col justify-center items-center px-4 sm:px-6 md:px-10 animate-in fade-in duration-200"
          >
            {/* 4. Portal Heading and Supporting Text */}
            <div
              className="text-center shrink-0"
              style={{
                marginTop: 'clamp(12px, 2.2vh, 22px)',
                marginBottom: 'clamp(14px, 2.5vh, 24px)',
              }}
            >
              <h1 className="text-xl sm:text-2xl font-bold text-[#102025] tracking-tight">
                Select Your Portal
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 font-normal mt-1 leading-normal max-w-md mx-auto">
                Choose the appropriate portal to securely access your TellerBud account.
              </p>
            </div>

            {/* 5 & 6. Full-Width Portal Cards Container */}
            {/* container: width: calc(100% - 80px), max-width: 1180px */}
            <div className="w-[calc(100%-32px)] sm:w-[calc(100%-48px)] md:w-[calc(100%-80px)] max-w-[1180px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 w-full items-stretch">
                
                {/* Card 1: TellerBud Admin */}
                <div
                  id="portal-card-admin"
                  role="button"
                  tabIndex={0}
                  aria-label="TellerBud Admin: Platform administration and operational management. Click to open Admin Sign-In."
                  onClick={() => handleSelectPortal('super_admin')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectPortal('super_admin');
                    }
                  }}
                  className="group relative w-full h-full min-h-[180px] sm:min-h-[195px] md:min-h-[205px] bg-white border border-gray-200/90 hover:border-[#0D93AA] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-2"
                >
                  {/* Top: Icon, Title & Supporting Text */}
                  <div>
                    {/* Oceanic-Green Shield Icon Container */}
                    <div className="w-11 h-11 rounded-xl bg-cyan-50/90 border border-cyan-100 text-[#0D93AA] flex items-center justify-center mb-3.5 transition-colors group-hover:bg-[#0D93AA] group-hover:text-white group-hover:border-[#0D93AA]">
                      <ShieldCheck className="w-5.5 h-5.5 transition-colors" />
                    </div>

                    {/* Portal Title */}
                    <h2 className="text-base sm:text-lg font-bold text-[#102025] tracking-tight group-hover:text-[#0D93AA] transition-colors">
                      TellerBud Admin
                    </h2>

                    {/* Supporting Text */}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      Platform administration and operational management
                    </p>
                  </div>

                  {/* Bottom: Continue Label & Arrow Icon */}
                  <div className="pt-3.5 mt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-[#0D93AA] transition-colors">
                      Continue to Admin
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-cyan-50 text-gray-400 group-hover:text-[#0D93AA] flex items-center justify-center transition-all group-hover:translate-x-0.5">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Business Owner */}
                <div
                  id="portal-card-business-owner"
                  role="button"
                  tabIndex={0}
                  aria-label="Business Owner: Business, Agent and transaction management. Click to open Business Owner Sign-In."
                  onClick={() => handleSelectPortal('business_owner')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectPortal('business_owner');
                    }
                  }}
                  className="group relative w-full h-full min-h-[180px] sm:min-h-[195px] md:min-h-[205px] bg-white border border-gray-200/90 hover:border-[#0D93AA] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:ring-offset-2"
                >
                  {/* Top: Icon, Title & Supporting Text */}
                  <div>
                    {/* Oceanic-Green Building Icon Container */}
                    <div className="w-11 h-11 rounded-xl bg-cyan-50/90 border border-cyan-100 text-[#0D93AA] flex items-center justify-center mb-3.5 transition-colors group-hover:bg-[#0D93AA] group-hover:text-white group-hover:border-[#0D93AA]">
                      <Building2 className="w-5.5 h-5.5 transition-colors" />
                    </div>

                    {/* Portal Title */}
                    <h2 className="text-base sm:text-lg font-bold text-[#102025] tracking-tight group-hover:text-[#0D93AA] transition-colors">
                      Business Owner
                    </h2>

                    {/* Supporting Text */}
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                      Business, Agent and transaction management
                    </p>
                  </div>

                  {/* Bottom: Continue Label & Arrow Icon */}
                  <div className="pt-3.5 mt-4 flex items-center justify-between border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-[#0D93AA] transition-colors">
                      Continue to Business
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-cyan-50 text-gray-400 group-hover:text-[#0D93AA] flex items-center justify-center transition-all group-hover:translate-x-0.5">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        ) : (
          /* ------------------------------------------------------- */
          /* DEDICATED PORTAL SIGN-IN VIEW                           */
          /* ------------------------------------------------------- */
          <section
            id="portal-signin-section"
            aria-label={`${selectedLoginRole === 'super_admin' ? 'TellerBud Admin' : 'Business Owner'} Sign-In`}
            className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 animate-in fade-in duration-200 shrink-0"
          >
            <div className="bg-white border border-gray-200/90 rounded-2xl shadow-sm p-6 sm:p-7">
              
              {/* Back to Portal Selection Bar */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100">
                <button
                  type="button"
                  id="btn-back-to-portals"
                  onClick={handleBackToPortalSelection}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0D93AA] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] rounded px-1 py-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Select Portal</span>
                </button>

                {/* Portal Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-[#0D93AA] border border-cyan-100">
                  {selectedLoginRole === 'super_admin' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-[#0D93AA]" />
                      <span>Admin Portal</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-3 h-3 text-[#0D93AA]" />
                      <span>Business Portal</span>
                    </>
                  )}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-[#102025] tracking-tight">
                  {selectedLoginRole === 'super_admin'
                    ? 'TellerBud Admin Sign-In'
                    : 'Business Owner Sign-In'}
                </h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {selectedLoginRole === 'super_admin'
                    ? 'Enter administrator credentials to access platform operations.'
                    : 'Enter registered credentials to manage business, agents and transactions.'}
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Sign-In Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Username or Email Address Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    {selectedLoginRole === 'business_owner'
                      ? 'Username or Email Address'
                      : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-email"
                      type={selectedLoginRole === 'business_owner' ? 'text' : 'email'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedLoginRole === 'business_owner'
                          ? 'Username or email'
                          : 'name@domain.com'
                      }
                      required
                      autoComplete={
                        selectedLoginRole === 'business_owner' ? 'username' : 'email'
                      }
                      className="w-full pl-10 pr-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-[10.5px] font-bold text-gray-700 uppercase tracking-wider mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-[#102025] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/30 focus:border-[#0D93AA] transition-all font-medium placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 font-medium select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#0D93AA] focus:ring-[#0D93AA]/30 border-gray-300 cursor-pointer"
                    />
                    <span>Remember Me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(true)}
                    className="text-xs font-semibold text-[#0D93AA] hover:text-[#0b8296] transition-colors cursor-pointer focus:outline-none focus:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In & Secondary Action */}
                <div className="pt-1.5 space-y-2">
                  <button
                    type="submit"
                    id="btn-submit-signin"
                    disabled={!isFormValid || isLoading}
                    className="w-full py-2.5 px-4 bg-[#0D93AA] hover:bg-[#0b8296] active:bg-[#096e80] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>
                        Sign In as{' '}
                        {selectedLoginRole === 'super_admin'
                          ? 'TellerBud Admin'
                          : 'Business Owner'}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToPortalSelection}
                    className="w-full py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change Portal</span>
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

      </div>

      {/* ========================================================= */}
      {/* 7. FOOTER (Pushed to bottom, always visible without scroll) */}
      {/* ========================================================= */}
      <footer
        id="tellerbud-auth-footer"
        className="relative z-10 w-full text-center text-xs text-gray-500 space-y-0.5 select-none shrink-0"
        style={{
          paddingTop: 'clamp(10px, 1.8vh, 18px)',
          paddingBottom: 'clamp(12px, 2vh, 20px)',
        }}
      >
        <p className="font-medium tracking-wide leading-tight text-gray-500">
          Secure access for authorised users only
        </p>
        <p className="text-gray-400 text-[11px] leading-tight">
          © 2026 TellerBud. All rights reserved.
        </p>
      </footer>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-password-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-50 text-[#0D93AA] flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>
            <h3
              id="reset-password-heading"
              className="text-base font-bold text-[#102025] mb-1"
            >
              Reset Password
            </h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Password reset links are managed via TellerBud Identity Security.
              Contact the system administrator or your registered security channel.
            </p>
            <button
              type="button"
              onClick={() => setForgotPasswordModal(false)}
              className="w-full py-2.5 bg-[#0D93AA] text-white text-xs font-semibold rounded-xl hover:bg-[#0b8296] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D93AA]/40"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
