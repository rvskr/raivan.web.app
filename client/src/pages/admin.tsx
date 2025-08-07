import { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/use-admin";
import { GalleryItem, ContactForm } from "@shared/schema";
import { Trash2, Upload, Plus } from "lucide-react";

export default function Admin() {
  const { isAdmin, signOut } = useAdmin();
  const { toast } = useToast();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [contacts, setContacts] = useState<ContactForm[]>([]);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    description: "",
    category: "restoration" as const,
    imageFile: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribeGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
      const items: GalleryItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as GalleryItem);
      });
      setGalleryItems(items);
    });

    const unsubscribeContacts = onSnapshot(collection(db, "contacts"), (snapshot) => {
      const contactsList: ContactForm[] = [];
      snapshot.forEach((doc) => {
        contactsList.push({ id: doc.id, ...doc.data() } as ContactForm);
      });
      setContacts(contactsList);
    });

    return () => {
      unsubscribeGallery();
      unsubscribeContacts();
    };
  }, [isAdmin]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewGalleryItem({ ...newGalleryItem, imageFile: file });
    }
  };

  const addGalleryItem = async () => {
    if (!newGalleryItem.title || !newGalleryItem.description || !newGalleryItem.imageFile) {
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
      const imageRef = ref(storage, `gallery/${Date.now()}_${newGalleryItem.imageFile.name}`);
      const uploadResult = await uploadBytes(imageRef, newGalleryItem.imageFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Add gallery item to Firestore
      await addDoc(collection(db, "gallery"), {
        title: newGalleryItem.title,
        description: newGalleryItem.description,
        category: newGalleryItem.category,
        imageUrl,
        order: galleryItems.length,
        createdAt: new Date(),
      });

      setNewGalleryItem({
        title: "",
        description: "",
        category: "restoration",
        imageFile: null,
      });

      toast({
        title: "Успех",
        description: "Работа добавлена в галерею",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить работу",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "gallery", id));
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

  const deleteContact = async (id: string) => {
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast({
        title: "Успех",
        description: "Сообщение удалено",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить сообщение",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">Войдите в систему для доступа к админ панели</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary" data-testid="admin-title">
            Админ панель
          </h1>
          <Button onClick={signOut} variant="outline" data-testid="button-signout">
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery" data-testid="tab-gallery">Галерея</TabsTrigger>
            <TabsTrigger value="contacts" data-testid="tab-contacts">Сообщения</TabsTrigger>
            <TabsTrigger value="content" data-testid="tab-content">Контент</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новую работу</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Название</Label>
                  <Input
                    id="title"
                    value={newGalleryItem.title}
                    onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                    data-testid="input-gallery-title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={newGalleryItem.description}
                    onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                    data-testid="textarea-gallery-description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={newGalleryItem.category}
                    onValueChange={(value) => setNewGalleryItem({ ...newGalleryItem, category: value as any })}
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
                <Button
                  onClick={addGalleryItem}
                  disabled={isUploading}
                  className="w-full"
                  data-testid="button-add-gallery"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isUploading ? "Загрузка..." : "Добавить работу"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <Card key={item.id} data-testid={`gallery-card-${item.id}`}>
                  <CardContent className="p-4">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      data-testid={`gallery-admin-image-${item.id}`}
                    />
                    <h3 className="font-semibold mb-2" data-testid={`gallery-admin-title-${item.id}`}>
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2" data-testid={`gallery-admin-desc-${item.id}`}>
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500 mb-4" data-testid={`gallery-admin-category-${item.id}`}>
                      Категория: {item.category}
                    </p>
                    <Button
                      onClick={() => deleteGalleryItem(item.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      data-testid={`button-delete-gallery-${item.id}`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <div className="grid gap-6">
              {contacts.map((contact) => (
                <Card key={contact.id} data-testid={`contact-card-${contact.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle data-testid={`contact-name-${contact.id}`}>
                          {contact.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500" data-testid={`contact-email-${contact.id}`}>
                          {contact.email}
                        </p>
                        {contact.phone && (
                          <p className="text-sm text-gray-500" data-testid={`contact-phone-${contact.id}`}>
                            {contact.phone}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => deleteContact(contact.id)}
                        variant="destructive"
                        size="sm"
                        data-testid={`button-delete-contact-${contact.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {contact.service && (
                      <p className="text-sm mb-2" data-testid={`contact-service-${contact.id}`}>
                        <strong>Услуга:</strong> {contact.service}
                      </p>
                    )}
                    <p className="text-sm" data-testid={`contact-message-${contact.id}`}>
                      <strong>Сообщение:</strong> {contact.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Нет новых сообщений
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Редактирование контента</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Для редактирования контента используйте интерфейс на главной странице. 
                  Все элементы с рамкой можно редактировать кликом.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/"}>
                  Перейти к редактированию
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
