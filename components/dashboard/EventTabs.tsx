"use client";

interface EventTabsProps {
  activeTab: "all" | "pending" | "drafts";
  onChange: (tab: "all" | "pending" | "drafts") => void;
}

export default function EventTabs({
  activeTab,
  onChange,
}: EventTabsProps) {
  const tabs = [
    {
      id: "all" as const,
      label: "All Events",
    },
    {
      id: "pending" as const,
      label: "Pending Admin Review",
    },
    {
      id: "drafts" as const,
      label: "Drafts",
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-8 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative whitespace-nowrap pb-4 text-sm font-medium transition ${
                active
                  ? "text-[#7C3AED]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}

              {active && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#7C3AED]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}