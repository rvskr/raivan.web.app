import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: {
    src: string;
    alt: string;
    title: string;
    description: string;
  } | null;
}

export function GalleryModal({ open, onOpenChange, image }: GalleryModalProps) {
  if (!image) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full bg-black border-none p-0" data-testid="gallery-modal">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-10"
          data-testid="button-close-modal"
        >
          <X size={32} />
        </button>
        <div className="relative">
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-auto rounded-lg"
            data-testid="modal-image"
          />
          <div className="text-white text-center p-6">
            <h3 className="text-2xl font-semibold mb-2" data-testid="modal-title">
              {image.title}
            </h3>
            <p className="text-gray-300" data-testid="modal-description">
              {image.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
