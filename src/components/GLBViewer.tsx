"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import { Suspense, useState, useEffect } from "react";

// This strongly typed wrapper handles actually loading the GLB file
// Note: useGLTF suspends when loading, and throws an error if it 404s
function Model({ url, onError }: { url: string, onError: () => void }) {
    // If the file is missing, we need to catch it.
    useEffect(() => {
        // Quick verification fetch to handle 404s cleanly without crashing react-three-fiber
        fetch(url).then(res => {
            if (!res.ok) {
                onError();
            }
        }).catch(() => onError());
    }, [url, onError]);

    const { scene } = useGLTF(url);
    return <primitive object={scene} />;
}

export function GLBViewer({ modelUrl }: { modelUrl: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        // Return null so ProductModal can naturally show the "Needs 3D Model" fallback
        return null;
    }

    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
                <Suspense fallback={null}>
                    <PresentationControls
                        speed={1.5}
                        global
                        zoom={1.5}
                        polar={[-0.1, Math.PI / 4]}
                    >
                        <Stage environment="city" intensity={0.6}>
                            <Model url={modelUrl} onError={() => setHasError(true)} />
                        </Stage>
                    </PresentationControls>
                </Suspense>
            </Canvas>
        </div>
    );
}
