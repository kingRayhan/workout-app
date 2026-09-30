import Image from "next/image";

export function GameIcon({
  src,
  className = "size-8",
}: {
  src: string;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      width={128}
      height={128}
      aria-hidden
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
