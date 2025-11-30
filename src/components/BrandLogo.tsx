import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  showWordmark?: boolean;
  size?: number;
};

export function BrandLogo({ showWordmark = true, size = 40 }: BrandLogoProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image
        src="/markdown-town-icon.svg"
        alt="MarkdownTown logo"
        width={size}
        height={size}
        priority
      />
      {showWordmark && (
        <span className="text-[1.15rem] font-semibold tracking-[0.02em] text-mdt-blue">
          MarkdownTown
        </span>
      )}
    </Link>
  );
}
