import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Props {
  title: string;
}

export default function EventBreadcrumb({ title }: Props) {
  return (
    <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/discover" className="hover:text-black">
          Discover
        </Link>

        <ChevronRight size={15} />

        <span className="font-medium text-[#241507]">
          {title}
        </span>
      </div>
    </div>
  );
}