import { useEffect, useRef, useState } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600&display=swap');

  :root {
    --teal:      #00c8d4;
    --teal-dark: #007a82;
    --teal-glow: #00e5f0;
    --cyan:      #00f5ff;
    --navy:      #050d12;
    --navy-mid:  #0a1a22;
    --navy-card: #0d2230;
    --white:     #e8f8fa;
    --muted:     #4a8a95;
    --sharingan: #00c8d4;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .kamui-root {
    width: 100%;
    min-height: 100vh;
    background: var(--navy);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    font-family: 'Rajdhani', sans-serif;
  }

  .kamui-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center,
      transparent 25%,
      rgba(0,0,0,0.4) 65%,
      rgba(5,13,18,0.95) 100%
    );
    pointer-events: none;
    z-index: 1;
  }

  /* Lightning streaks */
  .lightning {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }
  .lightning-bolt {
    position: absolute;
    width: 1px;
    background: linear-gradient(180deg, transparent, var(--teal-glow), transparent);
    opacity: 0;
    animation: boltFlash 6s ease-in-out infinite;
  }
  .lightning-bolt:nth-child(1) { left: 15%; height: 40%; top: 5%;  animation-delay: 0s;   }
  .lightning-bolt:nth-child(2) { left: 75%; height: 55%; top: 0%;  animation-delay: 2.1s; }
  .lightning-bolt:nth-child(3) { left: 88%; height: 30%; top: 10%; animation-delay: 4.3s; }
  .lightning-bolt:nth-child(4) { left: 30%; height: 45%; top: 2%;  animation-delay: 1.5s; }
  @keyframes boltFlash {
    0%,90%,100% { opacity: 0; }
    91%          { opacity: 0.8; width: 2px; }
    93%          { opacity: 0.2; }
    94%          { opacity: 0.9; width: 1px; }
    96%          { opacity: 0; }
  }

  .kamui-content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ── Sharingan Eye — teal version ── */
  .eye-wrap {
    position: relative;
    width: 110px;
    height: 110px;
    margin-bottom: 2rem;
    animation: eyePulse 3s ease-in-out infinite;
  }
  @keyframes eyePulse {
    0%,100% { filter: drop-shadow(0 0 10px #00c8d488) drop-shadow(0 0 28px #00c8d444); }
    50%      { filter: drop-shadow(0 0 22px #00e5f0cc) drop-shadow(0 0 55px #00c8d477); }
  }
  .eye-svg { width: 100%; height: 100%; }

  .tomoe-group {
    transform-origin: 60px 60px;
    animation: tomeeSpin 8s linear infinite;
  }
  @keyframes tomeeSpin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .pupil-spiral {
    transform-origin: 60px 60px;
    animation: spiralPulse 2s ease-in-out infinite alternate;
  }
  @keyframes spiralPulse {
    from { transform: scale(0.9) rotate(0deg); }
    to   { transform: scale(1.05) rotate(15deg); }
  }

  /* ── ZEPHYR brand tag ── */
  .brand-tag {
    font-family: 'Orbitron', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.5em;
    color: var(--teal-dark);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
    animation: fadeUp 1s ease 0.2s both;
  }

  /* ── 404 ── */
  .four-o-four {
    font-family: 'Orbitron', monospace;
    font-size: clamp(5rem, 18vw, 11rem);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #e8f8fa 0%, #00c8d4 35%, #007a82 70%, #003a42 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: glitchIn 1s cubic-bezier(0.23, 1, 0.32, 1) both;
    position: relative;
  }

  @keyframes glitchIn {
    0%   { opacity: 0; transform: scale(1.4) rotate(-3deg); filter: blur(20px); }
    60%  { opacity: 1; transform: scale(0.97) rotate(0.5deg); filter: blur(0); }
    80%  { transform: scale(1.01); }
    100% { transform: scale(1) rotate(0); }
  }

  .four-o-four::before {
    content: '404';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #00f5ff 0%, transparent 50%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: crackFlicker 4s ease-in-out infinite;
    opacity: 0.25;
  }
  @keyframes crackFlicker {
    0%,100% { opacity: 0.2;  transform: translate(0,0);       }
    20%      { opacity: 0.45; transform: translate(-2px, 1px); }
    40%      { opacity: 0.1;  transform: translate(1px,-1px);  }
    70%      { opacity: 0.35; transform: translate(-1px, 2px); }
  }

  .subtitle {
    font-family: 'Orbitron', monospace;
    font-size: clamp(0.6rem, 2.2vw, 0.78rem);
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.6rem;
    animation: fadeUp 1.2s ease 0.4s both;
  }

  .kamui-divider {
    width: 200px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--teal), transparent);
    margin: 1.6rem auto;
    animation: fadeUp 1s ease 0.6s both;
  }

  .kamui-body {
    font-family: 'Rajdhani', sans-serif;
    font-size: clamp(0.95rem, 3vw, 1.1rem);
    font-weight: 300;
    color: #5a9aa5;
    max-width: 360px;
    line-height: 1.85;
    letter-spacing: 0.03em;
    animation: fadeUp 1s ease 0.8s both;
  }

  /* ── Glitch scan line ── */
  .scan-line {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--teal-glow), transparent);
    opacity: 0;
    animation: scanMove 5s ease-in-out infinite;
    pointer-events: none;
    z-index: 3;
  }
  @keyframes scanMove {
    0%      { top: 0%;   opacity: 0; }
    5%      { opacity: 0.4; }
    95%     { opacity: 0.2; }
    100%    { top: 100%; opacity: 0; }
  }

  /* ── CTA Button ── */
  .kamui-btn {
    margin-top: 2.2rem;
    position: relative;
    padding: 0.8rem 2.4rem;
    background: transparent;
    border: 1px solid var(--teal-dark);
    color: var(--teal-glow);
    font-family: 'Orbitron', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    cursor: pointer;
    overflow: hidden;
    transition: color 0.4s ease, border-color 0.4s ease;
    animation: fadeUp 1s ease 1s both;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .kamui-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--teal), var(--teal-dark));
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: -1;
  }
  .kamui-btn:hover { color: var(--navy); border-color: var(--teal); }
  .kamui-btn:hover::before { transform: scaleX(1); }

  /* ── Expanding rings ── */
  .ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid;
    pointer-events: none;
    animation: ringExpand 4s ease-out infinite;
    opacity: 0;
  }
  .ring:nth-child(1) { animation-delay: 0s;   border-color: #00c8d433; }
  .ring:nth-child(2) { animation-delay: 1.3s; border-color: #00f5ff22; }
  .ring:nth-child(3) { animation-delay: 2.6s; border-color: #00c8d418; }
  @keyframes ringExpand {
    0%   { width: 60px;  height: 60px;  opacity: 0.7; transform: translate(-50%,-50%); }
    100% { width: 600px; height: 600px; opacity: 0;   transform: translate(-50%,-50%); }
  }

  /* ── Orbiting text ── */
  .dimension-text {
    position: absolute;
    font-family: 'Orbitron', monospace;
    font-size: 0.5rem;
    letter-spacing: 0.5em;
    color: #00c8d418;
    text-transform: uppercase;
    pointer-events: none;
    white-space: nowrap;
    animation: orbitText 20s linear infinite;
    transform-origin: center;
  }
  @keyframes orbitText {
    from { transform: rotate(0deg) translateX(210px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(210px) rotate(-360deg); }
  }

  /* ── Corner brackets ── */
  .corner {
    position: absolute;
    width: 18px;
    height: 18px;
    border-color: var(--teal-dark);
    border-style: solid;
    opacity: 0.5;
  }
  .corner-tl { top: 12px; left: 12px;  border-width: 2px 0 0 2px; }
  .corner-tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; }
  .corner-bl { bottom: 12px; left: 12px;  border-width: 0 0 2px 2px; }
  .corner-br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; }

  /* ── Error code tag ── */
  .error-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(0,200,212,0.08);
    border: 1px solid rgba(0,200,212,0.2);
    padding: 4px 12px;
    margin-bottom: 1.5rem;
    animation: fadeUp 1s ease 1.1s both;
  }
  .error-tag-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--teal);
    animation: dotBlink 1.5s ease-in-out infinite;
  }
  @keyframes dotBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .error-tag-text {
    font-family: 'Orbitron', monospace;
    font-size: 0.55rem;
    letter-spacing: 0.25em;
    color: var(--teal);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Teal Sharingan Eye ── */
function SharinganEye() {
  return (
    <svg className="eye-svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00c8d4" stopOpacity="1" />
          <stop offset="55%"  stopColor="#007a82" stopOpacity="1" />
          <stop offset="100%" stopColor="#002a30" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="pupilGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#000d0f" />
          <stop offset="100%" stopColor="#001a1e" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#050d12" />
      <circle cx="60" cy="60" r="46" fill="url(#irisGrad)" filter="url(#glow)" />
      <circle cx="60" cy="60" r="30" fill="none" stroke="#00c8d415" strokeWidth="2" />
      <g className="tomoe-group" filter="url(#glow)">
        {[0, 120, 240].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 60 60)`}>
            <ellipse cx="60" cy="32" rx="7" ry="10" fill="#000d0f" />
            <circle  cx="60" cy="20" r="5.5"         fill="#000d0f" />
          </g>
        ))}
      </g>
      <g className="pupil-spiral">
        <circle cx="60" cy="60" r="16" fill="url(#pupilGrad)" />
        <path d="M60 52 Q68 56 60 60 Q52 64 60 68" fill="none" stroke="#00c8d430" strokeWidth="1.5" />
        <path d="M52 60 Q56 52 60 60 Q64 68 68 60" fill="none" stroke="#00c8d430" strokeWidth="1.5" />
      </g>
      <circle cx="60" cy="60" r="57" fill="none" stroke="#00c8d425" strokeWidth="2" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="#00c8d455" strokeWidth="0.5" />
    </svg>
  );
}

/* ── Canvas — teal spiral warp ── */
function KamuiCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const { width: W, height: H } = canvas;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.52;

      // Spiral arms
      for (let arm = 0; arm < 6; arm++) {
        const armAngle = (arm / 6) * Math.PI * 2;
        ctx.beginPath();
        for (let i = 0; i <= 300; i++) {
          const pct   = i / 300;
          const r     = pct * maxR;
          const twist = pct * Math.PI * 5 + t * 0.4 + armAngle;
          const x     = cx + r * Math.cos(twist);
          const y     = cy + r * Math.sin(twist);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const alpha = 0.05 + 0.04 * Math.sin(t + arm);
        ctx.strokeStyle = `rgba(0, 200, 212, ${alpha})`;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
      }

      // Concentric rings
      for (let ring = 1; ring <= 8; ring++) {
        const r     = (ring / 8) * maxR;
        const phase = t * 0.25 + ring * 0.4;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.04) {
          const wobble = 1 + 0.025 * Math.sin(a * 6 + phase);
          const x = cx + r * wobble * Math.cos(a);
          const y = cy + r * wobble * Math.sin(a);
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        const alpha = (0.03 + 0.02 * Math.sin(t * 0.5 + ring)) * (1 - ring / 10);
        ctx.strokeStyle = `rgba(0, 229, 240, ${alpha})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }

      // Radial rays
      for (let r = 0; r < 24; r++) {
        const angle = (r / 24) * Math.PI * 2 + t * 0.08;
        const len   = maxR * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.3 + r * 0.5)));
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + len * Math.cos(angle), cy + len * Math.sin(angle));
        ctx.strokeStyle = `rgba(0, 200, 212, ${0.012 + 0.008 * Math.abs(Math.sin(t * 0.5 + r))})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }

      // Floating particles
      for (let p = 0; p < 40; p++) {
        const angle = ((p * 2.4 + t * (0.1 + (p % 5) * 0.04)) % (Math.PI * 2));
        const r     = maxR * (0.15 + 0.75 * ((p * 0.618 + t * 0.02 * (p % 3 + 1)) % 1));
        const x     = cx + r * Math.cos(angle);
        const y     = cy + r * Math.sin(angle);
        const size  = 0.8 + (p % 4) * 0.5;
        const alpha = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.3 + p));
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = p % 3 === 0
          ? `rgba(0, 245, 255, ${alpha})`
          : `rgba(0, 200, 212, ${alpha})`;
        ctx.fill();
      }

      // Electric grid lines (subtle, matches website lightning feel)
      ctx.save();
      ctx.globalAlpha = 0.025 + 0.01 * Math.sin(t * 0.7);
      for (let gx = 0; gx < W; gx += 60) {
        ctx.beginPath();
        ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
        ctx.strokeStyle = '#00c8d4';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 60) {
        ctx.beginPath();
        ctx.moveTo(0, gy); ctx.lineTo(W, gy);
        ctx.strokeStyle = '#00c8d4';
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
      ctx.restore();

      t += 0.018;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="kamui-canvas" />;
}

/* ── Main Component ── */
const NotFound = () => {
  const [warping, setWarping] = useState(false);

  const handleReturn = () => {
    setWarping(true);
    setTimeout(() => { window.location.href = "/"; }, 800);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div
        className="kamui-root"
        style={{
          transition: warping ? "opacity 0.8s ease, transform 0.8s ease" : "none",
          opacity:    warping ? 0 : 1,
          transform:  warping ? "scale(0.1) rotate(720deg)" : "scale(1)",
        }}
      >
        <KamuiCanvas />
        <div className="vignette" />
        <div className="scan-line" />

        {/* Lightning bolts */}
        <div className="lightning">
          <div className="lightning-bolt" />
          <div className="lightning-bolt" />
          <div className="lightning-bolt" />
          <div className="lightning-bolt" />
        </div>

        {/* Corner brackets */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Expanding rings */}
        <div style={{ position:"absolute", top:"50%", left:"50%", zIndex:2, pointerEvents:"none" }}>
          <div className="ring" />
          <div className="ring" />
          <div className="ring" />
        </div>

        {/* Orbiting text */}
        <div style={{ position:"absolute", top:"50%", left:"50%", zIndex:2, pointerEvents:"none" }}>
          <span className="dimension-text">KAMUI · DIMENSIONAL VOID · 次元の彼方 · ZEPHYR SYSTEMS</span>
        </div>

        {/* Content */}
        <div className="kamui-content">
          <div className="brand-tag">Zephyr · System Error</div>

          <div className="eye-wrap">
            <SharinganEye />
          </div>

          <div className="error-tag">
            <div className="error-tag-dot" />
            <span className="error-tag-text">HTTP 404 · PAGE NOT FOUND</span>
          </div>

          <div className="four-o-four">404</div>
          <p className="subtitle">Dimensional Rift Detected</p>

          <div className="kamui-divider" />

          <p className="kamui-body">
            This page has been pulled into another dimension.<br />
            Even Kamui cannot retrieve what no longer exists.
          </p>

          <button className="kamui-btn" onClick={handleReturn}>
            ← Return to Reality
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;