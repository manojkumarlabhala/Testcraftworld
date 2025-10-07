import { Badge } from "./ui/badge";

interface CategoryBadgeProps {
  category: string;
  variant?: "default" | "secondary" | "outline";
}

const categoryColors: Record<string, string> = {
  technology: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  business: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  design: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  lifestyle: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  marketing: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export default function CategoryBadge({ category, variant = "default" }: CategoryBadgeProps) {
  const colorClass = categoryColors[category.toLowerCase()] || categoryColors.technology;
  
  return (
    <Badge 
      variant={variant} 
      className={variant === "default" ? colorClass : ""}
      data-testid={`badge-category-${category.toLowerCase()}`}
    >
      {category}
    </Badge>
  );
}
