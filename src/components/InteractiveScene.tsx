"use client";
import React, { Suspense, lazy } from 'react';
import type { Application } from '@splinetool/runtime';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function InteractiveScene({
    sceneUrl,
    onObjectClick
}: {
    sceneUrl: string;
    onObjectClick?: (name: string) => void;
}) {
    const handleLoad = (app: Application) => {
        // Listen for clicks on the Spline scene
        app.addEventListener('mouseDown', (e) => {
            console.log('Spline object clicked:', e.target.name);
            if (onObjectClick && e.target.name) {
                onObjectClick(e.target.name);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-0 pointer-events-auto">
            <Suspense fallback={<div className="w-full h-full bg-transparent flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-black border-t-transparent animate-spin"></div></div>}>
                <Spline scene={sceneUrl} onLoad={handleLoad} className="w-full h-full block" />
            </Suspense>
        </div>
    );
}
