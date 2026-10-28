import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { AppError } from "@/errors/AppError"

/**
 * Gets the current session from NextAuth.
 * Throws an AppError if the session is missing or the user is not authenticated.
 */
export async function getBackendSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    throw new AppError("Unauthorized: No active session", 401)
  }

  return {
    session,
    userId: session.user.id,
    companyId: session.user.companyId || null,
  }
}
