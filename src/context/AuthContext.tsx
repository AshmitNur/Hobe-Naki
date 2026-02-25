"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/utils/firebase";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult
} from "firebase/auth";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithPhone: (phone: string) => Promise<{ error: any }>;
    verifyOtp: (token: string) => Promise<{ error: any }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

    useEffect(() => {
        if (!auth) {
            setIsLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const setupRecaptcha = () => {
        if (!auth) throw new Error("Firebase auth is not initialized.");
        if (!(window as any).recaptchaVerifier) {
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const signInWithPhone = async (phone: string) => {
        try {
            setupRecaptcha();
            const appVerifier = (window as any).recaptchaVerifier;
            if (!auth) throw new Error("Firebase auth is not initialized.");
            const result = await signInWithPhoneNumber(auth, phone, appVerifier);
            setConfirmationResult(result);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const verifyOtp = async (token: string) => {
        try {
            if (!confirmationResult) throw new Error("No OTP request found.");
            await confirmationResult.confirm(token);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            if (!auth) throw new Error("Firebase auth is not initialized.");
            await signInWithEmailAndPassword(auth, email, password);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            if (!auth) throw new Error("Firebase auth is not initialized.");
            await createUserWithEmailAndPassword(auth, email, password);
            return { error: null };
        } catch (error) {
            return { error };
        }
    };

    const signOut = async () => {
        if (!auth) throw new Error("Firebase auth is not initialized.");
        await firebaseSignOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail, signOut }}>
            <div id="recaptcha-container"></div>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
