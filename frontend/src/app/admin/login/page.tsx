"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { TimerReset, Lock, User, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/api/admin";
import { FADE_IN_UP, STAGGER_CONTAINER } from "@/lib/animations";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    
    try {
      await loginAdmin({ username, password });
      toast.success("管理员登录成功");
      router.push("/admin");
    } catch (error) {
      setError(true);
      toast.error(error instanceof Error ? error.message : "登录失败");
      // Vibration/shake effect handled by the error state in motion
    } finally {
      setSubmitting(false);
    }
  }

  const shakeVariants = {
    error: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };

  const cardVariants = {
    ...FADE_IN_UP,
    ...shakeVariants,
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-12 grid-sheen">
      <motion.div
        initial="initial"
        animate="animate"
        variants={STAGGER_CONTAINER}
        className="w-full max-w-md"
      >
        <motion.div variants={FADE_IN_UP} className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary text-white shadow-2xl shadow-primary/30">
            <TimerReset className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Swimming <span className="text-primary">Best</span>
            </h1>
            <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-muted/60">
              Administrative Console
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={error ? "error" : "animate"}
          variants={cardVariants}
        >
          <Card className="border-border/50 shadow-2xl shadow-primary/5">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-extrabold tracking-tight">管理员登录</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                当前系统仅开放内部管理。请输入您的凭据以进入后台。
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted/80">
                    管理账号
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
                    <Input
                      autoComplete="username"
                      id="username"
                      className="pl-11"
                      placeholder="Enter username"
                      onChange={(event) => setUsername(event.target.value)}
                      value={username}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted/80">
                    安全密码
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary" />
                    <Input
                      autoComplete="current-password"
                      id="password"
                      type="password"
                      className="pl-11"
                      placeholder="••••••••"
                      onChange={(event) => setPassword(event.target.value)}
                      value={password}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button 
                  className="w-full gap-2 rounded-2xl h-12 text-base" 
                  disabled={submitting} 
                  type="submit"
                >
                  {submitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span>进入管理控制台</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        <motion.p 
          variants={FADE_IN_UP}
          className="mt-8 text-center text-xs text-muted/60"
        >
          Protected by end-to-end encryption. Unauthorized access is prohibited.
        </motion.p>
      </motion.div>
    </div>
  );
}
