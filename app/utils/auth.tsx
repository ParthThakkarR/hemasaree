import { getServerSession } from "next-auth/next";
import { authOptions } from "@lib/auth";

export async function verifyAdminToken(req: Request): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const isAdmin = (session.user as any).isAdmin;
    const id = (session.user as any).id;

    if (!isAdmin || !id) {
      return null;
    }

    return id;
  } catch (error) {
    console.error("[VERIFY_ADMIN_ERROR]", error);
    return null;
  }
}
