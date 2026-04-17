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
              "relative aspect-square rounded-2xl flex flex-col items-center justify-center p-4 border transition-all duration-300",
              isUnlocked
                ? "bg-primary/5 border-primary/20 hover:border-primary/60 hover:shadow-[0_0_20px_hsla(var(--primary),0.2)] hover:bg-primary/10"
                : "bg-white/5 border-white/5 opacity-40 cursor-not-allowed grayscale"
            )}
          >
            <div className={cn(
              "text-5xl font-display font-black mb-1 transition-colors",
              isUnlocked ? "text-foreground" : "text-muted-foreground"
            )}>
              {level.id}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
              {isCompleted ? (
                <span className="text-primary flex items-center gap-1 drop-shadow-sm">
                  <CheckCircle className="w-3 h-3" /> VERIFIED
                </span>
              ) : isUnlocked ? (
                <span className="text-primary/70 flex items-center gap-1">
                  <Play className="w-3 h-3" /> INITIALIZE
                </span>
              ) : (
                <span className="text-muted-foreground/60 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> ENCRYPTED
                </span>
              )}
            </div>

            {/* Glowing active indicator */}
            {isUnlocked && !isCompleted && (
              <div className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
