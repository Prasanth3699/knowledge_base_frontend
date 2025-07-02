import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export const metadata: Metadata = {
  title: "Reset Password | Knowledge Base",
  description: "Reset your Knowledge Base account password",
};

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return <ResetPasswordForm token={params.token} />;
}

