import { User } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    is_admin: boolean;
    access_token: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      is_admin: boolean;
    };
    access_token?: string;
  }
}