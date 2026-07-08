import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const { data: usersList, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/users").catch(() => ({ data: [] }));
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/admin/users/${data.userId}/status`, data),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update user status"),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: any) => await apiClient.put(`/admin/users/${data.userId}/role`, data),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to update user role"),
  });

  const handleStatusChange = (userId: number, newStatus: any) => {
    if (confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ userId, status: newStatus });
    }
  };

  const handleRoleChange = (userId: number, newRole: any) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole.replace('_', ' ')}?`)) {
      updateRoleMutation.mutate({ userId, role: newRole });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Users</h2>
          <p className="text-sm text-slate-500 mt-1">Manage system access, roles, and user accounts.</p>
        </div>
      </div>
      
      <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Name</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Email</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Role</th>
                  <th className="text-left py-4 px-6 font-bold text-slate-500 uppercase tracking-wider text-[11px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-medium">Loading users...</td></tr>
                ) : usersList?.length ? (
                  usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="flex items-center gap-2">
                            {u.name || "Unknown User"}
                            {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck className="w-4 h-4 text-indigo-500" /> : null}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">{u.email || "N/A"}</td>
                      <td className="py-4 px-6">
                        <Select 
                          value={u.role} 
                          onValueChange={(v) => handleRoleChange(u.id, v)}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs bg-slate-50 border-slate-200 focus:ring-indigo-500 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="delivery_man">Delivery Man</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-6">
                        <Select 
                          value={u.status} 
                          onValueChange={(v) => handleStatusChange(u.id, v)}
                        >
                          <SelectTrigger className={`w-[120px] h-8 text-xs border-slate-200 focus:ring-indigo-500 rounded-lg font-medium ${u.status === 'blocked' ? 'bg-rose-50 text-rose-700' : u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-12 text-slate-500 font-medium bg-slate-50/50">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
