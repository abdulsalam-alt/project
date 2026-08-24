import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  slug: string;
  isActive: boolean;
  onClick: (slug: string) => void;
}

export default function CategoryCard({
  icon: Icon,
  title,
  slug,
  isActive,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(slug)}
      className={`
        group
        flex
        w-full
        flex-col
        items-center
        justify-center
        rounded-[24px]
        border
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg

        ${
          isActive
            ? "border-[#8B6045] bg-[#F7EFE8]"
            : "border-[#ECECEC] bg-white hover:border-[#8B6045]"
        }
      `}
    >
      {/* Icon */}
      <div
        className={`
          flex
          h-16
          w-16
          items-center
          justify-center
          rounded-full
          transition-all

          ${
            isActive
              ? "bg-[#8B6045]"
              : "bg-[#F7F7F7] group-hover:bg-[#8B6045]"
          }
        `}
      >
        <Icon
          size={30}
          className={`
            transition-colors

            ${
              isActive
                ? "text-white"
                : "text-[#8B6045] group-hover:text-white"
            }
          `}
        />
      </div>

      {/* Title */}
      <span
        className="
          mt-4
          text-center
          text-sm
          font-medium
          leading-5
          text-[#241507]
          whitespace-pre-line
        "
      >
        {title}
      </span>
    </button>
  );
}