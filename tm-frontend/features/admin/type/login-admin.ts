import { WorkspaceRole } from "@/features/auth/type/authUser";

export interface AdminLoginPayload {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    message: string;
    data: {
       email: string;
        name: string | null;
        roles: {
          system: string[];
          workspace: WorkspaceRole[];
        };
    }
}