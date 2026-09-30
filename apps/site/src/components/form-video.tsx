export function FormVideo({ src, label }: { src: string; label: string }) {
  return (
    <video
      src={src}
      autoPlay
      muted
      loop
      playsInline
      aria-label={label}
      className="pointer-events-none aspect-video w-full bg-black object-contain"
    />
  );
}
