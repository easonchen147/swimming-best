"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Plus, 
  Edit3, 
  Download, 
  Save, 
  X, 
  Search,
  Settings2
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createAdminTeam,
  getTeamExportUrl,
  listAdminTeams,
  updateAdminTeam,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import type { TeamSummary } from "@/lib/types";

function sortTeams(items: TeamSummary[]) {
  return [...items].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.name.localeCompare(right.name, "zh-Hans-CN");
  });
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm.trim());
  const [form, setForm] = useState({
    name: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    let cancelled = false;
    listAdminTeams(deferredSearchTerm || undefined)
      .then((response) => {
        if (!cancelled) {
          setTeams(sortTeams(response.teams));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [deferredSearchTerm]);

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      sortOrder: "0",
      isActive: true,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    
    const payload = {
      name: form.name,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updateAdminTeam(editingId, payload);
        const response = await listAdminTeams(deferredSearchTerm || undefined);
        setTeams(sortTeams(response.teams));
        toast.success("队伍已更新");
      } else {
        await createAdminTeam(payload);
        const response = await listAdminTeams(deferredSearchTerm || undefined);
        setTeams(sortTeams(response.teams));
        toast.success("队伍已创建");
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存队伍失败");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(team: TeamSummary) {
    setEditingId(team.id);
    setForm({
      name: team.name,
      sortOrder: String(team.sortOrder),
      isActive: team.isActive,
    });
    if (window.innerWidth < 1024) {
       window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <AdminShell
      description="管理受管队伍实体。队伍用于对队员进行归类，并直接影响公开页的筛选和展示。"
      title="队伍管理"
    >
      <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)] items-start">
        {/* Form Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="sticky top-28 shadow-xl shadow-primary/5">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                  editingId ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                )}>
                  {editingId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-xl">{editingId ? "编辑队伍" : "新建队伍"}</CardTitle>
                  <CardDescription>
                    {editingId ? "修改现有队伍的基础属性" : "创建一个新的队伍实体"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <Field label="队伍名称">
                  <Input
                    placeholder="例如: 精英预备队"
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    value={form.name}
                    required
                  />
                </Field>
                
                <Field label="显示权重 (排序)">
                  <Input
                    inputMode="numeric"
                    placeholder="数字越小越靠前"
                    onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                    value={form.sortOrder}
                  />
                </Field>

                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/40 p-4 transition-colors hover:border-primary/20">
                  <Checkbox
                    id="isActive"
                    checked={form.isActive}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isActive: checked === true }))
                    }
                  />
                  <label htmlFor="isActive" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-bold text-foreground">队伍当前有效</span>
                    <span className="text-xs text-muted/80">非有效队伍在分配队员时将不可见。</span>
                  </label>
                </div>
              </CardContent>
              
              <CardFooter className="gap-3 pt-2">
                <Button 
                  className="flex-1 gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={submitting}
                  success={success}
                >
                  <Save className="h-4 w-4" />
                  {editingId ? "更新队伍" : "创建队伍"}
                </Button>
                {editingId && !success && (
                  <Button variant="outline" className="px-5 h-12 rounded-2xl" onClick={resetForm} type="button">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* List Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 min-h-[500px]">
            <CardHeader className="pb-6 border-b border-border/40">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>已管理队伍</CardTitle>
                    <CardDescription>当前显示 {teams.length} 个队伍实体</CardDescription>
                  </div>
                </div>
                
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                   <Input 
                      placeholder="搜索队伍名称..." 
                      className="pl-10 h-10 rounded-full bg-surface/50 border-border/40"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
               <motion.div 
                 variants={STAGGER_CONTAINER}
                 initial="initial"
                 animate="animate"
                 className="grid gap-4 md:grid-cols-2"
               >
                 <AnimatePresence mode="popLayout">
                   {teams.map((team) => (
                     <motion.div
                       layout
                       key={team.id}
                       variants={FADE_IN_UP}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="group"
                     >
                       <Card className={cn(
                         "h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5",
                         editingId === team.id && "border-primary/40 bg-primary/5 shadow-inner"
                       )}>
                         <CardContent className="p-5">
                           <div className="flex items-start justify-between gap-4">
                             <div className="flex flex-col gap-3">
                               <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-black tracking-tight text-foreground">{team.name}</h3>
                                  <Badge 
                                    className={cn(
                                      "rounded-full px-2 py-0 h-5 text-[9px] font-bold border-transparent uppercase tracking-wider",
                                      team.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/10 text-muted"
                                    )}
                                  >
                                    {team.isActive ? "Active" : "Inactive"}
                                  </Badge>
                               </div>
                               
                               <div className="flex items-center gap-4 text-xs font-bold text-muted/60 uppercase tracking-widest">
                                  <div className="flex items-center gap-1">
                                     <Settings2 className="h-3 w-3" />
                                     <span>Order: {team.sortOrder}</span>
                                  </div>
                               </div>
                             </div>

                             <div className="flex items-center gap-1 shrink-0">
                               <Button
                                 onClick={() => startEdit(team)}
                                 size="icon"
                                 variant="ghost"
                                 className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                               >
                                 <Edit3 className="h-4 w-4" />
                               </Button>
                               <Button
                                 onClick={() => window.open(getTeamExportUrl(team.id), "_blank")}
                                 size="icon"
                                 variant="ghost"
                                 className="h-9 w-9 rounded-xl hover:bg-secondary/10 hover:text-secondary"
                               >
                                 <Download className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>

               {teams.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/5 text-muted/20 mb-4">
                       <Users className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">没有找到任何队伍</h3>
                    <Button variant="outline" className="mt-4 rounded-full" onClick={() => setSearchTerm("")}>
                       重置搜索
                    </Button>
                 </div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
