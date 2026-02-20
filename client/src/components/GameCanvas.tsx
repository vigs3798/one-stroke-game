import React, { useRef, useEffect, useState, useCallback } from "react";
import { type LevelData, type Node, type Edge, getEdgeId, getPossibleMoves } from "@/lib/game-engine";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowRight, Home } from "lucide-react";
import { Button } from "./ui/button";

interface GameCanvasProps {
  level: LevelData;
  onComplete: () => void;
  onExit: () => void;
}

export function GameCanvas({ level, onComplete, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [currentNode, setCurrentNode] = useState<number | null>(null);
  const [pathHistory, setPathHistory] = useState<number[]>([]); // Sequence of node IDs
  const [isWon, setIsWon] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [cursorPos, setCursorPos] = useState<{x: number, y: number} | null>(null);

  // Initialize Level
  useEffect(() => {
    resetLevel();
  }, [level]);

  const resetLevel = useCallback(() => {
    // Deep copy nodes
    const initialNodes = level.nodes.map(n => ({ ...n }));
    
    // Create edges with used: false
    const initialEdges = level.edges.map(([a, b]) => ({
      id: getEdgeId(a, b),
      source: a,
      target: b,
      used: false
    }));

    // Calculate initial degrees
    const degrees = new Map<number, number>();
    initialEdges.forEach(e => {
      degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
      degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
    });
    initialNodes.forEach(n => n.degree = degrees.get(n.id) || 0);

    setNodes(initialNodes);
    setEdges(initialEdges);
    setCurrentNode(null);
    setPathHistory([]);
    setIsWon(false);
    setMessage("Select a starting node");
  }, [level]);

  // Check Win Condition
  useEffect(() => {
    if (edges.length > 0 && edges.every(e => e.used)) {
      setIsWon(true);
      setMessage("LEVEL COMPLETE!");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#d946ef'] // cyan, purple, magenta
      });
      setTimeout(onComplete, 1500);
    } else if (currentNode !== null) {
      // Check for softlock
      const possibleMoves = getPossibleMoves(currentNode, edges);
      if (possibleMoves.length === 0 && edges.some(e => !e.used)) {
        setMessage("DEAD END! Restart required.");
      } else {
        const remaining = edges.filter(e => !e.used).length;
        setMessage(`${remaining} edges remaining`);
      }
    }
  }, [edges, currentNode, onComplete]);

  // Canvas Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Resize handling
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
      
      // Scaling factor to fit 600x600 game logic into responsive canvas
      const scaleX = canvas.width / 600;
      const scaleY = canvas.height / 600;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% fit
      const offsetX = (canvas.width - 600 * scale) / 2;
      const offsetY = (canvas.height - 600 * scale) / 2;

      // Transform coordinate helper
      const t = (val: number) => val * scale;
      const tx = (x: number) => t(x) + offsetX;
      const ty = (y: number) => t(y) + offsetY;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Edges
      edges.forEach(edge => {
        const start = nodes.find(n => n.id === edge.source)!;
        const end = nodes.find(n => n.id === edge.target)!;

        ctx.beginPath();
        ctx.moveTo(tx(start.x), ty(start.y));
        ctx.lineTo(tx(end.x), ty(end.y));
        
        ctx.lineWidth = 4 * scale;
        if (edge.used) {
          ctx.strokeStyle = "#06b6d4"; // Primary Cyan
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#06b6d4";
        } else {
          ctx.strokeStyle = "#334155"; // Slate-700
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      });

      // 2. Draw Active Drag Line
      if (currentNode !== null && cursorPos && !isWon) {
        const startNode = nodes.find(n => n.id === currentNode)!;
        
        // Raw cursor pos needs to be relative to canvas, but we already have client coords in state
        // Let's just use the inverse transform of the node to get screen coords? 
        // Better: Use pre-calculated screen coords for the node
        const sx = tx(startNode.x);
        const sy = ty(startNode.y);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(cursorPos.x, cursorPos.y); // These are already canvas-relative
        ctx.strokeStyle = "rgba(6, 182, 212, 0.5)";
        ctx.lineWidth = 2 * scale;
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Nodes
      nodes.forEach(node => {
        const x = tx(node.x);
        const y = ty(node.y);
        const radius = 15 * scale;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (node.id === currentNode) {
          ctx.fillStyle = "#facc15"; // Yellow active
          ctx.shadowColor = "#facc15";
          ctx.shadowBlur = 15;
        } else if (pathHistory.includes(node.id)) {
          ctx.fillStyle = "#06b6d4"; // Visited/Cyan
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = "#1e293b"; // Dark Slate
          ctx.shadowBlur = 0;
        }
        
        ctx.fill();
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Degree Hint (optional, for debug/tutorial)
        // ctx.fillStyle = "white";
        // ctx.font = "12px sans-serif";
        // ctx.fillText(node.degree?.toString() || "", x - 4, y + 4);
      });

      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [nodes, edges, currentNode, cursorPos, isWon]);

  // Input Handling Helpers
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const getNodeAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    // Reverse transform to get game logic coords
    const scaleX = canvas.width / 600;
    const scaleY = canvas.height / 600;
    const scale = Math.min(scaleX, scaleY) * 0.9;
    const offsetX = (canvas.width - 600 * scale) / 2;
    const offsetY = (canvas.height - 600 * scale) / 2;

    const gameX = (x - offsetX) / scale;
    const gameY = (y - offsetY) / scale;

    // Hit radius tolerance
    const hitRadius = 30; 

    return nodes.find(n => {
      const dx = n.x - gameX;
      const dy = n.y - gameY;
      return Math.sqrt(dx*dx + dy*dy) < hitRadius;
    });
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isWon) return;
    const { x, y } = getCanvasCoords(e);
    const clickedNode = getNodeAt(x, y);

    if (clickedNode) {
      if (currentNode === null) {
        // First move - start anywhere (unless restricted by level)
        if (level.startNodes && !level.startNodes.includes(clickedNode.id)) {
          // Invalid start node
          setMessage("Invalid start node!");
          return;
        }
        setCurrentNode(clickedNode.id);
        setPathHistory([clickedNode.id]);
        setMessage("Drag to connect nodes");
      } else if (currentNode === clickedNode.id) {
        // Clicked self - do nothing
      } else {
        // Try to move to this node
        attemptMove(clickedNode.id);
      }
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isWon) return;
    const coords = getCanvasCoords(e);
    setCursorPos(coords);

    // Drag-over detection for smoother mobile play
    if (currentNode !== null) {
      const hoveredNode = getNodeAt(coords.x, coords.y);
      if (hoveredNode && hoveredNode.id !== currentNode) {
        attemptMove(hoveredNode.id);
      }
    }
  };

  const handleEnd = () => {
    setCursorPos(null);
  };

  const attemptMove = (targetId: number) => {
    if (currentNode === null) return;

    // Check if edge exists and is unused
    const edgeIndex = edges.findIndex(e => 
      !e.used && 
      ((e.source === currentNode && e.target === targetId) || 
       (e.source === targetId && e.target === currentNode))
    );

    if (edgeIndex !== -1) {
      // Valid move!
      const newEdges = [...edges];
      newEdges[edgeIndex].used = true;
      setEdges(newEdges);
      setCurrentNode(targetId);
      setPathHistory(prev => [...prev, targetId]);
    } else {
      // Invalid move visual feedback could go here
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full max-w-2xl mx-auto relative">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-4 px-4 bg-muted/30 rounded-lg p-2 backdrop-blur-sm border border-white/5">
        <Button variant="ghost" size="icon" onClick={onExit} className="hover:text-primary">
          <Home className="w-5 h-5" />
        </Button>
        <div className="text-xl font-display text-primary tracking-widest text-glow">
          {message}
        </div>
        <Button variant="ghost" size="icon" onClick={resetLevel} className="hover:text-primary">
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>

      {/* Game Board */}
      <div 
        ref={containerRef} 
        className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-[0_0_50px_-12px_rgba(6,182,212,0.2)]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="cursor-crosshair w-full h-full block touch-none select-none"
        />
        
        {/* Win Overlay */}
        <AnimatePresence>
          {isWon && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10"
            >
              <h2 className="text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-6 drop-shadow-2xl">
                COMPLETE
              </h2>
              <Button 
                onClick={onComplete}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse"
              >
                Next Level <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-muted-foreground text-sm font-mono flex gap-4">
        <span>NODES: {nodes.length}</span>
        <span>EDGES: {edges.length}</span>
      </div>
    </div>
  );
}
