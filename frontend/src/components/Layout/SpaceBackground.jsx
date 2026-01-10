import React, { useEffect, useRef } from 'react';

/**
 * SpaceBackground - Recreated from Dec 21 'Gold & Cyan' Specification.
 * High-performance Canvas 2D with specific "Gold & Cyan" galaxy aesthetic.
 */
const SpaceBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: false });
        let animationFrameId;
        let stars = [];
        let clusters = [];
        let galaxies = [];
        let shootingStars = [];
        let majesticComet; // The rare specific feature
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Interaction state
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            width = window.innerWidth;
            height = window.innerHeight;

            // Set buffer size for High DPI
            canvas.width = width * dpr;
            canvas.height = height * dpr;

            // Map logical units to buffer pixels
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            initCosmos();
        };

        const handleMouseMove = (e) => {
            targetMouseX = (e.clientX / width - 0.5);
            targetMouseY = (e.clientY / height - 0.5);
        };

        class Star {
            constructor(layer = 0) {
                this.layer = layer; // 0: Far, 1: Mid, 2: Near
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;

                // Parallax depth mapping
                const depthFactors = [0.1, 0.4, 0.8];
                this.z = depthFactors[this.layer];

                // Aesthetic Distribution (Cyan, Gold, White) - Matching Dec 21 spec
                const r = Math.random();
                if (r > 0.90) {
                    this.color = `rgba(255, 184, 0, ${0.4 + Math.random() * 0.4})`; // Gold
                } else if (r > 0.80) {
                    this.color = `rgba(0, 251, 255, ${0.3 + Math.random() * 0.4})`; // Cyan
                } else {
                    this.color = `rgba(255, 255, 255, ${0.2 + Math.random() * 0.6})`; // White
                }

                this.baseSize = (Math.random() * 1.5 + 0.2) * (this.layer + 1) * 0.5;
                this.size = this.baseSize;
                this.twinkles = Math.random() > 0.7;
                this.twinklePhase = Math.random() * Math.PI * 2;
                this.speed = (0.01 + Math.random() * 0.03) * this.z;
            }

            update() {
                if (this.twinkles) {
                    this.size = this.baseSize * (0.8 + Math.sin(Date.now() * 0.003 + this.twinklePhase) * 0.4);
                }

                // Parallax
                this.x += (mouseX * this.z * 40 - (this.x - width / 2) * 0.0005) * 0.05;
                this.y += (mouseY * this.z * 40 - (this.y - height / 2) * 0.0005) * 0.05;

                this.y -= this.speed; // Drift up

                if (this.y < -10) this.y = height + 10;
                if (this.x < -10) this.x = width + 10;
                if (this.x > width + 10) this.x = -10;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Galaxy {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 60 + 40;
                this.angle = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.002;
                this.opacity = Math.random() * 0.15 + 0.05;
                this.color = Math.random() > 0.5 ? '0, 251, 255' : '255, 184, 0';
                this.z = 0.05;
            }

            update() {
                this.angle += this.rotationSpeed;
                this.x += (mouseX * this.z * 40) * 0.05;
                this.y += (mouseY * this.z * 40) * 0.05;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.globalAlpha = this.opacity;
                ctx.globalCompositeOperation = 'screen';

                const g = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
                g.addColorStop(0, `rgba(${this.color}, 1)`);
                g.addColorStop(0.5, `rgba(${this.color}, 0.2)`);
                g.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = g;
                ctx.scale(2, 0.6); // Spiral
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        class StarCluster {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.radius = Math.random() * 300 + 100;
                this.opacity = Math.random() * 0.12 + 0.03;
                this.color = Math.random() > 0.5 ? '0, 251, 255' : '255, 184, 0';
            }

            draw() {
                const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
                g.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
                g.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = g;
                ctx.globalCompositeOperation = 'screen';
                ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
                ctx.globalCompositeOperation = 'source-over';
            }
        }

        class ShootingStar {
            constructor() {
                this.active = false;
                this.timer = Math.random() * 10000;
            }

            trigger() {
                this.active = true;
                this.x = Math.random() * width;
                this.y = Math.random() * height * 0.4;
                this.len = Math.random() * 100 + 50;
                this.speed = Math.random() * 10 + 5;
                this.angle = (135 + Math.random() * 20) * Math.PI / 180;
                this.opacity = 1;
                this.color = Math.random() > 0.5 ? '#FFB800' : '#00FBFF';
            }

            update() {
                if (!this.active) {
                    if (this.timer <= 0) {
                        this.trigger();
                        this.timer = Math.random() * 20000 + 10000;
                    } else {
                        this.timer -= 16;
                    }
                    return;
                }

                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                this.opacity -= 0.02;

                if (this.opacity <= 0 || this.x < -100 || this.y > height + 100) {
                    this.active = false;
                }
            }

            draw() {
                if (!this.active) return;
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.globalCompositeOperation = 'screen';

                const grad = ctx.createLinearGradient(
                    this.x, this.y,
                    this.x - Math.cos(this.angle) * this.len,
                    this.y - Math.sin(this.angle) * this.len
                );
                grad.addColorStop(0, '#FFF');
                grad.addColorStop(0.3, this.color);
                grad.addColorStop(1, 'transparent');

                ctx.strokeStyle = grad;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
                ctx.stroke();
                ctx.restore();
            }
        }

        const initCosmos = () => {
            stars = [];
            // Dec 21 Density Settings
            [1000, 400, 100].forEach((count, layer) => {
                for (let i = 0; i < count; i++) stars.push(new Star(layer));
            });

            galaxies = [];
            for (let i = 0; i < 4; i++) galaxies.push(new Galaxy());

            clusters = [];
            for (let i = 0; i < 6; i++) clusters.push(new StarCluster());

            shootingStars = [new ShootingStar(), new ShootingStar()];
        };

        const drawAtmosphere = () => {
            // Deep Purple Nebula Core - The signature of Dec 21
            ctx.fillStyle = '#020203'; // Deep Black Base
            ctx.fillRect(0, 0, width, height);

            ctx.globalCompositeOperation = 'screen';
            const g1 = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.8);
            g1.addColorStop(0, 'rgba(40, 20, 100, 0.15)'); // Purple haze
            g1.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g1;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'source-over';
        };

        const animate = () => {
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            drawAtmosphere();
            galaxies.forEach(g => { g.update(); g.draw(); });
            clusters.forEach(c => c.draw());
            stars.forEach(s => { s.update(); s.draw(); });
            shootingStars.forEach(s => { s.update(); s.draw(); });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        resize();
        animate();

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="space-background-canvas"
            style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                zIndex: 0, pointerEvents: 'none', opacity: 1
            }}
        />
    );
};

export default SpaceBackground;
