import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  hero: ReactNode;
}

export default function AuthLayout({
  children,
  hero,
}: AuthLayoutProps) {
  return (
    <main className="bg-[#F8F8F8]">
      <div className="mx-auto flex max-w-[1728px]">
        {/* Left Side */}
        <section className="w-full bg-white lg:w-1/2">
          {children}
        </section>

        {/* Right Side */}
        <aside className="hidden w-1/2 bg-[#14041D] lg:flex">
          <div className="w-full">
            {hero}
          </div>
        </aside>
      </div>
    </main>
  );
}