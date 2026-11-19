import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/axios/server";
import type { AuthUser } from "@/features/auth/type/authUser";
import axios from "axios";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    // Gọi BE /auth/me kèm Bearer token
    const { data: user } = await serverApi.get<AuthUser>("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
        const response = NextResponse.json({ user: null }, { status: 401 });
        response.cookies.delete("access_token");
        return response;
      }
      // Lỗi khác: giữ cookie, báo lỗi tạm thời
      return NextResponse.json({ user: null }, { status: 503 });
  }
}
