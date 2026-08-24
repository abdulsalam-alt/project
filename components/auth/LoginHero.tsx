import Image from "next/image";

export default function LoginHero() {
  return (
    <section className="relative hidden h-full bg-[#14041D] lg:flex">
      <Image
        src="/images/auth/login-bg.png"
        alt="Login"
        fill
        priority
        className="object-cover"
      />
    </section>
  );
}