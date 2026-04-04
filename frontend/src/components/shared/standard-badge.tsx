import { Badge } from "@/components/ui/badge";

export function StandardBadge({
  colorHex,
  label,
}: {
  colorHex: string;
  label: string;
}) {
  return (
    <Badge
      className="border-transparent text-white"
      style={{ backgroundColor: colorHex }}
    >
      {label}
    </Badge>
  );
}
