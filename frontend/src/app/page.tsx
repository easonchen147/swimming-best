"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Users, Star, Trophy, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { PublicShell } from "@/components/layout/public-shell";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPublicSwimmers } from "@/lib/api/public";
import { listTeams } from "@/lib/swimmer-label";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { PublicSwimmerSummary } from "@/lib/types";

export default function HomePage() {
  const [swimmers, setSwimmers] = useState<PublicSwimmerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    listPublicSwimmers()
      .then((response) => setSwimmers(response.swimmers))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const teams = listTeams(swimmers);
  const filteredSwimmers = swimmers.filter((swimmer) => {
    const matchesTeam = !teamFilter || swimmer.teamId === teamFilter;
    const matchesSearch = !searchTerm || 
      swimmer.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  return (
    <PublicShell>
      {/* Hero Section - Even More Compact */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={STAGGER_CONTAINER}
        className="relative mb-8 overflow-hidden rounded-[32px] bg-primary px-8 py-10 text-center text-white shadow-xl shadow-primary/20 md:px-12 md:py-14"
      >
        {/* Restored Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-10">
           <div className="grid-sheen absolute inset-0" />
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.5, 0.3],
               x: [0, 50, 0],
               y: [0, -50, 0]
             }}
             transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-1/2 -left-1/4 h-[100%] w-[100%] rounded-full bg-secondary blur-[120px]" 
           />
           <motion.div 
             animate={{ 
               scale: [1, 1.1, 1],
               opacity: [0.2, 0.4, 0.2],
               x: [0, -40, 0],
               y: [0, 60, 0]
             }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
             className="absolute -bottom-1/2 -right-1/4 h-[100%] w-[100%] rounded-full bg-accent blur-[120px]" 
           />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            variants={FADE_IN_UP}
            className="mb-4 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-md"
          >
            <Star className="h-2.5 w-2.5 text-accent" />
            <span>让每一份进步都被看见</span>
          </motion.div>
          
          <motion.h1 
            variants={FADE_IN_UP}
            className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight md:text-6xl"
          >
            记录成长，<span className="text-secondary">超越</span>自我
          </motion.h1>
          
          <motion.p 
            variants={FADE_IN_UP}
            className="mt-6 max-w-xl text-base font-medium text-white/70 text-balance"
          >
            欢迎来到 Swimming Best。见证孩子们在泳池中的每一次突破与蜕变。
          </motion.p>
          
          <motion.div variants={FADE_IN_UP} className="mt-8 flex flex-wrap justify-center gap-8">
             <div className="flex flex-col items-center gap-0.5">
                <span className="text-3xl font-black">{swimmers.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">已录入档案</span>
             </div>
             <div className="flex flex-col items-center gap-0.5">
                <span className="text-3xl font-black">{teams.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">活跃队伍</span>
             </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="flex flex-col gap-6">
        {/* Controls - More Compact */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div className="flex flex-col gap-0.5">
              <h2 className="text-2xl font-black tracking-tight text-foreground">学员档案库</h2>
              <p className="text-xs font-medium text-muted">选择档案查看详细分析与目标进度</p>
           </div>
           
           <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input 
                className="h-10 rounded-full pl-11 pr-5 shadow-sm border-border/60 bg-surface/50 transition-all focus:bg-white focus:shadow-xl focus:shadow-primary/5 text-sm"
                placeholder="搜索姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-border/40 pb-4">
           <Button
             className="h-8 rounded-full px-4 text-xs font-bold"
             onClick={() => setTeamFilter("")}
             size="sm"
             type="button"
             variant={teamFilter === "" ? "primary" : "ghost"}
           >
             全部
           </Button>
           {teams.map((team) => (
             <Button
               className="h-8 rounded-full px-4 text-xs font-bold"
               key={team.id}
               onClick={() => setTeamFilter(team.id)}
               size="sm"
               type="button"
               variant={teamFilter === team.id ? "primary" : "ghost"}
             >
               {team.name}
             </Button>
           ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-center text-xs font-bold text-rose-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
               <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredSwimmers.map((swimmer) => (
                <motion.div
                  key={swimmer.id}
                  layout
                  variants={FADE_IN_UP}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group"
                >
                  <Link href={`/swimmers/${swimmer.slug}`}>
                    <Card className="h-full border-border/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-xl group-hover:shadow-primary/5">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                           <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary text-base font-black group-hover:bg-primary group-hover:text-white transition-all">
                              {swimmer.displayName.slice(0, 1)}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <h3 className="truncate text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {swimmer.displayName}
                              </h3>
                              {swimmer.team && (
                                <div className="flex items-center gap-1 text-[9px] font-bold text-muted/60">
                                   <span className="truncate uppercase tracking-tighter">{swimmer.team.name}</span>
                                </div>
                              )}
                           </div>
                           <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all">
                              <ChevronRight className="h-3.5 w-3.5 text-primary" />
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredSwimmers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-[40px] bg-muted/5 text-muted/20 mb-6">
               <Users className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground">没有找到匹配的学员</h3>
            <p className="mt-2 text-muted font-medium">尝试搜索其他姓名或更改队伍筛选。</p>
            <Button 
               variant="outline" 
               className="mt-8 rounded-full px-8 h-12"
               onClick={() => { setTeamFilter(""); setSearchTerm(""); }}
            >
               重置所有筛选
            </Button>
          </motion.div>
        )}
      </section>
    </PublicShell>
  );
}
