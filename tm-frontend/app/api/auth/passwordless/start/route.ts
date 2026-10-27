import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

const AGU_EMAIL_REGEX = /^[^\s@]+@student.agu\.edu\.vn$/i;

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

    if (
      email.length > 254 ||
      !AGU_EMAIL_REGEX.test(email)
    ) {
      return NextResponse.json(
        { message: "Vui lòng sử dụng email @agu.edu.vn." },
        { status: 400 },
      );
    }

    // TODO: Áp dụng rate limit theo IP và email tại đây.
    // TODO: Nếu chỉ cho phép tài khoản đã được trường cấp,
    // kiểm tra email có trong danh sách người dùng hợp lệ.

    await auth0.passwordless.start({
      connection: "email",
      email,
      send: "code",
    });

    return NextResponse.json({
      message: "Nếu email đủ điều kiện, mã xác minh sẽ được gửi.",
    });
  } catch (error) {
    console.error("Auth0 Passwordless start error:", error);
    return NextResponse.json(
      { message: "Không thể gửi mã lúc này. Vui lòng thử lại sau." },
      { status: 400 },
    );
  }
}