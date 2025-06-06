import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    usePlural: true,
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
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
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "usersTable",
  },
  session: {
    modelName: "sessionsTable",
    additionalFields: {
      clinicData: {
        type: "string",
        nullable: true,
      },
    },
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
});
