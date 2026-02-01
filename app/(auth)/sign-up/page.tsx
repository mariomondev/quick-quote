import type { Metadata } from "next";
import { SignUpForm } from "../_components/sign-up-form";

export const metadata: Metadata = {
  title: "Create Account - QuickQuote",
  description:
    "Create your QuickQuote account to start building professional quotes",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
