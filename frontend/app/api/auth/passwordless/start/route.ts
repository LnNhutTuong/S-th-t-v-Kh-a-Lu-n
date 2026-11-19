import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {serverApi} from "@/lib/axios/server"
import axios from "axios";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Kiểm tra Content-Type và dữ liệu đầu vào.
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(
        { message: "Yêu cầu không hợp lệ." },
        { status: 415 },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("email" in body) ||
      typeof body.email !== "string"
    ) {
      return NextResponse.json(
        { message: "Vui lòng nhập email hợp lệ." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    if(email.length > 254){
      return NextResponse.json(
        {message: "Vui lòng nhập email hợp lệ"},
        {status: 400}
      )
    }

    if (!process.env.INTERNAL_API_KEY){
      return NextResponse.json({ message: "Lỗi hệ thống." }, { status: 500 });
    } 
    // TODO: Áp dụng rate limit theo IP và email tại đây.

    let allowed: boolean = false;
    try {
      const { data } = await serverApi.post<boolean>(
        "/auth/check-email",
        { email },
        {
          headers: { "x-internal-key": process.env.INTERNAL_API_KEY },
          timeout: 30000,
        },
      );

      allowed = data;
    } catch (error) {
      if(axios.isAxiosError(error) && error.response?.status === 403){
        return NextResponse.json(
          {message: "Email chưa có quyền truy cập"},
          {status: 403}
        )
      }
      return NextResponse.json(
        { message: "Máy chủ đang bảo trì, vui lòng thử lại sau." },
        { status: 502 },
      );
    }

    if (!allowed) {
      return NextResponse.json(
        { message: "Vui lòng sử dụng email AGU." },
        { status: 403 },
      );
    }

    await auth0.passwordless.start({
      connection: "email",
      email,
      send: "code",
    });

    return NextResponse.json({
      message: "Nếu email đủ điều kiện, mã xác minh sẽ được gửi.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Không thể gửi mã lúc này. Vui lòng thử lại sau." },
      { status: 400 },
    );
  }
}