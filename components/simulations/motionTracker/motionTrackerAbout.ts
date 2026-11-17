import { SimulationAboutContent } from '../shared/AboutPanel';

export const MOTION_TRACKER_ABOUT: SimulationAboutContent = {
  title: 'Kinematics Video Motion Tracker',
  summary:
    'Calibrate a reference scale, track an object frame-by-frame, and use position and velocity graphs to measure speed and acceleration.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Video / Simulation Canvas:</strong> The main viewport where video frames or simulated physics scenarios are rendered. Crosshairs track clicked points over time.',
        '<strong>Calibration Reference Bar:</strong> A striped yellow and black decimeter bar of known length (e.g. 1.00 m) used to convert canvas pixels into real-world meters.',
        '<strong>Coordinate Origin Crosshair:</strong> A cyan crosshair marking (0, 0) in meters. Displacements right are positive x; displacements upward are positive y.',
        '<strong>Kinematic Data Graphs:</strong> Four real-time Recharts displays tracking x-Position vs. Time, y-Position vs. Time, x-Velocity vs. Time, and y-Velocity vs. Time.',
        '<strong>Tracked Points Overlay:</strong> Red dots marking your recorded object positions at each frame timestamp.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Step 1: Ruler (Calibration):</strong> Click and drag between the ends of the reference bar, enter the real distance in meters, and click Lock.',
        '<strong>Step 2: Origin:</strong> Click anywhere on the video canvas to place the (0, 0) axes for all measurements.',
        '<strong>Step 3: Track Motion:</strong> Click directly on the moving object. The tracker records position, computes velocity, and advances the frame automatically.',
        '<strong>Playback & Scrubbing:</strong> Use Play/Pause, Undo (Z key), or Skip Frame (X key) to step forward and backward.',
        '<strong>Regression Models:</strong> Choose "Linear Fit" (y = mt + b) to measure steady velocity or "Quadratic Fit" (y = at² + bt + c) to measure acceleration (a = 2 · coefficient).',
        '<strong>Export Data:</strong> Export tracked kinematics to CSV spreadsheet format or download publication-grade PNG graph charts.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Measure Constant Velocity:</strong> In the Air-Track Glider scenario, calibrate the 1.0 m track, set the origin at the start, and track 10 frames. Notice how the x-vs-t slope remains perfectly straight with zero acceleration.',
        '<strong>Confirm Earth Gravity (-9.8 m/s²):</strong> In the Free Fall Drop scenario, place the origin at the top magnet and track the falling sphere. Apply a Quadratic Fit to y-vs-t to confirm the quadratic coefficient is near -4.9 (giving ay = -9.8 m/s²).',
        '<strong>Analyze Incline Acceleration:</strong> Track the dynamics cart down the ramp. Apply a Linear Fit to x-Velocity vs. Time to observe how the velocity slope directly yields acceleration.',
        '<strong>Prove Independence of 2D Motion:</strong> Track a two-dimensional projectile arc. Compare x-vs-t (constant speed) against y-vs-t (parabolic curve). Notice that horizontal motion does not alter vertical downward acceleration.',
        '<strong>Test Intentional Miscalibration:</strong> Enter 0.5 m instead of 1.0 m during calibration. Observe how all measured velocities and accelerations halve, showing why scale reference matters in real experiments.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Position & Displacement:</strong> The location of an object relative to a chosen reference frame origin. Displacement (Δx, Δy) represents change in position over time.',
        '<strong>Average vs. Instantaneous Velocity:</strong> Velocity is the time rate of change of position (v = Δx / Δt). On an x-t graph, the slope represents velocity.',
        '<strong>Uniform Acceleration:</strong> When velocity changes at a constant rate (a = Δv / Δt). Under uniform acceleration, position grows quadratically: y(t) = y₀ + v₀t + ½at².',
        '<strong>Independence of Perpendicular Motions:</strong> In two-dimensional kinematics, horizontal motion (ax = 0) and vertical motion (ay = -g) operate independently with time (t) as the shared bridge.',
        '<strong>Experimental Calibration:</strong> Optical tracking requires an in-frame spatial reference to convert camera pixels to SI units (meters/pixel = L_real / L_pixels).',
      ],
    },
  ],
};
