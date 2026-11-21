import axios from "axios";

export const layThongBaoLoi = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", "); // join các lỗi thành 1 chuỗi
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Đã xảy ra lỗi, vui lòng thử lại";
};