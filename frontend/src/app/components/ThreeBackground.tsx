import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityDir: number;
}

interface Orb {
  x: number;
  y: number;
  radius: number;
  phase: number;
  speed: number;
}

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const orbsRef = useRef<Orb[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const count = 180;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      size: Math.random() * 1.6 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      opacityDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // Initialize glowing orbs
    orbsRef.current = [
      { x: 0.78, y: 0.22, radius: 260, phase: 0, speed: 0.4 },
      { x: 0.18, y: 0.72, radius: 220, phase: 1.8, speed: 0.3 },
      { x: 0.55, y: 0.85, radius: 180, phase: 3.5, speed: 0.5 },
    ];

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      timeRef.current += 0.008;
      const t = timeRef.current;

      // Clear with dark background
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#060B18";
      ctx.fillRect(0, 0, W, H);

      // Draw grid lines (perspective grid)
      ctx.save();
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = "#4A7C9E";
      ctx.lineWidth = 0.8;
      const gridSpacing = 80;
      const vanishX = W / 2;
      const vanishY = H * 0.6;
      // Horizontal grid lines
      for (let row = 0; row <= 12; row++) {
        const y = vanishY + row * gridSpacing * 0.7;
        if (y > H) break;
        const spread = ((y - vanishY) / (H - vanishY)) * W * 1.5;
        ctx.beginPath();
        ctx.moveTo(vanishX - spread / 2, y);
        ctx.lineTo(vanishX + spread / 2, y);
        ctx.stroke();
      }
      // Vertical grid lines converging
      for (let col = -10; col <= 10; col++) {
        const xBottom = vanishX + col * 90;
        ctx.beginPath();
        ctx.moveTo(vanishX, vanishY);
        ctx.lineTo(xBottom, H);
        ctx.stroke();
      }
      ctx.restore();

      // Draw glowing orbs
      orbsRef.current.forEach((orb) => {
        const pulse = Math.sin(t * orb.speed + orb.phase);
        const r = orb.radius * (1 + pulse * 0.08);
        const cx = orb.x * W + Math.cos(t * orb.speed * 0.4 + orb.phase) * 30;
        const cy = orb.y * H + Math.sin(t * orb.speed * 0.3 + orb.phase) * 20;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, `rgba(201,168,76,${0.045 + pulse * 0.015})`);
        grd.addColorStop(0.5, `rgba(201,168,76,${0.02 + pulse * 0.008})`);
        grd.addColorStop(1, "rgba(201,168,76,0)");
        ctx.save();
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw wireframe shapes (simple rotating outlines)
      const shapes = [
        { cx: W * 0.82, cy: H * 0.2, type: "hex", size: 60, rotOffset: 0 },
        { cx: W * 0.12, cy: H * 0.55, type: "tri", size: 50, rotOffset: 1.2 },
        { cx: W * 0.75, cy: H * 0.75, type: "hex", size: 40, rotOffset: 2.4 },
        { cx: W * 0.35, cy: H * 0.15, type: "diamond", size: 35, rotOffset: 0.8 },
      ];

      shapes.forEach((shape) => {
        const rot = t * 0.25 + shape.rotOffset;
        const floatY = Math.sin(t * 0.4 + shape.rotOffset) * 10;
        ctx.save();
        ctx.translate(shape.cx, shape.cy + floatY);
        ctx.rotate(rot);
        ctx.strokeStyle = "rgba(201,168,76,0.12)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (shape.type === "hex") {
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
            const px = Math.cos(angle) * shape.size;
            const py = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
        } else if (shape.type === "tri") {
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const px = Math.cos(angle) * shape.size;
            const py = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          // Inner circle
          ctx.moveTo(shape.size * 0.5, 0);
          ctx.arc(0, 0, shape.size * 0.5, 0, Math.PI * 2);
        } else if (shape.type === "diamond") {
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size * 0.6, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size * 0.6, 0);
          ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
      });

      // Draw particles
      particlesRef.current.forEach((p) => {
        // Update
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += 0.003 * p.opacityDir;
        if (p.opacity > 0.6 || p.opacity < 0.05) p.opacityDir *= -1;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Draw
        const goldChance = p.z > 0.75;
        const color = goldChance
          ? `rgba(201,168,76,${p.opacity})`
          : `rgba(150,180,220,${p.opacity * 0.6})`;
        ctx.save();
        ctx.fillStyle = color;
        if (goldChance) {
          // small glow
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, `rgba(201,168,76,${p.opacity * 0.5})`);
          grd.addColorStop(1, "rgba(201,168,76,0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Connect nearby particles with faint lines
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.save();
            ctx.strokeStyle = `rgba(201,168,76,${0.05 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
