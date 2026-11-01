import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Đăng xuất thành công." },
    { status: 200 }
  );

  // Xóa cookie access_token khỏi trình duyệt
  response.cookies.delete("access_token");

  return response;
}
