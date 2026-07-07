import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function UsersManagement() {
  const utils = trpc.useUtils();
  const { data: usersList, isLoading } = trpc.admin.users.useQuery();

  const updateStatusMutation = trpc.admin.updateUserStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated");
      utils.admin.users.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.admin.users.invalidate();
    },
    onError: (err) => toast.error(err.message),
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Users</h2>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
                ) : usersList?.length ? (
                  usersList.map((u: any) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium flex items-center gap-2">
                        {u.name || "N/A"}
                        {u.role === 'admin' || u.role === 'super_admin' ? <ShieldCheck className="w-4 h-4 text-blue-500" /> : null}
                      </td>
                      <td className="py-2 px-4">{u.email || "N/A"}</td>
                      <td className="py-2 px-4">
                        <Select 
                          value={u.role} 
                          onValueChange={(v) => handleRoleChange(u.id, v)}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buyer">Buyer</SelectItem>
                            <SelectItem value="delivery_man">Delivery Man</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-2 px-4">
                        <Select 
                          value={u.status} 
                          onValueChange={(v) => handleStatusChange(u.id, v)}
                        >
                          <SelectTrigger className={`w-[110px] h-8 text-xs ${u.status === 'blocked' ? 'text-red-600' : ''}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
