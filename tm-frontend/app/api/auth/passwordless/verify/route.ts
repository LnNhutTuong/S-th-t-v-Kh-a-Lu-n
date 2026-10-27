import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export const runtime = "nodejs";

const AGU_EMAIL_REGEX = /^[^\s@]+@student.agu\.edu\.vn$/i;
const OTP_REGEX = /^\d{6}$/;

export async function POST(request: NextRequest) {
  try {
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
      !("code" in body) ||
      typeof body.email !== "string" ||
      typeof body.code !== "string"
    ) {
      return NextResponse.json(
        { message: "Email hoặc mã xác minh không hợp lệ." },
        { status: 400 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const code = body.code.trim();

    if (
      email.length > 254 ||
      !AGU_EMAIL_REGEX.test(email) ||
      !OTP_REGEX.test(code)
    ) {
      return NextResponse.json(
        { message: "Email hoặc mã xác minh không hợp lệ." },
        { status: 400 },
      );
    }

    // TODO: Áp dụng rate limit theo IP và email.
    // Không log mã OTP hoặc dữ liệu bí mật.

    await auth0.passwordless.verify({
      connection: "email",
      email,
      verificationCode: code,
    });

    // SDK đã xác minh OTP và tạo session cookie bảo mật.
    return NextResponse.json({
      message: "Đăng nhập thành công.",
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Auth0 Passwordless verify error:", error);
    return NextResponse.json(
      { message: "Mã xác minh không đúng, đã hết hạn hoặc không thể sử dụng." },
      { status: 400 },
    );
  }
}