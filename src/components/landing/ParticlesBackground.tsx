import { useEffect, useRef } from "react";

interface ParticlesBackgroundProps {
    className?: string;
    color?: string;
}

export function ParticlesBackground({ className, color = "rgba(255, 255, 255, 0.8)" }: ParticlesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouse = { x: 0, y: 0 };
        // ... (rest of the file until draw)



        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            baseX: number;
            baseY: number;
            density: number;

            constructor(x?: number, y?: number) {
                this.x = x || Math.random() * (canvas?.width || window.innerWidth);
                this.y = y || Math.random() * (canvas?.height || window.innerHeight);
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 3 + 1; // Larger: 1px to 4px
                this.speedX = (Math.random() - 0.5) * 1; // Faster drift
                this.speedY = (Math.random() - 0.5) * 1;
                this.density = (Math.random() * 30) + 1;
            }

            update() {
                // Mouse Interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = 150;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;

                if (distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to drift
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                    // Add drift
                    this.x += this.speedX;
                    this.y += this.speedY;
                    this.baseX += this.speedX;
                    this.baseY += this.speedY;
                }

                // Wrap around screen
                if (this.x > (canvas?.width || 0)) { this.x = 0; this.baseX = 0; }
                if (this.x < 0) { this.x = (canvas?.width || 0); this.baseX = canvas?.width || 0; }
                if (this.y > (canvas?.height || 0)) { this.y = 0; this.baseY = 0; }
                if (this.y < 0) { this.y = (canvas?.height || 0); this.baseY = canvas?.height || 0; }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const numberOfParticles = Math.floor(window.innerWidth / 15); // More density
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        init();
        animate();

        const handleResize = () => {
            resizeCanvas();
            init();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.x;
            mouse.y = e.y;
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full pointer-events-none z-[1] ${className || ''}`}
            style={{ opacity: 0.8 }}
        />
    );
}
