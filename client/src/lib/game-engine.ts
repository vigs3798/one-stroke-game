// Game Logic & Data Structures

export interface Point {
  x: number;
  y: number;
}

export interface Node extends Point {
  id: number;
  degree?: number; // Calculated at runtime
}

export interface Edge {
  id: string; // usually "min-max" of node IDs
  source: number;
  target: number;
  used: boolean;
}

export interface LevelData {
  id: number;
  nodes: Node[];
  edges: [number, number][]; // Simple tuple definition for config
  startNodes?: number[]; // If restricted
  timeLimit: number; // in seconds
}

// Generate edge ID consistently
export const getEdgeId = (a: number, b: number) =>
  `${Math.min(a, b)}-${Math.max(a, b)}`;

// Levels Configuration
export const LEVELS: LevelData[] = [
  {
    id: 1, // Square with Cross (Solvable Circuit)
    timeLimit: 50,
    nodes: [
      { id: 0, x: 200, y: 400 }, { id: 1, x: 400, y: 400 },
      { id: 2, x: 400, y: 200 }, { id: 3, x: 200, y: 200 },
      { id: 4, x: 300, y: 340 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [0, 2], [1, 3]],
  },
  {
    id: 2, // Solvable House
    timeLimit: 45,
    nodes: [
      { id: 0, x: 200, y: 400 }, { id: 1, x: 400, y: 400 },
      { id: 2, x: 400, y: 200 }, { id: 3, x: 200, y: 200 },
      { id: 4, x: 300, y: 100 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [2, 4], [3, 4]],
  },
  {
    id: 3, // Butterfly Plus
    timeLimit: 40,
    nodes: [
      { id: 0, x: 150, y: 300 }, { id: 1, x: 150, y: 450 },
      { id: 2, x: 300, y: 300 }, // Hub
      { id: 3, x: 450, y: 300 }, { id: 4, x: 450, y: 450 },
      { id: 5, x: 300, y: 150 },
    ],
    edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2], [0, 5], [5, 2]],
  },
  {
    id: 4, // Pentagram Star (Circuit)
    timeLimit: 35,
    nodes: [
      { id: 0, x: 300, y: 100 }, { id: 1, x: 500, y: 240 },
      { id: 2, x: 450, y: 460 }, { id: 3, x: 150, y: 460 },
      { id: 4, x: 100, y: 240 },
    ],
    edges: [[0, 2], [2, 4], [4, 1], [1, 3], [3, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  {
    id: 5, // Diamond Web
    timeLimit: 30,
    nodes: [
      { id: 0, x: 300, y: 100 }, { id: 1, x: 500, y: 300 },
      { id: 2, x: 300, y: 500 }, { id: 3, x: 100, y: 300 },
      { id: 4, x: 300, y: 200 }, { id: 5, x: 300, y: 400 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5], [5, 2], [4, 1], [4, 3], [5, 1], [5, 3]],
  },
  {
    id: 6, // Hexagon Web (Solvable)
    timeLimit: 25,
    nodes: [
      { id: 0, x: 300, y: 100 }, { id: 1, x: 500, y: 200 },
      { id: 2, x: 500, y: 400 }, { id: 3, x: 300, y: 500 },
      { id: 4, x: 100, y: 400 }, { id: 5, x: 100, y: 200 },
      { id: 6, x: 320, y: 310 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [1, 6], [3, 6], [4, 6], [0, 3], [1, 4]],
  },
  {
    id: 7, // Hourglass Pro Plus
    timeLimit: 20,
    nodes: [
      { id: 0, x: 200, y: 100 }, { id: 1, x: 400, y: 100 },
      { id: 2, x: 300, y: 300 }, { id: 3, x: 200, y: 500 },
      { id: 4, x: 400, y: 500 }, { id: 5, x: 100, y: 100 },
      { id: 6, x: 500, y: 100 },
    ],
    edges: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2], [0, 5], [5, 2], [1, 6], [6, 2], [0, 3]],
  },
  {
    id: 8, // Intermediate Ribbon Loop
    timeLimit: 25,
    nodes: [
      { id: 0, x: 100, y: 300 }, { id: 1, x: 200, y: 200 },
      { id: 2, x: 300, y: 300 }, { id: 3, x: 400, y: 200 },
      { id: 4, x: 500, y: 300 }, { id: 5, x: 300, y: 100 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 3], [2, 5], [5, 1], [5, 3], [0, 2], [2, 4]],
  },
  {
    id: 9, // Complex Shield
    timeLimit: 20,
    nodes: [
      { id: 0, x: 300, y: 100 }, { id: 1, x: 500, y: 300 },
      { id: 2, x: 300, y: 500 }, { id: 3, x: 100, y: 300 },
      { id: 4, x: 300, y: 300 }, { id: 5, x: 200, y: 180 },
      { id: 6, x: 400, y: 180 },
    ],
    edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [0, 5], [5, 4], [0, 6], [6, 4]],
  },
  {
    id: 10, // Circular Network Finale
    timeLimit: 20,
    nodes: [
      { id: 0, x: 300, y: 100 }, { id: 1, x: 470, y: 200 },
      { id: 2, x: 470, y: 400 }, { id: 3, x: 300, y: 500 },
      { id: 4, x: 130, y: 400 }, { id: 5, x: 130, y: 200 },
      { id: 6, x: 330, y: 300 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [0, 3], [1, 4], [2, 5]
    ]
  }
];

export function hasEulerPath(nodes: Node[], edges: Edge[]): boolean {
  // A graph has an Euler path if 0 or 2 vertices have odd degree.
  const degrees = new Map<number, number>();
  nodes.forEach(n => degrees.set(n.id, 0));

  edges.forEach(e => {
    degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
    degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
  });

  let oddCount = 0;
  degrees.forEach(deg => {
    if (deg % 2 !== 0) oddCount++;
  });

  return oddCount === 0 || oddCount === 2;
}

export function getPossibleMoves(currentNodeId: number, edges: Edge[]): Edge[] {
  return edges.filter(e =>
    !e.used && (e.source === currentNodeId || e.target === currentNodeId)
  );
}
