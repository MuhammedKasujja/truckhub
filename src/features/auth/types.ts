export interface AuthUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface User extends AuthUser {
  permissions: string[];
}

export type AuthResponse = {
  access_token: string;
  expires_in: number;
  user: AuthUser;
  permissions: string[];
};

export type UserSession = {
  access_token: string;
  expires_in: number;
  user: User;
};
