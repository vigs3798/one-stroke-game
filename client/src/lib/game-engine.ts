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
}

// Generate edge ID consistently
export const getEdgeId = (a: number, b: number) => 
  `${Math.min(a, b)}-${Math.max(a, b)}`;

// Levels Configuration
export const LEVELS: LevelData[] = [
  {
    id: 1,
    nodes: [
      { id: 0, x: 100, y: 300 },
      { id: 1, x: 300, y: 100 },
      { id: 2, x: 500, y: 300 },
      { id: 3, x: 300, y: 500 },
      { id: 4, x: 300, y: 300 },
    ],
    edges: [[0,1], [1,2], [2,3], [3,0], [0,4], [1,4], [2,4], [3,4]],
  },
  {
    id: 2, // The House (Euler path classic)
    nodes: [
      { id: 0, x: 200, y: 400 }, // bottom left
      { id: 1, x: 400, y: 400 }, // bottom right
      { id: 2, x: 400, y: 200 }, // top right
      { id: 3, x: 200, y: 200 }, // top left
      { id: 4, x: 300, y: 100 }, // roof tip
    ],
    edges: [[0,1], [1,2], [2,3], [3,0], [2,4], [3,4], [0,2], [1,3]], // Cross in middle too
  },
  {
    id: 3, // The Bowtie
    nodes: [
      { id: 0, x: 100, y: 150 },
      { id: 1, x: 100, y: 450 },
      { id: 2, x: 300, y: 300 }, // center
      { id: 3, x: 500, y: 150 },
      { id: 4, x: 500, y: 450 },
    ],
    edges: [[0,1], [0,2], [1,2], [2,3], [2,4], [3,4]],
  },
  {
    id: 4, // Star
    nodes: [
      { id: 0, x: 300, y: 100 },
      { id: 1, x: 490, y: 240 },
      { id: 2, x: 420, y: 460 },
      { id: 3, x: 180, y: 460 },
      { id: 4, x: 110, y: 240 },
    ],
    edges: [[0,2], [0,3], [1,3], [1,4], [2,4]],
  },
  {
    id: 5, // Envelope with flap
    nodes: [
      { id: 0, x: 150, y: 400 },
      { id: 1, x: 450, y: 400 },
      { id: 2, x: 450, y: 200 },
      { id: 3, x: 150, y: 200 },
      { id: 4, x: 300, y: 100 }, // flap
      { id: 5, x: 300, y: 300 }, // center cross
    ],
    edges: [[0,1], [1,2], [2,3], [3,0], [3,4], [2,4], [0,5], [2,5], [1,5], [3,5]],
  },
  {
    id: 6, // Hexa-web
    nodes: [
      { id: 0, x: 300, y: 300 }, // center
      { id: 1, x: 300, y: 100 },
      { id: 2, x: 473, y: 200 },
      { id: 3, x: 473, y: 400 },
      { id: 4, x: 300, y: 500 },
      { id: 5, x: 127, y: 400 },
      { id: 6, x: 127, y: 200 },
    ],
    edges: [
      [1,2], [2,3], [3,4], [4,5], [5,6], [6,1], // outer ring
      [0,1], [0,2], [0,3], [0,4], [0,5], [0,6]  // spokes
    ]
  },
  {
    id: 7, // Double House
    nodes: [
      { id: 0, x: 100, y: 300 },
      { id: 1, x: 200, y: 200 },
      { id: 2, x: 200, y: 400 },
      { id: 3, x: 300, y: 300 }, // middle join
      { id: 4, x: 400, y: 200 },
      { id: 5, x: 400, y: 400 },
      { id: 6, x: 500, y: 300 },
    ],
    edges: [
      [0,1], [0,2], [1,3], [2,3], [1,2], // left house
      [3,4], [3,5], [4,6], [5,6], [4,5]  // right house
    ]
  },
  {
    id: 8, // The Grid 3x3 (with diagonals)
    nodes: [
      { id: 0, x: 200, y: 200 }, { id: 1, x: 300, y: 200 }, { id: 2, x: 400, y: 200 },
      { id: 3, x: 200, y: 300 }, { id: 4, x: 300, y: 300 }, { id: 5, x: 400, y: 300 },
      { id: 6, x: 200, y: 400 }, { id: 7, x: 300, y: 400 }, { id: 8, x: 400, y: 400 },
    ],
    edges: [
      [0,1], [1,2], [3,4], [4,5], [6,7], [7,8], // horiz
      [0,3], [3,6], [1,4], [4,7], [2,5], [5,8], // vert
      [0,4], [4,8], [2,4], [4,6] // diagonals
    ]
  },
  {
    id: 9, // Complex Crystal
    nodes: [
      { id: 0, x: 300, y: 100 },
      { id: 1, x: 500, y: 250 },
      { id: 2, x: 400, y: 450 },
      { id: 3, x: 200, y: 450 },
      { id: 4, x: 100, y: 250 },
      { id: 5, x: 300, y: 250 }, // inner top
      { id: 6, x: 350, y: 350 }, // inner right
      { id: 7, x: 250, y: 350 }, // inner left
    ],
    edges: [
      [0,1], [1,2], [2,3], [3,4], [4,0], // outer pentagon
      [0,5], [1,5], [1,6], [2,6], [3,7], [2,7], [4,7], [4,5],
      [5,6], [6,7], [7,5] // inner triangle
    ]
  },
  {
    id: 10, // The Final Boss - K5 complete graph (impossible unless modified, so we remove one edge to make it Euler path possible)
    nodes: [
      { id: 0, x: 300, y: 100 },
      { id: 1, x: 490, y: 240 },
      { id: 2, x: 420, y: 460 },
      { id: 3, x: 180, y: 460 },
      { id: 4, x: 110, y: 240 },
    ],
    // K5 has 10 edges. All degrees 4. Euler circuit exists.
    // Let's make it slightly harder by adding a tail.
    edges: [
      [0,1], [0,2], [0,3], [0,4],
      [1,2], [1,3], [1,4],
      [2,3], [2,4],
      [3,4]
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
