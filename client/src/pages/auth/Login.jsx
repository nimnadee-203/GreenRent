import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, UserRound, CheckCircle2, Circle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Home/Navbar";
import { auth, googleProvider, hasFirebaseConfig } from "../../config/firebase";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchBackendUser } = useAuth();
  const redirectTarget = location.state?.from || "/";
  const redirectState = location.state?.postLoginState || null;
  const shouldResumeBookingFlow = Boolean(location.state?.postLoginState?.resumeAvailabilityFlow);
  const bookingNotice = location.state?.message || "";
  const [isSignUp, setIsSignUp] = useState(() => location.state?.mode === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const headerText = useMemo(() => {
    return isSignUp
      ? "Create your GreenRent account"
      : "Welcome back to GreenRent";
  }, [isSignUp]);

  useEffect(() => {
    if (location.state?.mode === "signup") setIsSignUp(true);
    if (location.state?.mode === "login") setIsSignUp(false);
  }, [location.state]);

  const updateField = (field) => (event) => {
    setForm((previous) => ({
      ...previous,
      [field]: event.target.value,
    }));
  };

  const normalizeFirebaseError = (message) => {
    if (!message) return "Authentication failed. Please try again.";

    return message
      .replace("Firebase:", "")
      .replace(/\(auth\/.+\)\.?/g, "")
      .trim();
  };

  const getApiErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      (Array.isArray(error?.response?.data?.errors) ? error.response.data.errors[0] : "") ||
      normalizeFirebaseError(error?.message)
    );
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.password || (isSignUp && !form.name)) {
      setError("Please fill all required fields.");
      return;
    }

    const hasMinLength = form.password.length >= 6;
    const hasUppercase = /[A-Z]/.test(form.password);
    const hasNumber = /[0-9]/.test(form.password);

    if (isSignUp && (!hasMinLength || !hasUppercase || !hasNumber)) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    setIsLoading(true);
    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      if (isSignUp) {
        if (!hasFirebaseConfig || !auth) {
          setError("Firebase config is missing. Add VITE_FIREBASE_* values in your client .env file.");
          return;
        }

        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.name.trim()) {
          await updateProfile(credential.user, { displayName: form.name.trim() });
        }

        try {
          const regResponse = await axios.post(
            `${API_BASE_URL}/api/auth/register`,
            {
              name: form.name.trim(),
              email: normalizedEmail,
              password: form.password,
            },
            { withCredentials: true }
          );
          if (regResponse.data?.token) {
            localStorage.setItem("token", regResponse.data.token);
          }
        } catch (registerError) {
          if (registerError?.response?.status === 409) {
            const loginResp = await axios.post(
              `${API_BASE_URL}/api/auth/login`,
              {
                email: normalizedEmail,
                password: form.password,
              },
              { withCredentials: true }
            );
            if (loginResp.data?.token) {
              localStorage.setItem("token", loginResp.data.token);
            }
          } else {
            throw registerError;
          }
        }

        setSuccess("Account created successfully.");
        await fetchBackendUser();
        if (shouldResumeBookingFlow) {
          navigate(redirectTarget, { replace: true, state: redirectState });
        } else {
          navigate("/preference-setup", { replace: true });
        }
        return;
      } else {
        const loginResponse = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          {
            email: normalizedEmail,
            password: form.password,
          },
          { withCredentials: true }
        );
        if (loginResponse.data?.token) {
          localStorage.setItem("token", loginResponse.data.token);
        }
        await fetchBackendUser();

        if (hasFirebaseConfig && auth) {
          try {
            await signInWithEmailAndPassword(auth, normalizedEmail, form.password);
          } catch (firebaseSyncError) {
          }
        }

        setSuccess("Login successful.");
      }

      navigate(redirectTarget, { replace: true, state: redirectState });
    } catch (authError) {
      setError(getApiErrorMessage(authError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");

    if (!hasFirebaseConfig || !auth || !googleProvider) {
      setError("Firebase config is missing. Add VITE_FIREBASE_* values in your client .env file.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const payload = {
        name: user.displayName || "Google User",
        email: user.email,
        avatar: user.photoURL,
        uid: user.uid,
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/google-login`, payload, { withCredentials: true });
      const { user: backendUser, token: googleToken } = response.data;
      if (googleToken) {
        localStorage.setItem("token", googleToken);
      }

      await fetchBackendUser();
      setSuccess("Google login successful.");

      if (shouldResumeBookingFlow) {
        navigate(redirectTarget, { replace: true, state: redirectState });
      } else if (backendUser && backendUser.isPreferenceSet === false) {
        navigate("/preference-setup", { replace: true });
      } else {
        navigate(redirectTarget, { replace: true, state: redirectState });
      }
    } catch (authError) {
      setError(normalizeFirebaseError(authError?.message));
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = form.password.length >= 6;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-cyan-50">
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-center gap-10 px-4 py-10 md:grid-cols-2 md:px-8">
        <section className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-100/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800 shadow-sm backdrop-blur-sm">
            <Lock size={14} className="opacity-80" /> Secure Access
          </div>
          <h1 className="mt-8 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl lg:leading-[1.1]">
            Sign in to manage <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">eco-friendly</span> stays.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600 md:max-w-lg">
            Use your email account or Google to continue. Your session stays synced with your property browsing preferences to deliver smart, personalized recommendations.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{headerText}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSignUp ? "Register once, then sign in anytime." : "Use your credentials to continue."}
          </p>

          {bookingNotice && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {bookingNotice}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleEmailAuth}>
            {isSignUp && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Full Name</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                  <UserRound size={16} className="text-slate-400" />
                  <input
                    value={form.name}
                    onChange={updateField("name")}
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <Mail size={16} className="text-slate-400" />
                <input
                  value={form.email}
                  onChange={updateField("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                <Lock size={16} className="text-slate-400" />
                <input
                  value={form.password}
                  onChange={updateField("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {isSignUp && (
                <div className="mt-3 ml-1 space-y-1.5 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">Password must contain:</p>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasMinLength ? 'text-emerald-600 font-medium' : ''}`}>
                    {hasMinLength ? <CheckCircle2 size={14} /> : <Circle size={14} />} <span>At least 6 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasUppercase ? 'text-emerald-600 font-medium' : ''}`}>
                    {hasUppercase ? <CheckCircle2 size={14} /> : <Circle size={14} />} <span>At least 1 uppercase letter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors ${hasNumber ? 'text-emerald-600 font-medium' : ''}`}>
                    {hasNumber ? <CheckCircle2 size={14} /> : <Circle size={14} />} <span>At least 1 number</span>
                  </div>
                </div>
              )}
            </label>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Login with Email"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue with Google
          </button>

          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Add Apartment and My Listings need backend cookie session. Use <strong>Email Login</strong> for seller actions.
          </p>

          <p className="mt-5 text-sm text-slate-600">
            {isSignUp ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setIsSignUp((previous) => !previous);
              }}
              className="font-semibold text-emerald-700 hover:text-emerald-900"
            >
              {isSignUp ? "Login" : "Create account"}
            </button>
          </p>

          <p className="mt-4 text-xs text-slate-500">
            <Link to="/" className="underline underline-offset-2">
              Back to Home
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
