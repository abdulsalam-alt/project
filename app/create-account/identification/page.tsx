import {
  AuthLayout,
  AuthHero,
  IdentificationForm,
} from "@/components/auth";

export default function IdentificationPage() {
  return (
    <AuthLayout hero={<AuthHero />}>
      <IdentificationForm />
    </AuthLayout>
  );
}