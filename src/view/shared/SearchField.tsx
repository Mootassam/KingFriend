import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export default function SearchField({ value, onChange, compact = false }: Props) {
  return (
    <label className={"search " + (compact ? "compact" : "")}>
      <Search size={19} />
      <input
        aria-label="Search instruments"
        placeholder={compact ? "Search..." : "Search symbol or name... e.g. EUR, BTC, Gold"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
