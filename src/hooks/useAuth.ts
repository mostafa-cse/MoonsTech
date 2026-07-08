import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import apiClient from "@/lib/api-client";

type User = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (localStorage.getItem('isLoggedIn') !== 'true') return null;
      try {
        const { data } = await apiClient.get<User>('/auth/me');
        return data;
      } catch (err) {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('isLoggedIn');
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      window.location.href = '/login';
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isAdmin: user?.role === "Admin" || user?.role === "SuperAdmin",
      isBuyer: user?.role === "Buyer" || user?.role === "Admin" || user?.role === "SuperAdmin",
      isDeliveryMan: user?.role === "DeliveryMan",
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch],
  );
}
