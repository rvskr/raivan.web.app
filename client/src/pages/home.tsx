import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { collection, deleteDoc, doc, setDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryModal } from "@/components/gallery-modal";
import { GalleryFilter } from "@/components/gallery-filter";
import { ContactForm } from "@/components/contact-form";
import { EditableContent } from "@/components/editable-content";
import { AuthModal } from "@/components/auth-modal";
import { GalleryAdminControls } from "@/components/gallery-admin-controls";
import { useAdmin } from "@/hooks/use-admin";
import { SocialLinkModal } from "@/components/social-link-modal";
import { GalleryItem, Service, Category, HeroSectionContent, AboutSectionContent, NavSectionContent, FooterContent, ContactItem, SocialLink, NavShopContent } from "@shared/schema";
import { Search, Settings, LogOut, Trash2, Edit2, X, Eye, EyeOff, Plus, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEditableContent } from "@/hooks/use-editable-content";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Хук для прослушивания коллекции Firestore в реальном времени
const useRealtimeFirebaseCollection = <T extends { id: string }>(collectionName: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));
        setData(items);
        setLoading(false);
      },
      (e) => {
        console.error(`Ошибка при получении данных из коллекции ${collectionName}:`, e);
        setError(e);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading, error };
};

interface ImageUploadState {
  url: string;
  file: File | null;
  uploading: boolean;
  option: "upload" | "url";
}

const useImageLoader = (url: string | undefined): boolean => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (!url) {
      setIsLoaded(false);
      return;
    }
    setIsLoaded(false);
    const img = new Image();
    img.src = url;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true);
  }, [url]);
  return isLoaded;
};

