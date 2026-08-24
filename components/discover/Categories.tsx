"use client";

import React from "react";
import {
  Users,
  Drama,
 Globe,
  Building2,
  Mic2,
  UtensilsCrossed,
  HandHelping,
  Sparkles,
} from "lucide-react";

import CategoryCard from "./CategoryCard";

interface CategoriesProps {
  selectedCategory: string;
  onCategoryChange: React.Dispatch<React.SetStateAction<string>>;
}

const categories = [
  {
    title: "Community",
    slug: "community",
    icon: Users,
  },
  {
    title: "Art/Culture",
    slug: "art-culture",
    icon: Drama,
  },
  {
    title: "Sport/Wellness",
    slug: "sport-wellness",
    icon: Globe,
  },
  {
    title: "Career/Business",
    slug: "career-business",
    icon: Building2,
  },
  {
    title: "Concerts",
    slug: "concerts",
    icon: Mic2,
  },
  {
    title: "Food/Drinks",
    slug: "food-drinks",
    icon: UtensilsCrossed,
  },
  {
    title: "Spirituality/\nReligion",
    slug: "spirituality-religion",
    icon: HandHelping,
  },
  {
    title: "Night Life",
    slug: "night-life",
    icon: Sparkles,
  },
];

export default function Categories({
  selectedCategory,
  onCategoryChange,
}: CategoriesProps) {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <h2 className="mb-8 text-2xl font-bold text-[#241507] md:text-3xl">
          Browse by Category
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => (
            <CategoryCard
              key={category.slug}
              title={category.title}
              slug={category.slug}
              icon={category.icon}
              isActive={selectedCategory === category.slug}
              onClick={(slug) =>
                onCategoryChange(
                  selectedCategory === slug ? "all" : slug
                )
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}