"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  FileText,
  Users, 
  Save,
  X
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { DatePickerInput } from "@/components/shared/date-picker";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getSwimmerSummaryExportUrl,
  listAdminTeams,
  listAdminSwimmers,
  updateAdminSwimmer,
} from "@/lib/api/admin";
import { listTeams } from "@/lib/swimmer-label";
import { cn } from "@/lib/utils";
import { FADE_IN_UP } from "@/lib/animations";
import type { AdminSwimmer, Gender, TeamSummary } from "@/lib/types";

export default function AdminSwimmersPage() {
  const [swimmers, setSwimmers] = useState<AdminSwimmer[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm.trim());
  const [form, setForm] = useState({
    realName: "",
    nickname: "",
    publicNameMode: "nickname",
    isPublic: true,
    gender: "unknown" as "male" | "female" | "unknown",
    teamId: "",
    birthDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const teamSelectId = "swimmer-team";
  const genderSelectId = "swimmer-gender";
  const publicNameModeSelectId = "swimmer-public-name-mode";
  const currentYear = new Date().getFullYear();
  const earliestBirthMonth = new Date(currentYear - 25, 0);
  const latestBirthMonth = new Date();
  useEffect(() => {
    listAdminTeams().then((teamResponse) => {
      setTeams(teamResponse.teams);
      setForm((current) => ({
        ...current,
        teamId: current.teamId || teamResponse.teams[0]?.id || "",
      }));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    listAdminSwimmers(teamFilter || undefined, deferredSearchTerm || undefined).then(
      (swimmerResponse) => {
        if (!cancelled) {
          setSwimmers(swimmerResponse.swimmers);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [deferredSearchTerm, teamFilter]);

  const visibleTeams = teams.length > 0 ? teams : listTeams(swimmers);
  const selectableTeams = teams.filter(
    (team) => team.isActive || team.id === form.teamId,
  );

  function resetForm() {
    setEditingId(null);
    setForm({
      realName: "",
      nickname: "",
      publicNameMode: "nickname",
      isPublic: true,
      gender: "unknown",
      teamId: teams[0]?.id || "",
      birthDate: "",
      notes: "",
    });
  }

  function updatePublicNameMode(nextMode: string) {
    setForm((current) => {
      if (nextMode === "hidden") {
        return {
          ...current,
          publicNameMode: nextMode,
          isPublic: false,
        };
      }

      const shouldRestorePublic =
        current.publicNameMode === "hidden" && current.isPublic === false;

      return {
        ...current,
        publicNameMode: nextMode,
        isPublic: shouldRestorePublic ? true : current.isPublic,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    const payload = { ...form };
    try {
      if (editingId) {
        await updateAdminSwimmer(editingId, payload);
        toast.success("队员档案已更新");
      } else {
        await createAdminSwimmer(payload);
        toast.success("队员档案已创建");
      }
      const swimmerResponse = await listAdminSwimmers(
        teamFilter || undefined,
        deferredSearchTerm || undefined,
      );
      setSwimmers(swimmerResponse.swimmers);
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
      birthDate: swimmer.birthDate ?? "",
      notes: swimmer.notes ?? "",
    });
    if (window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const isHiddenMode = form.publicNameMode === "hidden";

  return (
    <AdminShell 
      description="管理所有参与项目的队员，决定他们的公开展示模式和隐私设置。" 
      title="队员管理"
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
                  <CardTitle className="text-xl">{editingId ? "编辑队员档案" : "新建队员档案"}</CardTitle>
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
                  <Field label="出生日期">
                    <DatePickerInput
                      ariaLabel="出生日期"
                      endMonth={latestBirthMonth}
                      onChange={(value) =>
                        setForm((current) => ({ ...current, birthDate: value }))
                      }
                      placeholder="请选择"
                      startMonth={earliestBirthMonth}
                      value={form.birthDate}
                    />
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

                <Field label="所属队伍" labelFor={teamSelectId}>
                  <Select
                    onValueChange={(value) => setForm((current) => ({ ...current, teamId: value }))}
                    value={form.teamId}
                  >
                    <SelectTrigger id={teamSelectId}>
                      <SelectValue placeholder="请选择所属队伍" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {teams.length === 0 ? (
                          <SelectItem disabled value="__empty__">
                            请先到“队伍”页面创建队伍
                          </SelectItem>
                        ) : null}
                        {selectableTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name} {!team.isActive ? " (已停用)" : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="性别" labelFor={genderSelectId}>
                    <Select
                      onValueChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          gender: value as Gender,
                        }))
                      }
                      value={form.gender}
                    >
                      <SelectTrigger id={genderSelectId}>
                        <SelectValue placeholder="请选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="unknown">未设置</SelectItem>
                          <SelectItem value="male">男</SelectItem>
                          <SelectItem value="female">女</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="展示姓名模式" labelFor={publicNameModeSelectId}>
                    <Select
                      onValueChange={updatePublicNameMode}
                      value={form.publicNameMode}
                    >
                      <SelectTrigger id={publicNameModeSelectId}>
                        <SelectValue placeholder="请选择展示模式" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="nickname">展示昵称</SelectItem>
                          <SelectItem value="real_name">展示真名</SelectItem>
                          <SelectItem value="hidden">完全隐藏</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/40 p-4 transition-colors hover:border-primary/20">
                  <Checkbox
                    disabled={isHiddenMode}
                    id="isPublic"
                    checked={form.isPublic}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isPublic: checked === true }))
                    }
                  />
                  <label htmlFor="isPublic" className="flex flex-col cursor-pointer">
                    <span className="text-sm font-bold text-foreground">公开展示该队员</span>
                    <span className="text-xs text-muted/80">
                      {isHiddenMode
                        ? "完全隐藏模式下会自动关闭公开展示。"
                        : "允许在公共门户页面搜索和查看该队员。"}
                    </span>
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
                    <CardDescription>当前显示 {swimmers.length} 名成员</CardDescription>
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
                 <Button
                    className="whitespace-nowrap rounded-full"
                    onClick={() => setTeamFilter("")}
                    size="sm"
                    type="button"
                    variant={teamFilter === "" ? "primary" : "outline"}
                 >
                    全部队伍
                 </Button>
                 {visibleTeams.map((team) => (
                    <Button
                       className="whitespace-nowrap rounded-full"
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
            </CardHeader>
            
            <CardContent className="p-0">
               <Table className="table-fixed">
                 <colgroup>
                   <col className="w-[240px]" />
                   <col className="w-[160px]" />
                   <col className="w-[90px]" />
                   <col className="w-[120px]" />
                   <col className="w-[88px]" />
                 </colgroup>
                 <TableHeader>
                   <TableRow className="hover:bg-transparent">
                     <TableHead>公开展示 / 真实姓名</TableHead>
                     <TableHead>所属队伍</TableHead>
                     <TableHead>性别</TableHead>
                     <TableHead>公开状态</TableHead>
                     <TableHead className="text-right">操作</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   <AnimatePresence mode="popLayout">
                     {swimmers.map((swimmer) => (
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
                             <div className="min-w-0 flex-1">
                               <div className="truncate font-bold text-foreground">
                                 {swimmer.publicNameMode === "real_name"
                                   ? swimmer.realName
                                   : swimmer.nickname || swimmer.realName}
                               </div>
                               <span className="block truncate text-[11px] text-muted">
                                 真实姓名：{swimmer.realName}
                               </span>
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
                              {swimmer.publicNameMode !== "hidden" ? (
                                <span className="ml-1 text-[10px] font-bold text-muted/70">
                                  {swimmer.publicNameMode === "real_name" ? "真名" : "昵称"}
                                </span>
                              ) : null}
                           </div>
                         </TableCell>
                         <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-1">
                              <Button
                               aria-label="编辑队员"
                               onClick={() => startEdit(swimmer)}
                               size="icon"
                               variant="ghost"
                               className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                             >
                               <Edit3 className="h-4 w-4" />
                             </Button>
                             <Button
                               aria-label="打开队员摘要"
                               onClick={() => window.open(getSwimmerSummaryExportUrl(swimmer.id), "_blank")}
                               size="icon"
                               variant="ghost"
                               className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                             >
                               <FileText className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
                   </AnimatePresence>
                 </TableBody>
               </Table>
               
               {swimmers.length === 0 && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                 >
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted/5 text-muted/40">
                       <Users className="h-10 w-10" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-foreground">没有找到任何队员</h3>
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
