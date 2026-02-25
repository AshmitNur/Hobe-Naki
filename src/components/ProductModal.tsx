"use client";

import { motion } from "framer-motion";
import { X, ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

interface ProductModalProps {
    objectName: string;
    onClose: () => void;
}

export function ProductModal({ objectName, onClose }: ProductModalProps) {
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();

    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

    // Initial default derivations
    const isCondom = objectName.toLowerCase().includes('button 1') || objectName.toLowerCase() === 'condom';
    const isCigarette = objectName.toLowerCase().includes('button 2') || objectName.toLowerCase() === 'cigarette';

    const displayName = isCondom ? 'Condom' : isCigarette ? 'Cigarette' : objectName;

    const activeBrand = selectedBrand || (isCondom ? 'Durex Extra Time' : isCigarette ? 'Benson' : objectName);

    // Image logic: expects images in public/images/products/...
    const getImageUrl = (brandName: string) => {
        const sanitized = brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `/images/products/${sanitized}.png`;
    };

    const currentImage = getImageUrl(activeBrand);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                className="relative z-50 w-full max-w-5xl h-[85vh] md:h-[70vh] bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] flex flex-col md:flex-row overflow-hidden pointer-events-auto"
                initial={{ y: 50, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-[#FEE002] hover:text-black transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Product Image Display */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-full bg-white/5 relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/20 overflow-hidden p-8">
                    <div className="w-full h-full relative flex items-center justify-center z-10 transition-transform duration-300 hover:scale-[1.02]">
                        <Image
                            src={currentImage}
                            alt={activeBrand}
                            fill
                            unoptimized={process.env.NODE_ENV === 'development'}
                            className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-opacity duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    {/* Subtle glow effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FEE002]/20 blur-[100px] pointer-events-none rounded-full" />
                </div>

                {/* Right Side: Details & Add to Cart */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col p-8 md:p-12 text-black bg-gradient-to-br from-white/10 to-black/5 overflow-y-auto">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 bg-[#FEE002]/80 text-black text-xs font-bold uppercase tracking-widest rounded-full mb-4 shadow-sm"
                        >
                            Express Delivery
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                        >
                            {displayName}
                        </motion.h2>

                        {/* Conditionally render different choices based on the product clicked */}
                        {(objectName.toLowerCase().includes('button 1') || objectName.toLowerCase() === 'condom') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="mt-6 mb-8"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-60">Select Brand</h3>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { brand: 'Durex Extra Time', price: '৳ 350', desc: 'Extended pleasure' },
                                        { brand: 'Manforce Chocolate', price: '৳ 120', desc: 'Flavored, dotted' },
                                        { brand: 'Skore Not Out', price: '৳ 150', desc: 'Climax delay' }
                                    ].map((item, idx) => {
                                        const isSelected = activeBrand === item.brand;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedBrand(item.brand)}
                                                className={`w-full text-left p-4 rounded-xl border backdrop-blur-md transition-all flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-[#FEE002] ${isSelected ? 'bg-white/40 border-[#FEE002] shadow-[0_0_15px_rgba(254,224,2,0.3)]' : 'border-white/40 bg-white/20 hover:bg-white/30'}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-lg">{item.brand}</p>
                                                    <p className="text-sm opacity-70">{item.desc}</p>
                                                </div>
                                                <span className="font-black text-[#FEE002] drop-shadow-sm bg-black/80 px-3 py-1 rounded-full text-sm group-hover:scale-110 transition-transform">
                                                    {item.price}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {(objectName.toLowerCase().includes('button 2') || objectName.toLowerCase() === 'cigarette') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="mt-6 mb-8"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 opacity-60">Select Brand</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['Benson', 'Marlboro', 'Gold Leaf', 'Derby'].map((brand, idx) => {
                                        const isSelected = activeBrand === brand;
                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedBrand(brand)}
                                                className={`px-4 py-2 rounded-full border transition-all font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002] ${isSelected ? 'bg-[#FEE002] border-[#FEE002] text-black shadow-md' : 'border-black/10 bg-white/50 hover:bg-[#FEE002]/50 text-black/80'}`}
                                            >
                                                {brand}
                                            </button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {!(objectName.toLowerCase().includes('button 1') || objectName.toLowerCase() === 'condom') && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="text-2xl font-black text-black mb-6 drop-shadow-sm mt-4"
                            >
                                ৳ 250
                            </motion.p>
                        )}

                        <motion.p
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="text-neutral-800 text-sm font-medium leading-relaxed mb-6 mt-4"
                        >
                            High-quality essential product carefully selected for you.
                            Enjoy fast, discreet delivery right to your map-pinged location within 15-30 minutes.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 mt-auto"
                    >
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-md border border-white/50 rounded-full px-4 py-3 shadow-[0_4px_16px_0_rgba(0,0,0,0.1)]">
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="text-black/60 hover:text-black transition-colors"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="w-6 text-center font-bold text-black">{qty}</span>
                            <button
                                onClick={() => setQty(qty + 1)}
                                className="text-black/60 hover:text-black transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={() => {
                                // Default prices:
                                let priceNum = 250;
                                if (isCondom) {
                                    const cPrices: Record<string, number> = { 'Durex Extra Time': 350, 'Manforce Chocolate': 120, 'Skore Not Out': 150 };
                                    if (activeBrand in cPrices) priceNum = cPrices[activeBrand];
                                } else if (isCigarette) {
                                    priceNum = 350;
                                }

                                addToCart({
                                    id: activeBrand,
                                    name: objectName,
                                    brand: activeBrand,
                                    price: priceNum,
                                    qty: qty,
                                    image: currentImage
                                });
                                onClose();
                            }}
                            className="flex-1 bg-[#FEE002] hover:bg-yellow-400 text-black font-black text-lg py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_16px_0_rgba(254,224,2,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
