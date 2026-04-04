"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  Trophy, 
  Plus, 
  Settings2, 
  ArrowRight, 
  Save, 
  Search,
  Activity,
  Layers
} from "lucide-react";

import { AdminShell } from "@/components/layout/admin-shell";
import { Field } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createAdminEvent, listAdminEvents } from "@/lib/api/admin";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import type { EventDefinition } from "@/lib/types";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    poolLengthM: 25,
    distanceM: 25,
    stroke: "freestyle",
    effortType: "sprint",
    displayName: "",
  });

  useEffect(() => {
    listAdminEvents()
      .then((response) => setEvents(response.events))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = events.filter(event => 
    event.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    
    try {
      const created = await createAdminEvent(form);
      setEvents((current) => [...current, created]);
      setForm({
        poolLengthM: 25,
        distanceM: 25,
        stroke: "freestyle",
        effortType: "sprint",
        displayName: "",
      });
      setSuccess(true);
      toast.success("结构化项目已创建");
      setTimeout(() => setSuccess(false), 1500);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "创建失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell 
      description="管理系统中的比赛和测试项目。PB 计算和成绩趋势完全依赖于这些标准化的结构化项目。" 
      title="项目管理"
    >
      <div className="grid gap-8 xl:grid-cols-[400px_minmax(0,1fr)] items-start">
        {/* Form Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="sticky top-28 shadow-xl shadow-primary/5 border-border/40">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl">新建项目</CardTitle>
                  <CardDescription>定义一个标准化的游泳测试或比赛项目</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="泳池长度 (米)">
                    <Input
                      type="number"
                      placeholder="25"
                      onChange={(event) => setForm((current) => ({ ...current, poolLengthM: Number(event.target.value) }))}
                      value={form.poolLengthM}
                      required
                    />
                  </Field>
                  <Field label="项目距离 (米)">
                    <Input
                      type="number"
                      placeholder="50"
                      onChange={(event) => setForm((current) => ({ ...current, distanceM: Number(event.target.value) }))}
                      value={form.distanceM}
                      required
                    />
                  </Field>
                </div>

                <Field label="泳姿类型">
                  <Select
                    onChange={(event) => setForm((current) => ({ ...current, stroke: event.target.value }))}
                    value={form.stroke}
                    required
                  >
                    <option value="freestyle">自由泳 (Freestyle)</option>
                    <option value="breaststroke">蛙泳 (Breaststroke)</option>
                    <option value="backstroke">仰泳 (Backstroke)</option>
                    <option value="butterfly">蝶泳 (Butterfly)</option>
                    <option value="medley">混合泳 (Medley)</option>
                  </Select>
                </Field>

                <Field label="测试/比赛性质">
                  <Select
                    onChange={(event) => setForm((current) => ({ ...current, effortType: event.target.value }))}
                    value={form.effortType}
                    required
                  >
                    <option value="sprint">冲刺 (Sprint)</option>
                    <option value="pace">配速 (Pace)</option>
                    <option value="technique">技术测试 (Technique)</option>
                    <option value="endurance">耐力 (Endurance)</option>
                    <option value="race">正式比赛 (Race)</option>
                  </Select>
                </Field>

                <Field label="显示名称 (可选)">
                  <Input
                    placeholder="留空则由系统自动拼写"
                    onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                    value={form.displayName}
                  />
                </Field>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  className="w-full gap-2 h-12 rounded-2xl" 
                  type="submit"
                  loading={submitting}
                  success={success}
                >
                  <Save className="h-4 w-4" />
                  保存项目定义
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* List Card */}
        <motion.div variants={FADE_IN_UP}>
          <Card className="shadow-xl shadow-primary/5 min-h-[600px] border-border/40">
            <CardHeader className="pb-6 border-b border-border/40">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle>项目库资源</CardTitle>
                    <CardDescription>系统中已定义的 {events.length} 个结构化项目</CardDescription>
                  </div>
                </div>
                
                <div className="relative w-full md:w-64">
                   <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                   <Input 
                      placeholder="搜索项目名称..." 
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
                 className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
               >
                 <AnimatePresence mode="popLayout">
                   {filteredEvents.map((event) => (
                     <motion.div
                       layout
                       key={event.id}
                       variants={FADE_IN_UP}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="group"
                     >
                       <Card className="h-full border-border/40 transition-all hover:border-primary/20 hover:bg-primary/5">
                         <CardContent className="p-6 flex flex-col gap-4">
                           <div className="flex items-start justify-between">
                             <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                               <Trophy className="h-6 w-6" />
                             </div>
                             <Badge variant="outline" className="rounded-full bg-surface text-[10px] font-bold uppercase tracking-widest border-border/60">
                                {event.effortType}
                             </Badge>
                           </div>
                           
                           <div>
                              <h3 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                                {event.displayName}
                              </h3>
                              <div className="mt-2 flex flex-wrap gap-2">
                                 <Badge className="bg-muted/10 text-muted border-transparent text-[10px] rounded-md font-bold">
                                    {event.distanceM}m
                                 </Badge>
                                 <Badge className="bg-muted/10 text-muted border-transparent text-[10px] rounded-md font-bold uppercase">
                                    {event.stroke.slice(0, 4)}
                                 </Badge>
                                 <Badge className="bg-muted/10 text-muted border-transparent text-[10px] rounded-md font-bold">
                                    Pool: {event.poolLengthM}m
                                 </Badge>
                              </div>
                           </div>

                           <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Definition ID: {event.id.slice(0, 8)}</span>
                              <Activity className="h-4 w-4 text-primary/40" />
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </motion.div>

               {filteredEvents.length === 0 && !loading && (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted/5 text-muted/20 mb-4">
                       <Layers className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">没有找到任何项目</h3>
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
