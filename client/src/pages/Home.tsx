import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { GameCanvas } from "@/components/GameCanvas";
import { LevelSelect } from "@/components/LevelSelect";
import { LEVELS } from "@/lib/game-engine";
import { useSubmitScore, useLeaderboard } from "@/hooks/use-leaderboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Trophy, Info, Github } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Home() {
  // Game State
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number>(1);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [lastLevelReached, setLastLevelReached] = useState<number>(0);
  const [isVictory, setIsVictory] = useState(false);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0);
  const logoClickTimeout = useRef<NodeJS.Timeout | null>(null);
  const [, setLocation] = useLocation();

  // Queries
  const { data: leaderboardData } = useLeaderboard();
  const submitScore = useSubmitScore();

  // Load progress
  useEffect(() => {
    // Reset to Level 1 for each fresh attempt/refresh as requested
    setUnlockedLevels(1);
    setAccumulatedTime(0);
    localStorage.removeItem("one-stroke-progress");
  }, []);

  const handleLevelComplete = (timeRemaining: number) => {
    const level = LEVELS.find(l => l.id === currentLevelId)!;
    const timeTaken = level.timeLimit - timeRemaining;
    setAccumulatedTime(prev => prev + timeTaken);
    const nextLevel = (currentLevelId || 0) + 1;

    // Save progress
    if (nextLevel > unlockedLevels) {
      setUnlockedLevels(nextLevel);
      localStorage.setItem("one-stroke-progress", nextLevel.toString());
    }

    if (currentLevelId === LEVELS.length) {
      // Beat the game!
      setLastLevelReached(LEVELS.length);
      setIsVictory(true);
      setShowVictoryModal(true);
      setCurrentLevelId(null);
    } else {
      // Advance
      setCurrentLevelId(nextLevel);
    }
  };

  const handleSubmitScore = async () => {
    if (!playerName.trim()) return;
    try {
      await submitScore.mutateAsync({
        playerName,
        levelReached: lastLevelReached,
        totalTimeTaken: accumulatedTime
      });
      setShowVictoryModal(false);
      setShowLeaderboard(true);
    } catch (e) {
      // Error handling by hook
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 blur-[100px] rounded-full" />
      </div>

      <header className="relative z-10 w-full p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm">
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => {
            if (logoClickTimeout.current) {
              clearTimeout(logoClickTimeout.current);
            }
            const newClicks = logoClicks + 1;
            setLogoClicks(newClicks);

            if (newClicks >= 3) {
              setLocation("/admin");
              setLogoClicks(0);
            } else {
              logoClickTimeout.current = setTimeout(() => setLogoClicks(0), 2000);
            }
          }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/25">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current">
              <path d="M12 2L2 22h20L12 2zm0 3l7.5 15h-15L12 5z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            ONE STROKE
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowLeaderboard(true)} className="border-primary/20 hover:border-primary hover:bg-primary/10">
            <Trophy className="w-5 h-5 text-yellow-500" />
          </Button>
          <Button variant="outline" size="icon" asChild className="border-white/10 hover:bg-white/5">
            <a href="https://github.com/replit/one-stroke-network" target="_blank" rel="noopener noreferrer">
              <Github className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-4">
        {currentLevelId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full flex flex-col"
          >
            <div className="text-center mb-2">
              <h2 className="text-xl text-primary font-display tracking-widest">LEVEL {currentLevelId}</h2>
            </div>
            <GameCanvas
              key={currentLevelId}
              level={LEVELS.find(l => l.id === currentLevelId)!}
              onComplete={handleLevelComplete}
              onExit={() => setCurrentLevelId(null)}
              onFail={() => {
                setLastLevelReached(currentLevelId || 1);
                setIsVictory(false);
                setUnlockedLevels(1);
                setShowVictoryModal(true);
              }}
            />
          </motion.div>
        ) : (
          <div className="max-w-4xl w-full flex flex-col items-center gap-12 py-12">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-display font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                PUZZ<span className="text-primary text-glow">LES</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto font-light">
                Connect all nodes using every edge exactly once.
                A neural handshake puzzle based on Euler paths.
              </p>
            </div>

            <LevelSelect
              unlockedLevels={unlockedLevels}
              onSelectLevel={setCurrentLevelId}
            />

            <div className="flex gap-8 text-sm text-muted-foreground font-mono uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Online
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full" />
                Secure
              </div>
              <div>v1.0.4</div>
            </div>
          </div>
        )}
      </main>

      {/* Leaderboard Modal */}
      <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
        <DialogContent className="bg-slate-950/90 border-slate-800 text-white backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
              <Trophy className="w-6 h-6" /> LEADERBOARD
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Top neural architects who completed the protocol.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between text-xs font-mono text-slate-500 mb-2 px-2">
              <span>OPERATOR</span>
              <span>LEVEL</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboardData?.map((entry, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold w-6 text-center ${i < 3 ? 'text-yellow-400' : 'text-slate-600'}`}>
                      #{i + 1}
                    </span>
                    <span className="font-semibold tracking-wide">{entry.playerName}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-primary font-bold">Lvl {entry.levelReached}</span>
                    <span className="text-[10px] text-slate-500 font-mono italic">Time Taken: {entry.totalTimeTaken}s</span>
                  </div>
                </div>
              ))}
              {(!leaderboardData || leaderboardData.length === 0) && (
                <div className="text-center py-8 text-slate-600">No records found. Be the first!</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Submission Modal (Victory or Failure) */}
      <Dialog open={showVictoryModal} onOpenChange={setShowVictoryModal}>
        <DialogContent className="bg-slate-950/95 border-primary/50 text-white backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className={cn(
              "text-3xl font-display text-center pb-2 bg-clip-text text-transparent bg-gradient-to-r",
              isVictory ? "from-primary to-purple-500" : "from-destructive to-orange-500"
            )}>
              {isVictory ? "PROTOCOL COMPLETE" : "ATTEMPT TERMINATED"}
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-slate-300">
              {isVictory
                ? "You have successfully traversed all network topologies."
                : `Sequence failed at Node Cluster ${lastLevelReached}. Record your progress?`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className={cn(
              "p-4 border rounded-lg text-center",
              isVictory ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"
            )}>
              <p className={cn(
                "text-sm uppercase tracking-widest mb-1",
                isVictory ? "text-primary" : "text-destructive"
              )}>
                {isVictory ? "Final Status" : "Last Stable Phase"}
              </p>
              <p className="text-4xl font-black font-display text-white">
                {isVictory ? "100%" : `LVL ${lastLevelReached}`}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Enter Codename for Records</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="NEO_77"
                maxLength={12}
                className="bg-slate-900 border-slate-700 focus:border-primary text-lg font-mono tracking-wider text-center"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmitScore}
              disabled={!playerName.trim() || submitScore.isPending}
              className="w-full bg-primary hover:bg-primary/80 text-black font-bold h-12 text-lg"
            >
              {submitScore.isPending ? "UPLOADING..." : "UPLOAD TO LEADERBOARD"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
