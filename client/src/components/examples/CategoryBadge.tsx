import CategoryBadge from '../CategoryBadge';

export default function CategoryBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2 p-4">
      <CategoryBadge category="Technology" />
      <CategoryBadge category="Business" />
      <CategoryBadge category="Design" />
      <CategoryBadge category="Lifestyle" />
      <CategoryBadge category="Marketing" />
    </div>
  );
}
