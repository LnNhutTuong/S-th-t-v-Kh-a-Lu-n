import { clientApi } from "@/lib/axios/client";
import type {LoginResponse, VerifyOtpPayload, VerifyOtpResponse } from "@/features/auth/type/passwordLessType";
import type { AuthUser } from "@/features/auth/type/authUser";

export const authService = {

  //============================
  //======= Passwordless =======
  //============================
  
  // otp duoc gui boi thang Auth0
  sendCode: async (email: string) => {
    const { data } = await clientApi.post<{ email: string }>(
      "/auth/passwordless/start",
      { email }
    );
    return data;
  },

  //veriy otp cua Auth0
  verifyOtp: async (payload: VerifyOtpPayload) => {
    const { data } = await clientApi.post<VerifyOtpResponse>(
      "/auth/passwordless/verify",
      payload,
    );
    return data;
  },

  // lay thong tin user hien tai
  getMe: async () => {
    const { data } = await clientApi.get<AuthUser>("/auth/me");
    return data;
  },
  
  // logout cua thang auth0
  logout: async () => {
    const { data } = await clientApi.post<{ message: string }>("/auth/logout");
    return data;
  },
};