import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  mood?: 'happy' | 'thinking' | 'excited' | 'wave' | 'sad';
  type?: 'robot' | 'beaker' | 'plant' | 'gerbil';
}

type Mascot = NonNullable<MascotProps['type']>;
const MASCOTS: readonly Mascot[] = ['robot', 'beaker', 'plant', 'gerbil'];

/** The mascot saved in Settings, or the robot if none is saved (or storage is blocked). */
const storedMascot = (): Mascot => {
  try {
    const saved = localStorage.getItem('sp_mascot');
    return MASCOTS.find(m => m === saved) ?? 'robot';
  } catch {
    return 'robot';
  }
};

export const ScienceBuddyMascot: React.FC<MascotProps> = ({ 
  className = '', 
  size = 120, 
  mood = 'happy',
  type = storedMascot()
}) => {
  return (
    <div className={`relative inline-block transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`} style={{ width: size, height: size }}>
      {/* CSS Keyframes for custom SVG animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes mascot-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          93%, 97% { transform: scaleY(0.1); }
        }
        @keyframes mascot-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes mascot-pulse {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 2px rgba(56, 189, 248, 0.4)); }
          50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.8)); }
        }
        @keyframes mascot-wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-20deg); }
        }
        @keyframes heart-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        
        /* Beaker Buddy Animations */
        @keyframes beaker-bubble-rise {
          0% { transform: translateY(0px) scale(0.6); opacity: 0; }
          20% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-45px) scale(1.2); opacity: 0; }
        }
        @keyframes beaker-slosh {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(3deg); }
        }
        
        /* Happy Plant Animations */
        @keyframes plant-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes leaf-left-wobble {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-10deg); }
        }
        @keyframes leaf-right-wobble {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        
        /* Cool Gerbil Animations */
        @keyframes gerbil-ear-wiggle {
          0%, 90%, 100% { transform: rotate(0deg); }
          93%, 97% { transform: rotate(12deg); }
        }
        @keyframes gerbil-whisker-twitch-l {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
        }
        @keyframes gerbil-whisker-twitch-r {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(6deg); }
        }
        
        .mascot-head-group {
          animation: mascot-bob 4s ease-in-out infinite;
        }
        .mascot-eye-l, .mascot-eye-r {
          animation: mascot-blink 4.5s infinite;
          transform-origin: center;
        }
        .mascot-eye-r {
          animation-delay: 0.2s;
        }
        .mascot-glow-element {
          animation: mascot-pulse 2s infinite;
        }
        .mascot-wave-arm {
          transform-origin: 65px 120px;
          transition: transform 0.3s ease;
        }
        .relative:hover .mascot-wave-arm {
          animation: mascot-wave 1.5s ease-in-out infinite;
        }
        .mascot-heart {
          animation: heart-beat 1.8s infinite;
          transform-origin: 100px 135px;
        }
        
        /* Animation classes for new companions */
        .beaker-liquid-group {
          animation: beaker-slosh 4s ease-in-out infinite;
          transform-origin: 100px 170px;
        }
        .beaker-bubble-1 {
          animation: beaker-bubble-rise 2.8s infinite ease-in;
          transform-origin: 100px 120px;
        }
        .beaker-bubble-2 {
          animation: beaker-bubble-rise 3.2s infinite ease-in;
          animation-delay: 0.7s;
          transform-origin: 90px 120px;
        }
        .beaker-bubble-3 {
          animation: beaker-bubble-rise 2.5s infinite ease-in;
          animation-delay: 1.5s;
          transform-origin: 110px 120px;
        }
        
        .plant-sway-element {
          animation: plant-sway 4.5s ease-in-out infinite;
          transform-origin: 100px 120px;
        }
        .plant-leaf-l {
          animation: leaf-left-wobble 3.5s ease-in-out infinite;
          transform-origin: 98px 90px;
        }
        .plant-leaf-r {
          animation: leaf-right-wobble 3.5s ease-in-out infinite;
          transform-origin: 100px 80px;
        }
        
        .gerbil-whisker-l-group {
          animation: gerbil-whisker-twitch-l 2.5s ease-in-out infinite;
          transform-origin: 82px 103px;
        }
        .gerbil-whisker-r-group {
          animation: gerbil-whisker-twitch-r 2.5s ease-in-out infinite;
          transform-origin: 118px 103px;
        }
      `}} />

      {/* ── CONDITIONAL RENDER BY MASCOT TYPE ── */}
      {type === 'beaker' && (
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <defs>
            <linearGradient id="beakerFluid" x1="60" y1="90" x2="140" y2="175" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6D28D9" />
            </linearGradient>
            <linearGradient id="glassRim" x1="85" y1="55" x2="115" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.5" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="188" rx="45" ry="8" fill="rgba(15, 23, 42, 0.15)" className="dark:fill-[rgba(0,0,0,0.4)]" />

          {/* Bubbles rising outside beaker */}
          <circle cx="100" cy="90" r="5" fill="#C084FC" className="beaker-bubble-1" filter="url(#neonGlow)" />
          <circle cx="92" cy="100" r="4" fill="#A78BFA" className="beaker-bubble-2" filter="url(#neonGlow)" />
          <circle cx="108" cy="95" r="3" fill="#D8B4FE" className="beaker-bubble-3" filter="url(#neonGlow)" />

          {/* Fluid inside beaker */}
          <g className="beaker-liquid-group">
            <path d="M 87 95 L 145 160 A 10 10 0 0 1 137 171 L 63 171 A 10 10 0 0 1 55 160 L 87 95 Z" fill="url(#beakerFluid)" />
            {/* Top sloshing liquid ellipse */}
            <ellipse cx="100" cy="97" rx="14" ry="4" fill="#D8B4FE" />
          </g>

          {/* Beaker Glass Body */}
          <path d="M 85 60 L 115 60 L 115 90 L 155 160 A 12 12 0 0 1 145 175 L 55 175 A 12 12 0 0 1 45 160 L 85 90 Z" 
            stroke="#CBD5E1" strokeWidth="4.5" fill="rgba(255, 255, 255, 0.12)" strokeLinejoin="round" className="dark:stroke-[#475569] dark:fill-[rgba(255,255,255,0.05)]" />
          
          {/* Glass Lip at top */}
          <rect x="80" y="54" width="40" height="7" rx="3.5" fill="url(#glassRim)" stroke="#CBD5E1" strokeWidth="2.5" className="dark:stroke-[#475569]" />

          {/* Beaker Measurement Marks */}
          <line x1="72" y1="140" x2="84" y2="140" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="78" y1="125" x2="88" y2="125" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <line x1="84" y1="110" x2="92" y2="110" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

          {/* Face on the beaker (mapped onto the fluid center) */}
          <g filter="url(#neonGlow)">
            {/* Blushes */}
            <circle cx="76" cy="138" r="6" fill="#F472B6" opacity="0.4" />
            <circle cx="124" cy="138" r="6" fill="#F472B6" opacity="0.4" />

            {/* Eyes based on mood */}
            {mood === 'happy' ? (
              <>
                <path d="M 80 134 Q 85 128 90 134" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M 110 134 Q 115 128 120 134" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <line x1="80" y1="131" x2="90" y2="133" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="mascot-eye-l" />
                <line x1="110" y1="133" x2="120" y2="129" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" className="mascot-eye-r" />
              </>
            ) : mood === 'sad' ? (
              <>
                <path d="M 80 135 Q 85 141 90 135" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M 110 135 Q 115 141 120 135" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : (
              <>
                <circle cx="85" cy="133" r="4.5" fill="#FFFFFF" className="mascot-eye-l" />
                <circle cx="115" cy="133" r="4.5" fill="#FFFFFF" className="mascot-eye-r" />
              </>
            )}

            {/* Mouth */}
            {mood === 'sad' ? (
              <path d="M 94 147 Q 100 142 106 147" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M 94 144 Q 100 150 106 144" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>
        </svg>
      )}

      {type === 'plant' && (
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <defs>
            <linearGradient id="potGrad" x1="66" y1="130" x2="126" y2="185" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="188" rx="45" ry="8" fill="rgba(15, 23, 42, 0.15)" className="dark:fill-[rgba(0,0,0,0.4)]" />

          {/* Waving plant leaves and stem */}
          <g className="plant-sway-element">
            {/* Stem */}
            <path d="M 100 125 Q 93 90 102 65" stroke="#22C55E" strokeWidth="7" strokeLinecap="round" fill="none" />
            
            {/* Top flower/sprout leaf */}
            <path d="M 102 65 C 102 48 94 38 102 28 C 110 38 102 48 102 65 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" />

            {/* Left Leaf */}
            <path d="M 97 93 C 78 88 70 98 62 91 C 72 106 88 101 97 93 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" className="plant-leaf-l" />

            {/* Right Leaf */}
            <path d="M 100 83 C 120 78 128 88 136 81 C 126 96 110 91 100 83 Z" fill="#4ADE80" stroke="#15803D" strokeWidth="1.5" className="plant-leaf-r" />
          </g>

          {/* Soil Layer */}
          <ellipse cx="100" cy="122" rx="36" ry="5" fill="#78350F" />

          {/* Terracotta flower pot base */}
          <path d="M 66 130 L 134 130 L 126 178 A 8 8 0 0 1 118 185 L 82 185 A 8 8 0 0 1 74 178 Z" fill="url(#potGrad)" stroke="#C2410C" strokeWidth="2.5" />
          
          {/* Pot Rim */}
          <rect x="58" y="117" width="84" height="13" rx="4" fill="#FB923C" stroke="#C2410C" strokeWidth="2.5" />

          {/* Face on the pot */}
          <g filter="url(#neonGlow)">
            {/* Rosy cheeks */}
            <circle cx="80" cy="154" r="5" fill="#FDA4AF" opacity="0.8" />
            <circle cx="120" cy="154" r="5" fill="#FDA4AF" opacity="0.8" />

            {/* Eyes based on mood */}
            {mood === 'happy' ? (
              <>
                <path d="M 83 148 Q 88 142 93 148" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 107 148 Q 112 142 117 148" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <line x1="83" y1="145" x2="93" y2="147" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
                <line x1="107" y1="147" x2="117" y2="143" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : mood === 'sad' ? (
              <>
                <path d="M 83 150 Q 88 156 93 150" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M 107 150 Q 112 156 117 150" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                <circle cx="88" cy="147" r="4" fill="#7C2D12" />
                <circle cx="112" cy="147" r="4" fill="#7C2D12" />
              </>
            )}

            {/* Cute Smile */}
            {mood === 'sad' ? (
              <path d="M 96 161 Q 100 157 104 161" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : (
              <path d="M 95 158 Q 100 164 105 158" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}
          </g>
        </svg>
      )}

      {type === 'gerbil' && (
        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
          <defs>
            <linearGradient id="gerbilFur" x1="60" y1="80" x2="140" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow */}
          <ellipse cx="100" cy="188" rx="45" ry="8" fill="rgba(15, 23, 42, 0.15)" className="dark:fill-[rgba(0,0,0,0.4)]" />

          {/* Gerbil Ears */}
          <g style={{ animation: 'gerbil-ear-wiggle 5s infinite' }}>
            {/* Left Ear */}
            <ellipse cx="70" cy="68" rx="13" ry="17" fill="#F59E0B" stroke="#D97706" strokeWidth="2" transform="rotate(-15 70 68)" />
            <ellipse cx="70" cy="68" rx="7" ry="11" fill="#FDA4AF" transform="rotate(-15 70 68)" />

            {/* Right Ear */}
            <ellipse cx="130" cy="68" rx="13" ry="17" fill="#F59E0B" stroke="#D97706" strokeWidth="2" transform="rotate(15 130 68)" />
            <ellipse cx="130" cy="68" rx="7" ry="11" fill="#FDA4AF" transform="rotate(15 130 68)" />
          </g>

          {/* Fluffy Gerbil Body */}
          <ellipse cx="100" cy="142" rx="48" ry="40" fill="url(#gerbilFur)" stroke="#B45309" strokeWidth="2" />
          
          {/* Fluffy white belly */}
          <ellipse cx="100" cy="148" rx="28" ry="22" fill="#FFFFFF" />

          {/* Adorable little feet */}
          <ellipse cx="72" cy="182" rx="10" ry="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
          <ellipse cx="128" cy="182" rx="10" ry="6" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />

          {/* Tiny scientific bowtie */}
          <g>
            <path d="M 88 123 L 100 131 L 88 139 Z" fill="#6366F1" stroke="#4338CA" strokeWidth="1" />
            <path d="M 112 123 L 100 131 L 112 139 Z" fill="#6366F1" stroke="#4338CA" strokeWidth="1" />
            <circle cx="100" cy="131" r="5.5" fill="#4F46E5" stroke="#312E81" strokeWidth="1" />
          </g>

          {/* Gerbil Head */}
          <ellipse cx="100" cy="98" rx="43" ry="34" fill="url(#gerbilFur)" stroke="#B45309" strokeWidth="2" />

          {/* Rose blush spots */}
          <circle cx="74" cy="108" r="5" fill="#FDA4AF" opacity="0.8" />
          <circle cx="126" cy="108" r="5" fill="#FDA4AF" opacity="0.8" />

          {/* Whiskers */}
          <g className="gerbil-whisker-l-group">
            <line x1="82" y1="103" x2="62" y2="100" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="106" x2="60" y2="107" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          <g className="gerbil-whisker-r-group">
            <line x1="118" y1="103" x2="138" y2="100" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="118" y1="106" x2="140" y2="107" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Cute Nose */}
          <polygon points="97,100 103,100 100,104" fill="#FDA4AF" stroke="#E11D48" strokeWidth="0.5" />
          
          {/* Gerbil Mouth */}
          <path d="M 94 108 Q 97 111 100 108 Q 103 111 106 108" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Glasses Frame (Cool Gerbil look!) */}
          <circle cx="78" cy="92" r="14" stroke="#1E293B" strokeWidth="3" fill="none" />
          <circle cx="122" cy="92" r="14" stroke="#1E293B" strokeWidth="3" fill="none" />
          <path d="M 92 92 L 108 92" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 64 92 L 58 90" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 136 92 L 142 90" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />

          {/* Glowing blue LED eyes under glasses */}
          <g filter="url(#neonGlow)">
            {mood === 'happy' ? (
              <>
                <path d="M 72 95 Q 78 88 84 95" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M 116 95 Q 122 88 128 95" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : mood === 'thinking' ? (
              <>
                <line x1="72" y1="91" x2="84" y2="93" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" className="mascot-eye-l" />
                <line x1="116" y1="93" x2="128" y2="89" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" className="mascot-eye-r" />
              </>
            ) : mood === 'sad' ? (
              <>
                <path d="M 72 96 Q 78 102 84 96" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M 116 96 Q 122 102 128 96" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : (
              <>
                <circle cx="78" cy="91" r="5" fill="#38BDF8" className="mascot-eye-l" />
                <circle cx="78" cy="91" r="1.5" fill="#FFFFFF" />
                <circle cx="122" cy="91" r="5" fill="#38BDF8" className="mascot-eye-r" />
                <circle cx="122" cy="91" r="1.5" fill="#FFFFFF" />
              </>
            )}
          </g>
        </svg>
      )}

      {type === 'robot' && (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          {/* Metallic/Plastic body gradients */}
          <linearGradient id="bodyGrad" x1="60" y1="100" x2="140" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          
          <linearGradient id="metalGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E2E8F0" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="darkMetal" x1="80" y1="30" x2="120" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Glowing screen gradient */}
          <linearGradient id="screenGrad" x1="65" y1="65" x2="135" y2="115" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>

          {/* Glow effects */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── GROUND SHADOW ── */}
        <ellipse cx="100" cy="188" rx="45" ry="8" fill="rgba(15, 23, 42, 0.15)" className="dark:fill-[rgba(0,0,0,0.4)]" />

        {/* ── ROBOT BODY (BACK ARMS & LEGS) ── */}
        {/* Left Arm (Behind) */}
        <path d="M50 120 C35 125 35 145 45 150 C52 153 58 145 55 138" stroke="url(#metalGrad)" strokeWidth="10" strokeLinecap="round" />
        {/* Left Leg */}
        <rect x="75" y="165" width="16" height="20" rx="8" fill="url(#darkMetal)" />
        <ellipse cx="83" cy="183" rx="14" ry="7" fill="url(#metalGrad)" />
        <circle cx="83" cy="180" r="4" fill="#38BDF8" className="mascot-glow-element" />

        {/* Right Leg */}
        <rect x="109" y="165" width="16" height="20" rx="8" fill="url(#darkMetal)" />
        <ellipse cx="117" cy="183" rx="14" ry="7" fill="url(#metalGrad)" />
        <circle cx="117" cy="180" r="4" fill="#38BDF8" className="mascot-glow-element" />

        {/* ── ROBOT MAIN TORSO ── */}
        <rect x="60" y="110" width="80" height="62" rx="20" fill="url(#bodyGrad)" stroke="url(#metalGrad)" strokeWidth="2.5" />
        
        {/* Torso Screen (Science readout) */}
        <rect x="72" y="122" width="56" height="38" rx="8" fill="#090D16" stroke="#4338CA" strokeWidth="1.5" />
        
        {/* Pulsing heart / energy core on screen */}
        <path d="M100 142 C97 138 92 138 90 141 C88 144 92 149 100 152 C108 149 112 144 110 141 C108 138 103 138 100 142 Z" 
          fill="#FB7185" 
          className="mascot-heart"
          filter="url(#neonGlow)"
        />
        
        {/* Small screen grid accents */}
        <line x1="76" y1="128" x2="84" y2="128" stroke="#1E293B" strokeWidth="1" />
        <line x1="76" y1="133" x2="88" y2="133" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 1" />
        <circle cx="120" cy="129" r="2.5" fill="#4ADE80" className="mascot-glow-element" />

        {/* ── ROBOT HEAD GROUP (Animated bobbing) ── */}
        <g className="mascot-head-group">
          {/* Neck connection */}
          <rect x="91" y="96" width="18" height="18" rx="4" fill="url(#darkMetal)" />
          <line x1="94" y1="102" x2="106" y2="102" stroke="#334155" strokeWidth="2.5" />
          <line x1="94" y1="108" x2="106" y2="108" stroke="#334155" strokeWidth="2.5" />

          {/* Antenna */}
          <rect x="97" y="32" width="6" height="24" fill="url(#metalGrad)" />
          {/* Pulsing glowing head light */}
          <circle cx="100" cy="26" r="8" fill="#38BDF8" className="mascot-glow-element" />
          <circle cx="100" cy="26" r="3" fill="#FFFFFF" />

          {/* Outer metallic head structure */}
          <rect x="52" y="48" width="96" height="56" rx="24" fill="url(#metalGrad)" stroke="#64748B" strokeWidth="1.5" />
          
          {/* Glossy Head Screen visor */}
          <rect x="58" y="54" width="84" height="44" rx="18" fill="url(#screenGrad)" stroke="#1E293B" strokeWidth="2" />

          {/* Glowing blue LED eyes (with blink animation) */}
          <g filter="url(#neonGlow)">
            {mood === 'happy' ? (
              <>
                {/* Curved happy arc eyes */}
                <path d="M72 78 Q80 70 88 78" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M112 78 Q120 70 128 78" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : mood === 'thinking' ? (
              <>
                {/* Puzzled flat/slant eyes */}
                <line x1="72" y1="74" x2="88" y2="76" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" className="mascot-eye-l" />
                <line x1="112" y1="76" x2="128" y2="70" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" className="mascot-eye-r" />
              </>
            ) : mood === 'sad' ? (
              <>
                {/* Curved down sad arc eyes */}
                <path d="M72 80 Q80 72 88 80" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" className="mascot-eye-l" />
                <path d="M112 80 Q120 72 128 80" stroke="#38BDF8" strokeWidth="4.5" strokeLinecap="round" fill="none" className="mascot-eye-r" />
              </>
            ) : (
              <>
                {/* Circular excited glowing eyes */}
                <circle cx="80" cy="75" r="7" fill="#38BDF8" className="mascot-eye-l" />
                <circle cx="80" cy="75" r="2.5" fill="#FFFFFF" />
                <circle cx="120" cy="75" r="7" fill="#38BDF8" className="mascot-eye-r" />
                <circle cx="120" cy="75" r="2.5" fill="#FFFFFF" />
              </>
            )}

            {/* Glowing cute mouth */}
            {mood === 'sad' ? (
              <path d="M93 90 Q100 84 107 90" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-glow-element" />
            ) : (
              <path d="M93 86 Q100 92 107 86" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" className="mascot-glow-element" />
            )}
          </g>

          {/* Visor shine overlay */}
          <path d="M64 58 L136 58 C130 55 70 55 64 58 Z" fill="rgba(255, 255, 255, 0.15)" />
        </g>

        {/* ── ROBOT FOREARMS (Front of body) ── */}
        {/* Right Arm (Waving arm) */}
        <g className="mascot-wave-arm">
          <path d="M142 120 C162 122 178 110 178 95 C178 88 170 88 165 92" stroke="url(#metalGrad)" strokeWidth="10" strokeLinecap="round" />
          {/* Glowing core in hand */}
          <circle cx="178" cy="95" r="3.5" fill="#38BDF8" className="mascot-glow-element" />
        </g>
      </svg>
      )}
    </div>
  );
};
