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
      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={STAGGER_CONTAINER}
        className="relative mb-16 overflow-hidden rounded-[40px] bg-primary px-8 py-20 text-center text-white shadow-2xl shadow-primary/20 md:px-12 md:py-28"
      >
        {/* Animated Background Elements */}
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
            className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md"
          >
            <Star className="h-3 w-3 text-accent" />
            <span>让每一份进步都被看见</span>
          </motion.div>
          
          <motion.h1 
            variants={FADE_IN_UP}
            className="max-w-4xl text-5xl font-black leading-[1.1] tracking-tight md:text-7xl"
          >
            记录成长，<span className="text-secondary">超越</span>自我
          </motion.h1>
          
          <motion.p 
            variants={FADE_IN_UP}
            className="mt-8 max-w-2xl text-lg font-medium text-white/70 text-balance md:text-xl"
          >
            欢迎来到 Swimming Best。这里记录了孩子们在泳池中的每一次划水与突破，见证从初学者到小选手的蜕变。
          </motion.p>
          
          <motion.div variants={FADE_IN_UP} className="mt-12 flex flex-wrap justify-center gap-4">
             <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">{swimmers.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">已录入档案</span>
             </div>
             <div className="mx-8 h-12 w-px bg-white/10 hidden md:block" />
             <div className="flex flex-col items-center gap-1">
                <span className="text-3xl font-black">{teams.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">活跃队伍</span>
             </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="flex flex-col gap-8">
        {/* Controls */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
           <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-foreground">学员档案库</h2>
              <p className="text-sm font-medium text-muted">选择一个档案查看详细的成绩分析与目标进度</p>
           </div>
           
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <Input 
                className="h-12 rounded-full pl-12 pr-6 shadow-sm border-border/60 bg-surface/50 transition-all focus:bg-white focus:shadow-xl focus:shadow-primary/5"
                placeholder="搜索学员姓名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-6">
           <Filter className="mr-2 h-4 w-4 text-muted" />
           <Button
             className="rounded-full"
             onClick={() => setTeamFilter("")}
             size="sm"
             type="button"
             variant={teamFilter === "" ? "primary" : "outline"}
           >
             全部队伍
           </Button>
           {teams.map((team) => (
             <Button
               className="rounded-full"
               key={team.id}
               onClick={() => setTeamFilter(team.id)}
               size="sm"
               type="button"
               variant={teamFilter === team.id ? "primary" : "outline"}
             >
               {team.name}
             </Button>
           ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 text-sm font-bold text-rose-600 backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
               <LoadingState key={i} label={`档案加载中 ${i}`} />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={STAGGER_CONTAINER}
            initial="initial"
            animate="animate"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                    <Card className="h-full border-border/40 transition-all group-hover:border-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/5">
                      <CardContent className="flex flex-col gap-6 p-8">
                        <div className="flex items-start justify-between">
                           <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/5 text-primary text-2xl font-black group-hover:bg-primary group-hover:text-white transition-colors">
                              {swimmer.displayName.slice(0, 1)}
                           </div>
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong border border-border/60 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <ArrowRight className="h-5 w-5 text-primary" />
                           </div>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                           <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                             {swimmer.displayName}
                           </h3>
                           {swimmer.team && (
                             <div className="flex items-center gap-2 text-sm font-bold text-muted/60">
                                <Users className="h-4 w-4" />
                                <span>{swimmer.team.name}</span>
                             </div>
                           )}
                        </div>

                        <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted/40">
                           <div className="flex items-center gap-1.5">
                              <Trophy className="h-3.5 w-3.5" />
                              <span>查看详细成绩</span>
                           </div>
                           <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
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
