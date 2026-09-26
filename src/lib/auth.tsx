"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const googleProvider = new GoogleAuthProvider();

async function ensureUserProfile(user: User) {
  const ref = doc(getFirebaseDb(), "users", user.uid);
  const existing = await getDoc(ref);
  const base = {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };
  if (existing.exists()) {
    await setDoc(ref, base, { merge: true });
  } else {
    await setDoc(ref, { ...base, createdAt: serverTimestamp() });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const auth = getFirebaseAuth();

    void getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await ensureUserProfile(result.user);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Google sign-in failed.",
          );
        }
      });

    const unsub = onAuthStateChanged(auth, (next) => {
      if (cancelled) return;
      setUser(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    const auth = getFirebaseAuth();
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user);
    } catch (err: unknown) {
      const code =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      // Popup blocked / iOS — fall back to redirect
      if (
        code === "auth/popup-blocked" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      if (code === "auth/popup-closed-by-user") {
        return;
      }
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await firebaseSignOut(getFirebaseAuth());
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      signInWithGoogle,
      signOut,
      clearError: () => setError(null),
    }),
    [user, loading, error, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
