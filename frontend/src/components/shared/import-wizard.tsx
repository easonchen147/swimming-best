"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileUp, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ArrowRight, 
  Loader2,
  Table,
  Database
} from "lucide-react";

import {
  confirmImportCsv,
  getImportTemplateUrl,
  previewImportCsv,
  type ImportConfirmResponse,
  type ImportPreviewResponse,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";

export function ImportWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [result, setResult] = useState<ImportConfirmResponse | null>(null);
  
  const [previewing, setPreviewing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handlePreview() {
    if (!file) {
      toast.error("请先选择 CSV 文件");
      return;
    }

    setPreviewing(true);
    try {
      const response = await previewImportCsv(file);
      setPreview(response);
      setResult(null);
      toast.success("解析预览成功");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "预览失败");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleConfirm() {
    if (!preview) return;

    setConfirming(true);
    try {
      const response = await confirmImportCsv(preview.validRows);
      setResult(response);
      toast.success("所有数据已入库");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "导入失败");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <motion.div 
      initial="initial"
      animate="animate"
      variants={STAGGER_CONTAINER}
      className="flex flex-col gap-8"
    >
      {/* Upload Card */}
      <motion.div variants={FADE_IN_UP}>
        <Card className="shadow-xl shadow-primary/5 border-border/40 overflow-hidden">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">上传成绩表格</CardTitle>
                <CardDescription>上传包含学员历史成绩的 CSV 文件进行批量导入</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="relative group">
               <label className={cn(
                 "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[32px] cursor-pointer transition-all duration-300",
                 file ? "bg-primary/[0.02] border-primary/30 shadow-inner" : "bg-surface border-border/60 hover:bg-primary/[0.01] hover:border-primary/20"
               )}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                     <div className={cn(
                       "flex h-12 w-12 items-center justify-center rounded-full mb-3 transition-colors",
                       file ? "bg-primary text-white" : "bg-muted/10 text-muted"
                     )}>
                        <FileSpreadsheet className="h-6 w-6" />
                     </div>
                     <p className="mb-1 text-sm font-bold text-foreground">
                        {file ? file.name : "点击或拖拽文件至此处"}
                     </p>
                     <p className="text-xs text-muted/60 uppercase tracking-widest font-bold">
                        CSV files only (Max 10MB)
                     </p>
                  </div>
                  <input
                    aria-label="导入文件"
                    accept=".csv"
                    onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
               </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
               <a
                 href={getImportTemplateUrl()}
                 className="group inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface px-5 py-2.5 text-xs font-bold text-muted transition-all hover:border-primary/20 hover:text-primary active:scale-95"
               >
                 <Download className="h-3.5 w-3.5" />
                 下载规范模板 (Template)
               </a>
               
               <Button 
                 onClick={handlePreview} 
                 disabled={!file || previewing}
                 loading={previewing}
                 className="rounded-full px-8 shadow-lg shadow-primary/20"
               >
                 <span>开始解析预览</span>
                 <ArrowRight className="h-4 w-4 ml-2" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Section */}
      <AnimatePresence>
        {preview && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-8"
          >
            <Card className="shadow-xl shadow-primary/5 border-border/40">
              <CardHeader className="pb-6 border-b border-border/40 bg-surface/30">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                      <Table className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">数据预览确认</CardTitle>
                      <CardDescription>解析完成，请在确认入库前检查是否有误</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                     <Badge className="bg-emerald-500/10 text-emerald-600 border-transparent rounded-full px-3 py-1 font-bold">
                        Valid: {preview.summary.valid}
                     </Badge>
                     {preview.summary.errors > 0 && (
                       <Badge className="bg-rose-500/10 text-rose-600 border-transparent rounded-full px-3 py-1 font-bold">
                          Errors: {preview.summary.errors}
                       </Badge>
                     )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-auto scrollbar-thin">
                  <div className="divide-y divide-border/40">
                    {preview.validRows.map((row) => (
                      <div className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-primary/[0.01]" key={row.line}>
                        <div className="flex items-center gap-4">
                           <div className="text-xs font-bold text-muted/40 font-mono w-6">#{row.line}</div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-foreground">{row.swimmerSlug}</span>
                              <span className="text-[10px] font-bold text-muted/60 uppercase tracking-widest">{row.eventDisplay}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-base font-black text-primary tracking-tight">{row.timeSeconds}s</span>
                           <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                      </div>
                    ))}
                    
                    {preview.errorRows.map((row) => (
                      <div className="flex items-start justify-between px-6 py-4 bg-rose-50/30" key={row.line}>
                        <div className="flex gap-4">
                           <div className="text-xs font-bold text-rose-300 font-mono w-6 pt-1">#{row.line}</div>
                           <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-rose-900">解析错误</span>
                              <div className="flex flex-wrap gap-1.5">
                                 {row.errors.map((err, i) => (
                                   <span key={i} className="text-[10px] font-medium text-rose-600/80 bg-rose-100/50 px-2 py-0.5 rounded-md">
                                      {err}
                                   </span>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-6 border-t border-border/40 bg-surface/10 justify-between gap-4">
                 <div className="text-xs font-bold text-muted/60 uppercase tracking-widest">
                    Ready to process {preview.summary.valid} records
                 </div>
                 <Button 
                   onClick={handleConfirm} 
                   disabled={preview.summary.valid === 0 || confirming}
                   loading={confirming}
                   className="rounded-full px-10 shadow-xl shadow-primary/20"
                 >
                   确认并导入数据库
                 </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Card */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center"
          >
            <Card className="w-full max-w-2xl bg-emerald-500 text-white border-none shadow-2xl shadow-emerald-500/20 overflow-hidden">
               <div className="absolute inset-0 z-0">
                  <div className="grid-sheen absolute inset-0 opacity-10" />
               </div>
               <CardContent className="relative z-10 p-10 flex flex-col items-center text-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl">
                     <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  
                  <div>
                     <h2 className="text-3xl font-black tracking-tight">导入成功！</h2>
                     <p className="mt-2 text-white/80 font-medium">所有有效数据已完成结构化存储并同步至公开档案</p>
                  </div>

                  <div className="grid grid-cols-3 gap-8 w-full max-w-md mt-4">
                     <div className="flex flex-col gap-1">
                        <span className="text-3xl font-black">{result.imported}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">成绩条目</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-3xl font-black">{result.contextsCreated}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">场景定义</span>
                     </div>
                     <div className="flex flex-col gap-1">
                        <span className="text-3xl font-black">{result.tagsCreated}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">新标签</span>
                     </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50"
                    onClick={() => { setFile(null); setPreview(null); setResult(null); }}
                  >
                     继续导入其他文件
                  </Button>
               </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
