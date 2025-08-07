import { useAdmin } from "@/hooks/use-admin";
import { CategoriesAdmin } from "@/components/categories-admin";
import { ServicesAdmin } from "@/components/services-admin";
import { GalleryAdminControls } from "@/components/gallery-admin-controls";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GalleryItem } from "@shared/schema";
import { Link } from "wouter";
import { ArrowLeft, Settings, Image, List, Users } from "lucide-react";

export default function Admin() {
  const { isAdmin, signOut } = useAdmin();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "gallery"), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GalleryItem[];
      setGalleryItems(items.sort((a, b) => a.order - b.order));
    });

    return () => unsubscribe();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Доступ запрещен</h1>
          <p className="text-gray-600 mb-6">У вас нет прав для доступа к админ панели</p>
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
      {/* Header */}
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
              <h1 className="text-xl font-bold">Админ панель</h1>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Выйти
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
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
              <div className="text-center text-gray-500 py-8">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Просмотр заявок будет доступен после интеграции Firebase</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}