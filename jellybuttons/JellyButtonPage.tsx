import React, { useRef, useEffect, useState } from "react";

const BALLS = [
  {
    label: "Who",
    href: "/who",
    color: "#1071fe",
  },
  {
    label: "NrutHolders",
    href: "/nrutholders",
    color: "#1b6ef3",
  },
  {
    label: "Creatives",
    href: "/creatives",
    color: "#009cff",
  },
  {
    label: "Contact",
    href: "/contact",
    color: "#0e3d7c",
  },
];

// Simple spring physics for jellyball animation
function useSpring(
  target: { x: number; y: number },
  stiffness = 0.12,
  damping = 0.8
) {
  const [pos, setPos] = useState(target);
  const vel = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let id: number;
    function animate() {
      vel.current.x =
        vel.current.x * damping + (target.x - pos.x) * stiffness;
      vel.current.y =
        vel.current.y * damping + (target.y - pos.y) * stiffness;
      setPos((p) => ({
        x: p.x + vel.current.x,
        y: p.y + vel.current.y,
      }));
      id = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(id);
  }, [target.x, target.y, stiffness, damping]);
  return pos;
}

// JellyBall component
function JellyBall({
  label,
  color,
  href,
  idx,
  mouse,
}: {
  label: string;
  color: string;
  href: string;
  idx: number;
  mouse: { x: number; y: number };
}) {
  // Radiate balls in a circle
  const radius = 160;
  const angle = (Math.PI * 2 * idx) / BALLS.length;
  const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const base = {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };

  // When mouse is close, push ball away slightly for bounce
  const dist =
    Math.sqrt(
      (mouse.x - base.x) ** 2 + (mouse.y - base.y) ** 2
    ) || 1;
  const repel =
    dist < 120
      ? {
          x: base.x + (base.x - mouse.x) * (120 - dist) * 0.015,
          y: base.y + (base.y - mouse.y) * (120 - dist) * 0.015,
        }
      : base;

  // Spring to position
  const pos = useSpring(repel, 0.18, 0.72);

  return (
    <a
      href={href}
      className="jellyball"
      style={{
        position: "absolute",
        left: pos.x - 60,
        top: pos.y - 60,
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: color,
        boxShadow:
          "0 8px 32px 0 rgba(16,113,254,0.12), 0 2px 6px 0 rgba(16,113,254,0.14)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: 22,
        textDecoration: "none",
        transition: "filter 0.2s",
        filter: dist < 120 ? "brightness(1.15) drop-shadow(0 0 20px #1071fe88)" : "",
        zIndex: 3,
        userSelect: "none",
        cursor: "pointer",
      }}
      tabIndex={0}
      aria-label={label}
    >
      <span
        style={{
          pointerEvents: "none",
          fontFamily: "inherit",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </a>
  );
}

// Canvas background: blue trails following mouse
function MouseTracks({ mouse }: { mouse: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tracks, setTracks] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    setTracks((prev) => [
      ...prev.slice(-30),
      { x: mouse.x, y: mouse.y },
    ]);
  }, [mouse.x, mouse.y]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 1; i < tracks.length; i++) {
      ctx.strokeStyle = "#1071fe";
      ctx.globalAlpha = 0.13 + 0.12 * (i / tracks.length);
      ctx.lineWidth = 16 - 0.3 * (tracks.length - i);
      ctx.beginPath();
      ctx.moveTo(tracks[i - 1].x, tracks[i - 1].y);
      ctx.lineTo(tracks[i].x, tracks[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [tracks]);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
      aria-hidden
    />
  );
}

// Main interactive page
export default function JellyLandingPage() {
  const [mouse, setMouse] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    function handle(e: MouseEvent) {
      setMouse({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  // Responsive center (recalculate on resize)
  useEffect(() => {
    function handleResize() {
      setMouse({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', 'OkaySerif', sans-serif",
      }}
    >
      <MouseTracks mouse={mouse} />
      {/* Jellyballs */}
      {BALLS.map((b, i) => (
        <JellyBall
          key={b.label}
          label={b.label}
          color={b.color}
          href={b.href}
          idx={i}
          mouse={mouse}
        />
      ))}
      {/* Center Logo/text */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 2,
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <img src="/logo.svg" alt="Nrutseab Logo" style={{ height: 70, marginBottom: 12, opacity: 0.2 }} />
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#1071fe",
            letterSpacing: "0.02em",
            marginBottom: 8,
            fontFamily: "inherit",
          }}
        >
          Nrutseab
        </h1>
        <p
          style={{
            color: "#193659",
            fontWeight: 400,
            fontSize: 18,
            opacity: 0.8,
            marginBottom: 0,
          }}
        >
          Choose your collective.<br />Bounce in, bounce out.
        </p>
      </div>
    </div>
  );
}
