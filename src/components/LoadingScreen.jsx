import { useState, useEffect } from "react";

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Initializing");

    useEffect(() => {
        const loadingSteps = [
            { text: "Loading MovieStream...", duration: 800 },
            { text: "Preparing your experience...", duration: 1000 },
            { text: "Loading content library...", duration: 1200 },
            { text: "Almost ready...", duration: 600 },
            { text: "Welcome!", duration: 400 }
        ];

        let currentStep = 0;
        let intervalId;

        const updateProgress = () => {
            if (currentStep < loadingSteps.length) {
                const step = loadingSteps[currentStep];
                setLoadingText(step.text);

                // Calculate progress percentage
                const totalDuration = loadingSteps.reduce((sum, s) => sum + s.duration, 0);
                const elapsedDuration = loadingSteps.slice(0, currentStep + 1).reduce((sum, s) => sum + s.duration, 0);
                const newProgress = Math.min(99, (elapsedDuration / totalDuration) * 100);
                setProgress(newProgress);

                currentStep++;

                if (currentStep === loadingSteps.length) {
                    clearInterval(intervalId);
                    // Final completion
                    setTimeout(() => {
                        setProgress(100);
                        setLoadingText("Ready to stream!");
                    }, 500);
                }
            }
        };

        intervalId = setInterval(updateProgress, loadingSteps[0].duration);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-[9999] flex items-center justify-center">
            <div className="text-center">
                {/* Logo Animation */}
                <div className="relative mb-10">
                    {/* Outer Glow */}
                    <div className="absolute inset-0 animate-pulse">
                        <div className="w-48 h-48 mx-auto bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-full blur-2xl opacity-30"></div>
                    </div>

                    {/* Main Logo Container */}
                    <div className="relative w-40 h-40 mx-auto mb-8">
                        {/* Rotating Ring */}
                        <div className="absolute inset-0 border-4 border-transparent border-t-red-500 border-r-pink-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-4 border-4 border-transparent border-b-purple-500 border-l-blue-500 rounded-full animate-spin animation-delay-1000"></div>

                        {/* Logo Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-900/50 animate-pulse-slow">
                                <span className="text-5xl font-bold text-white">M</span>
                            </div>
                        </div>

                        {/* Floating Particles */}
                        <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full animate-bounce"></div>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-pink-500 rounded-full animate-bounce animation-delay-300"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full animate-bounce animation-delay-600"></div>
                        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-bounce animation-delay-900"></div>
                    </div>

                    {/* Logo Text */}
                    <div className="mb-12">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                            MovieStream
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">Premium Streaming Experience</p>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="mb-8">
                    <p className="text-xl text-gray-300 mb-2">{loadingText}</p>
                    <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                    <div className="text-left p-3 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
                        <div className="text-green-400 text-sm font-medium mb-1">✓ 4K Quality</div>
                        <div className="text-xs text-gray-400">Ultra HD Streaming</div>
                    </div>
                    <div className="text-left p-3 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
                        <div className="text-green-400 text-sm font-medium mb-1">✓ No Ads</div>
                        <div className="text-xs text-gray-400">Uninterrupted Viewing</div>
                    </div>
                    <div className="text-left p-3 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
                        <div className="text-green-400 text-sm font-medium mb-1">✓ Multi-Device</div>
                        <div className="text-xs text-gray-400">Watch Anywhere</div>
                    </div>
                    <div className="text-left p-3 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800">
                        <div className="text-green-400 text-sm font-medium mb-1">✓ Latest Content</div>
                        <div className="text-xs text-gray-400">Daily Updates</div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-gray-600 text-sm">
                    © {new Date().getFullYear()} MovieStream. All rights reserved.
                </div>
            </div>
        </div>
    );
}