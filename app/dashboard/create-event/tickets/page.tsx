import TicketTypeForm from "@/components/dashboard/create-event/TicketTypeForm";

type TicketPageProps = {
  searchParams: Promise<{
    draftId?: string;
  }>;
};

export default async function TicketPage({
  searchParams,
}: TicketPageProps) {
  const params =
    await searchParams;

  return (
    <TicketTypeForm
      draftId={
        params.draftId ?? null
      }
    />
  );
}