import type { Metadata } from "next";

import { EmailActionHandler } from "@/components/auth/email-action-handler";

export const metadata: Metadata = {
  title: "Secure account action | MediTap",
  description: "Complete a MediTap email verification or password reset.",
};

export default function EmailActionPage() {
  return <EmailActionHandler />;
}
