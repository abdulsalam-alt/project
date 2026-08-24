"use client";

import { useMemo, useState } from "react";

import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";

import DiscoverHero from "@/components/discover/DiscoverHero";
import Categories from "@/components/discover/Categories";
import CategoryFilterChip from "@/components/discover/CategoryFilterChip";
import UpcomingEvents from "@/components/discover/UpcomingEvents";

import {
  getPublicEvents,
  subscribeToEventDrafts,
} from "@/lib/dashboard/eventDraft";

import { useSyncExternalStore } from "react";

import type { Event } from "@/lib/data/event";

/* =========================================================
   STABLE SERVER SNAPSHOT
========================================================= */

const EMPTY_EVENTS: Event[] = [];

function getServerEvents(): Event[] {
  return EMPTY_EVENTS;
}

export default function DiscoverPage() {
  const publicEvents =
    useSyncExternalStore(
      subscribeToEventDrafts,
      getPublicEvents,
      getServerEvents
    );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [selectedLocation, setSelectedLocation] =
    useState("all");

  const filteredEvents =
    useMemo(() => {
      const search =
        searchQuery
          .trim()
          .toLowerCase();

      return publicEvents.filter(
        (event) => {
          const matchesSearch =
            !search ||
            event.title
              .toLowerCase()
              .includes(search) ||
            event.location
              .toLowerCase()
              .includes(search) ||
            event.venue
              ?.toLowerCase()
              .includes(search);

          const matchesCategory =
            selectedCategory ===
              "all" ||
            event.category ===
              selectedCategory;

          const matchesLocation =
            selectedLocation ===
              "all" ||
            event.location
              .toLowerCase()
              .includes(
                selectedLocation.toLowerCase()
              );

          return (
            matchesSearch &&
            matchesCategory &&
            matchesLocation
          );
        }
      );
    }, [
      publicEvents,
      searchQuery,
      selectedCategory,
      selectedLocation,
    ]);

  return (
    <main className="min-h-screen bg-[#F7F7F7]">
      <Navbar />

      <DiscoverHero />

      <Categories
        selectedCategory={
          selectedCategory
        }
        onCategoryChange={
          setSelectedCategory
        }
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <CategoryFilterChip
          category={
            selectedCategory
          }
          onClear={() =>
            setSelectedCategory(
              "all"
            )
          }
        />
      </div>

      <UpcomingEvents
        events={filteredEvents}
        searchQuery={searchQuery}
        onSearchChange={
          setSearchQuery
        }
        selectedLocation={
          selectedLocation
        }
        onLocationChange={
          setSelectedLocation
        }
      />

      <Footer />
    </main>
  );
}