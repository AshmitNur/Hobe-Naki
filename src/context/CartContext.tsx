"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type CartItem = {
    id: string; // brand name
    name: string; // Generic ObjectName
    brand: string;
    price: number;
    qty: number;
    image: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const addToCart = (newItem: CartItem) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === newItem.id);
            if (existing) {
                return prev.map(i => i.id === newItem.id ? { ...i, qty: i.qty + newItem.qty } : i);
            }
            return [...prev, newItem];
        });
        // Delay opening the cart slightly to let ProductModal exit animation finish gracefully
        setTimeout(() => {
            setIsCartOpen(true);
        }, 400);
    };

    const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

    const updateQty = (id: string, qty: number) => {
        if (qty === 0) {
            removeFromCart(id);
        } else {
            setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
        }
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => total + (item.price * item.qty), 0);
    const cartCount = items.reduce((count, item) => count + item.qty, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error("useCart must be used within a CartProvider");
    return context;
}
