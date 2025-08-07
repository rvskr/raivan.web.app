import { Button } from "@/components/ui/button";

interface GalleryFilterProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function GalleryFilter({ activeFilter, onFilterChange }: GalleryFilterProps) {
  const filters = [
    { id: "all", label: "Все работы" },
    { id: "restoration", label: "Реставрация" },
    { id: "art", label: "Арт-объекты" },
    { id: "custom", label: "На заказ" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {filters.map((filter) => (
        <Button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          variant={activeFilter === filter.id ? "default" : "outline"}
          className={`px-6 py-2 rounded-full transition-all ${
            activeFilter === filter.id
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
          }`}
          data-testid={`filter-${filter.id}`}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
