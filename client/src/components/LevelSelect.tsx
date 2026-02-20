import { motion } from "framer-motion";
import { Lock, CheckCircle, Play } from "lucide-react";
import { LEVELS } from "@/lib/game-engine";
import { cn } from "@/lib/utils";

interface LevelSelectProps {
  unlockedLevels: number;
  onSelectLevel: (levelId: number) => void;
}

export function LevelSelect({ unlockedLevels, onSelectLevel }: LevelSelectProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-2xl">
      {LEVELS.map((level) => {
        const isUnlocked = level.id <= unlockedLevels;
        const isCompleted = level.id < unlockedLevels;
        
        return (
          <motion.button
            key={level.id}
            whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
            whileTap={isUnlocked ? { scale: 0.95 } : {}}
            onClick={() => isUnlocked && onSelectLevel(level.id)}
            disabled={!isUnlocked}
            className={cn(
              "relative aspect-square rounded-xl flex flex-col items-center justify-center p-4 border-2 transition-all duration-300",
              isUnlocked 
                ? "bg-muted/40 border-primary/20 hover:border-primary hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-muted/60"
                : "bg-background/50 border-white/5 opacity-50 cursor-not-allowed grayscale"
            )}
          >
            <div className="text-4xl font-display font-bold mb-2 text-foreground/80">
              {level.id}
            </div>
            
            {isCompleted ? (
              <div className="text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <CheckCircle className="w-3 h-3" /> Solved
              </div>
            ) : isUnlocked ? (
              <div className="text-foreground/60 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <Play className="w-3 h-3" /> Play
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" /> Locked
              </div>
            )}

            {/* Decorative corners */}
            {isUnlocked && (
              <>
                <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-primary/50" />
                <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-primary/50" />
                <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-primary/50" />
                <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-primary/50" />
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
