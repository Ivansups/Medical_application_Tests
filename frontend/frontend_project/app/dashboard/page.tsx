import { getServerSession } from "next-auth";
import { authOptions } from "@/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Добро пожаловать, {session.user.email}</h1>
      <p>ID: {session.user.id}</p>
      <p>Admin: {session.user.is_admin ? "Да" : "Нет"}</p>
    </div>
  );
}