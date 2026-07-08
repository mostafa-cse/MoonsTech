import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const login = useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post("/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Logged in successfully!");
      if (data.role === "Admin" || data.role === "SuperAdmin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/";
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    }
  });

  const devLogin = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post("/auth/login", { email: "admin@moons.tech", password: "AdminPassword123!" });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Logged in as Dev Admin!");
      window.location.href = "/admin";
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Dev login failed");
    }
  });

  const onSubmit = (values: LoginFormValues) => {
    login.mutate(values);
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-12 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-indigo-50/50 to-slate-50" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />

        <Card className="w-full max-w-md glass border-0 relative z-10 rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-white/40" />
          <CardHeader className="space-y-1 text-center pb-2 pt-10 relative z-20">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200/50">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</CardTitle>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your account
            </p>
          </CardHeader>
          <CardContent className="pb-10 px-8 sm:px-10 relative z-20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2.5">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className={`flex h-12 w-full rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <span className="text-xs font-medium text-indigo-600 cursor-pointer hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`flex h-12 w-full rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 pr-11 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 font-semibold text-sm transition-all duration-200" 
                size="lg" 
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Create account
              </Link>
            </div>

            {import.meta.env.DEV && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-dashed" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-medium">
                      Dev Only
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full h-10 rounded-xl"
                  variant="secondary"
                  onClick={() => devLogin.mutate()}
                  disabled={devLogin.isPending}
                >
                  Bypass Login (Admin)
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
