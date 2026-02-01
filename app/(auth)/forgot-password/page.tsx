import type { Metadata } from "next";
import { ForgotPasswordForm } from "../_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password - QuickQuote",
  description: "Reset your QuickQuote account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
