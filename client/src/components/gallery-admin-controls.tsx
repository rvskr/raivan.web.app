import { useState } from "react";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GalleryItem } from "@shared/schema";
import { Plus, Trash2, Upload } from "lucide-react";

interface GalleryAdminControlsProps {
  galleryItems: GalleryItem[];
  onItemAdded?: () => void;
  onItemDeleted?: () => void;
}

export function GalleryAdminControls({ galleryItems, onItemAdded, onItemDeleted }: GalleryAdminControlsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "restoration" as const,
    imageFile: null as File | null,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem({ ...newItem, imageFile: file });
    }
  };

  const addGalleryItem = async () => {
    if (!newItem.title || !newItem.description || !newItem.imageFile) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля и выберите изображение",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `gallery/${Date.now()}_${newItem.imageFile.name}`);
      const uploadResult = await uploadBytes(imageRef, newItem.imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Add gallery item to Firestore
      await addDoc(collection(db, "gallery"), {
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        imageUrl,
        order: galleryItems.length,
        createdAt: new Date(),
      });

      setNewItem({
        title: "",
        description: "",
        category: "restoration",
        imageFile: null,
      });

      setIsOpen(false);
      onItemAdded?.();

      toast({
        title: "Успех",
        description: "Работа добавлена в галерею",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить работу. Проверьте подключение Firebase.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteGalleryItem = async (id: string, title: string) => {
    if (!confirm(`Удалить работу "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, "gallery", id));
      onItemDeleted?.();
      
      toast({
        title: "Успех",
        description: "Работа удалена из галереи",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить работу",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Item Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-primary text-white hover:bg-primary/90" data-testid="add-gallery-item">
            <Plus className="h-4 w-4 mr-2" />
            Добавить работу
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" data-testid="add-gallery-modal">
          <DialogHeader>
            <DialogTitle>Добавить новую работу</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                data-testid="input-gallery-title"
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                rows={3}
                data-testid="textarea-gallery-description"
              />
            </div>
            <div>
              <Label htmlFor="category">Категория</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem({ ...newItem, category: value as any })}
              >
                <SelectTrigger data-testid="select-gallery-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restoration">Реставрация</SelectItem>
                  <SelectItem value="art">Арт-объекты</SelectItem>
                  <SelectItem value="custom">На заказ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="image">Изображение</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                data-testid="input-gallery-image"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={addGalleryItem}
                disabled={isUploading}
                className="flex-1"
                data-testid="button-save-gallery"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? "Загрузка..." : "Добавить"}
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-gallery"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Items List with Delete Option */}
      {galleryItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-600">Управление работами:</h4>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white/50 p-2 rounded border"
                data-testid={`gallery-admin-item-${item.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">{item.category}</p>
                </div>
                <Button
                  onClick={() => deleteGalleryItem(item.id, item.title)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid={`button-delete-gallery-${item.id}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}