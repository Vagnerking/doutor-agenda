"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        (await authClient.signOut()).data?.success &&
          router.push("/authentication");
      }}
    >
      <LogOutIcon className="h-4 w-4" />
    </Button>
  );
}
