export interface Point {
  t: number;
  x: number; // meters
  y: number; // meters
  vx?: number; // m/s
  vy?: number; // m/s
  canvasX: number;
  canvasY: number;
}

export interface RegressionResult {
  type: 'linear' | 'quad';
  m?: number;
  b: number;
  a?: number;
  c?: number;
  r2: number;
  fn: (x: number) => number;
  text: string;
}

export interface ScaleBarConfig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lengthMeters: number;
  label: string;
  orientation: 'horizontal' | 'vertical';
}

export interface KinematicScenarioConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  duration: number; // in seconds
  scaleBar: ScaleBarConfig;
  origin: { x: number; y: number }; // canvas pixel coordinates of origin
  metersPerPixel: number;
  initialState: {
    x0: number; // initial x in meters relative to origin
    y0: number; // initial y in meters relative to origin
    vx0: number; // m/s
    vy0: number; // m/s
    ax: number; // m/s^2
    ay: number; // m/s^2
  };
  objectVisual: {
    type: 'glider' | 'sphere' | 'cart' | 'projectile';
    color: string;
    label: string;
    radius: number;
  };
  apparatusType: 'air_track' | 'drop_tower' | 'incline_ramp' | 'projectile_launcher';
}

/**
 * Calculates linear regression y = mx + b.
 */
export function calculateLinearRegression(data: { x: number; y: number }[]): RegressionResult | null {
  if (data.length < 3) return null;
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of data) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return null;

  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;

  const yMean = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (const p of data) {
    ssTot += Math.pow(p.y - yMean, 2);
    ssRes += Math.pow(p.y - (m * p.x + b), 2);
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return {
    type: 'linear',
    m,
    b,
    r2,
    fn: (x: number) => m * x + b,
    text: `y = ${m.toFixed(3)}t + ${b.toFixed(3)}`,
  };
}

/**
 * Calculates quadratic regression y = a*x^2 + b*x + c via Cramer's rule.
 */
