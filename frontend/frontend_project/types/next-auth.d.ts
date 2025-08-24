import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      is_admin: boolean;
    };
    access_token: string;
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    is_admin: boolean;
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    is_admin: boolean;
    access_token: string;
  }
}