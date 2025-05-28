"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        const response = await authClient.signOut();
        if (response.data?.success) {
          router.push("/authentication");
        }
      }}
    >
      <LogOutIcon className="h-4 w-4" />
    </Button>
  );
}