export function calculateQuadraticRegression(data: { x: number; y: number }[]): RegressionResult | null {
  if (data.length < 3) return null;
  const n = data.length;
  let s1 = 0, s2 = 0, s3 = 0, s4 = 0, sy = 0, sxy = 0, sx2y = 0;
  for (const p of data) {
    const x = p.x;
    const y = p.y;
    s1 += x;
    s2 += x * x;
    s3 += x * x * x;
    s4 += x * x * x * x;
    sy += y;
    sxy += x * y;
    sx2y += x * x * y;
  }

  const calcDet = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

  const detMain = calcDet([
    [s4, s3, s2],
    [s3, s2, s1],
    [s2, s1, n],
  ]);

  if (Math.abs(detMain) < 1e-12) return null;

  const a = calcDet([
    [sx2y, s3, s2],
    [sxy, s2, s1],
    [sy, s1, n],
  ]) / detMain;

  const b = calcDet([
    [s4, sx2y, s2],
    [s3, sxy, s1],
    [s2, sy, n],
  ]) / detMain;

  const c = calcDet([
    [s4, s3, sx2y],
    [s3, s2, sxy],
    [s2, s1, sy],
  ]) / detMain;

  const yMean = sy / n;
  let ssTot = 0, ssRes = 0;
  for (const p of data) {
    ssTot += Math.pow(p.y - yMean, 2);
    ssRes += Math.pow(p.y - (a * p.x * p.x + b * p.x + c), 2);
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return {
    type: 'quad',
    a,
    b,
    c,
    r2,
    fn: (x: number) => a * x * x + b * x + c,
    text: `y = ${a.toFixed(3)}t² + ${b.toFixed(3)}t + ${c.toFixed(3)}`,
  };
}

/**
 * Wrapper for regression calculations based on fit type.
 */
export function calculateRegression(data: { x: number; y: number }[], type: string): RegressionResult | null {
  if (type === 'linear') return calculateLinearRegression(data);
  if (type === 'quad') return calculateQuadraticRegression(data);
  return null;
}

/**
 * Computes exact physical kinematics and canvas pixel coordinates at time t.
 */
export function computeKinematicPosition(scenario: KinematicScenarioConfig, t: number) {
  const clampedT = Math.max(0, Math.min(scenario.duration, t));
  const { x0, y0, vx0, vy0, ax, ay } = scenario.initialState;

  const x = x0 + vx0 * clampedT + 0.5 * ax * clampedT * clampedT;
  const y = y0 + vy0 * clampedT + 0.5 * ay * clampedT * clampedT;
  const vx = vx0 + ax * clampedT;
  const vy = vy0 + ay * clampedT;

  // Convert meters to canvas pixels (canvas Y is inverted: y-up means -canvasY)
  const canvasX = scenario.origin.x + x / scenario.metersPerPixel;
  const canvasY = scenario.origin.y - y / scenario.metersPerPixel;

  return { t: clampedT, x, y, vx, vy, canvasX, canvasY };
}

/**
 * Generates an array of ground-truth tracked points for a scenario sampled at stepTime.
 */
export function generateGroundTruthPoints(scenario: KinematicScenarioConfig, stepTime = 0.04): Point[] {
  const points: Point[] = [];
  const totalFrames = Math.floor(scenario.duration / stepTime);

  for (let i = 0; i <= totalFrames; i++) {
    const t = Number((i * stepTime).toFixed(4));
    const state = computeKinematicPosition(scenario, t);

    const point: Point = {
      t: state.t,
      x: Number(state.x.toFixed(4)),
      y: Number(state.y.toFixed(4)),
      vx: Number(state.vx.toFixed(4)),
      vy: Number(state.vy.toFixed(4)),
      canvasX: Number(state.canvasX.toFixed(2)),
      canvasY: Number(state.canvasY.toFixed(2)),
    };
    points.push(point);
  }
  return points;
}

/**
 * Renders the synthetic physics laboratory apparatus and moving object onto a 2D canvas context.
 */
export function drawKinematicScenario(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scenario: KinematicScenarioConfig,
  currentTime: number
) {
  // 1. Background Lab Environment
  ctx.save();
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(0, 0, width, height);

  // Subtle grid lines (50px spacing)
  ctx.strokeStyle = '#1e293b'; // slate-800
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Specific Apparatus Graphics
  if (scenario.apparatusType === 'air_track') {
    // Air track rail
    ctx.fillStyle = '#334155'; // slate-700 rail
    ctx.fillRect(40, 270, width - 80, 24);
    ctx.fillStyle = '#64748b'; // metal top plate
    ctx.fillRect(40, 268, width - 80, 4);

    // Track support legs
    ctx.fillStyle = '#475569';
    ctx.fillRect(80, 294, 20, 60);
    ctx.fillRect(width - 100, 294, 20, 60);

    // Air holes on track
    ctx.fillStyle = '#0f172a';
    for (let hx = 60; hx < width - 60; hx += 20) {
      ctx.beginPath();
      ctx.arc(hx, 282, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (scenario.apparatusType === 'drop_tower') {
    // Vertical drop rail
    ctx.fillStyle = '#334155';
    ctx.fillRect(scenario.origin.x - 30, 40, 60, height - 70);
    ctx.fillStyle = '#475569';
    ctx.fillRect(scenario.origin.x - 24, 40, 48, height - 70);

    // Electromagnet release mechanism at top
    ctx.fillStyle = '#ef4444'; // red magnet housing
    ctx.fillRect(scenario.origin.x - 20, 36, 40, 24);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(scenario.origin.x - 12, 60, 24, 8);

    // Safety foam catch cushion at bottom
    ctx.fillStyle = '#10b981';
    ctx.fillRect(scenario.origin.x - 45, height - 45, 90, 25);
  } else if (scenario.apparatusType === 'incline_ramp') {
    // Incline ramp wedge
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(60, 100);
    ctx.lineTo(width - 60, 360);
    ctx.lineTo(60, 360);
    ctx.closePath();
    ctx.fill();

    // Smooth rail surface on slope
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(56, 96);
    ctx.lineTo(width - 56, 356);
    ctx.stroke();
  } else if (scenario.apparatusType === 'projectile_launcher') {
    // Launcher base and ground
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, height - 60, width - 80, 20);

    // Launch pedestal
    ctx.fillStyle = '#475569';
    ctx.fillRect(scenario.origin.x - 15, scenario.origin.y, 30, height - 60 - scenario.origin.y);

    // Spring launcher cannon barrel
    ctx.save();
    ctx.translate(scenario.origin.x, scenario.origin.y);
    ctx.rotate(-Math.PI / 4); // 45 degree angle
    ctx.fillStyle = '#0ea5e9'; // cyan barrel
    ctx.fillRect(-10, -25, 20, 40);
    ctx.restore();
  }

  // 3. Calibration Reference Meter Stick
  const { scaleBar } = scenario;
  ctx.save();
  if (scaleBar.orientation === 'horizontal') {
    const lenPx = Math.abs(scaleBar.x2 - scaleBar.x1);
    const startX = Math.min(scaleBar.x1, scaleBar.x2);
    const yPos = scaleBar.y1;

    // Outer border
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.fillRect(startX, yPos - 6, lenPx, 12);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(startX, yPos - 6, lenPx, 12);

    // Decimeter alternating stripes
    const decimeterCount = 10;
    const dmWidth = lenPx / decimeterCount;
    for (let i = 0; i < decimeterCount; i++) {
      if (i % 2 === 1) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(startX + i * dmWidth, yPos - 6, dmWidth, 12);
      }
    }

    // End caps and label
    ctx.fillStyle = '#38bdf8'; // sky-400 label
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`📏 ${scaleBar.label} (${scaleBar.lengthMeters.toFixed(2)} m)`, startX + lenPx / 2, yPos - 12);

    // Reference tick markers at both ends
    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBar.x1, scaleBar.y1 - 14);
    ctx.lineTo(scaleBar.x1, scaleBar.y1 + 14);
    ctx.moveTo(scaleBar.x2, scaleBar.y2 - 14);
    ctx.lineTo(scaleBar.x2, scaleBar.y2 + 14);
    ctx.stroke();
  } else {
    // Vertical meter stick
    const lenPx = Math.abs(scaleBar.y2 - scaleBar.y1);
    const startY = Math.min(scaleBar.y1, scaleBar.y2);
    const xPos = scaleBar.x1;

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(xPos - 6, startY, 12, lenPx);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xPos - 6, startY, 12, lenPx);

    const dmHeight = lenPx / 10;
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 1) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(xPos - 6, startY + i * dmHeight, 12, dmHeight);
      }
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`📏 ${scaleBar.label}`, xPos + 14, startY + lenPx / 2);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBar.x1 - 14, scaleBar.y1);
    ctx.lineTo(scaleBar.x1 + 14, scaleBar.y1);
    ctx.moveTo(scaleBar.x2 - 14, scaleBar.y2);
    ctx.lineTo(scaleBar.x2 + 14, scaleBar.y2);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Moving Object at Current Time
  const state = computeKinematicPosition(scenario, currentTime);
  ctx.save();
  ctx.translate(state.canvasX, state.canvasY);

  const { objectVisual } = scenario;
  if (objectVisual.type === 'glider') {
    // Glider body
    ctx.fillStyle = objectVisual.color;
    ctx.beginPath();
    ctx.roundRect(-22, -14, 44, 28, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // High-visibility target crosshair on glider center
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else if (objectVisual.type === 'sphere') {
    // Steel sphere with 3D radial shine
    const gradient = ctx.createRadialGradient(-4, -4, 2, 0, 0, objectVisual.radius);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, objectVisual.color);
    gradient.addColorStop(1, '#0f172a');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, objectVisual.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tracking crosshair
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (objectVisual.type === 'cart') {
    // Dynamics cart
    ctx.fillStyle = objectVisual.color;
    ctx.beginPath();
    ctx.roundRect(-20, -10, 40, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-12, 10, 5, 0, Math.PI * 2);
    ctx.arc(12, 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Target bullseye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Projectile
    ctx.fillStyle = objectVisual.color;
    ctx.beginPath();
    ctx.arc(0, 0, objectVisual.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // 5. Time HUD Overlay
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(width - 170, 15, 155, 48);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 170, 15, 155, 48);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('VIDEO TIME:', width - 160, 32);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`${currentTime.toFixed(2)}s / ${scenario.duration.toFixed(2)}s`, width - 160, 52);
  ctx.restore();

  ctx.restore();
}

/**
 * Evaluates student tracking points and regressions against pedagogical kinematic targets.
 */
export function verifyKinematicChallenge(
  challengeId: string,
  points: Point[],
  _metersPerPixel: number
): { success: boolean; message: string } {
  if (points.length < 6) {
    return {
      success: false,
      message: `You have recorded ${points.length} points. Track at least 6 to 8 frames across the motion to establish an accurate kinematic trend.`,
    };
  }

  // Ensure points are sorted by time
  const sorted = [...points].sort((a, b) => a.t - b.t);
  const totalDt = sorted[sorted.length - 1].t - sorted[0].t;
  if (totalDt < 0.25) {
    return {
      success: false,
      message: `Tracked timespan is only ${totalDt.toFixed(2)}s. Track across more of the video to analyze the object's full motion.`,
    };
  }

  const xData = sorted.map(p => ({ x: p.t, y: p.x }));
  const yData = sorted.map(p => ({ x: p.t, y: p.y }));
  const vxData = sorted.filter(p => p.vx !== undefined).map(p => ({ x: p.t, y: p.vx! }));
  const vyData = sorted.filter(p => p.vy !== undefined).map(p => ({ x: p.t, y: p.vy! }));

  const linX = calculateLinearRegression(xData);
  const quadX = calculateQuadraticRegression(xData);
  const _linY = calculateLinearRegression(yData);
  const quadY = calculateQuadraticRegression(yData);
  const linVx = calculateLinearRegression(vxData);
  const linVy = calculateLinearRegression(vyData);

  // Challenge 1: Constant Velocity Glider
  if (challengeId === 'glider_const_v') {
    const vxVal = linX?.m ?? 0;
    const axVal = quadX?.a ? quadX.a * 2 : (linVx?.m ?? 0);

    // Target: vx = 1.50 m/s (tolerance ±0.20), ax near 0 (|ax| <= 0.35)
    if (vxVal < 1.30 || vxVal > 1.70) {
      return {
        success: false,
        message: `Measured horizontal velocity is ${vxVal.toFixed(2)} m/s (Target: 1.50 m/s). Verify your 1.0 m calibration scale and click the glider's center consistently.`,
      };
    }
    if (Math.abs(axVal) > 0.40) {
      return {
        success: false,
        message: `Detected acceleration of ${axVal.toFixed(2)} m/s². An air-track glider moves with zero acceleration. Make sure your calibration ruler is locked correctly.`,
      };
    }
    return {
      success: true,
      message: `Measured horizontal velocity is ${vxVal.toFixed(2)} m/s (Target: 1.50 m/s) with near-zero acceleration (${axVal.toFixed(2)} m/s²). Linear displacement confirms uniform motion.`,
    };
  }

  // Challenge 2: Free Fall Gravitational Pull
  if (challengeId === 'free_fall_g') {
    // In y(t) = a*t^2 + b*t + c, vertical acceleration is 2*a
    const ayFromY = quadY?.a ? quadY.a * 2 : 0;
    const ayFromVy = linVy?.m ?? 0;
    const ayVal = ayFromY !== 0 ? ayFromY : ayFromVy;

    const totalDy = Math.abs(sorted[sorted.length - 1].y - sorted[0].y);
    const _avgVx = xData.reduce((acc, p) => acc + p.y, 0) / xData.length;

    // Check vertical acceleration: target -9.8 m/s^2 (window -11.0 to -8.6 m/s^2)
    if (ayVal > -8.6 || ayVal < -11.2) {
      return {
        success: false,
        message: `Measured vertical acceleration is ${ayVal.toFixed(2)} m/s² (Target: -9.80 m/s²). Check that your vertical 1.0 m calibration ruler is accurate and origin is at the drop point.`,
      };
    }
    if (totalDy < 1.0) {
      return {
        success: false,
        message: `Total vertical descent tracked is ${totalDy.toFixed(2)} m. Continue tracking through the fall (at least 1.0 m of vertical displacement).`,
      };
    }
    return {
      success: true,
      message: `Determined gravitational acceleration of ${ayVal.toFixed(2)} m/s² (Earth standard: -9.80 m/s²). The parabolic y-t curve confirms constant downward acceleration.`,
    };
  }

  // Challenge 3: Ramp Acceleration & Displacement
  if (challengeId === 'ramp_accel') {
    // In x(t) = a*t^2 + b*t + c, ax = 2*a
    const axVal = quadX?.a ? quadX.a * 2 : (linVx?.m ?? 0);
    const totalDx = Math.abs(sorted[sorted.length - 1].x - sorted[0].x);

    // Target ax = 2.00 m/s^2 (window 1.70 to 2.30 m/s^2), displacement >= 1.8 m
    if (axVal < 1.70 || axVal > 2.35) {
      return {
        success: false,
        message: `Measured acceleration is ${axVal.toFixed(2)} m/s² (Target: 2.00 m/s²). Check the calibration scale along the ramp and tracking clicks.`,
      };
    }
    if (totalDx < 1.75) {
      return {
        success: false,
        message: `Total displacement tracked is ${totalDx.toFixed(2)} m (Target: ≥ 2.0 m). Track additional frames down the incline.`,
      };
    }
    return {
      success: true,
      message: `Measured acceleration is ${axVal.toFixed(2)} m/s² across ${totalDx.toFixed(2)} m of displacement. Linear velocity growth confirms uniform acceleration.`,
    };
  }

  // Challenge 4: 2D Projectile Independence
  if (challengeId === 'projectile_2d') {
    const vxVal = linX?.m ?? 0;
    const axVal = quadX?.a ? quadX.a * 2 : 0;
    const ayVal = quadY?.a ? quadY.a * 2 : (linVy?.m ?? 0);
    const maxY = Math.max(...sorted.map(p => p.y));

    // Target: vx ≈ 3.0 m/s (2.6 - 3.4), ax ≈ 0 (|ax| <= 0.4), ay ≈ -9.8 (-11.2 to -8.5), maxY >= 0.65 m
    if (vxVal < 2.5 || vxVal > 3.5) {
      return {
        success: false,
        message: `Horizontal velocity is ${vxVal.toFixed(2)} m/s (Target: 3.00 m/s). Re-check your 1.0 m horizontal calibration bar.`,
      };
    }
    if (Math.abs(axVal) > 0.50) {
      return {
        success: false,
        message: `Horizontal motion shows acceleration of ${axVal.toFixed(2)} m/s². In projectile motion, horizontal velocity must remain constant.`,
      };
    }
    if (ayVal > -8.4 || ayVal < -11.4) {
      return {
        success: false,
        message: `Vertical acceleration is ${ayVal.toFixed(2)} m/s² (Target: -9.80 m/s²). Vertical motion must follow gravitational free fall.`,
      };
    }
    if (maxY < 0.60) {
      return {
        success: false,
        message: `Peak projectile height is only ${maxY.toFixed(2)} m. Track through the apex of the parabolic trajectory.`,
      };
    }
    return {
      success: true,
      message: `Demonstrated 2D independence: constant horizontal velocity vx = ${vxVal.toFixed(2)} m/s simultaneously coupled with vertical free-fall acceleration ay = ${ayVal.toFixed(2)} m/s².`,
    };
  }

  return { success: false, message: 'Unknown kinematic challenge ID.' };
}
