"use client";
import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineBackground({ sceneUrl }: { sceneUrl?: string }) {
    if (!sceneUrl) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-auto">
            <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
                <Spline scene={sceneUrl} className="w-full h-full block" />
            </Suspense>
        </div>
    );
}
