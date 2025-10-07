import { Card } from "./ui/card";

interface AdSlotProps {
  position: "header" | "sidebar" | "footer" | "in-content";
  className?: string;
}

export default function AdSlot({ position, className = "" }: AdSlotProps) {
  const sizes = {
    header: "h-24",
    sidebar: "h-64",
    footer: "h-32",
    "in-content": "h-48",
  };

  return (
    <Card className={`flex items-center justify-center border-dashed ${sizes[position]} ${className}`} data-testid={`ad-slot-${position}`}>
      <div className="text-center p-4">
        <p className="text-xs text-muted-foreground mb-1">Advertisement</p>
        <p className="text-sm font-medium text-muted-foreground">
          Ad Space - {position.charAt(0).toUpperCase() + position.slice(1)}
        </p>
      </div>
    </Card>
  );
}
