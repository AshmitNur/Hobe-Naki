"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, User, MapPin, CreditCard, Clock, ChevronRight, Edit2, LogOut, PlusCircle, Trash2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/context/AuthContext";

interface ProfileModalProps {
    onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
    const { user, signInWithPhone, verifyOtp, signInWithEmail, signUpWithEmail, signOut } = useAuth();

    // Auth UI State
    const [authMode, setAuthMode] = useState<'phone' | 'email_in' | 'email_up'>('phone');
    const [loginPhone, setLoginPhone] = useState("+880");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginOtp, setLoginOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState("New User");

    const [isEditingAddress, setIsEditingAddress] = useState<number | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);

    // Convert single address to array list
    const [addresses, setAddresses] = useState([
        { id: 1, title: "Home", line1: "House 12, Road 5, Block C, Banani", line2: "Dhaka 1213, Bangladesh" }
    ]);
    const [draftAddress, setDraftAddress] = useState({ title: "", line1: "", line2: "" });

    const [defaultPayment, setDefaultPayment] = useState("bKash");

    const [isEditingBkash, setIsEditingBkash] = useState(false);
    const [bkashNumber, setBkashNumber] = useState("01712-***678");

    const [addressQuery, setAddressQuery] = useState("");
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (addressQuery.length >= 3) {
                try {
                    // Using Photon (by Komoot) - OpenStreetMap data, highly optimized for autocomplete, NO API KEY
                    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(addressQuery)}&limit=5`);
                    if (res.ok) {
                        const data = await res.json();
                        const formattedSuggestions = (data.features || []).map((f: any) => {
                            const p = f.properties;
                            // Build a display string out of available OSM fields
                            return {
                                display_name: [p.name, p.street, p.district, p.city, p.state, p.country].filter(Boolean).join(", ")
                            };
                        });
                        setAddressSuggestions(formattedSuggestions);
                    }
                } catch (e) {
                    console.error("Geocoding failed:", e);
                }
            } else {
                setAddressSuggestions([]);
            }
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [addressQuery]);

    const handleAddressSearch = (query: string) => {
        setDraftAddress({ ...draftAddress, line1: query });
        setAddressQuery(query);
    };

    const handleSelectSuggestion = (suggestion: any) => {
        setDraftAddress({ ...draftAddress, line1: suggestion.display_name });
        setAddressQuery(""); // Clearing this prevents the useEffect from re-triggering unnecessary fetches
        setAddressSuggestions([]);
    };

    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5); // Fetch top 5 recent orders

            if (user && !error && data) {
                setRecentOrders(data);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    // Auth Handlers
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        const { error } = await signInWithPhone(loginPhone);
        if (error) {
            alert(`Login Error: ${error.message}`);
        } else {
            setIsOtpSent(true);
        }
        setIsAuthLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        const { error } = await verifyOtp(loginOtp);
        if (error) {
            alert(`Verification Error: ${error.message}`);
        }
        setIsAuthLoading(false);
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        if (authMode === 'email_in') {
            const { error } = await signInWithEmail(loginEmail, loginPassword);
            if (error) alert(`Login Error: ${error.message}`);
        } else {
            const { error } = await signUpWithEmail(loginEmail, loginPassword);
            if (error) {
                alert(`Sign Up Error: ${error.message}`);
            } else {
                alert("Sign up successful! You may now be logged in (or need to check your email to verify).");
            }
        }
        setIsAuthLoading(false);
    };

    const handleSaveAddress = () => {
        if (isAddingAddress) {
            setAddresses([...addresses, { ...draftAddress, id: Date.now() }]);
            setIsAddingAddress(false);
        } else if (isEditingAddress !== null) {
            setAddresses(addresses.map(adr => adr.id === isEditingAddress ? { ...adr, ...draftAddress } : adr));
            setIsEditingAddress(null);
        }
        setDraftAddress({ title: "", line1: "", line2: "" });
        setAddressQuery("");
        setAddressSuggestions([]);
    };

    const handleDeleteAddress = (idToDel: number) => {
        setAddresses(addresses.filter(adr => adr.id !== idToDel));
    };

    const handleEditAddressClick = (adr: any) => {
        setDraftAddress({ title: adr.title, line1: adr.line1, line2: adr.line2 });
        setAddressQuery(adr.line1);
        setIsEditingAddress(adr.id);
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div
                className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
                onClick={onClose}
            />

            <motion.div
                className="relative z-50 w-full max-w-5xl h-[85vh] md:h-[70vh] bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex flex-col md:flex-row overflow-hidden pointer-events-auto"
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#FEE002] hover:text-black transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Sidebar */}
                <div className="w-full md:w-1/3 h-auto md:h-full bg-white/5 relative flex flex-col border-b md:border-b-0 md:border-r border-white/20 p-8">
                    {!user ? (
                        <div className="flex-1 flex flex-col justify-center text-center px-4">
                            <h2 className="text-3xl font-black mb-2 uppercase text-white tracking-tight drop-shadow-md">
                                {authMode === 'email_up' ? 'Sign Up' : 'Sign In'}
                            </h2>
                            <p className="text-sm font-medium text-white/50 mb-6 max-w-[80%] mx-auto">Access your saved addresses, secure payments, and order history.</p>

                            <div className="flex justify-center gap-2 mb-6 bg-white/10 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('phone')}
                                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${authMode === 'phone' ? 'bg-[#FEE002] text-black' : 'text-white/70 hover:text-white'}`}
                                >Phone</button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('email_in')}
                                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${authMode === 'email_in' ? 'bg-[#FEE002] text-black' : 'text-white/70 hover:text-white'}`}
                                >Email</button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMode('email_up')}
                                    className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${authMode === 'email_up' ? 'bg-[#FEE002] text-black' : 'text-white/70 hover:text-white'}`}
                                >New?</button>
                            </div>

                            {authMode === 'phone' ? (
                                <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
                                    {!isOtpSent ? (
                                        <>
                                            <input
                                                type="tel"
                                                value={loginPhone}
                                                onChange={e => setLoginPhone(e.target.value)}
                                                placeholder="+8801XXXXXXXXX"
                                                className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/30 text-white placeholder-white/30 font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002] transition-all text-center tracking-wider"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAuthLoading}
                                                className="w-full bg-[#FEE002] hover:bg-yellow-400 text-black font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_15px_rgba(254,224,2,0.3)] mt-2"
                                            >
                                                {isAuthLoading ? "Sending..." : "Send Secure OTP"} <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <input
                                                type="text"
                                                value={loginOtp}
                                                onChange={e => setLoginOtp(e.target.value)}
                                                placeholder="Enter 6-digit Code"
                                                className="w-full px-4 py-3 bg-white/10 rounded-xl border border-[#FEE002]/50 text-white placeholder-white/30 font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[#FEE002] transition-all"
                                                maxLength={6}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={isAuthLoading || loginOtp.length < 6}
                                                className="w-full bg-[#E2136E] hover:bg-[#c90f61] text-white font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_15px_rgba(226,19,110,0.3)] mt-4"
                                            >
                                                {isAuthLoading ? "Verifying..." : "Verify & Login"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsOtpSent(false)}
                                                className="mt-4 text-xs font-bold text-white/50 hover:text-white"
                                            >
                                                Incorrect number? Go back
                                            </button>
                                        </motion.div>
                                    )}
                                </form>
                            ) : (
                                <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
                                    <input
                                        type="email"
                                        value={loginEmail}
                                        onChange={e => setLoginEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/30 text-white placeholder-white/30 font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002] transition-all tracking-wide text-center"
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full px-4 py-3 bg-white/10 rounded-xl border border-white/30 text-white placeholder-white/30 font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002] transition-all text-center"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="submit"
                                        disabled={isAuthLoading}
                                        className="w-full bg-[#FEE002] hover:bg-yellow-400 text-black font-black text-lg py-3 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_15px_rgba(254,224,2,0.3)] mt-2"
                                    >
                                        {isAuthLoading ? "Processing..." : (authMode === 'email_up' ? "Create Account" : "Sign In")} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center justify-center text-center mb-8 mt-4">
                                <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-[#FEE002] flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(254,224,2,0.3)]">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                {isEditingProfile ? (
                                    <div className="flex flex-col gap-2 w-full mt-2">
                                        <input
                                            type="text"
                                            value={profileName}
                                            onChange={e => setProfileName(e.target.value)}
                                            className="w-full px-3 py-2 bg-white/20 rounded-xl border border-white/40 text-white placeholder-white/50 font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002]"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => setIsEditingProfile(false)}
                                            className="mt-2 flex justify-center items-center gap-2 px-4 py-2 bg-[#FEE002] hover:bg-yellow-400 text-black rounded-full text-sm font-bold transition-colors shadow-sm"
                                        >
                                            Save Profile
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-black text-white">{profileName}</h2>
                                        <p className="text-sm font-medium text-[#FEE002] mb-1">{user.phoneNumber || user.email}</p>

                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold transition-colors text-white"
                                        >
                                            <Edit2 className="w-3 h-3" /> Edit Profile
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 flex-1">
                                <button className="flex items-center gap-3 p-3 rounded-xl bg-white/20 border border-white/40 font-bold transition-all hover:bg-white/40 focus:ring-2 focus:ring-[#FEE002] text-white">
                                    <MapPin className="w-5 h-5 text-[#FEE002] drop-shadow-sm" /> Managed Addresses
                                </button>
                                <button className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent font-bold transition-all hover:bg-white/10 text-white/80">
                                    <CreditCard className="w-5 h-5 opacity-60" /> Saved Payments
                                </button>
                                <button className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent font-bold transition-all hover:bg-white/10 text-white/80">
                                    <Clock className="w-5 h-5 opacity-60" /> Order History
                                </button>
                            </div>

                            <button onClick={signOut} className="mt-auto flex items-center justify-center gap-2 p-3 text-red-400 font-bold hover:bg-red-500/10 rounded-xl transition-colors">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </>
                    )}
                </div>

                {/* Right Area - Dynamic Content */}
                <div className="w-full md:w-2/3 h-full flex flex-col p-8 md:p-12 text-black bg-gradient-to-br from-white/10 to-black/5 overflow-y-auto relative">
                    {!user && (
                        <div className="absolute inset-0 z-40 bg-black/50 backdrop-blur-md flex items-center justify-center pointer-events-auto">
                            <div className="text-center max-w-sm px-6">
                                <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">Login Required</h3>
                                <p className="text-white/90 font-medium text-sm">Please sign in on the left panel to access and manage your delivery profiles.</p>
                            </div>
                        </div>
                    )}
                    <div className={!user ? "opacity-10 pointer-events-none" : ""}>
                        <div className="flex justify-between items-center mb-6 mt-2 border-b border-black/10 pb-4">
                            <h3 className="text-3xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                                Your Addresses
                            </h3>
                            {!isAddingAddress && isEditingAddress === null && (
                                <button
                                    onClick={() => { setIsAddingAddress(true); setDraftAddress({ title: "New Address", line1: "", line2: "" }); }}
                                    className="flex items-center gap-1 bg-[#FEE002] text-black px-3 py-1.5 rounded-full font-bold text-sm shadow-[0_2px_8px_rgba(254,224,2,0.5)] hover:bg-yellow-400 transition-colors"
                                >
                                    <PlusCircle className="w-4 h-4" /> Add
                                </button>
                            )}
                        </div>

                        {/* Address List & Editor Container */}
                        <div className="flex flex-col gap-4 mb-8">
                            {(isAddingAddress || isEditingAddress !== null) && (
                                <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_16px_0_rgba(0,0,0,0.05)] border-2 border-[#FEE002] relative z-50 group">
                                    <h4 className="font-bold mb-3">{isAddingAddress ? "Add New Address" : "Edit Address"}</h4>
                                    <input
                                        type="text"
                                        placeholder="Title (e.g. Home, Office)"
                                        value={draftAddress.title}
                                        onChange={e => setDraftAddress({ ...draftAddress, title: e.target.value })}
                                        className="w-full mb-2 bg-white/60 border border-white/50 rounded-lg px-3 py-2 font-bold text-lg text-black focus:outline-none focus:ring-2 focus:ring-[#FEE002]"
                                        autoFocus
                                    />
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Street Network, Road, Block... (Powered by OpenStreetMap)"
                                            value={addressQuery || draftAddress.line1}
                                            onChange={e => handleAddressSearch(e.target.value)}
                                            className="w-full mb-2 bg-white/60 border border-white/50 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#FEE002]"
                                        />
                                        {addressSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-lg border border-black/10 overflow-hidden z-20">
                                                {addressSuggestions.map((suggestion, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSelectSuggestion(suggestion)}
                                                        className="px-4 py-3 text-sm text-neutral-800 hover:bg-[#FEE002]/20 cursor-pointer border-b border-black/5 last:border-b-0"
                                                    >
                                                        {suggestion.display_name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="City, ZIP, Country"
                                        value={draftAddress.line2}
                                        onChange={e => setDraftAddress({ ...draftAddress, line2: e.target.value })}
                                        className="w-full mb-4 bg-white/60 border border-white/50 rounded-lg px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#FEE002]"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveAddress}
                                            className="px-5 py-2 bg-[#FEE002] hover:bg-yellow-400 text-black rounded-lg text-sm font-bold transition-colors shadow-sm flex-1"
                                        >
                                            {isAddingAddress ? "Save New Address" : "Update Address"}
                                        </button>
                                        <button
                                            onClick={() => { setIsAddingAddress(false); setIsEditingAddress(null); }}
                                            className="px-5 py-2 bg-black/10 hover:bg-black/20 text-black rounded-lg text-sm font-bold transition-colors shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Rendering mapped list of saved locations */}
                            {!isAddingAddress && addresses.map((adr, i) => (
                                <div key={adr.id} className={`bg-white/40 backdrop-blur-md rounded-2xl p-5 shadow-[0_4px_16px_0_rgba(0,0,0,0.05)] border border-white/50 relative group ${isEditingAddress === adr.id ? 'hidden' : 'block'}`}>
                                    {i === 0 && <div className="absolute top-5 right-5 w-3 h-3 bg-[#FEE002] rounded-full shadow-[0_0_8px_rgba(254,224,2,0.8)]"></div>}
                                    <h4 className="font-bold text-lg mb-1">{adr.title}</h4>
                                    <p className="text-sm text-neutral-800 leading-relaxed max-w-[80%]">
                                        {adr.line1}<br />
                                        {adr.line2}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <button
                                            onClick={() => handleEditAddressClick(adr)}
                                            className="text-sm font-bold text-black/60 hover:text-black focus:outline-none"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAddress(adr.id)}
                                            className="text-sm font-bold text-red-500/80 hover:text-red-600 focus:outline-none flex gap-1 items-center"
                                        >
                                            <Trash2 className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b border-black/10 pb-4">
                            Payment Methods
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {/* bKash */}
                            <div
                                className={`border rounded-2xl p-4 flex flex-col justify-center transition-colors shadow-sm ${defaultPayment === 'bKash' ? 'bg-[#E2136E]/20 border-[#E2136E]/50 ring-2 ring-[#E2136E]' : 'bg-[#E2136E]/5 border-[#E2136E]/20 hover:bg-[#E2136E]/10 cursor-pointer'}`}
                                onClick={(e) => {
                                    if (defaultPayment !== 'bKash') setDefaultPayment('bKash');
                                }}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#E2136E] rounded-full flex items-center justify-center font-black text-white text-xs shadow-md">
                                            bkash
                                        </div>
                                        <div>
                                            <p className="font-bold">bKash Account</p>
                                            {!isEditingBkash && <p className="text-xs opacity-70">Linked: {bkashNumber || "None"}</p>}
                                        </div>
                                    </div>
                                    {defaultPayment === 'bKash' ? (
                                        <button
                                            className="text-xs font-bold text-[#E2136E] bg-white px-3 py-1 rounded-full shadow-sm ring-1 ring-[#E2136E]/20 hover:bg-gray-50"
                                            onClick={(e) => { e.stopPropagation(); setIsEditingBkash(!isEditingBkash); }}
                                        >
                                            {isEditingBkash ? "Close" : "Edit"}
                                        </button>
                                    ) : (
                                        <ChevronRight className="w-5 h-5 opacity-40" />
                                    )}
                                </div>

                                {/* Inline bkash editor state */}
                                {isEditingBkash && defaultPayment === 'bKash' && (
                                    <div className="mt-4 pt-4 border-t border-[#E2136E]/20 flex gap-2">
                                        <input
                                            type="tel"
                                            value={bkashNumber}
                                            onChange={e => setBkashNumber(e.target.value)}
                                            placeholder="017XX-XXXXXX"
                                            className="w-full bg-white/60 border border-white/50 rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsEditingBkash(false); }}
                                            className="bg-[#E2136E] text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-[#c90f61]"
                                        >
                                            Link
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Cash on Delivery */}
                            <div
                                onClick={() => setDefaultPayment('COD')}
                                className={`backdrop-blur-sm border rounded-2xl p-4 flex items-center justify-between transition-colors cursor-pointer shadow-sm ${defaultPayment === 'COD' ? 'bg-white/80 border-[#FEE002] ring-2 ring-[#FEE002]' : 'bg-white/40 border-white/50 hover:bg-white/60'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center font-black text-[#FEE002] shadow-md">
                                        ৳
                                    </div>
                                    <div>
                                        <p className="font-bold">Cash on Delivery</p>
                                        <p className="text-xs opacity-70">Pay when arrived</p>
                                    </div>
                                </div>
                                {defaultPayment === 'COD' ? (
                                    <span className="text-xs font-bold text-black bg-[#FEE002] px-3 py-1 rounded-full shadow-sm">Active</span>
                                ) : (
                                    <ChevronRight className="w-5 h-5 opacity-40" />
                                )}
                            </div>
                        </div>

                        <h3 className="text-3xl font-black mb-6 uppercase tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] border-b border-black/10 pb-4">
                            Recent Orders
                        </h3>

                        <div className="flex flex-col gap-3 mb-4">
                            {recentOrders.length === 0 ? (
                                <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20">
                                    <p className="text-white/70 font-medium">No recent orders found.</p>
                                </div>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="bg-white/20 backdrop-blur-sm border border-white/40 rounded-xl p-4 flex items-center justify-between hover:bg-white/30 transition-colors shadow-sm">
                                        <div>
                                            <p className="font-bold flex items-center gap-2">
                                                Order #{order.id.split('-')[0].toUpperCase()}
                                            </p>
                                            <p className="text-sm opacity-70">
                                                {new Date(order.created_at).toLocaleDateString()} • {order.payment_method}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl">৳ {order.total_amount}</p>
                                            <div className="flex justify-end gap-1 items-center">
                                                <div className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                                <p className={`text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {order.status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
