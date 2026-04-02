"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAdmin } from "@/lib/api/admin";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await loginAdmin({ username, password });
      toast.success("管理员登录成功");
      router.push("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <Card className="w-full max-w-md">
        <div className="font-mono text-xs uppercase tracking-[0.24em] text-primary/55">
          Admin Access
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-primary">管理员登录</h1>
        <p className="mt-2 text-sm text-muted">
          当前 MVP 只开放管理员操作，账号密码由后端配置文件控制。
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">账号</Label>
            <Input
              autoComplete="username"
              id="username"
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </div>
          <Button className="w-full" disabled={submitting} type="submit">
            {submitting ? "登录中..." : "进入后台"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
