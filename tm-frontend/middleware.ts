import { NextRequest, NextResponse } from "next/server";
// import { auth0 } from "./lib/auth0";

// export async function proxy(request: NextRequest) {
//   return auth0.middleware(request);
// }

// 1. Định nghĩa các tiền tố route cần bảo vệ
const protectedPrefixes = ["/home-page"];

// 2. Định nghĩa các route đăng nhập/đăng ký
const authPrefixes = ["/auth/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookie
  const token = request.cookies.get("access_token")?.value;

  // Kiểm tra xem route hiện tại có thuộc nhóm protected hay không
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Kiểm tra xem route hiện tại có thuộc nhóm auth hay không
  const isAuthRoute = authPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Trường hợp 1: Vào trang bảo vệ nhưng chưa có token -> Đẩy về login
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    // Lưu lại URL gốc để sau khi đăng nhập xong có thể chuyển hướng lại trang cũ
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Trường hợp 2: Đã đăng nhập nhưng cố tình vào lại trang login -> Đẩy vào home-page
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/home-page", request.url));
  }

  // Trường hợp 3: Hợp lệ -> Cho đi tiếp
  return NextResponse.next();
}

// 3. Cấu hình Matcher để bỏ qua static assets, file hệ thống Next.js
export const config = {
  matcher: [
    /*
     * Khớp tất cả request TRỪ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc.)
     * - api routes (để API xử lý lỗi 401 riêng, không redirect html)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};



