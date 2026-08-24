import {
  AuthLayout,
  LoginHero,
  ForgotPasswordForm,
} from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout hero={<LoginHero />}>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}