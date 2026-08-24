import TicketTypeForm from "@/components/dashboard/create-event/TicketTypeForm";

interface TicketTypePageProps {
  searchParams: Promise<{
    draftId?: string;
  }>;
}

export default async function TicketTypePage({
  searchParams,
}: TicketTypePageProps) {
  const params = await searchParams;

  return (
    <TicketTypeForm
      draftId={params.draftId ?? null}
    />
  );
}