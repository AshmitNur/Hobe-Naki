"use client";

import { useState, useEffect } from "react";
import { RollingLetter } from "../components/RollingLetter";
import { InteractiveScene } from "../components/InteractiveScene";
import { ProductModal } from "../components/ProductModal";
import { ProfileModal } from "../components/ProfileModal";
import { CartModal } from "../components/CartModal";
import { useCart } from "@/context/CartContext";
import { RotateCw, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const text = "HOBE NAKI".split("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isIntroAnimDone, setIsIntroAnimDone] = useState(false);

  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIntroAnimDone(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const handleSceneClick = (objectName: string) => {
    // Ignore clicks on basic scene elements if they don't represent products
    // Assuming your UI has specific 3D items users will click
    if (objectName && !['Directional Light', 'Camera', 'Rectangle'].includes(objectName)) {
      // Allow plenty of time for the Spline click-animations to finish completely
      setTimeout(() => {
        setSelectedProduct(objectName);
      }, 1950); // Increased from 1.2s to 3s
    }
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans">

      {/* Interactive Spline 3D Scene */}
      <div
        className="fixed inset-0 z-0 pointer-events-auto transition-opacity duration-1000"
        style={{ opacity: isIntroAnimDone ? 1 : 0 }}
      >
        <InteractiveScene
          sceneUrl="https://prod.spline.design/lIAPvXEvoxglBWV5/scene.splinecode"
          onObjectClick={handleSceneClick}
        />
      </div>

      {/* Top right buttons */}
      <div className="absolute top-6 right-8 flex gap-3 z-30 pointer-events-auto">
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-center h-10 px-4 rounded-full bg-black/80 hover:bg-black text-[#FEE002] transition-colors shadow-lg border border-[#FEE002]/20 font-bold focus:outline-none focus:ring-2 focus:ring-[#FEE002] focus:ring-offset-2 focus:ring-offset-yellow-500"
        >
          {/* A generic logo-like visual for the checkout area */}
          <div className="w-5 h-5 mr-2 rounded-full border-2 border-[#FEE002] flex items-center justify-center relative">
            <div className="w-2 h-2 bg-[#FEE002] rounded-full" />
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse">{cartCount}</span>}
          </div>
          Checkout {cartCount > 0 ? `(${cartCount})` : ''}
        </button>
      </div>

      {/* Floating 3D Text Container */}
      <AnimatePresence>
        <motion.div
          className="absolute z-20 flex pointer-events-auto origin-top-left"
          initial={{ top: "45%", left: "50%", x: "-50%", y: "-50%", scale: 0.9, opacity: 0 }}
          animate={
            isIntroAnimDone
              ? { top: "24px", left: "32px", x: 0, y: 0, scale: 0.25, opacity: 1 }
              : { top: "45%", left: "50%", x: "-50%", y: "-50%", scale: 1, opacity: 1 }
          }
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          style={{ width: "max-content" }}
        >
          {text.map((char, index) => (
            <RollingLetter
              key={`${char}-${index}`}
              finalLetter={char}
              delay={index * 0.1}
            />
          ))}
        </motion.div>
      </AnimatePresence>



      {/* Product Detail / Profile Modal overlay */}
      <AnimatePresence mode="wait">
        {selectedProduct && (
          selectedProduct.toLowerCase().includes('button 3') ||
            selectedProduct.toLowerCase().includes('personal') ||
            selectedProduct.toLowerCase().includes('profile') ? (
            <ProfileModal key="profile-modal" onClose={() => setSelectedProduct(null)} />
          ) : (
            <ProductModal
              key={`product-modal-${selectedProduct}`}
              objectName={selectedProduct}
              onClose={() => setSelectedProduct(null)}
            />
          )
        )}
      </AnimatePresence>

      <CartModal />
    </main>
  );
}
