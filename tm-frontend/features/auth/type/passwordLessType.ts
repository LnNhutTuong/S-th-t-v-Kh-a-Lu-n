export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
  redirectTo: string;
}

export type LoginResponse = {
  accessToken: string;
  user: {
    email: string;
    ten: string | null;
    vaiTro: {
      heThong: string[],
      boPhan: {
        idBoPhan: string,
        tenBoPhan: string,
        vaiTro: string
      }[]
    }
  };
};
