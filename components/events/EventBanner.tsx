import Image from "next/image";

interface Props {
  banner: string;
  organizerImage: string;
}

export default function EventBanner({
  banner,
  organizerImage,
}: Props) {
  return (
    <section className="mx-auto mt-5 max-w-7xl px-5 md:px-8">
      <div className="relative">

        <div className="relative h-[240px] overflow-hidden rounded-[28px] md:h-[420px]">
          <Image
            src={banner}
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute -bottom-10 left-8 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl md:h-32 md:w-32">
          <Image
            src={organizerImage}
            alt=""
            fill
            className="object-cover"
          />
        </div>

      </div>
    </section>
  );
}