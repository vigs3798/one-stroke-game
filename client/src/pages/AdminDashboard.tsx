import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutDashboard, ListTodo, Users, ArrowLeft, Loader2, CheckCircle2, Eye, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Level } from "@shared/schema";
import { LEVELS } from "@/lib/game-engine";
import { GameCanvas } from "@/components/GameCanvas";
import { useThemeStore, THEMES, type ThemeType } from "@/lib/theme-store";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const { currentTheme, setTheme } = useThemeStore();

  const { data: levels, isLoading: levelsLoading } = useQuery<Level[]>({
    queryKey: [api.admin.levels.list.path],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<{ totalPlayers: number; avgLevel: number }>({
    queryKey: [api.admin.stats.get.path],
  });

  if (levelsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedLevelData = LEVELS.find(l => l.id === selectedLevelId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="hover:bg-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <LayoutDashboard className="text-primary" /> ADMIN PROTOCOL
              </h1>
              <p className="text-slate-400">System architecture and level validation</p>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Total Operators</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.totalPlayers || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Average Depth</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black">{stats?.avgLevel?.toFixed(1) || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-400">Interface Theme</CardTitle>
              <Palette className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 pt-1">
                {(Object.keys(THEMES) as ThemeType[]).map((themeName) => (
                  <Button
                    key={themeName}
                    variant={currentTheme === themeName ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "capitalize text-[10px] h-7 px-3 border-white/10 transition-all font-display",
                      currentTheme === themeName
                        ? "bg-primary text-black font-black border-primary shadow-[0_0_10px_hsla(var(--primary),0.5)]"
                        : "bg-slate-900/50 text-slate-400 hover:text-white hover:border-primary/50"
                    )}
                    onClick={() => setTheme(themeName)}
                  >
                    {themeName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Levels Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <ListTodo className="text-primary" /> LEVEL SOLUTIONS
            </div>

            <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400 font-mono w-20">ID</TableHead>
                    <TableHead className="text-slate-400">TOPOLOGY GUIDE (STEP-BY-STEP)</TableHead>
                    <TableHead className="text-slate-400 w-32 text-right">ACTION</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels?.map((level) => (
                    <TableRow
                      key={level.id}
                      className={`border-slate-800 hover:bg-white/5 transition-colors cursor-pointer ${selectedLevelId === level.levelNumber ? 'bg-primary/10' : ''}`}
                      onClick={() => setSelectedLevelId(level.levelNumber)}
                    >
                      <TableCell className="font-mono text-primary font-bold">L-{level.levelNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {level.solution.map((nodeId, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold">
                                {nodeId}
                              </span>
                              {idx < level.solution.length - 1 && (
                                <span className="text-slate-600">→</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
                          <Eye className="w-4 h-4 mr-2" /> VIEW
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Preview Pane */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <Eye className="text-primary" /> TOPOLOGY PREVIEW
            </div>
            <Card className="bg-slate-900 border-slate-800 h-[500px] flex flex-col shadow-2xl overflow-hidden">
              {selectedLevelData ? (
                <div className="flex-1 p-4 flex flex-col">
                  <div className="flex-1 rounded bg-black/40 border border-slate-800 relative overflow-hidden">
                    <GameCanvas
                      key={selectedLevelId}
                      level={selectedLevelData}
                      onComplete={() => { }}
                      onExit={() => setSelectedLevelId(null)}
                      onFail={() => { }}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-bold text-primary uppercase">Hints & Logic</div>
                    <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside italic">
                      {levels?.find(l => l.levelNumber === selectedLevelId)?.hints?.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 text-center italic">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 opacity-20" />
                  </div>
                  SELECT A LEVEL TO RECONSTRUCT TOPOLOGY LOGIC
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
