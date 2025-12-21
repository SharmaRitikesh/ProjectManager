import { useEffect, useRef } from 'react';
import './AbstractBackground.css';

const AbstractBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Floating orbs/blobs
        const orbs = [];
        const orbCount = 5;

        for (let i = 0; i < orbCount; i++) {
            orbs.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: 150 + Math.random() * 200,
                xSpeed: (Math.random() - 0.5) * 0.3,
                ySpeed: (Math.random() - 0.5) * 0.3,
                hue: Math.random() * 60 + 200, // Blue to purple range
                opacity: 0.03 + Math.random() * 0.05
            });
        }

        // Floating particles
        const particles = [];
        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.4 + 0.1
            });
        }

        // Geometric lines
        const lines = [];
        const lineCount = 8;

        for (let i = 0; i < lineCount; i++) {
            lines.push({
                x1: Math.random() * canvas.width,
                y1: Math.random() * canvas.height,
                length: 100 + Math.random() * 300,
                angle: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.005,
                opacity: 0.05 + Math.random() * 0.1,
                width: 1 + Math.random() * 2
            });
        }

        const drawOrbs = () => {
            orbs.forEach(orb => {
                // Update position
                orb.x += orb.xSpeed;
                orb.y += orb.ySpeed;

                // Bounce off edges
                if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
                if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
                if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
                if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

                // Draw gradient orb
                const gradient = ctx.createRadialGradient(
                    orb.x, orb.y, 0,
                    orb.x, orb.y, orb.radius
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${orb.opacity})`);
                gradient.addColorStop(0.5, `rgba(200, 200, 200, ${orb.opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        const drawParticles = () => {
            particles.forEach(particle => {
                // Update position
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around edges
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.y > canvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = canvas.height;

                // Draw particle
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connections between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const drawLines = () => {
            lines.forEach(line => {
                // Update angle
                line.angle += line.rotationSpeed;

                const x2 = line.x1 + Math.cos(line.angle) * line.length;
                const y2 = line.y1 + Math.sin(line.angle) * line.length;

                // Draw line with gradient
                const gradient = ctx.createLinearGradient(line.x1, line.y1, x2, y2);
                gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${line.opacity})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                ctx.strokeStyle = gradient;
                ctx.lineWidth = line.width;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(line.x1, line.y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            });
        };

        const drawMeshGrid = () => {
            const gridSize = 60;
            const offsetX = (time * 10) % gridSize;
            const offsetY = (time * 5) % gridSize;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 1;

            // Vertical lines
            for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines  
            for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        };

        const drawWaves = () => {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 2;

            for (let x = 0; x < canvas.width; x += 5) {
                const y = canvas.height * 0.7 +
                    Math.sin(x * 0.005 + time) * 30 +
                    Math.sin(x * 0.01 + time * 0.5) * 20;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Second wave
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            for (let x = 0; x < canvas.width; x += 5) {
                const y = canvas.height * 0.5 +
                    Math.sin(x * 0.008 + time * 0.8) * 40 +
                    Math.sin(x * 0.003 + time * 0.3) * 25;

                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };

        const animate = () => {
            time += 0.01;

            // Clear with slight fade for trail effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw all elements
            drawMeshGrid();
            drawOrbs();
            drawWaves();
            drawLines();
            drawParticles();

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <>
            {/* CSS animated background elements */}
            <div className="abstract-bg">
                <div className="gradient-orb gradient-orb-1"></div>
                <div className="gradient-orb gradient-orb-2"></div>
                <div className="gradient-orb gradient-orb-3"></div>
                <div className="geometric-shape shape-1"></div>
                <div className="geometric-shape shape-2"></div>
                <div className="geometric-shape shape-3"></div>
                <div className="glow-line glow-line-1"></div>
                <div className="glow-line glow-line-2"></div>
            </div>

            {/* Canvas for dynamic particles and effects */}
            <canvas
                ref={canvasRef}
                className="abstract-canvas"
            />
        </>
    );
};

export default AbstractBackground;
