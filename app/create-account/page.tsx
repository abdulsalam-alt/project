import {
  AuthLayout,
  AuthHero,
  CreateAccountForm,
} from "@/components/auth";

export default function CreateAccountPage() {
  return (
    <AuthLayout
      hero={<AuthHero />}
    >
      <CreateAccountForm />
    </AuthLayout>
  );
}