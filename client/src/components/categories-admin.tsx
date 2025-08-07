import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export function CategoriesAdmin() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "" });
  const [editValues, setEditValues] = useState({ name: "", slug: "" });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData.sort((a, b) => a.order - b.order));
    });

    return () => unsubscribe();
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название категории",
        variant: "destructive",
      });
      return;
    }

    const slug = newCategory.slug || generateSlug(newCategory.name);

    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory.name.trim(),
        slug,
        order: categories.length,
        createdAt: new Date(),
      });

      setNewCategory({ name: "", slug: "" });
      setIsAddOpen(false);
      
      toast({
        title: "Успех",
        description: "Категория добавлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить категорию",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Удалить категорию "${name}"?`)) return;

    try {
      await deleteDoc(doc(db, "categories", id));
      toast({
        title: "Успех",
        description: "Категория удалена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить категорию",
        variant: "destructive",
      });
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValues({ name: category.name, slug: category.slug });
  };

  const saveEdit = async (id: string) => {
    if (!editValues.name.trim()) return;

    try {
      await updateDoc(doc(db, "categories", id), {
        name: editValues.name.trim(),
        slug: editValues.slug || generateSlug(editValues.name),
        updatedAt: new Date(),
      });

      setEditingId(null);
      toast({
        title: "Успех",
        description: "Категория обновлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить категорию",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ name: "", slug: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Управление категориями</h3>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-category-button">
              <Plus className="h-4 w-4 mr-2" />
              Добавить категорию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая категория</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Название</Label>
                <Input
                  id="category-name"
                  value={newCategory.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewCategory({
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  placeholder="Например: Реставрация мебели"
                  data-testid="input-category-name"
                />
              </div>
              <div>
                <Label htmlFor="category-slug">Slug (автоматически)</Label>
                <Input
                  id="category-slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  placeholder="restavraciya-mebeli"
                  data-testid="input-category-slug"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addCategory} className="flex-1" data-testid="button-save-category">
                  Добавить
                </Button>
                <Button onClick={() => setIsAddOpen(false)} variant="outline" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between bg-white/50 p-3 rounded border"
            data-testid={`category-item-${category.id}`}
          >
            {editingId === category.id ? (
              <div className="flex-1 flex gap-2">
                <Input
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="flex-1"
                  data-testid={`edit-category-name-${category.id}`}
                />
                <Input
                  value={editValues.slug}
                  onChange={(e) => setEditValues({ ...editValues, slug: e.target.value })}
                  className="flex-1"
                  data-testid={`edit-category-slug-${category.id}`}
                />
                <Button
                  onClick={() => saveEdit(category.id)}
                  size="sm"
                  variant="outline"
                  data-testid={`save-category-${category.id}`}
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  onClick={cancelEdit}
                  size="sm"
                  variant="outline"
                  data-testid={`cancel-edit-category-${category.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-gray-500">{category.slug}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => startEdit(category)}
                    size="sm"
                    variant="outline"
                    data-testid={`edit-category-${category.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => deleteCategory(category.id, category.name)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    data-testid={`delete-category-${category.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {categories.length === 0 && (
          <p className="text-center text-gray-500 py-4">Нет категорий</p>
        )}
      </div>
    </div>
  );
}