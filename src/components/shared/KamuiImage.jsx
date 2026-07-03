import { useEffect, useRef, useState } from 'react';

const KamuiImage = ({ src, alt }) => {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [imgReady, setImgReady] = useState(false);

    useEffect(() => {
        const img = imgRef.current;

        const run = () => {
            setImgReady(true);
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            const W = canvas.width;
            const H = canvas.height;
            const cx = W / 2;
            const cy = H / 2;

            const COLS = 36;
            const ROWS = 36;
            const cellW = W / COLS;
            const cellH = H / ROWS;

            // start with fully black canvas — user sees black first
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, W, H);

            const tiles = [];
            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLS; col++) {
                    const dx = col * cellW + cellW / 2;
                    const dy = row * cellH + cellH / 2;

                    const nx = (dx - cx) / (W / 2);
                    const ny = (dy - cy) / (H / 2);
                    const dist = Math.sqrt(nx * nx + ny * ny);
                    const baseAngle = Math.atan2(ny, nx);

                    // CENTER tiles start first (Kamui opens from center outward)
                    const startDelay = Math.min(dist / 1.5, 1) * 0.55;

                    tiles.push({
                        col, row,
                        sx: (col / COLS) * img.naturalWidth,
                        sy: (row / ROWS) * img.naturalHeight,
                        sw: img.naturalWidth / COLS,
                        sh: img.naturalHeight / ROWS,
                        dx: col * cellW,
                        dy: row * cellH,
                        nx, ny,
                        dist,
                        baseAngle,
                        startDelay,
                    });
                }
            }

            const DURATION = 2200;
            const start = performance.now();

            const animate = (now) => {
                const elapsed = now - start;
                const rawP = Math.min(elapsed / DURATION, 1);

                // easeInOutQuad
                const globalP = rawP < 0.5
                    ? 2 * rawP * rawP
                    : 1 - Math.pow(-2 * rawP + 2, 2) / 2;

                // clear to transparent each frame
                ctx.clearRect(0, 0, W, H);

                // draw full image as base — tiles will COVER it until revealed
                ctx.globalAlpha = 1;
                ctx.drawImage(img, 0, 0, W, H);

                let allDone = true;

                for (const t of tiles) {
                    const tileP = Math.max(0, Math.min(
                        (globalP - t.startDelay) / (1 - t.startDelay), 1
                    ));

                    // tile fully revealed — nothing to draw over it
                    if (tileP >= 1) continue;

                    allDone = false;

                    if (tileP <= 0) {
                        // tile not yet started — cover with transparent black overlay
                        ctx.save();
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = 'rgba(0,0,0,0)'; // fully transparent hole
                        ctx.clearRect(t.dx, t.dy, cellW, cellH); // punch hole in image
                        ctx.restore();
                        continue;
                    }

                    // easeInCubic — slow then snap
                    const e = 1 - Math.pow(1 - tileP, 3); // easeOutCubic: tile arrives from vortex

                    // tile spirals FROM center outward TO its final position
                    const spiralTurns = 1.8 + t.dist * 1.2;
                    // angle goes from baseAngle + full turns → baseAngle (lands in place)
                    const currentAngle = t.baseAngle + (1 - e) * Math.PI * 2 * spiralTurns;

                    // distance from center: starts at 0, ends at final position
                    const currentDist = e * t.dist * (W / 2);

                    const newX = cx + Math.cos(currentAngle) * currentDist;
                    const newY = cy + Math.sin(currentAngle) * currentDist;

                    // tile grows from 0 to full size as it arrives
                    const scale = Math.pow(e, 0.6);
                    const drawW = cellW * scale;
                    const drawH = cellH * scale;

                    // first clear the tile destination (punch transparent hole)
                    ctx.clearRect(t.dx, t.dy, cellW, cellH);

                    // draw spiraling tile flying into position
                    ctx.save();
                    ctx.globalAlpha = Math.min(e * 1.5, 1);
                    ctx.translate(newX, newY);
                    ctx.rotate(currentAngle + Math.PI / 2);
                    ctx.transform(1, (1 - e) * 0.3, -(1 - e) * 0.3, 1, 0, 0);
                    ctx.drawImage(
                        img,
                        t.sx, t.sy, t.sw, t.sh,
                        -drawW / 2, -drawH / 2, drawW, drawH
                    );
                    ctx.restore();
                }

                if (!allDone) {
                    requestAnimationFrame(animate);
                } else {
                    // clean final draw
                    ctx.clearRect(0, 0, W, H);
                    ctx.globalAlpha = 1;
                    ctx.drawImage(img, 0, 0, W, H);
                }
            };

            requestAnimationFrame(animate);
        };

        if (img.complete && img.naturalWidth !== 0) {
            run();
        } else {
            img.onload = run;
        }
    }, [src]);

    return (
        <div className="relative w-full h-full bg-black">
            {/* hidden source image */}
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                className="hidden"
                crossOrigin="anonymous"
            />
            {/* canvas is the only visible thing — starts black, kamui reveals image */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
};

export default KamuiImage;