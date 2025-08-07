import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { GalleryItem, Category } from "@shared/schema";
import { Plus, Trash2, Upload, Edit2 } from "lucide-react";

interface GalleryAdminControlsProps {
  galleryItems: GalleryItem[];
  onItemAdded?: () => void;
  onItemDeleted?: () => void;
  onItemUpdated?: () => void;
}

export function GalleryAdminControls({ galleryItems, onItemAdded, onItemDeleted, onItemUpdated }: GalleryAdminControlsProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [imageOption, setImageOption] = useState<"upload" | "url">("upload");
  const [categories, setCategories] = useState<Category[]>([]);
  const [formValues, setFormValues] = useState({
    title: "",
    description: "",
    category: "",
    imageFile: null as File | null,
    imageUrl: "",
  });

  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(items.sort((a, b) => a.order - b.order));
      if (items.length > 0 && !formValues.category) {
        setFormValues((prev) => ({ ...prev, category: items[0].slug }));
      }
    });
    return () => unsubscribe();
  }, [formValues.category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormValues({ ...formValues, imageFile: file, imageUrl: "" });
    }
  };

  const resetForm = () => {
    setFormValues({
      title: "",
      description: "",
      category: categories[0]?.slug || "",
      imageFile: null,
      imageUrl: "",
    });
    setImageOption("upload");
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setIsEditing(true);
      setEditingItem(item);
      setFormValues({
        title: item.title,
        description: item.description,
        category: item.category,
        imageFile: null,
        imageUrl: item.imageUrl,
      });
      setImageOption("url");
    } else {
      setIsEditing(false);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const saveGalleryItem = async () => {
    if (!formValues.title || !formValues.description || !formValues.category ||
        (imageOption === "upload" && !formValues.imageFile) ||
        (imageOption === "url" && !formValues.imageUrl)) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    if (imageOption === "upload" && !IMGBB_API_KEY) {
      toast({
        title: "Ошибка",
        description: "API ключ ImgBB не настроен. Проверьте файл .env.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let finalImageUrl = formValues.imageUrl;

      if (imageOption === "upload" && formValues.imageFile) {
        const formData = new FormData();
        formData.append("image", formValues.imageFile);
        formData.append("key", IMGBB_API_KEY);

        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.data?.url) {
          finalImageUrl = data.data.url;
        } else {
          throw new Error(data.error?.message || "ImgBB upload failed");
        }
      }

      if (isEditing && editingItem) {
        // Update existing item
        await updateDoc(doc(db, "gallery", editingItem.id), {
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          imageUrl: finalImageUrl,
          updatedAt: new Date(),
        });
        onItemUpdated?.();
        toast({
          title: "Успех",
          description: "Работа в галерее обновлена",
        });
      } else {
        // Add new item
        await addDoc(collection(db, "gallery"), {
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          imageUrl: finalImageUrl,
          order: galleryItems.length,
          createdAt: new Date(),
        });
        onItemAdded?.();
        toast({
          title: "Успех",
          description: "Работа добавлена в галерею",
        });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error saving gallery item:", error);
      toast({
        title: "Ошибка",
        description: `Не удалось сохранить работу: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Управление галереей</h3>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenModal()} data-testid="add-gallery-item-button">
              <Plus className="h-4 w-4 mr-2" /> Добавить работу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Редактировать работу" : "Добавить новую работу"}</DialogTitle>
              <DialogDescription>
                {isEditing ? "Обновите информацию о работе в галерее." : "Добавьте новую фотографию в галерею."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="gallery-title">Название</Label>
                <Input
                  id="gallery-title"
                  name="title"
                  value={formValues.title}
                  onChange={handleInputChange}
                  placeholder="Название работы"
                />
              </div>
              <div>
                <Label htmlFor="gallery-description">Описание</Label>
                <Textarea
                  id="gallery-description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  placeholder="Краткое описание работы"
                />
              </div>
              <div>
                <Label htmlFor="gallery-category">Категория</Label>
                <Select
                  name="category"
                  value={formValues.category}
                  onValueChange={(value) => setFormValues({ ...formValues, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Изображение</Label>
                <RadioGroup
                  onValueChange={(value: "upload" | "url") => {
                    setImageOption(value);
                    setFormValues({ ...formValues, imageUrl: "", imageFile: null });
                  }}
                  value={imageOption}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upload" id="upload-option" />
                    <Label htmlFor="upload-option">Загрузить</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="url-option" />
                    <Label htmlFor="url-option">Ссылка</Label>
                  </div>
                </RadioGroup>

                {imageOption === "upload" && (
                  <Input type="file" onChange={handleImageUpload} accept="image/*" />
                )}
                {imageOption === "url" && (
                  <Input
                    name="imageUrl"
                    value={formValues.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Вставьте URL изображения"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={handleCloseModal} variant="outline">
                Отмена
              </Button>
              <Button onClick={saveGalleryItem} disabled={isUploading} data-testid="save-gallery-item-button">
                {isUploading ? "Сохранение..." : (isEditing ? "Сохранить изменения" : "Добавить")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="space-y-2">
        {galleryItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-16 h-16 object-cover rounded-md"
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{item.title}</p>
                <p className="text-gray-500 text-sm">{item.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenModal(item)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteGalleryItem(item.id, item.title)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}