const TAU = Math.PI * 2;

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

const lerp = (a, b, t) =>
  a + (b - a) * t;

function parseColor(value, fallback) {
  const input = String(value || "").trim();

  if (/^#[0-9a-f]{6}$/i.test(input)) {
    return {
      r: parseInt(input.slice(1, 3), 16),
      g: parseInt(input.slice(3, 5), 16),
      b: parseInt(input.slice(5, 7), 16),
    };
  }

  const match = input.match(/rgba?\(([^)]+)\)/i);

  if (!match) return fallback;

  const parts = match[1].split(",").map(Number);

  return parts.length >= 3
    ? {
        r: parts[0],
        g: parts[1],
        b: parts[2],
      }
    : fallback;
}

const rgba = (color, alpha) =>
  `rgba(${color.r},${color.g},${color.b},${alpha})`;

function seededRandom(seed) {
  let x = seed >>> 0;

  return () => {
    x += 0x6d2b79f5;
    let t = x;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createEnergyField({
  root,
  canvas,
  nodeEls = [],
  skills = [],
  dark = true,
  getActive,
}) {
  const ctx = canvas.getContext("2d", {
    alpha: true,
    desynchronized: true,
  });

  if (!ctx) return { destroy() {} };

  const reducedMotion = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  const finePointer = window
    .matchMedia("(pointer: fine)")
    .matches;

  const style = getComputedStyle(root);

  const colors = {
    cobalt: parseColor(
      style.getPropertyValue("--gh-cobalt"),
      { r: 42, g: 75, b: 255 }
    ),
    mint: parseColor(
      style.getPropertyValue("--gh-mint"),
      { r: 94, g: 234, b: 212 }
    ),
    yellow: parseColor(
      style.getPropertyValue("--gh-yellow"),
      { r: 255, g: 210, b: 63 }
    ),
    white: parseColor(
      style.getPropertyValue("--gh-white"),
      { r: 245, g: 247, b: 255 }
    ),
    amber: { r: 245, g: 158, b: 11 },
    cyan: { r: 6, g: 182, b: 212 },
    violet: { r: 236, g: 72, b: 153 },
    emerald: { r: 16, g: 185, b: 129 },
    azure: { r: 59, g: 130, b: 246 },
    indigo: { r: 139, g: 92, b: 246 },
  };

  const pointer = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    active: false,
  };

  const size = {
    w: 1,
    h: 1,
    dpr: 1,
    cx: 0,
    cy: 0,
    r: 160,
  };

  const random = seededRandom(84021);

  // 128 foreground particles in dark mode with 3 distinct energy layers
  const particles = Array.from(
    { length: dark ? 128 : 75 },
    () => {
      const type = random() < 0.22 ? 2 : (random() < 0.62 ? 1 : 0);
      return {
        type, // 0: fine cosmic dust, 1: radiant energy spark, 2: twinkling luminous mote
        angle: random() * TAU,
        distance: 0.55 + random() * 2.35,
        speed: (0.12 + random() * 0.38) * (random() < 0.5 ? 1 : -1),
        phase: random() * TAU,
        size:
          type === 2
            ? (2.8 + random() * 1.5)
            : (type === 1 ? (1.5 + random() * 1.1) : (0.7 + random() * 0.6)),
        color: [
          colors.cobalt,
          colors.mint,
          colors.yellow,
          colors.white,
          colors.cyan,
          colors.amber,
        ][Math.floor(random() * 6)],
      };
    }
  );

  // 14 swirling 3D internal plasma tendrils circulating inside the core
  const filaments = Array.from({ length: 14 }, (_, i) => ({
    tilt: -0.62 + (i / 13) * 1.24,
    radiusRatio: 0.30 + (i % 5) * 0.13,
    speed: (i % 2 === 0 ? 1 : -1) * (0.24 + i * 0.035),
    phase: i * 0.92,
    width: 1.2 + (i % 3) * 0.7,
    color: [
      colors.white,
      colors.yellow,
      colors.mint,
      colors.cobalt,
      colors.amber,
      colors.cyan,
    ][i % 6],
    alpha: 0.45 + (i % 4) * 0.14,
  }));

  // 6 solar prominence loops leaping dynamically from the globe surface
  const prominences = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * TAU + 0.35,
    heightRatio: 1.14 + (i % 3) * 0.10,
    spread: 0.32 + (i % 2) * 0.14,
    speed: 0.38 + i * 0.07,
    phase: i * 1.35,
    color: i % 2 === 0 ? colors.yellow : colors.cyan,
  }));

  // Ribbons directed towards each node, plus ambient energy flows
  const ribbons = [
    [-2.55, 1.84, 0.42, colors.amber, 0],   // 0: AI / ML (Upper Left)
    [-1.57, 1.68, -0.32, colors.cyan, 1],   // 1: Web Development (Top)
    [-0.58, 1.86, 0.34, colors.violet, 2],  // 2: UI/UX Design (Upper Right)
     [2.65, 1.76, -0.28, colors.mint, 3],   // 3: Product (Lower Left)
     [0.52, 1.74, 0.35, colors.azure, 4],   // 4: Data Science (Lower Right)
     [1.57, 1.80, -0.34, colors.indigo, 5], // 5: Cloud / Systems (Bottom)
    [-2.05, 1.55, -0.45, colors.cobalt, -1], // Ambient stream 1
     [0.05, 1.60, 0.40, colors.yellow, -1],  // Ambient stream 2
  ].map(([angle, length, bend, color, nodeIdx], index) => ({
    angle,
    length,
    bend,
    color,
    nodeIdx,
    phase: index * 1.55,
    speed: (index % 2 ? -1 : 1) * (0.05 + index * 0.003),
  }));

  const nodeAngles = [
    -2.55, // 0: AI / ML (Upper Left)
    -1.57, // 1: Web Development (Top)
    -0.58, // 2: UI/UX Design (Upper Right)
     2.65, // 3: Product (Lower Left)
     0.52, // 4: Data Science (Lower Right)
     1.57, // 5: Cloud / Systems (Bottom)
     2.10, // Extra node if present
    -0.10, // Extra node if present
  ];

  const nodes = nodeEls.map((element, index) => {
    const skillColor = skills[index]?.color
      ? parseColor(skills[index].color, colors.yellow)
      : colors.yellow;
    return {
      element,
      index,
      angle: nodeAngles[index] ?? index * 0.8,
      distance: 1.28 + (index % 2) * 0.12,
      phase: index * 0.91,
      color: skillColor,
      x: 0,
      y: 0,
      scale: 1,
    };
  });

  let raf = 0;
  let visible = false;
  let destroyed = false;
  let elapsed = 0;
  let previous = 0;

  const resize = () => {
    if (destroyed) return;

    const rect = root.getBoundingClientRect();

    size.w = Math.max(1, rect.width);
    size.h = Math.max(1, rect.height);
    size.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(size.w * size.dpr);
    canvas.height = Math.round(size.h * size.dpr);

    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    ctx.setTransform(
      size.dpr,
      0,
      0,
      size.dpr,
      0,
      0
    );

    // Align canvas globe origin with DOM core UI element when present
    const coreUi = root.querySelector(".gh-core-ui");
    if (coreUi) {
      const coreRect = coreUi.getBoundingClientRect();
      size.cx = coreRect.left + coreRect.width * 0.5 - rect.left;
      size.cy = coreRect.top + coreRect.height * 0.5 - rect.top;
    } else {
      size.cx = size.w < 860 ? size.w * 0.50 : size.w * 0.69;
      size.cy = size.w < 860 ? size.h * 0.60 : size.h * 0.50;
    }

    size.r = clamp(
      Math.min(size.w * 0.17, size.h * 0.32),
      size.w < 560 ? 85 : (size.w < 860 ? 105 : 120),
      300
    );
  };

  const drawAtmosphere = () => {
    // Clear canvas completely to allow 3D background cosmic particles to shine through cleanly
    ctx.clearRect(0, 0, size.w, size.h);

    const lights = [
      {
        x:
          size.w * 0.73 +
          Math.sin(elapsed * 0.18) * size.w * 0.018,
        y:
          size.h * 0.42 +
          Math.cos(elapsed * 0.15) * size.h * 0.025,
        radius: size.w * 0.32,
        color: colors.cobalt,
        alpha: dark ? 0.16 : 0.08,
      },
      {
        x:
          size.w * 0.75 +
          Math.cos(elapsed * 0.13) * size.w * 0.02,
        y:
          size.h * 0.76 +
          Math.sin(elapsed * 0.12) * size.h * 0.02,
        radius: size.w * 0.28,
        color: colors.mint,
        alpha: dark ? 0.12 : 0.06,
      },
      {
        x:
          size.w * 0.55 +
          Math.sin(elapsed * 0.10) * size.w * 0.012,
        y: size.h * 0.32,
        radius: size.w * 0.16,
        color: colors.yellow,
        alpha: dark ? 0.055 : 0.04,
      },
    ];

    ctx.save();
    if (dark) {
      ctx.globalCompositeOperation = "screen";
    }

    lights.forEach((light) => {
      const gradient = ctx.createRadialGradient(
        light.x,
        light.y,
        0,
        light.x,
        light.y,
        light.radius
      );

      gradient.addColorStop(0, rgba(light.color, light.alpha));
      gradient.addColorStop(0.48, rgba(light.color, light.alpha * 0.32));
      gradient.addColorStop(1, rgba(light.color, 0));

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius, 0, TAU);
      ctx.fill();
    });

    ctx.restore();
  };

  const drawParticles = () => {
    ctx.save();
    if (dark) {
      ctx.globalCompositeOperation = "screen";
    }

    particles.forEach((particle) => {
      const angle =
        particle.angle +
        elapsed * particle.speed * 0.10;

      const radial =
        size.r *
        (
          particle.distance +
          Math.sin(elapsed * 0.55 + particle.phase) * 0.07
        );

      const x =
        size.cx +
        Math.cos(angle) * radial * 1.48 +
        pointer.x * size.w * 0.012;

      const y =
        size.cy +
        Math.sin(angle) * radial * 0.92 +
        pointer.y * size.h * 0.012;

      if (particle.type === 2) {
        // Twinkling luminous mote with soft radial halo
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.2 + particle.phase);
        const moteAlpha = dark ? (0.35 + pulse * 0.55) : (0.25 + pulse * 0.45);
        const haloRadius = particle.size * 2.6;

        const haloGrad = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          haloRadius
        );
        haloGrad.addColorStop(0, rgba(colors.white, moteAlpha));
        haloGrad.addColorStop(0.35, rgba(particle.color, moteAlpha * 0.72));
        haloGrad.addColorStop(1, rgba(particle.color, 0));

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(x, y, haloRadius, 0, TAU);
        ctx.fill();

        ctx.fillStyle = rgba(colors.white, moteAlpha);
        ctx.beginPath();
        ctx.arc(x, y, particle.size * 0.75, 0, TAU);
        ctx.fill();
      } else if (particle.type === 1) {
        // Energetic glowing spark
        const sparkAlpha = dark ? 0.85 : 0.65;
        const sparkHalo = particle.size * 2.2;

        const sparkGrad = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          sparkHalo
        );
        sparkGrad.addColorStop(0, rgba(colors.white, sparkAlpha));
        sparkGrad.addColorStop(0.40, rgba(particle.color, sparkAlpha * 0.75));
        sparkGrad.addColorStop(1, rgba(particle.color, 0));

        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(x, y, sparkHalo, 0, TAU);
        ctx.fill();
      } else {
        // Fine cosmic dust
        ctx.fillStyle = rgba(
          particle.color,
          dark ? 0.62 : 0.40
        );
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, TAU);
        ctx.fill();
      }
    });

    ctx.restore();
  };

  const drawRibbon = (ribbon, index) => {
    const isNodeActive =
      ribbon.nodeIdx >= 0 && getActive?.() === ribbon.nodeIdx;
    const active =
      getActive?.() === index || isNodeActive;

    const angle =
      ribbon.angle +
      Math.sin(elapsed * 0.35 + ribbon.phase) * 0.12 +
      ribbon.speed * elapsed;

    const startRadius = size.r * 0.68;
    const endRadius = size.r * ribbon.length;

    const startX = size.cx + Math.cos(angle) * startRadius;
    const startY = size.cy + Math.sin(angle) * startRadius * 0.90;

    const perpX = -Math.sin(angle);
    const perpY = Math.cos(angle);

    const dynamicBend =
      ribbon.bend * size.r +
      Math.sin(elapsed * 0.52 + ribbon.phase) * size.r * 0.08;

    const control1X =
      size.cx +
      Math.cos(angle + 0.08) * size.r * 1.05 +
      perpX * dynamicBend;
    const control1Y =
      size.cy +
      Math.sin(angle + 0.08) * size.r * 0.94 +
      perpY * dynamicBend;

    const control2X =
      size.cx +
      Math.cos(angle - 0.10) * size.r * 1.42 +
      perpX * dynamicBend * 0.52;
    const control2Y =
      size.cy +
      Math.sin(angle - 0.10) * size.r * 1.24 +
      perpY * dynamicBend * 0.52;

    const endX =
      size.cx +
      Math.cos(angle + ribbon.bend * 0.12) * endRadius * 1.18;
    const endY =
      size.cy +
      Math.sin(angle + ribbon.bend * 0.12) * endRadius * 0.88;

    ctx.save();
    ctx.lineCap = "round";

    // Pass 1: Volumetric aura glow
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      control1X,
      control1Y,
      control2X,
      control2Y,
      endX,
      endY
    );
    ctx.strokeStyle = rgba(
      ribbon.color,
      dark
        ? (active ? 0.44 : 0.18)
        : (active ? 0.32 : 0.12)
    );
    ctx.lineWidth = active ? 16 : 8.5;
    ctx.stroke();

    // Pass 2: Saturated plasma stream
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      control1X,
      control1Y,
      control2X,
      control2Y,
      endX,
      endY
    );
    ctx.strokeStyle = rgba(
      ribbon.color,
      dark
        ? (active ? 0.94 : 0.65)
        : (active ? 0.78 : 0.45)
    );
    ctx.lineWidth = active ? 4.4 : 2.5;
    ctx.stroke();

    // Pass 3: White-hot superconductive core line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      control1X,
      control1Y,
      control2X,
      control2Y,
      endX,
      endY
    );
    ctx.strokeStyle = rgba(
      colors.white,
      active ? 0.96 : (dark ? 0.68 : 0.48)
    );
    ctx.lineWidth = active ? 1.8 : 1.1;
    ctx.stroke();

    // 3 Staggered Energy Charge Packets per ribbon
    const packetSpeed = active ? 0.28 : 0.13;
    const baseTravel =
      (elapsed * packetSpeed + ribbon.phase / TAU) % 1;
    const packetOffsets = [0, 0.33, 0.66];

    packetOffsets.forEach((offset) => {
      const travel = (baseTravel + offset) % 1;
      const t = travel;
      const invT = 1 - t;

      const px =
        invT ** 3 * startX +
        3 * invT ** 2 * t * control1X +
        3 * invT * t ** 2 * control2X +
        t ** 3 * endX;

      const py =
        invT ** 3 * startY +
        3 * invT ** 2 * t * control1Y +
        3 * invT * t ** 2 * control2Y +
        t ** 3 * endY;

      // Glow halo
      const packetRadius = active ? 7.5 : 4.8;
      const packetGrad = ctx.createRadialGradient(
        px,
        py,
        0,
        px,
        py,
        packetRadius * 2
      );
      packetGrad.addColorStop(
        0,
        rgba(colors.white, active ? 0.98 : 0.88)
      );
      packetGrad.addColorStop(
        0.35,
        rgba(ribbon.color, active ? 0.82 : 0.58)
      );
      packetGrad.addColorStop(1, rgba(ribbon.color, 0));

      ctx.fillStyle = packetGrad;
      ctx.beginPath();
      ctx.arc(px, py, packetRadius * 2, 0, TAU);
      ctx.fill();

      // Bright center spark
      ctx.fillStyle = rgba(colors.white, active ? 1.0 : 0.92);
      ctx.beginPath();
      ctx.arc(px, py, active ? 2.6 : 1.6, 0, TAU);
      ctx.fill();
    });

    ctx.restore();
  };

  const drawGlobe = () => {
    const centerX =
      size.cx +
      pointer.x * size.r * 0.055;

    const centerY =
      size.cy +
      pointer.y * size.r * 0.045;

    const radius =
      size.r *
      (
        1 +
        Math.sin(elapsed * 0.62) * 0.022 +
        Math.cos(elapsed * 1.34) * 0.012
      );

    ctx.save();

    // 1. Outermost Atmospheric Coronal Radiance (Expansive aura)
    const coronaRadius = radius * 1.55;
    const coronaGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.70,
      centerX,
      centerY,
      coronaRadius
    );
    coronaGrad.addColorStop(
      0,
      rgba(colors.cobalt, dark ? 0.35 : 0.18)
    );
    coronaGrad.addColorStop(
      0.40,
      rgba(colors.cyan, dark ? 0.22 : 0.12)
    );
    coronaGrad.addColorStop(
      0.72,
      rgba(colors.yellow, dark ? 0.10 : 0.06)
    );
    coronaGrad.addColorStop(1, rgba(colors.cobalt, 0));

    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coronaRadius, 0, TAU);
    ctx.fill();

    // 2. Solar Prominence Loops (Magnetic loops leaping from surface)
    prominences.forEach((prom) => {
      const promAngle =
        prom.angle +
        Math.sin(elapsed * 0.30 + prom.phase) * 0.15;
      const loopHeight =
        radius *
        (
          prom.heightRatio +
          Math.sin(elapsed * prom.speed + prom.phase) * 0.08
        );
      const span = prom.spread;

      const p1X =
        centerX + Math.cos(promAngle - span * 0.5) * radius * 0.95;
      const p1Y =
        centerY + Math.sin(promAngle - span * 0.5) * radius * 0.90;
      const topX =
        centerX + Math.cos(promAngle) * loopHeight * 1.05;
      const topY =
        centerY + Math.sin(promAngle) * loopHeight * 0.95;
      const p2X =
        centerX + Math.cos(promAngle + span * 0.5) * radius * 0.95;
      const p2Y =
        centerY + Math.sin(promAngle + span * 0.5) * radius * 0.90;

      ctx.beginPath();
      ctx.moveTo(p1X, p1Y);
      ctx.quadraticCurveTo(topX, topY, p2X, p2Y);
      ctx.strokeStyle = rgba(
        prom.color,
        dark ? 0.45 : 0.28
      );
      ctx.lineWidth = 2.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(p1X, p1Y);
      ctx.quadraticCurveTo(topX, topY, p2X, p2Y);
      ctx.strokeStyle = rgba(
        colors.white,
        dark ? 0.75 : 0.50
      );
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });

    // 3. Volumetric Organic Plasma Body
    const plasmaGrad = ctx.createRadialGradient(
      centerX - radius * 0.20,
      centerY - radius * 0.24,
      0,
      centerX,
      centerY,
      radius * 1.05
    );

    if (dark) {
      plasmaGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      plasmaGrad.addColorStop(0.06, "rgba(255, 235, 130, 0.95)");
      plasmaGrad.addColorStop(0.18, "rgba(255, 185, 45, 0.88)");
      plasmaGrad.addColorStop(0.34, "rgba(94, 234, 212, 0.75)");
      plasmaGrad.addColorStop(0.52, "rgba(42, 75, 255, 0.90)");
      plasmaGrad.addColorStop(0.76, "rgba(20, 32, 115, 0.95)");
      plasmaGrad.addColorStop(0.92, "rgba(8, 12, 45, 0.92)");
      plasmaGrad.addColorStop(1.0, "rgba(6, 8, 24, 0)");
    } else {
      plasmaGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      plasmaGrad.addColorStop(0.08, "rgba(255, 215, 64, 0.92)");
      plasmaGrad.addColorStop(0.25, "rgba(94, 234, 212, 0.68)");
      plasmaGrad.addColorStop(0.55, "rgba(79, 110, 247, 0.80)");
      plasmaGrad.addColorStop(0.85, "rgba(165, 180, 252, 0.85)");
      plasmaGrad.addColorStop(1.0, "rgba(224, 231, 255, 0)");
    }

    ctx.fillStyle = plasmaGrad;
    ctx.beginPath();

    const points = 64;
    for (let index = 0; index < points; index++) {
      const angle = (index / points) * TAU;
      const wobble =
        1 +
        Math.sin(angle * 2 + elapsed * 0.9) * 0.032 +
        Math.cos(angle * 4 - elapsed * 0.7) * 0.024 +
        Math.sin(angle * 6 + elapsed * 1.4) * 0.014 +
        Math.cos(angle * 11 - elapsed * 1.8) * 0.008;

      const x = centerX + Math.cos(angle) * radius * wobble;
      const y = centerY + Math.sin(angle) * radius * 0.92 * wobble;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();

    // 4. Internal Swirling Plasma Filaments & Magnetic Flux Tendrils (14 filaments in 3D projection)
    filaments.forEach((fil) => {
      const phi = elapsed * fil.speed + fil.phase;
      const filRadius = radius * fil.radiusRatio;

      ctx.beginPath();
      for (let step = 0; step <= 28; step++) {
        const theta = (step / 28) * TAU;
        const px = Math.cos(theta) * filRadius;
        const py = Math.sin(theta) * filRadius * Math.cos(fil.tilt);
        const pz = Math.sin(theta) * filRadius * Math.sin(fil.tilt);

        const rx = px * Math.cos(phi) - pz * Math.sin(phi);
        const ry =
          py +
          Math.sin(rx * 0.05 + elapsed * 1.5) * (radius * 0.04);

        const scrX = centerX + rx;
        const scrY = centerY + ry * 0.88;

        if (step === 0) {
          ctx.moveTo(scrX, scrY);
        } else {
          ctx.lineTo(scrX, scrY);
        }
      }

      ctx.strokeStyle = rgba(
        fil.color,
        dark ? fil.alpha : fil.alpha * 0.7
      );
      ctx.lineWidth = fil.width;
      ctx.stroke();
    });

    // 5. White-Hot Solar Nucleus & Fusion Flare
    const coreGrad = ctx.createRadialGradient(
      centerX - radius * 0.18,
      centerY - radius * 0.20,
      0,
      centerX - radius * 0.18,
      centerY - radius * 0.20,
      radius * 0.35
    );
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    coreGrad.addColorStop(0.12, rgba(colors.yellow, 0.92));
    coreGrad.addColorStop(0.40, rgba(colors.amber, 0.65));
    coreGrad.addColorStop(1, rgba(colors.yellow, 0));

    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(
      centerX - radius * 0.18,
      centerY - radius * 0.20,
      radius * 0.35,
      0,
      TAU
    );
    ctx.fill();

    // 6. Direct Crackling Electric Arc to Active Skill Node
    const activeIndex = getActive?.();
    if (activeIndex >= 0 && nodes[activeIndex]) {
      const activeNode = nodes[activeIndex];
      const targetX = activeNode.x;
      const targetY = activeNode.y;
      const arcDist = Math.hypot(targetX - centerX, targetY - centerY);

      if (arcDist > 10) {
        const perpX = -(targetY - centerY) / arcDist;
        const perpY = (targetX - centerX) / arcDist;
        const segments = 14;

        // Outer electric glow
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        for (let s = 1; s < segments; s++) {
          const t = s / segments;
          const bx = lerp(centerX, targetX, t);
          const by = lerp(centerY, targetY, t);
          const jitter =
            Math.sin(elapsed * 38 + s * 3.7) *
            16 *
            Math.sin(t * Math.PI);
          ctx.lineTo(bx + perpX * jitter, by + perpY * jitter);
        }
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = rgba(
          activeNode.color || colors.yellow,
          dark ? 0.75 : 0.55
        );
        ctx.lineWidth = 4.5;
        ctx.stroke();

        // Inner white-hot electric core
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        for (let s = 1; s < segments; s++) {
          const t = s / segments;
          const bx = lerp(centerX, targetX, t);
          const by = lerp(centerY, targetY, t);
          const jitter =
            Math.sin(elapsed * 38 + s * 3.7) *
            16 *
            Math.sin(t * Math.PI);
          ctx.lineTo(bx + perpX * jitter, by + perpY * jitter);
        }
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  const updateNodes = () => {
    nodes.forEach((node) => {
      const active =
        getActive?.() === node.index;

      const time =
        elapsed * 0.55 +
        node.phase;

      const orbitalAngle =
        node.angle +
        Math.sin(time * 0.4) * 0.15;

      const distance =
        size.r * node.distance;

      const drift =
        12 +
        10 * Math.sin(time * 0.7);

      const baseX =
        size.cx +
        Math.cos(orbitalAngle) * distance * 1.05 +
        Math.cos(time) * drift;

      const baseY =
        size.cy +
        Math.sin(orbitalAngle) * distance * 0.88 +
        Math.sin(time * 0.8) * drift * 0.6;

      const targetX = clamp(
        baseX +
          pointer.x *
            size.w *
            (active ? 0.02 : 0.012),
        90,
        size.w - 110
      );

      const targetY =
        baseY +
        pointer.y *
          size.h *
          (active ? 0.018 : 0.01);

      node.x = lerp(
        node.x || targetX,
        targetX,
        0.11
      );

      node.y = lerp(
        node.y || targetY,
        targetY,
        0.11
      );

      node.scale = lerp(
        node.scale,
        active ? 1.08 : 1,
        0.13
      );

      if (node.element) {
        node.element.style.transform =
          `translate3d(${node.x}px,${node.y}px,0) ` +
          `translate(-50%,-50%) ` +
          `scale(${node.scale})`;
      }
    });
  };

  const render = () => {
    drawAtmosphere();
    drawParticles();
    ribbons.forEach(drawRibbon);
    drawGlobe();
    updateNodes();
  };

  const loop = (timestamp) => {
    raf = 0;

    if (
      destroyed ||
      !visible ||
      document.hidden
    ) {
      return;
    }

    const delta = previous
      ? Math.min(timestamp - previous, 40)
      : 16.7;

    previous = timestamp;

    elapsed +=
      reducedMotion ? 0 : delta * 0.001;

    pointer.x = lerp(
      pointer.x,
      pointer.tx,
      pointer.active ? 0.13 : 0.08
    );

    pointer.y = lerp(
      pointer.y,
      pointer.ty,
      pointer.active ? 0.13 : 0.08
    );

    render();

    raf = window.requestAnimationFrame(loop);
  };

  const start = () => {
    if (
      !raf &&
      !destroyed &&
      visible &&
      !reducedMotion &&
      !document.hidden
    ) {
      raf = window.requestAnimationFrame(loop);
    }
  };

  const onPointerMove = (event) => {
    if (!finePointer) return;

    const rect = root.getBoundingClientRect();

    pointer.tx = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1
    );

    pointer.ty = clamp(
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
      -1,
      1
    );

    pointer.active = true;
  };

  const onPointerLeave = () => {
    pointer.active = false;
    pointer.tx = 0;
    pointer.ty = 0;
  };

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else {
      start();
    }
  };

  root.addEventListener("pointermove", onPointerMove, {
    passive: true,
  });

  root.addEventListener("pointerleave", onPointerLeave, {
    passive: true,
  });

  document.addEventListener(
    "visibilitychange",
    onVisibilityChange
  );

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;

      if (visible) {
        resize();
        render();
        start();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    { threshold: 0.02 }
  );

  intersectionObserver.observe(root);

  resize();
  visible = true;
  render();
  start();

  return {
    destroy() {
      destroyed = true;

      if (raf) {
        cancelAnimationFrame(raf);
      }

      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      ctx.clearRect(0, 0, size.w, size.h);

      nodeEls.forEach((element) => {
        if (element) {
          element.style.transform = "";
        }
      });
    },
  };
}
