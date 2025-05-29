import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  plugins: [
    {
      id: "clinicData",
      $Infer: {
        session: {
          clinicData: { type: "string", nullable: true },
        },
      },
    },
  ],
});
