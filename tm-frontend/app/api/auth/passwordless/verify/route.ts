import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { verifyOtpRequestSchema } from "@/features/auth/schema/passwordless.schema";
import { serverApi } from "@/lib/axios/server";
import type { LoginResponse } from "@/features/auth/type/passwordLessType";
import axios from "axios";
import {cookies } from "next/headers"

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // 1. Kiểm tra Content-Type
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { message: "Yêu cầu không hợp lệ." },
        { status: 415 },
      );
    }

    if (!process.env.INTERNAL_API_KEY) {
      return NextResponse.json(
        { message: "Lỗi hệ thống." },
        { status: 500 },
      );
    }

    // 2. Parse body + Validate bằng Zod
    const body: unknown = await request.json();
    const parsed = verifyOtpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Email hoặc mã xác minh không hợp lệ." },
        { status: 400 },
      );
    }

    const { email, code } = parsed.data;

    // 3. Verify OTP qua Auth0
    await auth0.passwordless.verify({
      connection: "email",
      email,
      verificationCode: code,
    });

    // 4. Gọi Backend lấy JWT bằng Axios (có type cho response)
    let beResponse;
    try{
      beResponse = await serverApi.post<{message: string, data: LoginResponse}>(
      "/auth/passwordless-login",
      { email },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_API_KEY,
        },
      },
    );}
    catch(error){
      if(axios.isAxiosError(error) && error.response?.status === 403){
        return NextResponse.json(
          {message: "Email chưa có quyền truy cập"},
          {status: 403}
        )
      }
      throw error;
    }

    if(!beResponse){
      return NextResponse.json(
        { message: "Lỗi hệ thống." },
        { status: 500 },
      );
    }

    const { accessToken, user } = beResponse.data.data;

    // 5. Set accessToken vào httpOnly cookie + trả response
    (await cookies()).set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({
      message: "Đăng nhập thành công.",
      redirectTo: "/home-page",
      user,
    });
    
  } catch (error) {
    console.error("Passwordless verify error:", error);
    return NextResponse.json(
      { message: "Mã xác minh không đúng, đã hết hạn hoặc không thể sử dụng." },
      { status: 400 },
    );
  }
}
