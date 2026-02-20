import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LayoutDashboard, ListTodo, Users, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: levels, isLoading: levelsLoading } = useQuery({
    queryKey: [api.admin.levels.list.path],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: [api.admin.stats.get.path],
  });

  if (levelsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Levels Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <ListTodo className="text-primary" /> LEVEL SOLUTIONS
          </div>
          
          <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-mono">ID</TableHead>
                  <TableHead className="text-slate-400">TOPOLOGY GUIDE (STEP-BY-STEP)</TableHead>
                  <TableHead className="text-slate-400">HINTS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels?.map((level) => (
                  <TableRow key={level.id} className="border-slate-800 hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono text-primary font-bold">L-{level.levelNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {level.solution.map((nodeId, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-8 h-8 rounded bg-primary/20 border border-primary/30 text-primary font-mono text-xs font-bold">
                              {nodeId}
                            </span>
                            {idx < level.solution.length - 1 && (
                              <span className="text-slate-600">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400 italic text-sm">
                      <ul className="list-disc list-inside">
                        {level.hints?.map((hint, i) => (
                          <li key={i}>{hint}</li>
                        ))}
                      </ul>
                    </TableCell>
                  </TableRow>
                ))}
                {(!levels || levels.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-slate-500 font-mono italic">
                      NO LEVEL DATA SEEDED.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
