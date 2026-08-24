/* =========================================================
   TEEKET PUBLIC EVENT TYPES
========================================================= */

export type EventCategory =
  | "community"
  | "art-culture"
  | "sport-wellness"
  | "career-business"
  | "concerts"
  | "food-drinks"
  | "spirituality-religion"
  | "night-life";

export type EventStatus =
  | "draft"
  | "pending-review"
  | "published"
  | "rejected"
  | "ended"
  | "cancelled";

/* =========================================================
   EVENT TICKET
========================================================= */

export type EventTicket = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available?: number;
  sold?: number;
  description?: string;
};

/* =========================================================
   ORGANIZER
========================================================= */

export type EventOrganizer = {
  id: string;
  name: string;
  image?: string;
};

/* =========================================================
   EVENT
========================================================= */

export type Event = {
  id: string;
  slug: string;

  title: string;
  description: string;

  image?: string;
  organizerImage?: string;

  category: EventCategory;

  date: string;
  time: string;

  location: string;
  venue?: string;
  address?: string;

  latitude: number;
  longitude: number;

  organizer: EventOrganizer;

  tickets: EventTicket[];

  status: EventStatus;

  createdAt?: string;
  updatedAt?: string;

  ticketType?: "free" | "paid";

  ticketSalesStart?: string;
  ticketSalesEnd?: string;
};

/* =========================================================
   SAMPLE PUBLIC EVENTS
========================================================= */

export const events: Event[] = [
  {
    id: "event-1",

    slug: "afrofusion-2026",

    title: "Afrofusion 2026",

    description:
      "Experience an unforgettable celebration of African music, culture and entertainment.",

    image:
      "/images/events/afrofusion.jpg",

    organizerImage:
      "/images/organizers/default.png",

    category: "concerts",

    date: "December 20, 2026",

    time: "6:00 PM",

    location: "Lagos",

    venue: "Landmark Beach",

    address:
      "Victoria Island, Lagos",

    latitude: 6.4281,

    longitude: 3.4219,

    organizer: {
      id: "organizer-1",

      name: "TEEKET Events",

      image:
        "/images/organizers/default.png",
    },

    tickets: [
      {
        id: "ticket-1",

        name: "Regular",

        price: 5000,

        quantity: 500,

        available: 500,

        sold: 0,

        description:
          "General admission ticket.",
      },
    ],

    status: "published",

    ticketType: "paid",
  },

  {
    id: "event-2",

    slug: "lights-out-2026",

    title: "Lights Out 2026",

    description:
      "A night of music, entertainment and unforgettable experiences.",

    image:
      "/images/events/lights-out.jpg",

    organizerImage:
      "/images/organizers/default.png",

    category: "night-life",

    date: "November 14, 2026",

    time: "8:00 PM",

    location: "Lagos",

    venue: "Muri Okunola Park",

    address:
      "Victoria Island, Lagos",

    latitude: 6.4318,

    longitude: 3.4157,

    organizer: {
      id: "organizer-2",

      name: "Lights Entertainment",

      image:
        "/images/organizers/default.png",
    },

    tickets: [
      {
        id: "ticket-2",

        name: "Regular",

        price: 3000,

        quantity: 300,

        available: 300,

        sold: 0,

        description:
          "General admission ticket.",
      },
    ],

    status: "published",

    ticketType: "paid",
  },

  {
    id: "event-3",

    slug: "becoming-her",

    title: "Becoming Her",

    description:
      "An inspiring gathering focused on growth, confidence and purpose.",

    image:
      "/images/events/becoming-her.jpg",

    organizerImage:
      "/images/organizers/default.png",

    category: "community",

    date: "October 10, 2026",

    time: "10:00 AM",

    location: "Lagos",

    venue: "Eko Hotel",

    address:
      "Victoria Island, Lagos",

    latitude: 6.4281,

    longitude: 3.4115,

    organizer: {
      id: "organizer-3",

      name: "Becoming Her",

      image:
        "/images/organizers/default.png",
    },

    tickets: [
      {
        id: "ticket-3",

        name: "Free Ticket",

        price: 0,

        quantity: 200,

        available: 200,

        sold: 0,

        description:
          "Free admission ticket.",
      },
    ],

    status: "published",

    ticketType: "free",
  },
];