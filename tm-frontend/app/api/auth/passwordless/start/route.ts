import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getAllowedDomains

 } from "@/utils/auth/check-domain";
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
    const allowedDomains = getAllowedDomains();
    const emailDomain = email.split("@")[1];
    if (
      email.length > 254 ||
      !emailDomain ||
      !allowedDomains.includes(emailDomain)
    ) {
      return NextResponse.json(
        { message: "Vui lòng sử dụng email trường cung cấp." },
        { status: 400 },
      );
    }

    // TODO: Áp dụng rate limit theo IP và email tại đây.

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