// Daily challenge puzzles - 14 pre-loaded challenges
// These rotate on a 14-day cycle

export const DAILY_CHALLENGES = [
  {
    id: 'dc1', name: 'Dawn Shift',
    gridSize: 6,
    source: { row: 0, col: 0, direction: 0 },
    crystal: { row: 5, col: 5 },
    fixed: [],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 5, col: 0 },
      { id: 'm2', type: 'movable-mirror-backward', row: 5, col: 1 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 50,
  },
  {
    id: 'dc2', name: 'Neon Twist',
    gridSize: 6,
    source: { row: 3, col: 0, direction: 0 },
    crystal: { row: 0, col: 3 },
    fixed: [{ id: 'b1', type: 'blocker', row: 3, col: 3 }],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 5, col: 0 },
      { id: 'm2', type: 'movable-mirror-forward', row: 5, col: 1 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 50,
  },
  {
    id: 'dc3', name: 'Prism Break',
    gridSize: 7,
    source: { row: 0, col: 6, direction: 2 },
    crystal: { row: 6, col: 0 },
    fixed: [],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 3, col: 3 },
      { id: 'm2', type: 'movable-mirror-forward', row: 4, col: 4 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 60,
  },
  {
    id: 'dc4', name: 'Shadow Lane',
    gridSize: 6,
    source: { row: 0, col: 0, direction: 1 },
    crystal: { row: 5, col: 5 },
    fixed: [{ id: 'b1', type: 'blocker', row: 3, col: 0 }],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 5, col: 0 },
      { id: 'm2', type: 'movable-mirror-backward', row: 5, col: 1 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 60,
  },
  {
    id: 'dc5', name: 'Light Bend',
    gridSize: 7,
    source: { row: 6, col: 0, direction: 3 },
    crystal: { row: 0, col: 6 },
    fixed: [],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 3, col: 3 },
      { id: 'm2', type: 'movable-mirror-forward', row: 4, col: 4 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 70,
  },
  {
    id: 'dc6', name: 'Reflex Arc',
    gridSize: 6,
    source: { row: 0, col: 5, direction: 1 },
    crystal: { row: 5, col: 0 },
    fixed: [{ id: 'b1', type: 'blocker', row: 3, col: 5 }],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 5, col: 3 },
      { id: 'm2', type: 'movable-mirror-forward', row: 5, col: 4 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 70,
  },
  {
    id: 'dc7', name: 'Grid Lock',
    gridSize: 7,
    source: { row: 3, col: 0, direction: 0 },
    crystal: { row: 3, col: 6 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 3, col: 3 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 6, col: 0 },
      { id: 'm2', type: 'movable-mirror-backward', row: 6, col: 1 },
      { id: 'm3', type: 'movable-mirror-forward', row: 6, col: 2 },
    ],
    moveLimit: 6, optimalMoves: 3, perfectMoves: 3,
    coinReward: 80,
  },
  {
    id: 'dc8', name: 'Neon Maze',
    gridSize: 7,
    source: { row: 0, col: 0, direction: 0 },
    crystal: { row: 6, col: 6 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 0, col: 4 },
      { id: 'b2', type: 'blocker', row: 4, col: 0 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 5, col: 3 },
      { id: 'm2', type: 'movable-mirror-backward', row: 5, col: 4 },
      { id: 'm3', type: 'movable-mirror-backward', row: 5, col: 5 },
    ],
    moveLimit: 6, optimalMoves: 3, perfectMoves: 3,
    coinReward: 80,
  },
  {
    id: 'dc9', name: 'Phantom',
    gridSize: 7,
    source: { row: 6, col: 6, direction: 3 },
    crystal: { row: 0, col: 0 },
    fixed: [],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 3, col: 3 },
      { id: 'm2', type: 'movable-mirror-backward', row: 4, col: 3 },
    ],
    moveLimit: 4, optimalMoves: 2, perfectMoves: 2,
    coinReward: 90,
  },
  {
    id: 'dc10', name: 'Circuit',
    gridSize: 7,
    source: { row: 0, col: 3, direction: 1 },
    crystal: { row: 6, col: 3 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 3, col: 3 },
      { id: 'b2', type: 'blocker', row: 3, col: 0 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 5, col: 1 },
      { id: 'm2', type: 'movable-mirror-forward', row: 5, col: 2 },
      { id: 'm3', type: 'movable-mirror-backward', row: 5, col: 3 },
    ],
    moveLimit: 6, optimalMoves: 3, perfectMoves: 3,
    coinReward: 90,
  },
  {
    id: 'dc11', name: 'Flux',
    gridSize: 7,
    source: { row: 0, col: 0, direction: 0 },
    crystal: { row: 0, col: 6 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 0, col: 3 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 3, col: 0 },
      { id: 'm2', type: 'movable-mirror-forward', row: 3, col: 1 },
      { id: 'm3', type: 'movable-mirror-backward', row: 4, col: 1 },
    ],
    moveLimit: 6, optimalMoves: 3, perfectMoves: 3,
    coinReward: 100,
  },
  {
    id: 'dc12', name: 'Omega',
    gridSize: 7,
    source: { row: 6, col: 0, direction: 0 },
    crystal: { row: 0, col: 6 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 6, col: 4 },
      { id: 'b2', type: 'blocker', row: 2, col: 4 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 3, col: 5 },
      { id: 'm2', type: 'movable-mirror-forward', row: 3, col: 6 },
      { id: 'm3', type: 'movable-mirror-backward', row: 4, col: 5 },
    ],
    moveLimit: 6, optimalMoves: 3, perfectMoves: 3,
    coinReward: 100,
  },
  {
    id: 'dc13', name: 'Eclipse',
    gridSize: 7,
    source: { row: 3, col: 6, direction: 2 },
    crystal: { row: 3, col: 0 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 3, col: 3 },
      { id: 'b2', type: 'blocker', row: 0, col: 3 },
      { id: 'b3', type: 'blocker', row: 6, col: 3 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-forward', row: 6, col: 0 },
      { id: 'm2', type: 'movable-mirror-backward', row: 6, col: 1 },
      { id: 'm3', type: 'movable-mirror-forward', row: 5, col: 0 },
      { id: 'm4', type: 'movable-mirror-backward', row: 5, col: 1 },
    ],
    moveLimit: 7, optimalMoves: 4, perfectMoves: 4,
    coinReward: 120,
  },
  {
    id: 'dc14', name: 'Supernova',
    gridSize: 7,
    source: { row: 0, col: 0, direction: 0 },
    crystal: { row: 6, col: 0 },
    fixed: [
      { id: 'b1', type: 'blocker', row: 0, col: 4 },
      { id: 'b2', type: 'blocker', row: 3, col: 0 },
      { id: 'b3', type: 'blocker', row: 6, col: 4 },
    ],
    movable: [
      { id: 'm1', type: 'movable-mirror-backward', row: 5, col: 5 },
      { id: 'm2', type: 'movable-mirror-forward', row: 5, col: 6 },
      { id: 'm3', type: 'movable-mirror-backward', row: 4, col: 6 },
      { id: 'm4', type: 'movable-mirror-forward', row: 4, col: 5 },
    ],
    moveLimit: 7, optimalMoves: 4, perfectMoves: 4,
    coinReward: 150,
  },
];

export function getTodaysChallenge() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
}

export function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow - now;
}
