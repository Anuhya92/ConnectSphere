import Image from "next/image";
import { getImageUrl } from "@/lib/utils";

export default function Avatar({
  name,
  path,
  size = 36,
}: {
  name: string;
  path?: string | null;
  size?: number;
}) {
  const url = getImageUrl(path);
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const hue = 205 + (hash % 28); // stays in the blue range

  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(135deg, hsl(${hue} 85% 58%), hsl(${hue + 14} 80% 48%))`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
