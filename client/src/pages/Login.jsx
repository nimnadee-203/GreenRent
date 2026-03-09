import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Eye, EyeOff, Mail, Lock, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { auth, googleProvider, hasFirebaseConfig } from "../config/firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
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

  const handleEmailAuth = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!hasFirebaseConfig || !auth) {
      setError("Firebase config is missing. Add VITE_FIREBASE_* values in your client .env file.");
      return;
    }

    if (!form.email || !form.password || (isSignUp && !form.name)) {
      setError("Please fill all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.name.trim()) {
          await updateProfile(credential.user, { displayName: form.name.trim() });
        }

        try {
          await axios.post(
            `${API_BASE_URL}/api/auth/register`,
            {
              name: form.name.trim(),
              email: form.email,
              password: form.password,
            },
            { withCredentials: true }
          );
        } catch (registerError) {
          if (registerError?.response?.status === 409) {
            await axios.post(
              `${API_BASE_URL}/api/auth/login`,
              {
                email: form.email,
                password: form.password,
              },
              { withCredentials: true }
            );
          } else {
            throw registerError;
          }
        }

        setSuccess("Account created successfully.");
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          {
            email: form.email,
            password: form.password,
          },
          { withCredentials: true }
        );
        setSuccess("Login successful.");
      }

      navigate("/properties");
    } catch (authError) {
      setError(normalizeFirebaseError(authError?.message));
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
      await signInWithPopup(auth, googleProvider);
      setSuccess("Google login successful for browsing. Use Email Login for Add Apartment/My Listings.");
      navigate("/properties");
    } catch (authError) {
      setError(normalizeFirebaseError(authError?.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-cyan-50">
      <Navbar />

      <main className="mx-auto grid min-h-[calc(100vh-80px)] max-w-[1280px] items-center gap-10 px-4 py-10 md:grid-cols-2 md:px-8">
        <section>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Secure Access</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Sign in to manage eco-friendly stays.
          </h1>
          <p className="mt-4 max-w-xl text-slate-600">
            Use your email account or Google to continue. Your session stays synced with your property browsing
            preferences.
          </p>
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">Need Firebase setup?</p>
            <p className="mt-1">
              Add your Firebase Web App keys as <code>VITE_FIREBASE_*</code> in <code>client/.env</code>.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{headerText}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSignUp ? "Register once, then sign in anytime." : "Use your credentials to continue."}
          </p>

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
