import { Button } from "@/components/ui/button";
import { Category } from "@shared/schema";

interface GalleryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  categories: Category[];
}

export function GalleryFilter({ activeFilter, onFilterChange, categories }: GalleryFilterProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => onFilterChange("all")}
          className="px-4 py-2"
          data-testid="filter-all"
        >
          Все
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeFilter === category.slug ? "default" : "outline"}
            onClick={() => onFilterChange(category.slug)}
            className="px-4 py-2"
            data-testid={`filter-${category.slug}`}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}