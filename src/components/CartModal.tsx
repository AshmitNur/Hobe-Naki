"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

export function CartModal() {
    const { items, removeFromCart, updateQty, cartTotal, isCartOpen, setIsCartOpen, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        setIsCheckingOut(true);

        try {
            // 1. Create the main Order struct in Supabase
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        total_amount: cartTotal,
                        delivery_fee: 50,
                        status: 'pending',
                        customer_phone: 'Guest',       // Hook to Profile context later
                        payment_method: 'Cash on Delivery' // Hook to Profile context later
                    }
                ])
                .select('id')
                .single();

            if (orderError) throw orderError;

            // 2. Map all cart items to the new order_id
            const orderId = orderData.id;
            const itemsToInsert = items.map(item => ({
                order_id: orderId,
                brand: item.brand,
                product_name: item.name,
                price: item.price,
                quantity: item.qty
            }));

            // 3. Batch insert items
            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            alert("Order placed successfully! Developer notice: Check Supabase Dashboard to see real data flow.");
            clearCart();
            setIsCartOpen(false);

        } catch (error: any) {
            console.error("Checkout Failed:", error);
            alert(`Checkout Failed: ${error?.message || JSON.stringify(error)}`);
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <motion.div
                    key="cart-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCartOpen(false)}
                    className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm pointer-events-auto"
                />
            )}

            {isCartOpen && (
                <motion.div
                    key="cart-drawer"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed top-0 right-0 z-[100] w-full md:w-[450px] h-full bg-[#1a1a1a] border-l border-white/20 shadow-2xl flex flex-col pointer-events-auto text-white overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                        <h2 className="text-2xl font-black flex items-center gap-2">
                            <ShoppingBag className="w-6 h-6 text-[#FEE002]" />
                            Your Cart
                        </h2>
                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FEE002] hover:text-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-10">
                                <ShoppingBag className="w-16 h-16 mb-4 opacity-50 text-white" />
                                <p className="text-xl font-bold text-white">Your cart is empty</p>
                                <p className="text-sm mt-2 text-white/70">Add some items from the 3D scene!</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-4 relative group">
                                    <div className="w-20 h-20 relative bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center p-2">
                                        <Image
                                            src={item.image}
                                            alt={item.brand}
                                            fill
                                            unoptimized={process.env.NODE_ENV === 'development'}
                                            className="object-contain drop-shadow-md p-1"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="pr-6">
                                            <h3 className="font-bold text-lg leading-tight text-white mb-1">{item.brand}</h3>
                                            <p className="text-[10px] font-black text-[#FEE002] uppercase tracking-widest bg-[#FEE002]/20 inline-block px-2 py-0.5 rounded-full">{item.name}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1 border border-white/10">
                                                <button onClick={() => updateQty(item.id, item.qty - 1)} className="hover:text-[#FEE002] transition-colors"><Minus className="w-3 h-3" /></button>
                                                <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, item.qty + 1)} className="hover:text-[#FEE002] transition-colors"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <span className="font-black text-[#FEE002]">৳ {item.price * item.qty}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer (Checkout) */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-medium opacity-70">Subtotal</span>
                                <span className="font-black text-xl">৳ {cartTotal}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6 text-sm opacity-60">
                                <span>Delivery Fee</span>
                                <span>৳ 50</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold">Total</span>
                                <span className="font-black text-3xl text-[#FEE002]">৳ {cartTotal + 50}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-[#FEE002] hover:bg-yellow-400 text-black font-black text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(254,224,2,0.4)]"
                            >
                                {isCheckingOut ? "Processing..." : "Place Order"} <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
