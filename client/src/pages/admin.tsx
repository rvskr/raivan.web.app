import { useAdmin } from "@/hooks/use-admin";
import { CategoriesAdmin } from "@/components/categories-admin";
import { ServicesAdmin } from "@/components/services-admin";
import { GalleryAdminControls } from "@/components/gallery-admin-controls";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GalleryItem, ContactForm } from "@shared/schema";
import { Link } from "wouter";
import { ArrowLeft, Settings, Image, List, Users, Trash2, Edit2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { isAdmin, signOut } = useAdmin();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [contactItems, setContactItems] = useState<ContactForm[]>([]);
  const [editingContact, setEditingContact] = useState<ContactForm | null>(null);

  useEffect(() => {
    // Получение элементов галереи
    const unsubscribeGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GalleryItem[];
      setGalleryItems(items.sort((a, b) => a.order - b.order));
    });

    // Получение заявок клиентов
    const unsubscribeContacts = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate() || new Date(),
      })) as ContactForm[];
      setContactItems(
  items
    .filter((item) => item.submittedAt !== undefined) // Ensure submittedAt exists
    .sort((a, b) => b.submittedAt!.getTime() - a.submittedAt!.getTime())
);
    });

    // Очистка подписок
    return () => {
      unsubscribeGallery();
      unsubscribeContacts();
    };
  }, []);

  const handleEditContact = (contact: ContactForm) => {
    setEditingContact(contact);
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;
    try {
      await setDoc(doc(db, "contacts", editingContact.id), editingContact, { merge: true });
      toast({ title: "Успех", description: "Заявка обновлена" });
      setEditingContact(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить заявку",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Удалить заявку?")) {
      try {
        await deleteDoc(doc(db, "contacts", id));
        toast({ title: "Успех", description: "Заявка удалена" });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось удалить заявку",
          variant: "destructive",
        });
      }
    }
  };

  const handleStatusChange = async (id: string, status: ContactForm['status']) => {
    try {
      await setDoc(doc(db, "contacts", id), { status }, { merge: true });
      toast({ title: "Успех", description: `Статус изменен на "${status}"` });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-6">У вас нет прав для доступа к админ-панели</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  На главную
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Админ-панель</h1>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Галерея
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Категории
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Услуги
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Заявки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Управление галереей</h2>
              <GalleryAdminControls galleryItems={galleryItems} />
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <CategoriesAdmin />
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <ServicesAdmin />
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Заявки клиентов</h2>
              {contactItems.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Нет заявок</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactItems.map((contact) => (
                    <div key={contact.id} className="border p-4 rounded-md">
                      {editingContact?.id === contact.id ? (
                        <div className="space-y-4">
                          <Input
                            value={editingContact.name}
                            onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                            placeholder="Имя"
                          />
                          <Input
                            value={editingContact.email}
                            onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                            placeholder="Email"
                          />
                          <Input
                            value={editingContact.phone || ""}
                            onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                            placeholder="Телефон"
                          />
                          <Input
                            value={editingContact.service || ""}
                            onChange={(e) => setEditingContact({ ...editingContact, service: e.target.value })}
                            placeholder="Услуга"
                          />
                          <Textarea
                            value={editingContact.message}
                            onChange={(e) => setEditingContact({ ...editingContact, message: e.target.value })}
                            placeholder="Сообщение"
                          />
                            <Select
                              value={editingContact.status}
                              onValueChange={(value: string) =>
                                setEditingContact({ ...editingContact, status: value as ContactForm['status'] })
                              }
                            >
                            <SelectTrigger>
                              <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Новая</SelectItem>
                              <SelectItem value="in-progress">В обработке</SelectItem>
                              <SelectItem value="completed">Завершена</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button onClick={handleSaveContact}>
                              <Save className="h-4 w-4 mr-2" />
                              Сохранить
                            </Button>
                            <Button variant="outline" onClick={() => setEditingContact(null)}>
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <p><strong>Имя:</strong> {contact.name}</p>
                            <p><strong>Email:</strong> {contact.email}</p>
                            <p><strong>Телефон:</strong> {contact.phone || "Не указан"}</p>
                            <p><strong>Услуга:</strong> {contact.service || "Не выбрана"}</p>
                            <p><strong>Сообщение:</strong> {contact.message}</p>
                            <p><strong>Дата:</strong> {contact.submittedAt ? contact.submittedAt.toLocaleString() : 'Не указана'}</p>
                            <p><strong>Статус:</strong> {contact.status || "Новая"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Select
                              value={contact.status || "new"}
                              onValueChange={(value: string) => handleStatusChange(contact.id, value as ContactForm['status'])}
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Статус" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="new">Новая</SelectItem>
                                <SelectItem value="in-progress">В обработке</SelectItem>
                                <SelectItem value="completed">Завершена</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" onClick={() => handleEditContact(contact)}>
                              <Edit2 className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}