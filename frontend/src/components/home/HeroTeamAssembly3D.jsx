import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Smoothstep easing interpolation
 */
function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * High-DPI canvas texture for physical block face.
 * Canvas dimensions 1024x460 strictly match the 2.0 / 0.9 = 2.22 aspect ratio of the geometry.
 * Completely eliminates any horizontal stretching or label clipping.
 */
function createFaceTexture(label, sublabel, bgColor, textColor) {
  const WIDTH = 1024;
  const HEIGHT = 460;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  // Solid background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle clean inset framing
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.22;
  ctx.strokeRect(16, 16, WIDTH - 32, HEIGHT - 32);
  ctx.globalAlpha = 1.0;

  // Primary role label — large, bold, crisp
  ctx.font = '900 132px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, 56, 260);

  // Sublabel — monospaced role tag
  ctx.font = '700 48px "JetBrains Mono", "SF Mono", monospace';
  ctx.globalAlpha = 0.72;
  ctx.fillText(sublabel, 60, 360);
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export const HeroTeamAssembly3D = ({
  progress = 0,
  userInitial = null,
  onContextLost = null,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(progress);
  const renderTriggerRef = useRef(null);

  progressRef.current = progress;

  // Trigger render on demand whenever progress prop changes
  useEffect(() => {
    if (renderTriggerRef.current) {
      renderTriggerRef.current();
    }
  }, [progress]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let isDisposed = false;
    let isInView = true;
    let rafId = null;

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 520;

    // ── 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null; // Fully transparent so hero ambient light & ink background show through

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    // Positioned slightly above and forward, looking at the center
    camera.position.set(0, 0.6, 7.2);
    camera.lookAt(0, -0.15, 0);

    // ── 2. Renderer (capped at DPR 2, alpha enabled)
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.setClearColor(0x000000, 0);
    } catch (err) {
      console.warn('[HeroTeamAssembly3D] WebGL init failed:', err);
      if (onContextLost) onContextLost();
      return;
    }

    // ── 3. Lighting (Atmospheric key, fill, ambient, rim)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.6);
    keyLight.position.set(5, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbfd9ff, 0.95);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x3b82f6, 0.6);
    rimLight.position.set(0, -2, -6);
    scene.add(rimLight);

    // ── 4. Ground Shadow Plate (subtle physical contact grounding)
    const shadowGeo = new THREE.PlaneGeometry(16, 16);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.65;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── 5. Squad Group
    const squadGroup = new THREE.Group();
    squadGroup.rotation.y = -0.18;
    squadGroup.rotation.x = 0.1;
    scene.add(squadGroup);

    // ── 6. Geometry & Block Configurations
    // Dimensions: 2.0 width x 0.9 height x 1.0 depth
    const blockGeo = new RoundedBoxGeometry(2.0, 0.9, 1.0, 4, 0.11);

    const gap = 0.20;
    const bw = 2.0, bh = 0.9;
    const col = bw / 2 + gap / 2;
    const row = bh / 2 + gap / 2 + 0.08;

    const youLabel = userInitial ? `YOU (${userInitial})` : 'YOU';

    const blockConfigs = [
      {
        id: 'you',
        label: youLabel,
        sublabel: 'TEAM LEAD',
        color: '#f59e0b',       // Amber / Gold
        textColor: '#0f172a',
        targetPos: new THREE.Vector3(-col, row, 0),
        startPos: new THREE.Vector3(-col, row, 0),
        startRot: new THREE.Euler(0, 0, 0),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.0, 0.0],
      },
      {
        id: 'backend',
        label: 'BACKEND',
        sublabel: 'API DEV',
        color: '#10b981',       // Emerald Mint
        textColor: '#022c22',
        targetPos: new THREE.Vector3(col, row, 0),
        startPos: new THREE.Vector3(5.0, 2.8, 2.2),
        startRot: new THREE.Euler(0.3, -0.5, 0.4),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.05, 0.38],
      },
      {
        id: 'ml',
        label: 'ML ENG',
        sublabel: 'PYTORCH',
        color: '#f8fafc',       // Crisp White
        textColor: '#0f172a',
        targetPos: new THREE.Vector3(-col, -row, 0),
        startPos: new THREE.Vector3(-5.2, -2.8, 2.4),
        startRot: new THREE.Euler(-0.4, 0.5, -0.35),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.38, 0.72],
      },
      {
        id: 'designer',
        label: 'DESIGN',
        sublabel: 'UI / UX',
        color: '#38bdf8',       // Sky Blue
        textColor: '#082f49',
        targetPos: new THREE.Vector3(col, -row, 0),
        startPos: new THREE.Vector3(5.0, -3.0, 2.6),
        startRot: new THREE.Euler(0.45, -0.4, 0.5),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.68, 0.95],
      },
    ];

    // ── 7. Blueprint Dashed Wireframe Ghost Seats
    const ghostGeo = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(2.04, 0.92, 1.02)
    );

    blockConfigs.forEach((cfg, idx) => {
      if (idx === 0) return; // Seat 0 (YOU) is already filled on initial load

      const ghostMat = new THREE.LineDashedMaterial({
        color: 0x60a5fa,
        dashSize: 0.16,
        gapSize: 0.10,
        transparent: true,
        opacity: 0.55,
      });

      const ghost = new THREE.LineSegments(ghostGeo, ghostMat);
      ghost.computeLineDistances(); // Required for dashed material
      ghost.position.copy(cfg.targetPos);
      squadGroup.add(ghost);

      cfg.ghostMesh = ghost;
      cfg.ghostMat = ghostMat;
    });

    // ── 8. Build Physical Meshes
    blockConfigs.forEach((cfg) => {
      const tex = createFaceTexture(cfg.label, cfg.sublabel, cfg.color, cfg.textColor);

      const frontMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.38,
        metalness: 0.08,
      });

      const bodyMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.42,
        metalness: 0.08,
      });

      const topMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.32,
        metalness: 0.12,
      });

      const mesh = new THREE.Mesh(blockGeo, [
        bodyMat, // +X right
        bodyMat, // -X left
        topMat,  // +Y top
        bodyMat, // -Y bottom
        frontMat,// +Z front face
        bodyMat, // -Z back
      ]);

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.copy(cfg.startPos);
      mesh.rotation.copy(cfg.startRot);

      squadGroup.add(mesh);
      cfg.mesh = mesh;
      cfg.tex = tex;
      cfg.frontMat = frontMat;
      cfg.bodyMat = bodyMat;
      cfg.topMat = topMat;
    });

    // ── 9. Render-on-Demand Execution Engine (Zero RAF when idle!)
    const updateScene = () => {
      const p = progressRef.current;

      blockConfigs.forEach((cfg, i) => {
        if (!cfg.mesh) return;

        if (i === 0) {
          cfg.mesh.position.copy(cfg.targetPos);
          cfg.mesh.rotation.copy(cfg.targetRot);
          return;
        }

        const [start, end] = cfg.enterRange;
        const t = smoothstep(start, end, p);

        cfg.mesh.position.lerpVectors(cfg.startPos, cfg.targetPos, t);
        cfg.mesh.rotation.x = THREE.MathUtils.lerp(cfg.startRot.x, cfg.targetRot.x, t);
        cfg.mesh.rotation.y = THREE.MathUtils.lerp(cfg.startRot.y, cfg.targetRot.y, t);
        cfg.mesh.rotation.z = THREE.MathUtils.lerp(cfg.startRot.z, cfg.targetRot.z, t);

        // Dashed outline fades out as block lands
        if (cfg.ghostMat) {
          cfg.ghostMat.opacity = Math.max(0, 0.55 * (1 - t * 1.15));
        }
      });

      const assembleBonus = smoothstep(0.88, 1.0, p);
      squadGroup.rotation.y = -0.18 + assembleBonus * 0.035;
      squadGroup.rotation.x = 0.1 - assembleBonus * 0.018;

      renderer.render(scene, camera);
    };

    const requestRender = () => {
      if (isDisposed || !isInView) return;
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          updateScene();
        });
      }
    };

    renderTriggerRef.current = requestRender;

    // Initial render
    requestRender();

    // ── 10. Viewport Intersection Observer (pause when out of view)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isInView = entry.isIntersecting;
        if (isInView) requestRender();
      });
    }, { threshold: 0.05 });
    io.observe(container);

    // ── 11. Resize Observer
    const ro = new ResizeObserver(() => {
      if (!container || !renderer || !camera || isDisposed) return;
      const w = container.clientWidth || 540;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    ro.observe(container);

    // ── 12. WebGL Context Loss Handlers
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('[HeroTeamAssembly3D] WebGL context lost.');
      if (onContextLost) onContextLost();
    };

    const handleContextRestored = () => {
      console.log('[HeroTeamAssembly3D] WebGL context restored.');
      requestRender();
    };

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // ── 13. Resource Disposal & Cleanup
    return () => {
      isDisposed = true;
      renderTriggerRef.current = null;
      if (rafId !== null) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();

      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      blockConfigs.forEach((cfg) => {
        if (cfg.tex) cfg.tex.dispose();
        if (cfg.frontMat) cfg.frontMat.dispose();
        if (cfg.bodyMat) cfg.bodyMat.dispose();
        if (cfg.topMat) cfg.topMat.dispose();
        if (cfg.ghostMat) cfg.ghostMat.dispose();
      });

      blockGeo.dispose();
      ghostGeo.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [userInitial, onContextLost]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none pointer-events-none"
      aria-hidden="true"
      role="presentation"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default HeroTeamAssembly3D;
