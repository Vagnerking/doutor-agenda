import { User } from "better-auth";

import { authClient } from "@/lib/auth-client";

export const getUserFromClientSession = () => {
  const result = authClient.useSession();

  if (!result) {
    throw new Error("Unauthorized");
  }

  return result.data?.user as User | null;
};
