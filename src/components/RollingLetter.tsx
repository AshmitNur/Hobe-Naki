"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RollingLetterProps {
    finalLetter: string;
    delay: number;
}

export function RollingLetter({ finalLetter, delay }: RollingLetterProps) {
    const [hasLanded, setHasLanded] = useState(false);
    const isSpace = finalLetter === " ";

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasLanded(true);
        }, delay * 1000 + 1500); // Wait for the initial roll to finish
        return () => clearTimeout(timer);
    }, [delay]);

    if (isSpace) {
        return <div className="w-[1vw]" />; // A gap for space
    }

    return (
        <motion.div
            className="perspective-wrapper relative cursor-pointer mx-1 md:mx-2"
            initial={{ rotateX: 1080, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            transition={{
                duration: 1.5,
                delay: delay,
                ease: [0.25, 1, 0.5, 1],
            }}
            whileHover={{
                rotateY: 20,
                rotateX: -20,
                y: -10,
                transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.9 }}
        >
            <div
                className="isometric-text preserve-3d font-black text-6xl md:text-8xl lg:text-9xl text-[#FEE002] uppercase tracking-tighter mix-blend-normal z-10 block"
                style={{ WebkitTextStroke: "2px #000" }}
            >
                {finalLetter}
            </div>
        </motion.div>
    );
}
