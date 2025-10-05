import React, { useState, useEffect } from 'react';

const loadingPhrases = [
  "Architecting your project's neural pathways...",
  "Synthesizing AI-powered insights from your vision...",
  "Deploying quantum task orchestration algorithms...",
  "Mapping interdimensional project dependencies...",
  "Crystallizing your goals into executable brilliance...",
  "Engaging hyperdrive momentum analytics...",
  "Weaving strategic threads through the project matrix...",
  "Activating sentient milestone detection systems...",
  "Harmonizing chaos into structured excellence...",
  "Infusing your project with predictive intelligence...",
  "Conjuring AI companions for your journey ahead...",
  "Transmuting ideas into trackable reality...",
  "Calibrating success probability matrices...",
  "Initializing adaptive progress forecasting...",
  "Unlocking the infinite potential of your vision..."
];

interface AILoadingOverlayProps {
  isVisible: boolean;
}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ isVisible }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 3000); // Change phrase every 3 seconds

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    // Reset to first phrase when overlay becomes visible
    if (isVisible) {
      setCurrentPhraseIndex(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Glassmorphism Card */}
      <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 max-w-2xl mx-4 animate-scaleIn">
        {/* Gradient Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          {/* Animated Icon */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 animate-spin-slow">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="2"
                  strokeDasharray="70 200"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            {/* Inner pulsing circle */}
            <div className="relative flex items-center justify-center w-32 h-32">
              <div className="absolute w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-pulse opacity-50"></div>
              <svg className="w-16 h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center space-y-4 min-h-[100px] flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-white">AI Processing Your Project</h3>
            
            {/* Animated Phrase */}
            <p className="text-lg text-purple-200 font-medium max-w-lg transition-all duration-500 animate-fadeIn" key={currentPhraseIndex}>
              {loadingPhrases[currentPhraseIndex]}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>

          {/* Subtle hint */}
          <p className="text-sm text-purple-300/70 italic">
            This usually takes just a few seconds...
          </p>
        </div>
      </div>

      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
