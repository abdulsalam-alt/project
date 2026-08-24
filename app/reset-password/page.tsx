import {
  AuthLayout,
  LoginHero,
  ResetPasswordForm,
} from "@/components/auth";

export default function ResetPasswordPage() {
  return (
    <AuthLayout hero={<LoginHero />}>
      <ResetPasswordForm />
    </AuthLayout>
  );
}