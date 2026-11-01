"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/service/auth.service";
import type { VerifyOtpPayload, VerifyOtpResponse, LoginResponse } from "@/features/auth/type/passwordLessType";
import { toast } from "sonner"

export const authKeys = {
  me: ["auth", "me"] as const,
};

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();


  //Get nen dung query de lay thong tin user
  const meQuery = useQuery({
    queryKey: authKeys.me, // key cua thang do
    queryFn: authService.getMe, // func thuc thi,
    staleTime: 5*60*1000, // sau 5p thi thuc hien mot lan
    retry: false, // khong retry khi query bi loi
  })

  //send otp -> post -> mutation
  const sendCodeMutation = useMutation({
    mutationFn: (email: string) => authService.sendCode(email), // func thuc thi
    onSuccess:() => {
      toast.success("Mã xác thực đã được gửi đến hộp thư của bạn.");
    }
    // onError: (error) => {
    //   toast.error(error.response?.data?.message || "Có lỗi xảy ra khi send")
    // }
  })

  //Verify otp -> post -> mutation
  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload), // gui payload: email, code
    onSuccess: async (data: VerifyOtpResponse) => {
      await queryClient.invalidateQueries({queryKey: authKeys.me}) 
      toast.success("Xác thực thành công!");
      router.replace("/home-page");
    },
    // onError: (error: any) => {
    //   toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi verify")
    // }
  })

  //Logout -> post -> mutation
  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      toast.success("Đăng xuất thành công");
      router.replace("/auth/login");
    },
    onError: (error: unknown) => {
      queryClient.clear();
      router.replace("/auth/login");
    }
  })

  //return cac state va func
  return{
    //User state
    user: meQuery.data ?? null,
    isAuthenticated: !!meQuery.data,
    isLoading: meQuery.isLoading,
    
    //Gui otp
    sendCode: sendCodeMutation.mutate,
    isSendingCode: sendCodeMutation.isPending,
    sendCodeError: sendCodeMutation.error,
    
    //Verify otp
    verifyOtp: verifyOtpMutation.mutate,
    isVerifyingOtp: verifyOtpMutation.isPending,
    verifyOtpError: verifyOtpMutation.error,

    //Logout
    logout: logout.mutate,
    isLoggingOut: logout.isPending,
    logoutError: logout.error,
  }
}