export type JwtPayload = {
  sub: string;
  email: string;
  ten: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  ten: string | null;
};


export type LoginResponse = {
  accessToken: string;
  nguoiDung: {
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

