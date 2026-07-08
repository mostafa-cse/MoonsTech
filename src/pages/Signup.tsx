import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const register = useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.post("/auth/register", userData);
      return data;
    },
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Signup failed");
    }
  });

  const onSubmit = (values: SignupFormValues) => {
    register.mutate({
      fullName: values.name,
      email: values.email,
      phoneNumber: values.phone,
      password: values.password
    });
  };

  const inputClass = "flex h-12 w-full rounded-xl border border-gray-200/80 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 hover:bg-white/80";

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
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Create an account</CardTitle>
            <p className="text-sm text-gray-500">
              Join us and start shopping today
            </p>
          </CardHeader>
          <CardContent className="pb-10 px-8 sm:px-10 relative z-20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  {...formRegister("name")}
                  className={`flex h-12 w-full rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...formRegister("email")}
                  className={`flex h-12 w-full rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+8801..."
                  {...formRegister("phone")}
                  className={`flex h-12 w-full rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 font-medium">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    {...formRegister("password")}
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
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...formRegister("confirmPassword")}
                  className={`flex h-12 w-full rounded-xl border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200/80 focus:ring-indigo-500/20 focus:border-indigo-400'} bg-white/60 backdrop-blur-sm px-4 py-2 text-sm transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 hover:bg-white/80`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 font-semibold text-sm transition-all duration-200 mt-2" 
                size="lg" 
                disabled={register.isPending}
              >
                {register.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" /> Create Account
                  </span>
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
