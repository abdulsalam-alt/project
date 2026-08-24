import {
  AuthLayout,
  LoginHero,
  LoginForm,
} from "@/components/auth";

export default function LoginPage() {
  return (
    <AuthLayout hero={<LoginHero />}>
      <LoginForm />
    </AuthLayout>
  );
}