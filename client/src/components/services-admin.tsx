import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

const AVAILABLE_ICONS = [
  'Hammer', 'Palette', 'Brush', 'Wrench', 'Scissors', 'PaintBucket',
  'Settings', 'Star', 'Heart', 'Shield', 'Award', 'Crown',
  'Gem', 'Sparkles', 'Zap', 'Tool', 'Screwdriver', 'Drill'
];

export function ServicesAdmin() {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    icon: "Hammer"
  });
  const [editValues, setEditValues] = useState({
    title: "",
    description: "",
    icon: "Hammer"
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(servicesData.sort((a, b) => a.order - b.order));
    });

    return () => unsubscribe();
  }, []);

  const addService = async () => {
    if (!newService.title.trim() || !newService.description.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive",
      });
      return;
    }

    try {
      await addDoc(collection(db, "services"), {
        title: newService.title.trim(),
        description: newService.description.trim(),
        icon: newService.icon,
        order: services.length,
        createdAt: new Date(),
      });

      setNewService({ title: "", description: "", icon: "Hammer" });
      setIsAddOpen(false);
      
      toast({
        title: "Успех",
        description: "Услуга добавлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить услугу",
        variant: "destructive",
      });
    }
  };

  const deleteService = async (id: string, title: string) => {
    if (!confirm(`Удалить услугу "${title}"?`)) return;

    try {
      await deleteDoc(doc(db, "services", id));
      toast({
        title: "Успех",
        description: "Услуга удалена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить услугу",
        variant: "destructive",
      });
    }
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setEditValues({
      title: service.title,
      description: service.description,
      icon: service.icon
    });
  };

  const saveEdit = async (id: string) => {
    if (!editValues.title.trim() || !editValues.description.trim()) return;

    try {
      await updateDoc(doc(db, "services", id), {
        title: editValues.title.trim(),
        description: editValues.description.trim(),
        icon: editValues.icon,
        updatedAt: new Date(),
      });

      setEditingId(null);
      toast({
        title: "Успех",
        description: "Услуга обновлена",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить услугу",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ title: "", description: "", icon: "Hammer" });
  };

  const renderIcon = (iconName: string, className = "h-4 w-4") => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Hammer;
    return <IconComponent className={className} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Управление услугами</h3>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="add-service-button">
              <Plus className="h-4 w-4 mr-2" />
              Добавить услугу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Новая услуга</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-title">Название</Label>
                <Input
                  id="service-title"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  placeholder="Например: Реставрация мебели"
                  data-testid="input-service-title"
                />
              </div>
              <div>
                <Label htmlFor="service-description">Описание</Label>
                <Textarea
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Подробное описание услуги..."
                  rows={3}
                  data-testid="textarea-service-description"
                />
              </div>
              <div>
                <Label htmlFor="service-icon">Иконка</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => setNewService({ ...newService, icon: iconName })}
                      className={`p-2 border rounded hover:bg-gray-100 flex items-center justify-center ${
                        newService.icon === iconName ? 'border-primary bg-primary/10' : 'border-gray-300'
                      }`}
                      data-testid={`icon-${iconName}`}
                    >
                      {renderIcon(iconName)}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Выбрано: {newService.icon}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={addService} className="flex-1" data-testid="button-save-service">
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

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white/50 p-4 rounded border"
            data-testid={`service-item-${service.id}`}
          >
            {editingId === service.id ? (
              <div className="space-y-3">
                <Input
                  value={editValues.title}
                  onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                  placeholder="Название услуги"
                  data-testid={`edit-service-title-${service.id}`}
                />
                <Textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  placeholder="Описание услуги"
                  rows={2}
                  data-testid={`edit-service-description-${service.id}`}
                />
                <div>
                  <Label className="text-sm">Иконка</Label>
                  <div className="grid grid-cols-8 gap-1 mt-1">
                    {AVAILABLE_ICONS.map((iconName) => (
                      <button
                        key={iconName}
                        onClick={() => setEditValues({ ...editValues, icon: iconName })}
                        className={`p-1 border rounded hover:bg-gray-100 flex items-center justify-center ${
                          editValues.icon === iconName ? 'border-primary bg-primary/10' : 'border-gray-300'
                        }`}
                        data-testid={`edit-icon-${iconName}-${service.id}`}
                      >
                        {renderIcon(iconName, "h-3 w-3")}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => saveEdit(service.id)}
                    size="sm"
                    className="flex-1"
                    data-testid={`save-service-${service.id}`}
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Сохранить
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    data-testid={`cancel-edit-service-${service.id}`}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 p-2 bg-primary/10 rounded">
                    {renderIcon(service.icon, "h-5 w-5 text-primary")}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{service.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
                <div className="flex gap-1 justify-end">
                  <Button
                    onClick={() => startEdit(service)}
                    size="sm"
                    variant="outline"
                    data-testid={`edit-service-${service.id}`}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => deleteService(service.id, service.title)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    data-testid={`delete-service-${service.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
        
        {services.length === 0 && (
          <p className="text-center text-gray-500 py-4">Нет услуг</p>
        )}
      </div>
    </div>
  );
}