// Вынесенный компонент для редактирования ссылок
const EditableLinkModal = ({ isOpen, onClose, onSave, initialText, initialUrl }: { isOpen: boolean; onClose: () => void; onSave: (data: { text: string; url: string }) => Promise<void>; initialText: string; initialUrl: string }) => {
  const formSchema = z.object({
    text: z.string().min(1, { message: "Текст не может быть пустым." }),
    url: z.string().url({ message: "Неверный формат URL." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: initialText,
      url: initialUrl,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSave({ text: values.text, url: values.url });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать ссылку</DialogTitle>
          <DialogDescription>Измените текст и URL-ссылку.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Текст кнопки</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL-ссылка</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Вынесенный компонент для загрузки изображений
const ImageUploadModal = ({ isOpen, onClose, title, imageState, setImageState, onSave }: { isOpen: boolean; onClose: () => void; title: string; imageState: ImageUploadState; setImageState: any; onSave: () => void }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>Измените изображение.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <RadioGroup onValueChange={(value: "upload" | "url") => setImageState((prev: ImageUploadState) => ({ ...prev, option: value }))} value={imageState.option} className="flex gap-4">
          <div className="flex items-center space-x-2"><RadioGroupItem value="upload" id="upload-option" /><Label htmlFor="upload-option">Загрузить</Label></div>
          <div className="flex items-center space-x-2"><RadioGroupItem value="url" id="url-option" /><Label htmlFor="url-option">Ссылка</Label></div>
        </RadioGroup>
        {imageState.option === "upload" && (<Input type="file" onChange={(e) => setImageState((prev: ImageUploadState) => ({ ...prev, file: e.target.files?.[0] || null }))} accept="image/*" />)}
        {imageState.option === "url" && (<Input value={imageState.url} onChange={(e) => setImageState((prev: ImageUploadState) => ({ ...prev, url: e.target.value }))} placeholder="https://example.com/image.jpg" />)}
      </div>
      <Button onClick={onSave} disabled={imageState.uploading}>{imageState.uploading ? "Загрузка..." : "Сохранить"}</Button>
    </DialogContent>
  </Dialog>
);

// Вынесенный компонент для диалога подтверждения
const CustomConfirmationDialog = ({ isOpen, onClose, title, description, onConfirm }: { isOpen: boolean; onClose: () => void; title: string; description: string; onConfirm: () => void }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button variant="destructive" onClick={onConfirm}>Удалить</Button>
      </div>
    </DialogContent>
  </Dialog>
);


const MainContent = () => {
  const { isAdmin, signOut } = useAdmin();
  const { toast } = useToast();
  const { data: categories } = useRealtimeFirebaseCollection<Category>("categories");
  const { data: galleryItems } = useRealtimeFirebaseCollection<GalleryItem>("gallery");
  const { data: services } = useRealtimeFirebaseCollection<Service>("services");
  const { data: socialLinks } = useRealtimeFirebaseCollection<SocialLink>("social-links");
  const heroContent = useEditableContent("hero-section") as HeroSectionContent;
  const aboutContent = useEditableContent("about-section") as AboutSectionContent;
  const navContent = useEditableContent("nav-section") as NavSectionContent;
  const navShopContent = useEditableContent("nav-shop") as NavShopContent;
  const isHeroImageLoaded = useImageLoader(heroContent?.heroImageUrl);
  const isAboutImageLoaded = useImageLoader(aboutContent?.aboutImageUrl);

  // Состояние для сохранения предпочтений пользователя, независимо от статуса админа
  const [isEditingPreference, setIsEditingPreference] = useState(() => {
    const saved = localStorage.getItem("isEditingPreference");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return false;
  });

  // Сохраняем предпочтение пользователя в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem("isEditingPreference", JSON.stringify(isEditingPreference));
  }, [isEditingPreference]);

  // Вычисляем реальное состояние режима редактирования
  const isActuallyEditing = isAdmin && isEditingPreference;

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modals, setModals] = useState({ hero: false, about: false, navLogo: false, addSocial: false, editSocial: false, shopLink: false });
  const [heroImage, setHeroImage] = useState<ImageUploadState>({ url: "", file: null, uploading: false, option: "url" });
  const [aboutImage, setAboutImage] = useState<ImageUploadState>({ url: "", file: null, uploading: false, option: "url" });
  const [navLogo, setNavLogo] = useState<ImageUploadState>({ url: "", file: null, uploading: false, option: "url" });
  const [selectedSocial, setSelectedSocial] = useState<SocialLink | null>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState(() => () => {});
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationDescription, setConfirmationDescription] = useState("");
  const holdTimeoutRef = useRef<number | null>(null);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(6);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setHeroImage((prev) => ({ ...prev, url: heroContent?.heroImageUrl || "" }));
    setAboutImage((prev) => ({ ...prev, url: aboutContent?.aboutImageUrl || "" }));
    setNavLogo((prev) => ({ ...prev, url: navContent?.navLogoUrl || "" }));
  }, [heroContent, aboutContent, navContent]);

  const filteredGalleryItems = useMemo(
    () => galleryItems.filter((item) => activeFilter === "all" || item.category === activeFilter),
    [galleryItems, activeFilter]
  );
  
  const displayedGalleryItems = filteredGalleryItems.slice(0, visibleGalleryCount);
  const hasMoreGalleryItems = filteredGalleryItems.length > visibleGalleryCount;

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  const toggleEditingMode = () => setIsEditingPreference((prev: any) => !prev);

  const handleGalleryItemClick = (item: GalleryItem) => {
    setSelectedImage({ src: item.imageUrl, alt: item.title, title: item.title, description: item.description });
    setIsGalleryModalOpen(true);
  };

  const startHold = () => {
    if (!isAdmin) holdTimeoutRef.current = window.setTimeout(() => setShowAuthModal(true), 5000);
  };

  const stopHold = () => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
    if (!IMGBB_API_KEY) throw new Error("Ключ API ImgBB отсутствует");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", IMGBB_API_KEY);
    const response = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (data.data?.url) return data.data.url;
    throw new Error(data.error?.message || "Ошибка загрузки на ImgBB");
  };

  const updateImage = async (imageState: ImageUploadState, setImageState: any, docId: string, fieldName: string, modalName: keyof typeof modals) => {
    if ((imageState.option === "url" && !imageState.url) || (imageState.option === "upload" && imageState.file === null)) {
      toast({ title: "Ошибка", description: "Изображение не выбрано.", variant: "destructive" });
      return;
    }
    setImageState((prev: ImageUploadState) => ({ ...prev, uploading: true }));
    try {
      const finalImageUrl = imageState.option === "upload" && imageState.file ? await uploadToImgBB(imageState.file) : imageState.url;
      await setDoc(doc(db, "editable-content", docId), { [fieldName]: finalImageUrl }, { merge: true });
      toast({ title: "Успех", description: "Изображение обновлено." });
      setModals((prev) => ({ ...prev, [modalName]: false }));
    } catch (e) {
      console.error("Ошибка обновления изображения:", e);
      toast({ title: "Ошибка", description: `Не удалось обновить изображение: ${e instanceof Error ? e.message : "Неизвестная ошибка"}`, variant: "destructive" });
    } finally {
      setImageState((prev: ImageUploadState) => ({ ...prev, uploading: false }));
    }
  };

  const handleDeleteSocialLink = async (social: SocialLink) => {
    try {
      await deleteDoc(doc(db, "social-links", social.id));
      toast({ title: "Успех", description: "Ссылка удалена" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить ссылку", variant: "destructive" });
    }
    setShowConfirmationDialog(false);
  };

  const galleryDeleteAction = (item: GalleryItem) => () => {
    try {
      deleteDoc(doc(db, "gallery", item.id));
      toast({ title: "Успех", description: "Работа удалена" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось удалить работу", variant: "destructive" });
    }
    setShowConfirmationDialog(false);
  };

  const handleLoadMore = () => {
    setVisibleGalleryCount(prevCount => prevCount + 6);
  };

  const handleShopLinkSave = async (data: { text: string; url: string }) => {
    try {
      await setDoc(doc(db, "editable-content", "nav-shop"), { shopText: data.text, shopUrl: data.url }, { merge: true });
      toast({ title: "Успех", description: "Ссылка на магазин обновлена." });
    } catch (e) {
      console.error("Ошибка обновления ссылки на магазин:", e);
      toast({ title: "Ошибка", description: `Не удалось обновить ссылку: ${e instanceof Error ? e.message : "Неизвестная ошибка"}`, variant: "destructive" });
    }
  };
  
  const navItems = [{ id: "hero", label: "Главная" }, { id: "services", label: "Услуги" }, { id: "gallery", label: "Галерея" }, { id: "about", label: "О нас" }, { id: "contact", label: "Контакты" }];
  const contactItems: ContactItem[] = [{ id: "contact-address", icon: "fas fa-map-marker-alt", defaultContent: "" }, { id: "contact-phone-display", icon: "fas fa-phone", defaultContent: "" }, { id: "contact-email-display", icon: "fas fa-envelope", defaultContent: "" }, { id: "contact-hours", icon: "fas fa-clock", defaultContent: "" }];
  
  return (
    <div className="min-h-screen bg-neutral text-dark">
      <nav className="bg-white shadow-lg sticky top-0 z-40" data-testid="navigation">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center cursor-pointer group" onMouseDown={startHold} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={startHold} onTouchEnd={stopHold} onTouchCancel={stopHold} onClick={() => scrollToSection("hero")} data-testid="nav-logo">
              {isAdmin && isActuallyEditing && (<Button variant="ghost" size="sm" className="mr-2 p-0 group-hover:opacity-100 opacity-0 transition-opacity" onClick={() => setModals((prev) => ({ ...prev, navLogo: true }))}><Edit2 className="h-4 w-4 text-gray-500" /></Button>)}
              {navContent?.navLogoUrl && <img src={navContent.navLogoUrl} alt="Логотип" className="h-10 mr-2" />}
              <EditableContent id="nav-title" defaultContent="" className="text-2xl font-display font-bold text-primary" tag="h1" isEditable={isActuallyEditing} />
            </div>
            <button className="md:hidden text-dark focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} data-testid="mobile-menu-toggle" aria-expanded={isMobileMenuOpen} aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
            <div className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row md:space-x-8 items-center absolute md:static top-16 left-0 right-0 bg-white md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none z-30`}>
              {navItems.map((item) => (<button key={item.id} onClick={() => scrollToSection(item.id)} className="text-dark hover:text-primary transition-colors py-2 md:py-0" data-testid={`nav-${item.id}`}><EditableContent id={`nav-${item.id}`} defaultContent={item.label} isEditable={isActuallyEditing} /></button>))}
              <div className="flex items-center py-2 md:py-0 relative group">
                <a
                  href={navShopContent?.shopUrl || "https://raivan-shop.web.app/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-dark hover:text-primary transition-colors ${isActuallyEditing ? 'pointer-events-none' : ''}`}
                  data-testid="nav-shop"
                >
                  <EditableContent
                    id="nav-shop-text"
                    defaultContent={navShopContent?.shopText || "Магазин"}
                    isEditable={isActuallyEditing}
                    onSave={async (value: string) => {
                      if (isAdmin) {
                        await setDoc(doc(db, "editable-content", "nav-shop"), { shopText: value }, { merge: true });
                      }
                    }}
                  />
                </a>
                {isAdmin && isActuallyEditing && (
                  <Button variant="ghost" size="sm" className="ml-2 p-0 opacity-100 transition-opacity" onClick={() => setModals(prev => ({...prev, shopLink: true}))}>
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
              {isAdmin && (
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0 md:ml-4">
                  <Button onClick={toggleEditingMode} variant="outline" size="sm">{isActuallyEditing ? (<><EyeOff className="h-4 w-4 mr-2" />Выключить редактирование</>) : (<><Eye className="h-4 w-4 mr-2" />Включить редактирование</>)}</Button>
                  {isActuallyEditing && (<Link href="/admin"><Button variant="outline" size="sm" data-testid="admin-panel-btn"><Settings className="h-4 w-4 mr-2" />Админ-панель</Button></Link>)}
                  <Button onClick={signOut} variant="outline" size="sm" data-testid="admin-logout-btn"><LogOut className="h-4 w-4 mr-2" />Выйти</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section id="hero" className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div className={`absolute inset-0 bg-cover bg-center bg-fixed transition-opacity duration-500 ease-in-out ${isHeroImageLoaded ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url('${heroContent?.heroImageUrl || ""}')` }}><div className="absolute inset-0 bg-black bg-opacity-40"></div></div>
        {!isHeroImageLoaded && (<div className="absolute inset-0 bg-gray-200 animate-pulse"></div>)}
        {isAdmin && isActuallyEditing && (<Button variant="secondary" size="sm" className="absolute top-4 right-4 z-50" onClick={() => setModals((prev) => ({ ...prev, hero: true }))}><Edit2 className="h-4 w-4" /></Button>)}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <EditableContent id="hero-title" defaultContent="" className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight" tag="h1" isEditable={isActuallyEditing} />
            <EditableContent id="hero-subtitle" defaultContent="" className="text-xl md:text-2xl mb-8 leading-relaxed" tag="p" isEditable={isActuallyEditing} />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => scrollToSection("contact")} className="bg-primary text-white px-8 py-4 text-lg hover:bg-primary/90 transition-all transform hover:scale-105" data-testid="hero-cta-1"><EditableContent id="hero-cta-1" defaultContent="" isEditable={isActuallyEditing} /></Button>
              <Button onClick={() => scrollToSection("gallery")} variant="outline" className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-dark transition-all bg-transparent" data-testid="hero-cta-2"><EditableContent id="hero-cta-2" defaultContent="" isEditable={isActuallyEditing} /></Button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 bg-white" data-testid="services-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent id="services-title" defaultContent="Наши услуги" className="text-4xl md:text-5xl font-display font-bold text-primary mb-6" tag="h2" isEditable={isActuallyEditing} />
            <EditableContent id="services-subtitle" defaultContent="Комплексный подход к реставрации и созданию уникальных предметов искусства" className="text-xl text-gray-600 max-w-3xl mx-auto" tag="p" isEditable={isActuallyEditing} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.Hammer;
              return (
                <div key={service.id} className="bg-neutral p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2" data-testid={`service-${index + 1}`}>
                  <div className="text-center mb-6">
                    <IconComponent className="h-12 w-12 text-accent mb-4 mx-auto" />
                    <h3 className="text-2xl font-display font-semibold mb-4">{service.title}</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="py-20 bg-gray-50" data-testid="gallery-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent id="gallery-title" defaultContent="Наши работы" className="text-4xl md:text-5xl font-display font-bold text-primary mb-6" tag="h2" isEditable={isActuallyEditing} />
            <EditableContent id="gallery-subtitle" defaultContent="Примеры успешных проектов реставрации и создания уникальных предметов" className="text-xl text-gray-600 max-w-3xl mx-auto" tag="p" isEditable={isActuallyEditing} />
          </div>
          <GalleryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} categories={categories} />
          {isAdmin && isActuallyEditing && (<div className="mb-8 max-w-md mx-auto"><GalleryAdminControls galleryItems={galleryItems} /></div>)}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="gallery-grid">
            {displayedGalleryItems.map((item) => (
              <div key={item.id} className="group relative" data-testid={`gallery-item-${item.id}`}>
                {isAdmin && isActuallyEditing && (
                  <button onClick={() => { setConfirmationTitle(`Удалить работу "${item.title}"?`); setConfirmationDescription("Вы уверены, что хотите удалить эту работу? Это действие необратимо."); setConfirmationAction(() => galleryDeleteAction(item)); setShowConfirmationDialog(true); }} className="absolute top-2 right-2 z-10 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg" data-testid={`delete-gallery-${item.id}`}><Trash2 className="h-4 w-4" /></button>
                )}
                <div className="cursor-pointer" onClick={() => handleGalleryItemClick(item)}>
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" data-testid={`gallery-image-${item.id}`} />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center"><Search className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" /></div>
                  </div>
                  <div className="mt-4"><h3 className="text-lg font-semibold mb-2" data-testid={`gallery-title-${item.id}`}>{item.title}</h3><p className="text-gray-600" data-testid={`gallery-desc-${item.id}`}>{item.description}</p></div>
                </div>
              </div>
            ))}
            {filteredGalleryItems.length === 0 && <div className="text-center py-12"><p className="text-gray-500">Нет работ в данной категории</p></div>}
          </div>
          {hasMoreGalleryItems && (
            <div className="text-center mt-12">
              <Button onClick={handleLoadMore} className="bg-primary text-white px-8 py-4 text-lg hover:bg-primary/90">Загрузить еще</Button>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="py-20 bg-white" data-testid="about-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <EditableContent id="about-title" defaultContent="" className="text-4xl md:text-5xl font-display font-bold text-primary mb-6" tag="h2" isEditable={isActuallyEditing} />
              <EditableContent id="about-desc-1" defaultContent="" className="text-lg text-gray-700 mb-6 leading-relaxed" tag="p" isEditable={isActuallyEditing} />
              <EditableContent id="about-desc-2" defaultContent="" className="text-lg text-gray-700 mb-8 leading-relaxed" tag="p" isEditable={isActuallyEditing} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                {[{ id: "stat-1", number: "500+", label: "Восстановленных предметов" }, { id: "stat-2", number: "15", label: "Лет опыта" }, { id: "stat-3", number: "200+", label: "Довольных клиентов" }].map((stat) => (
                  <div key={stat.id} className="text-center">
                    <EditableContent id={`${stat.id}-number`} defaultContent={stat.number} className="text-3xl font-bold text-accent" tag="div" isEditable={isActuallyEditing} />
                    <EditableContent id={`${stat.id}-label`} defaultContent={stat.label} className="text-sm text-gray-600" tag="div" isEditable={isActuallyEditing} />
                  </div>
                ))}
              </div>
              <Button onClick={() => scrollToSection("contact")} className="bg-primary text-white px-8 py-4 text-lg hover:bg-primary/90" data-testid="about-cta"><EditableContent id="about-cta" defaultContent="" isEditable={isActuallyEditing} /></Button>
            </div>
            <div className="lg:pl-8 relative">
              <img src={aboutContent?.aboutImageUrl || ""} alt="Мастер за работой" className={`rounded-xl shadow-2xl w-full transition-opacity duration-500 ease-in-out ${isAboutImageLoaded ? "opacity-100" : "opacity-0"}`} data-testid="about-image" />
              {!isAboutImageLoaded && (<div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>)}
              {isAdmin && isActuallyEditing && (<Button variant="secondary" size="sm" className="absolute bottom-4 right-4" onClick={() => setModals((prev) => ({ ...prev, about: true }))}><Edit2 className="h-4 w-4" /></Button>)}
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 bg-gray-50" data-testid="contact-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent id="contact-title" defaultContent="Свяжитесь с нами" className="text-4xl md:text-5xl font-display font-bold text-primary mb-6" tag="h2" isEditable={isActuallyEditing} />
            <EditableContent id="contact-subtitle" defaultContent="Готовы обсудить ваш проект? Свяжитесь с нами для бесплатной консультации" className="text-xl text-gray-600 max-w-3xl mx-auto" tag="p" isEditable={isActuallyEditing} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ContactForm services={services} />
            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <EditableContent id="contact-info-title" defaultContent="Контактная информация" className="text-2xl font-display font-semibold mb-6" tag="h3" isEditable={isActuallyEditing} />
                <div className="space-y-4">
                  {contactItems.map((item) => (
                    <div key={item.id} className="flex items-center"><i className={`${item.icon} text-primary text-xl w-8`}></i><EditableContent id={item.id} defaultContent={item.defaultContent} className="text-gray-700" tag="span" isEditable={isActuallyEditing} /></div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-lg">
                <EditableContent id="social-title" defaultContent="Мы в социальных сетях" className="text-2xl font-display font-semibold mb-6" tag="h3" isEditable={isActuallyEditing} />
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <div key={social.id} className="relative">
                      <a href={social.url} className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-all" data-testid={`social-${social.platform.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                        {social.icon.startsWith("http") ? (<img src={social.icon} alt={social.platform} className="h-5 w-5" />) : (<i className={`${social.icon} text-xl`}></i>)}
                      </a>
                      {isAdmin && isActuallyEditing && (
                        <div className="absolute -top-2 -right-2 flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedSocial(social); setModals((prev) => ({ ...prev, editSocial: true })); }} className="bg-white p-1 rounded-full shadow"><Edit2 className="h-4 w-4 text-gray-500" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => { setConfirmationTitle(`Удалить ссылку на ${social.platform}?`); setConfirmationDescription("Вы уверены, что хотите удалить эту социальную ссылку? Это действие необратимо."); setConfirmationAction(() => () => handleDeleteSocialLink(social)); setShowConfirmationDialog(true); }} className="bg-white p-1 rounded-full shadow"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isAdmin && isActuallyEditing && (<Button variant="outline" size="sm" onClick={() => { setSelectedSocial(null); setModals((prev) => ({ ...prev, addSocial: true })); }} className="ml-4"><Plus className="h-4 w-4 mr-2" />Добавить соцсеть</Button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white py-12" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <EditableContent id="nav-title" defaultContent="" className="text-2xl font-display font-bold mb-4" tag="h3" isEditable={isActuallyEditing} />
              <EditableContent id="footer-description" defaultContent="" className="text-gray-300 leading-relaxed" tag="p" isEditable={isActuallyEditing} />
            </div>
            <div>
              <EditableContent id="footer-services-title" defaultContent="Услуги" className="text-lg font-semibold mb-4" tag="h4" isEditable={isActuallyEditing} />
              <ul className="space-y-2 text-gray-300">
                {services.map((service, index) => (
                  <li key={index}>
                    <EditableContent
                      id={`footer-service-${index + 1}`}
                      defaultContent={service.title}
                      className="hover:text-white transition-colors"
                      tag="a"
                      isEditable={isActuallyEditing}
                      onSave={async (value: string) => {
                        if (isAdmin) {
                          await setDoc(doc(db, "services", service.id), { title: value }, { merge: true });
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <EditableContent id="footer-contact-title" defaultContent="Контакты" className="text-lg font-semibold mb-4" tag="h4" isEditable={isActuallyEditing} />
              <div className="space-y-2 text-gray-300">
                {contactItems.filter((item) => item.id !== "contact-hours").map((item) => (
                  <div key={item.id} className="flex items-center"><i className={`${item.icon} text-primary text-xl w-8`}></i><EditableContent id={item.id} defaultContent={item.defaultContent} tag="p" isEditable={isActuallyEditing} /></div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <EditableContent id="footer-copyright" defaultContent="" className="text-gray-400" tag="p" isEditable={isActuallyEditing} />
          </div>
        </div>
      </footer>

      <GalleryModal open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen} image={selectedImage} />
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
      <ImageUploadModal isOpen={modals.hero} onClose={() => setModals((prev) => ({ ...prev, hero: false }))} title="Редактировать главное изображение" imageState={heroImage} setImageState={setHeroImage} onSave={() => updateImage(heroImage, setHeroImage, "hero-section", "heroImageUrl", "hero")} />
      <ImageUploadModal isOpen={modals.about} onClose={() => setModals((prev) => ({ ...prev, about: false }))} title="Редактировать изображение о нас" imageState={aboutImage} setImageState={setAboutImage} onSave={() => updateImage(aboutImage, setAboutImage, "about-section", "aboutImageUrl", "about")} />
      <ImageUploadModal isOpen={modals.navLogo} onClose={() => setModals((prev) => ({ ...prev, navLogo: false }))} title="Редактировать логотип" imageState={navLogo} setImageState={setNavLogo} onSave={() => updateImage(navLogo, setNavLogo, "nav-section", "navLogoUrl", "navLogo")} />
      <SocialLinkModal isOpen={modals.addSocial} onClose={() => setModals((prev) => ({ ...prev, addSocial: false }))} title="Добавить новую соцсеть" />
      {selectedSocial && (<SocialLinkModal isOpen={modals.editSocial} onClose={() => setModals((prev) => ({ ...prev, editSocial: false }))} title={`Редактировать ${selectedSocial.platform}`} initialData={selectedSocial} />)}
      <CustomConfirmationDialog isOpen={showConfirmationDialog} onClose={() => setShowConfirmationDialog(false)} title={confirmationTitle} description={confirmationDescription} onConfirm={confirmationAction} />
      <EditableLinkModal isOpen={modals.shopLink} onClose={() => setModals((prev) => ({...prev, shopLink: false}))} onSave={handleShopLinkSave} initialText={navShopContent?.shopText || "Магазин"} initialUrl={navShopContent?.shopUrl || "https://raivan-shop.web.app/"} />
    </div>
  );
};

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-neutral text-dark"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>}>
      <MainContent />
    </Suspense>
  );
}