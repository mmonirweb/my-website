import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { LoginInput } from '../types/schema';

export const AUTH_USER_KEY = ['auth', 'user'];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch Current User (প্রতিবার কুকি থেকে লাইভ টোকেন চেক করবে)
  const { data: user, isLoading, isError } = useQuery({
    queryKey: AUTH_USER_KEY,
    queryFn: authService.getCurrentUser,
    enabled: !!Cookies.get('auth_token'),
    retry: false,
    staleTime: 1000 * 60 * 5, // ৫ মিনিট ক্যাশ রাখবে যাতে ঘন ঘন এপিআই কল না হয়
  });

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginInput) => authService.login(credentials),
    onSuccess: (response) => {
      // ১. API এর উত্তর থেকে টোকেন বের করে কুকিতে সেভ করা
      const token = response?.token || response?.data?.token || response?.access_token;
      
      if (token) {
        Cookies.set('auth_token', token, { expires: 7, path: '/' });
      }

      // ২. ইউজার ডাটা সেভ এবং ইউজার কুয়েরি রিফ্রেশ
      const userData = response?.user || response?.data?.user || response?.data;
      queryClient.setQueryData(AUTH_USER_KEY, userData);
      queryClient.invalidateQueries({ queryKey: AUTH_USER_KEY });

      // ৩. ড্যাশবোর্ডে পাঠানো
      router.push('/dashboard');
    },
  });

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      Cookies.remove('auth_token', { path: '/' });
      queryClient.setQueryData(AUTH_USER_KEY, null);
      queryClient.clear();
      router.push('/login');
    },
    onError: () => {
      // এপিআই এরর দিলেও ফ্রন্টএন্ড থেকে কুকি ফেলে দিয়ে বের করে দেবে
      Cookies.remove('auth_token', { path: '/' });
      queryClient.clear();
      router.push('/login');
    }
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
  };
}