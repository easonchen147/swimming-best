"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Users, 
  Save,
  X
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  createAdminSwimmer,
  getSwimmerExportUrl,
  listAdminTeams,
  listAdminSwimmers,
  updateAdminSwimmer,
} from "@/lib/api/admin";
import { describeSwimmer, listTeams } from "@/lib/swimmer-label";
import { cn } from "@/lib/utils";
import { FADE_IN_UP } from "@/lib/animations";
import type { AdminSwimmer, Gender, TeamSummary } from "@/lib/types";

export default function AdminSwimmersPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    realName: "",
    nickname: "",
    publicNameMode: "nickname",
    isPublic: true,
    gender: "unknown" as "male" | "female" | "unknown",
    teamId: "",
    birthYear: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const currentYear = new Date().getFullYear();
  const birthYearOptions = Array.from({ length: 26 }, (_, index) => String(currentYear - index));

  useEffect(() => {
    Promise.all([listAdminSwimmers(), listAdminTeams()]).then(([swimmerResponse, teamResponse]) => {
      setSwimmers(swimmerResponse.swimmers);
      setTeams(teamResponse.teams);
      setForm((current) => ({
        ...current,
        teamId: current.teamId || teamResponse.teams[0]?.id || "",
      }));
    });
  }, []);

  const visibleTeams = teams.length > 0 ? teams : listTeams(swimmers);
  const selectableTeams = teams.filter(
    (team) => team.isActive || team.id === form.teamId,
  );
  
  const filteredSwimmers = swimmers.filter((swimmer) => {
    const matchesTeam = !teamFilter || swimmer.teamId === teamFilter;
    const matchesSearch = !searchTerm || 
      swimmer.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      swimmer.nickname.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  function resetForm() {
    setEditingId(null);
    setForm({
      realName: "",
      nickname: "",
      publicNameMode: "nickname",
      isPublic: true,
      gender: "unknown",
      teamId: teams[0]?.id || "",
      birthYear: "",
      notes: "",
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    const payload = {
      ...form,
      birthYear: form.birthYear ? Number(form.birthYear) : undefined,
    };
    try {
      if (editingId) {
        const swimmer = await updateAdminSwimmer(editingId, payload);
        setSwimmers((current) =>
          current.map((item) => (item.id === swimmer.id ? swimmer : item)),
        );
        toast.success("孩子档案已更新");
      } else {
        const swimmer = await createAdminSwimmer(payload);
        setSwimmers((current) => [...current, swimmer]);
        toast.success("孩子档案已创建");
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        resetForm();
      }, 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(swimmer: AdminSwimmer) {
    setEditingId(swimmer.id);
    setForm({
      realName: swimmer.realName,
      nickname: swimmer.nickname,
      publicNameMode: swimmer.publicNameMode,
      isPublic: swimmer.isPublic,
      gender: swimmer.gender,
      teamId: swimmer.teamId,
      birthYear: swimmer.birthYear ? String(swimmer.birthYear) : "",
      notes: swimmer.notes ?? "",
    });
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <AdminShell 
      description="管理所有参与项目的孩子，决定他们的公开展示模式和隐私设置。" 
      title="孩子管理"
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
                  <CardTitle className="text-xl">{editingId ? "编辑孩子档案" : "新建孩子档案"}</CardTitle>
                  <CardDescription>
                    {editingId ? "修改已有档案信息" : "录入一名新成员的基本信息"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="真实姓名">
                    <Input
                      placeholder="例如: 张小明"
                      onChange={(event) => setForm((current) => ({ ...current, realName: event.target.value }))}
                      value={form.realName}
                      required
                    />
                  </Field>
                  <Field label="公开昵称">
                    <Input
                      placeholder="例如: 小明"
                      onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))}
                      value={form.nickname}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="出生年份">
                    <Select
                      onChange={(event) =>
                        setForm((current) => ({ ...current, birthYear: event.target.value }))
                      }
                      value={form.birthYear}
                    >
                      <option value="">请选择年份</option>
                      {birthYearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="备注">
                    <Input
                      placeholder="例如: 主项偏自由泳"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, notes: event.target.value }))
                      }
                      value={form.notes}
                    />
                  </Field>
                </div>

                <Field label="所属队伍">
                  <Select
                    onChange={(event) => setForm((current) => ({ ...current, teamId: event.target.value }))}
                    value={form.teamId}
                    required
                  >
                    {teams.length === 0 ? (
                      <option value="">请先到“队伍”页面创建队伍</option>
                    ) : null}
                    {selectableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {!team.isActive ? " (已停用)" : ""}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="性别">
                    <Select
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          gender: event.target.value as Gender,
                        }))
                      }
                      value={form.gender}
                    >
                      <option value="unknown">未设置</option>
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </Select>
                  </Field>
                  <Field label="展示姓名模式">
                    <Select
                      onChange={(event) => setForm((current) => ({ ...current, publicNameMode: event.target.value }))}
                      value={form.publicNameMode}
                    >
                      <option value="nickname">展示昵称</option>
                      <option value="real_name">展示真名</option>
                      <option value="hidden">完全隐藏</option>
                    </Select>
                  </Field>
                </div>

                <div className="flex items-center space-x-3 rounded-2xl border border-border/60 bg-surface/40 p-4 transition-colors hover:border-primary/20">
                  <input
                    id="isPublic"
                    checked={form.isPublic}
                    onChange={(event) => setForm((current) => ({ ...current, isPublic: event.target.checked }))}
                    type="checkbox"
                    className="h-5 w-5 rounded-lg border-primary/20 text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <label htmlFor="isPublic" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-bold text-foreground">公开展示该孩子</span>
                    <span className="text-xs text-muted/80">允许在公共门户页面搜索和查看该孩子。</span>
                  </label>
                </div>
              </CardContent>
              
              <CardFooter className="gap-3 pt-2">
                <Button 
                  className="flex-1 gap-2 h-12 rounded-2xl" 
                  disabled={teams.length === 0} 
                  type="submit"
                  loading={submitting}
                  success={success}
                >
                  <Save className="h-4 w-4" />
                  {editingId ? "更新档案" : "创建档案"}
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
          <Card className="shadow-xl shadow-primary/5 min-h-[600px]">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>已录入成员</CardTitle>
                    <CardDescription>共有 {swimmers.length} 名成员录入系统</CardDescription>
                  </div>
                </div>
                
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                   <Input 
                      placeholder="搜索姓名或昵称..." 
                      className="pl-10 h-10 rounded-full bg-surface/50 border-border/40"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                   />
                </div>
              </div>

              {/* Filters */}
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                 <Filter className="h-4 w-4 text-muted shrink-0 mr-2" />
                 <button
                    onClick={() => setTeamFilter("")}
                    className={cn(
                       "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
                       teamFilter === "" 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-surface text-muted hover:bg-primary/5 hover:text-primary border border-border/40"
                    )}
                 >
                    全部队伍
                 </button>
                 {visibleTeams.map((team) => (
                    <button
                       key={team.id}
                       onClick={() => setTeamFilter(team.id)}
                       className={cn(
                          "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95",
                          teamFilter === team.id 
                           ? "bg-primary text-white shadow-lg shadow-primary/20" 
                           : "bg-surface text-muted hover:bg-primary/5 hover:text-primary border border-border/40"
                       )}
                    >
                       {team.name}
                    </button>
                 ))}
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow className="hover:bg-transparent">
                     <TableHead className="w-[200px]">姓名 / 昵称</TableHead>
                     <TableHead>所属队伍</TableHead>
                     <TableHead>性别</TableHead>
                     <TableHead>公开状态</TableHead>
                     <TableHead className="text-right">操作</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   <AnimatePresence mode="popLayout">
                     {filteredSwimmers.map((swimmer) => (
                       <TableRow 
                         key={swimmer.id} 
                         layoutId={swimmer.id}
                         className={cn(editingId === swimmer.id && "bg-primary/5")}
                       >
                         <TableCell>
                           <div className="flex items-center gap-3">
                             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary font-bold">
                               {swimmer.nickname.slice(0, 1)}
                             </div>
                             <div className="flex flex-col">
                               <span className="font-bold text-foreground">{describeSwimmer(swimmer)}</span>
                               <span className="text-[10px] text-muted uppercase tracking-wider">{swimmer.realName}</span>
                             </div>
                           </div>
                         </TableCell>
                         <TableCell>
                            <Badge variant="outline" className="rounded-lg bg-surface font-semibold py-1">
                               {teams.find(t => t.id === swimmer.teamId)?.name || "未知队伍"}
                            </Badge>
                         </TableCell>
                         <TableCell>
                            <span className="text-xs font-medium">
                               {swimmer.gender === 'male' ? '男生' : swimmer.gender === 'female' ? '女生' : '未知'}
                            </span>
                         </TableCell>
                         <TableCell>
                           <div className="flex flex-col gap-1">
                              <Badge 
                                className={cn(
                                  "w-fit rounded-full px-2 py-0 h-5 text-[10px] border-transparent",
                                  swimmer.isPublic ? "bg-emerald-500/10 text-emerald-600" : "bg-muted/10 text-muted"
                                )}
                              >
                                {swimmer.isPublic ? "公开可见" : "私密隐藏"}
                              </Badge>
                              <span className="text-[9px] font-bold text-muted/60 uppercase ml-1">
                                {swimmer.publicNameMode.replace('_', ' ')}
                              </span>
                           </div>
                         </TableCell>
                         <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-1">
                             <Button
                               onClick={() => startEdit(swimmer)}
                               size="icon"
                               variant="ghost"
                               className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                             >
                               <Edit3 className="h-4 w-4" />
                             </Button>
                             <Button
                               onClick={() => window.open(getSwimmerExportUrl(swimmer.id), "_blank")}
                               size="icon"
                               variant="ghost"
                               className="h-9 w-9 rounded-xl hover:bg-secondary/10 hover:text-secondary"
                             >
                               <Download className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </AnimatePresence>
                 </TableBody>
               </Table>
               
               {filteredSwimmers.length === 0 && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                 >
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/5 text-muted/40">
                       <Users className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">没有找到任何孩子</h3>
                    <p className="text-sm text-muted">尝试更换筛选条件或搜索关键词。</p>
                    <Button 
                      variant="outline" 
                      className="mt-6 rounded-full px-6"
                      onClick={() => { setTeamFilter(""); setSearchTerm(""); }}
                    >
                       清除所有筛选条件
                    </Button>
                 </motion.div>
               )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
