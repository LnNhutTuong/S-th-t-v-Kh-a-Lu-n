
import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/axios/server";

async function handleRequest(request: NextRequest) {
  // Lấy đường dẫn sau /api
  const path = request.nextUrl.pathname.replace(/^\/api/, "");

  // Lấy query params, ví dụ ?page=1
  const params = request.nextUrl.searchParams;

  // Lấy body nếu request có gửi dữ liệu
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  try {
    const response = await serverApi.request({
      method: request.method,
      url: path,
      params,
      data: body || undefined,
      headers: {
        "Content-Type":
          request.headers.get("content-type") || "application/json",
      },
      // Cho phép nhận cả status 400, 401, 404, 500...
      validateStatus: () => true,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch {
    return NextResponse.json(
      { message: "Không thể kết nối đến Backend" },
      { status: 502 },
    );
  }
}

// Hỗ trợ các phương thức HTTP
export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
