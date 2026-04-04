"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Plus, 
  Save, 
  Layout, 
  Target
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field, SelectField } from "@/components/shared/form-field";
import { StandardBadge } from "@/components/shared/standard-badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createAdminStandard,
  createAdminStandardEntry,
  listAdminEvents,
  listAdminStandardEntries,
  listAdminStandards,
} from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import type { EventDefinition, StandardEntry, TimeStandard } from "@/lib/types";

export default function AdminStandardsPage() {
  const [standards, setStandards] = useState<TimeStandard[]>([]);
  const [entries, setEntries] = useState<StandardEntry[]>([]);
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [selectedStandardId, setSelectedStandardId] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [standardSubmitting, setStandardSubmitting] = useState(false);
  const [entrySubmitting, setEntrySubmitting] = useState(false);

  const [standardForm, setStandardForm] = useState({
    tierGroup: "",
    name: "",
    tierOrder: "1",
    colorHex: "#4f46e5",
  });
  
  const [entryForm, setEntryForm] = useState({
    eventId: "",
    gender: "all" as "male" | "female" | "all",
    qualifyingTimeMs: "30000",
  });

  useEffect(() => {
    Promise.all([listAdminStandards(), listAdminEvents()]).then(
      ([standardResponse, eventResponse]) => {
        setStandards(standardResponse.standards);
        setEvents(eventResponse.events);
        setSelectedStandardId(standardResponse.standards[0]?.id ?? "");
        setEntryForm((current) => ({
          ...current,
          eventId: current.eventId || eventResponse.events[0]?.id || "",
        }));
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    if (!selectedStandardId) {
      return;
    }

    listAdminStandardEntries(selectedStandardId).then((response) => setEntries(response.entries));
  }, [selectedStandardId]);

  async function handleCreateStandard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStandardSubmitting(true);
    try {
      const standard = await createAdminStandard({
        tierGroup: standardForm.tierGroup,
        name: standardForm.name,
        tierOrder: Number(standardForm.tierOrder || 0),
        colorHex: standardForm.colorHex,
      });
      setStandards((current) => [...current, standard]);
      setSelectedStandardId(standard.id);
      setStandardForm({
        tierGroup: "",
        name: "",
        tierOrder: "1",
        colorHex: "#4f46e5",
      });
      toast.success("自定义标准组已成功创建");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建标准失败");
    } finally {
      setStandardSubmitting(false);
    }
  }

  async function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStandardId) return;
    
    setEntrySubmitting(true);
    try {
      const entry = await createAdminStandardEntry(selectedStandardId, {
        eventId: entryForm.eventId,
        gender: entryForm.gender,
        qualifyingTimeMs: Number(entryForm.qualifyingTimeMs),
      });
      setEntries((current) => [...current, entry]);
      toast.success("达标条目已添加");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建条目失败");
    } finally {
      setEntrySubmitting(false);
    }
  }

  return (
    <AdminShell 
      description="管理自定义的成绩达标标准。这些标准将作为参考线显示在孩子们的成绩趋势图中。" 
      title="标准体系管理"
    >
      <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)] items-start">
        {/* Standard Group Form */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="sticky top-28 shadow-xl shadow-primary/5 border-border/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layout className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">新建标准组</CardTitle>
                  <CardDescription>定义一个新的达标评价体系</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleCreateStandard}>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="分组名称">
                    <Input
                      placeholder="例如: 校队标准"
                      onChange={(event) => setStandardForm((current) => ({ ...current, tierGroup: event.target.value }))}
                      value={standardForm.tierGroup}
                      required
                    />
                  </Field>
                  <Field label="层级名称">
                    <Input
                      placeholder="例如: 一级"
                      onChange={(event) => setStandardForm((current) => ({ ...current, name: event.target.value }))}
                      value={standardForm.name}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="权重排序">
                    <Input
                      type="number"
                      placeholder="1"
                      onChange={(event) => setStandardForm((current) => ({ ...current, tierOrder: event.target.value }))}
                      value={standardForm.tierOrder}
                    />
                  </Field>
                  <Field label="视觉主题色">
                    <div className="flex gap-2">
                       <div 
                         className="h-11 w-11 rounded-xl border border-border shadow-inner shrink-0" 
                         style={{ backgroundColor: standardForm.colorHex }}
                       />
                       <Input
                         placeholder="#4f46e5"
                         onChange={(event) => setStandardForm((current) => ({ ...current, colorHex: event.target.value }))}
                         value={standardForm.colorHex}
                       />
                    </div>
                  </Field>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  className="w-full gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={standardSubmitting}
                >
                  <Save className="h-4 w-4" />
                  保存标准组
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Entries Management */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 min-h-[600px] border-border/40 overflow-hidden">
            <CardHeader className="pb-6 bg-surface/30 border-b border-border/40">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>标准定义与条目</CardTitle>
                    <CardDescription>管理选中标准组下的具体项目成绩要求</CardDescription>
                  </div>
                </div>
                
                {/* Standard Selector Tabs */}
                <div className="flex flex-wrap gap-2">
                  {standards.map((standard) => (
                    <button
                      key={standard.id}
                      onClick={() => setSelectedStandardId(standard.id)}
                      className={cn(
                        "rounded-full px-5 py-2 text-xs font-bold transition-all active:scale-95 border",
                        selectedStandardId === standard.id 
                          ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                          : "bg-white text-muted hover:bg-primary/5 hover:text-primary border-border/60"
                      )}
                    >
                      {standard.tierGroup} · {standard.name}
                    </button>
                  ))}
                  {standards.length === 0 && !loading && (
                    <span className="text-xs font-bold text-muted/40 italic">暂未创建任何标准组</span>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
               {/* Entry Creator Form */}
               <div className="p-6 bg-primary/[0.02] border-b border-border/40">
                  <form className="grid gap-6 md:grid-cols-4 items-end" onSubmit={handleCreateEntry}>
                    <SelectField
                      label="适用项目"
                      onChange={(value) => setEntryForm((current) => ({ ...current, eventId: value }))}
                      options={events.map((item) => ({ label: item.displayName, value: item.id }))}
                      value={entryForm.eventId}
                    />
                    <SelectField
                      label="性别要求"
                      onChange={(value) =>
                        setEntryForm((current) => ({
                          ...current,
                          gender: value as StandardEntry["gender"],
                        }))
                      }
                      options={[
                        { label: "不限性别 (All)", value: "all" },
                        { label: "男子 (Male)", value: "male" },
                        { label: "女子 (Female)", value: "female" },
                      ]}
                      value={entryForm.gender}
                    />
                    <Field label="达标成绩 (毫秒)">
                      <Input
                        type="number"
                        placeholder="30000"
                        onChange={(event) => setEntryForm((current) => ({ ...current, qualifyingTimeMs: event.target.value }))}
                        value={entryForm.qualifyingTimeMs}
                      />
                    </Field>
                    <Button 
                      disabled={!selectedStandardId} 
                      type="submit"
                      loading={entrySubmitting}
                      className="rounded-xl h-11"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      添加条目
                    </Button>
                  </form>
               </div>

               {/* Entry List */}
               <div className="p-6">
                  <motion.div 
                    variants={STAGGER_CONTAINER}
                    initial="initial"
                    animate="animate"
                    className="grid gap-4 md:grid-cols-2"
                  >
                    <AnimatePresence mode="popLayout">
                      {entries.map((entry) => (
                        <motion.div
                          layout
                          key={entry.id}
                          variants={FADE_IN_UP}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <Card className="border-border/40 group hover:border-primary/20 hover:bg-primary/5 transition-all">
                            <CardContent className="p-5">
                               <div className="flex items-start justify-between">
                                  <div className="flex flex-col gap-3">
                                     <div className="flex items-center gap-2">
                                        <StandardBadge colorHex={entry.colorHex} label={entry.name} />
                                        <Badge variant="outline" className="bg-surface text-[10px] font-bold border-border/60 uppercase tracking-widest">
                                           {entry.gender}
                                        </Badge>
                                     </div>
                                     <h4 className="text-lg font-black tracking-tight text-foreground">{entry.eventDisplayName}</h4>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-[10px] font-bold text-muted/40 uppercase tracking-widest mb-1">Qualifying</div>
                                     <div className="text-2xl font-black text-primary tracking-tighter">
                                        {entry.qualifyingTimeMs} <span className="text-[10px] uppercase ml-0.5">ms</span>
                                     </div>
                                  </div>
                               </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {entries.length === 0 && selectedStandardId && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                       <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-muted/5 text-muted/20 mb-6">
                          <Target className="h-10 w-10" />
                       </div>
                       <h3 className="text-lg font-bold text-foreground">该标准组下暂无条目</h3>
                       <p className="text-muted font-medium mt-2">请使用上方表单为该体系添加具体的成绩要求。</p>
                    </div>
                  )}
                  
                  {!selectedStandardId && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                       <div className="flex h-20 w-20 items-center justify-center rounded-[32px] bg-muted/5 text-muted/20 mb-6">
                          <Layout className="h-10 w-10" />
                       </div>
                       <h3 className="text-lg font-bold text-foreground">请先选择或创建一个标准组</h3>
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminShell>
  );
}
