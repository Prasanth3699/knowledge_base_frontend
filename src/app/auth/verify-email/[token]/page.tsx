import { Metadata } from "next";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

interface VerifyEmailPageProps {
  params: {
    token: string;
  };
}

export const metadata: Metadata = {
  title: "Verify Email | Knowledge Base",
  description: "Verify your Knowledge Base account email address",
};

export default function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  return <VerifyEmailForm token={params.token} />;
}