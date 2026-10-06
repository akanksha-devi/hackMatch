import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

/**
 * Smoothstep easing helper
 */
function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

/**
 * Creates a crisp high-DPI canvas texture for the face of a physical block.
 * Canvas dimensions match the front face aspect ratio (2.0 / 0.9 = 2.22).
 * 1024 x 460 ensures 1:1 mapping with NO horizontal stretching or clipping.
 */
function createFaceTexture(label, sublabel, bgColor, textColor) {
  const WIDTH = 1024;
  const HEIGHT = 460;
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');

  // Fill solid background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle clean inset border
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.22;
  ctx.strokeRect(16, 16, WIDTH - 32, HEIGHT - 32);
  ctx.globalAlpha = 1.0;

  // Primary role label — large, bold, bottom-anchored
  ctx.font = '900 132px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(label, 56, 260);

  // Sublabel — monospaced role tag
  ctx.font = '700 48px "SF Mono", "Fira Code", monospace';
  ctx.globalAlpha = 0.72;
  ctx.fillText(sublabel, 60, 360);
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export const HeroTeamAssembly3D = ({ progress = 0, isLight = false }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(progress);

  progressRef.current = progress;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 420;

    // ── Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent — hero bg shows through

    // ── Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.8, 7.0);
    camera.lookAt(0, -0.05, 0);

    // ── Renderer — alpha: true so Three.js canvas is transparent
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.setClearColor(0x000000, 0); // Fully transparent clear

    // ── Lighting — physically grounded
    // Key directional light from upper right
    const keyLight = new THREE.DirectionalLight(0xfff4e0, isLight ? 2.8 : 2.4);
    keyLight.position.set(5, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    // Cool fill light from lower left
    const fillLight = new THREE.DirectionalLight(0xbfd9ff, isLight ? 1.0 : 0.9);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    // Soft ambient light
    const ambient = new THREE.AmbientLight(0xffffff, isLight ? 1.2 : 0.85);
    scene.add(ambient);

    // Back rim light — cobalt-toned to integrate with hero
    const rimLight = new THREE.DirectionalLight(0x3b82f6, isLight ? 0.5 : 0.65);
    rimLight.position.set(0, -2, -6);
    scene.add(rimLight);

    // ── Ground shadow receiver (invisible plane)
    const shadowGeo = new THREE.PlaneGeometry(14, 14);
    const shadowMat = new THREE.ShadowMaterial({ opacity: isLight ? 0.22 : 0.38 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.65;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── Squad group — slight physical angle
    const squadGroup = new THREE.Group();
    squadGroup.rotation.y = -0.18;
    squadGroup.rotation.x = 0.1;
    scene.add(squadGroup);

    // ── Geometry — chunky physical blocks (ratio 2.0 / 0.9 = 2.22)
    const blockGeo = new RoundedBoxGeometry(2.0, 0.9, 1.0, 4, 0.11);

    // ── Block definitions — 4 distinct physical roles
    const gap = 0.20;
    const bw = 2.0, bh = 0.9;
    const col = bw / 2 + gap / 2;
    const row = bh / 2 + gap / 2 + 0.08;

    const blockConfigs = [
      {
        id: 'you',
        label: 'YOU',
        sublabel: 'TEAM LEAD',
        color: '#f59e0b',       // Amber / Gold
        textColor: '#0f172a',   // Dark ink
        targetPos: new THREE.Vector3(-col, row, 0),
        startPos: new THREE.Vector3(-col, row, 0), // Already placed
        startRot: new THREE.Euler(0, 0, 0),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.0, 0.0],
      },
      {
        id: 'backend',
        label: 'BACKEND',
        sublabel: 'API DEV',
        color: '#10b981',       // Emerald Mint
        textColor: '#022c22',   // Deep green ink
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
        textColor: '#0f172a',   // Slate ink
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
        textColor: '#082f49',   // Deep ocean ink
        targetPos: new THREE.Vector3(col, -row, 0),
        startPos: new THREE.Vector3(5.0, -3.0, 2.6),
        startRot: new THREE.Euler(0.45, -0.4, 0.5),
        targetRot: new THREE.Euler(0, 0, 0),
        enterRange: [0.68, 0.95],
      },
    ];

    // ── Ghost dashed wireframe seats — blueprints awaiting teammates
    const ghostGeo = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(2.04, 0.92, 1.02)
    );

    blockConfigs.forEach((cfg, idx) => {
      if (idx === 0) return; // Seat 0 is already filled

      const ghostMat = new THREE.LineDashedMaterial({
        color: isLight ? 0x93c5fd : 0x60a5fa,
        dashSize: 0.16,
        gapSize: 0.10,
        transparent: true,
        opacity: isLight ? 0.45 : 0.55,
      });

      const ghost = new THREE.LineSegments(ghostGeo, ghostMat);
      ghost.computeLineDistances(); // Required for LineDashedMaterial!
      ghost.position.copy(cfg.targetPos);
      squadGroup.add(ghost);

      cfg.ghostMesh = ghost;
      cfg.ghostMat = ghostMat;
    });

    // ── Build physical block meshes
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
        bodyMat, // +X (right)
        bodyMat, // -X (left)
        topMat,  // +Y (top specular)
        bodyMat, // -Y (bottom)
        frontMat,// +Z (printed front face)
        bodyMat, // -Z (back)
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

    // ── Render loop
    let animId;
    let isDisposed = false;

    const render = () => {
      if (isDisposed) return;
      const p = progressRef.current;

      blockConfigs.forEach((cfg, i) => {
        if (!cfg.mesh) return;

        if (i === 0) {
          // Seat 0 (YOU) — stays in target position
          cfg.mesh.position.copy(cfg.targetPos);
          cfg.mesh.rotation.copy(cfg.targetRot);
          return;
        }

        const [start, end] = cfg.enterRange;
        const t = smoothstep(start, end, p);

        // Interpolate position and rotation
        cfg.mesh.position.lerpVectors(cfg.startPos, cfg.targetPos, t);
        cfg.mesh.rotation.x = THREE.MathUtils.lerp(cfg.startRot.x, cfg.targetRot.x, t);
        cfg.mesh.rotation.y = THREE.MathUtils.lerp(cfg.startRot.y, cfg.targetRot.y, t);
        cfg.mesh.rotation.z = THREE.MathUtils.lerp(cfg.startRot.z, cfg.targetRot.z, t);

        // Ghost dashed outline fades out as block slides in
        if (cfg.ghostMat) {
          cfg.ghostMat.opacity = Math.max(0, 0.55 * (1 - t * 1.15));
        }
      });

      // Group subtle posture settle when squad is fully assembled
      const assembleBonus = smoothstep(0.88, 1.0, p);
      squadGroup.rotation.y = -0.18 + assembleBonus * 0.035;
      squadGroup.rotation.x = 0.1 - assembleBonus * 0.018;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    render();

    // ── Resize
    const handleResize = () => {
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    // ── Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      ro.disconnect();

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
  }, [isLight]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none pointer-events-none"
      style={{ height: 'clamp(300px, 44vh, 480px)' }}
      aria-hidden="true"
      role="presentation"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default HeroTeamAssembly3D;
