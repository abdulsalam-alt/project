import { notFound } from "next/navigation";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import {
  EventBanner,
  EventBreadcrumb,
  EventInfo,
  EventLocation,
  TicketCard,
} from "@/components/events";
import { events } from "@/lib/data/event";

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = events.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  // 1. Safely calculate the lowest starting price from the tickets array
  const basePrice = event.tickets && event.tickets.length > 0 
    ? Math.min(...event.tickets.map((t) => t.price)) 
    : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white pb-20">
        <EventBreadcrumb title={event.title} />
        <EventBanner banner={event.image} organizerImage={event.organizerImage} />
        <EventInfo event={event} />
        <EventLocation location={event.location} />
        
        {/* 2. Pass the calculated starting price to your TicketCard */}
        <TicketCard price={basePrice.toString()} slug={event.slug} />

      </main>
      <Footer />
    </>
  );
}
