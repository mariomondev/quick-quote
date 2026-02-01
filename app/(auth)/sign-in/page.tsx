import type { Metadata } from "next";
import { SignInForm } from "../_components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In - QuickQuote",
  description: "Sign in to your QuickQuote account",
};

export default function SignInPage() {
  return <SignInForm />;
}
