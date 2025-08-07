import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { GalleryModal } from "@/components/gallery-modal";
import { GalleryFilter } from "@/components/gallery-filter";
import { ContactForm } from "@/components/contact-form";
import { EditableContent } from "@/components/editable-content";
import { AuthModal } from "@/components/auth-modal";
import { useAdmin } from "@/hooks/use-admin";
import { GalleryItem } from "@shared/schema";
import { Search, Settings, LogOut } from "lucide-react";

export default function Home() {
  const { isAdmin, signOut } = useAdmin();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    alt: string;
    title: string;
    description: string;
  } | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "gallery"), orderBy("order", "asc")),
      (snapshot) => {
        const items: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as GalleryItem);
        });
        setGalleryItems(items);
      }
    );

    return unsubscribe;
  }, []);

  const filteredGalleryItems = galleryItems.filter((item) => {
    if (activeFilter === "all") return true;
    return item.category === activeFilter;
  });

  const handleGalleryItemClick = (item: GalleryItem) => {
    setSelectedImage({
      src: item.imageUrl,
      alt: item.title,
      title: item.title,
      description: item.description,
    });
    setIsGalleryModalOpen(true);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral text-dark">
      {/* Admin Toggle */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          <div className="bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
            <div className="text-sm font-semibold mb-1">🎨 Режим редактирования</div>
            <div className="text-xs">
              Кликните по любому тексту или кнопке с желтой рамкой для редактирования
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-40" data-testid="navigation">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <EditableContent
                id="nav-logo"
                defaultContent="Мастерская Искусства"
                className="text-2xl font-display font-bold text-primary"
                tag="h1"
              />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <button 
                onClick={() => scrollToSection("hero")}
                className="text-dark hover:text-primary transition-colors"
                data-testid="nav-home"
              >
                <EditableContent id="nav-home" defaultContent="Главная" />
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="text-dark hover:text-primary transition-colors"
                data-testid="nav-services"
              >
                <EditableContent id="nav-services" defaultContent="Услуги" />
              </button>
              <button 
                onClick={() => scrollToSection("gallery")}
                className="text-dark hover:text-primary transition-colors"
                data-testid="nav-gallery"
              >
                <EditableContent id="nav-gallery" defaultContent="Галерея" />
              </button>
              <button 
                onClick={() => scrollToSection("about")}
                className="text-dark hover:text-primary transition-colors"
                data-testid="nav-about"
              >
                <EditableContent id="nav-about" defaultContent="О нас" />
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="text-dark hover:text-primary transition-colors"
                data-testid="nav-contact"
              >
                <EditableContent id="nav-contact" defaultContent="Контакты" />
              </button>
              
              {/* Admin Controls */}
              {!isAdmin ? (
                <Button
                  onClick={() => setShowAuthModal(true)}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                  data-testid="admin-login-btn"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Админ
                </Button>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Режим редактирования
                  </div>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                    data-testid="admin-logout-btn"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center" data-testid="hero-section">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <EditableContent
              id="hero-title"
              defaultContent="Возвращаем душу вашей мебели"
              className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
              tag="h1"
            />
            <EditableContent
              id="hero-subtitle"
              defaultContent="Профессиональная реставрация антикварной мебели и создание уникальных арт-объектов с любовью к деталям"
              className="text-xl md:text-2xl mb-8 leading-relaxed"
              tag="p"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-primary text-white px-8 py-4 text-lg hover:bg-primary/90 transition-all transform hover:scale-105"
                data-testid="hero-cta-1"
              >
                <EditableContent id="hero-cta-1" defaultContent="Заказать консультацию" />
              </Button>
              <Button
                onClick={() => scrollToSection("gallery")}
                variant="outline"
                className="border-2 border-white text-white px-8 py-4 text-lg hover:bg-white hover:text-dark transition-all bg-transparent"
                data-testid="hero-cta-2"
              >
                <EditableContent id="hero-cta-2" defaultContent="Посмотреть работы" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white" data-testid="services-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent
              id="services-title"
              defaultContent="Наши услуги"
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
              tag="h2"
            />
            <EditableContent
              id="services-subtitle"
              defaultContent="Комплексный подход к реставрации и созданию уникальных предметов искусства"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              tag="p"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-neutral p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2" data-testid="service-1">
              <div className="text-center mb-6">
                <i className="fas fa-hammer text-5xl text-accent mb-4"></i>
                <EditableContent
                  id="service-1-title"
                  defaultContent="Реставрация мебели"
                  className="text-2xl font-display font-semibold mb-4"
                  tag="h3"
                />
              </div>
              <EditableContent
                id="service-1-desc"
                defaultContent="Профессиональное восстановление антикварной и винтажной мебели с сохранением исторической ценности"
                className="text-gray-700 mb-6 leading-relaxed"
                tag="p"
              />
              <Button className="w-full bg-primary text-white hover:bg-primary/90" data-testid="service-1-cta">
                <EditableContent id="service-1-cta" defaultContent="Подробнее" />
              </Button>
            </div>

            {/* Service 2 */}
            <div className="bg-neutral p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2" data-testid="service-2">
              <div className="text-center mb-6">
                <i className="fas fa-palette text-5xl text-accent mb-4"></i>
                <EditableContent
                  id="service-2-title"
                  defaultContent="Художественная отделка"
                  className="text-2xl font-display font-semibold mb-4"
                  tag="h3"
                />
              </div>
              <EditableContent
                id="service-2-desc"
                defaultContent="Создание уникальных художественных решений: роспись, патина, позолота и декоративные техники"
                className="text-gray-700 mb-6 leading-relaxed"
                tag="p"
              />
              <Button className="w-full bg-primary text-white hover:bg-primary/90" data-testid="service-2-cta">
                <EditableContent id="service-2-cta" defaultContent="Подробнее" />
              </Button>
            </div>

            {/* Service 3 */}
            <div className="bg-neutral p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2" data-testid="service-3">
              <div className="text-center mb-6">
                <i className="fas fa-tools text-5xl text-accent mb-4"></i>
                <EditableContent
                  id="service-3-title"
                  defaultContent="Изготовление на заказ"
                  className="text-2xl font-display font-semibold mb-4"
                  tag="h3"
                />
              </div>
              <EditableContent
                id="service-3-desc"
                defaultContent="Создание эксклюзивной мебели и арт-объектов по индивидуальным проектам и пожеланиям"
                className="text-gray-700 mb-6 leading-relaxed"
                tag="p"
              />
              <Button className="w-full bg-primary text-white hover:bg-primary/90" data-testid="service-3-cta">
                <EditableContent id="service-3-cta" defaultContent="Подробнее" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-gray-50" data-testid="gallery-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent
              id="gallery-title"
              defaultContent="Наши работы"
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
              tag="h2"
            />
            <EditableContent
              id="gallery-subtitle"
              defaultContent="Примеры успешных проектов реставрации и создания уникальных предметов"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              tag="p"
            />
          </div>

          <GalleryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="gallery-grid">
            {filteredGalleryItems.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer"
                onClick={() => handleGalleryItemClick(item)}
                data-testid={`gallery-item-${item.id}`}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    data-testid={`gallery-image-${item.id}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <Search className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2" data-testid={`gallery-title-${item.id}`}>
                    {item.title}
                  </h3>
                  <p className="text-gray-600" data-testid={`gallery-desc-${item.id}`}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredGalleryItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Нет работ в данной категории</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white" data-testid="about-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <EditableContent
                id="about-title"
                defaultContent="О нашей мастерской"
                className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
                tag="h2"
              />
              <EditableContent
                id="about-desc-1"
                defaultContent="Более 15 лет мы занимаемся профессиональной реставрацией мебели и созданием уникальных арт-объектов. Наша миссия — сохранить историческую ценность антикварных предметов и подарить им вторую жизнь."
                className="text-lg text-gray-700 mb-6 leading-relaxed"
                tag="p"
              />
              <EditableContent
                id="about-desc-2"
                defaultContent="Команда опытных мастеров использует традиционные техники реставрации в сочетании с современными материалами и инструментами, обеспечивая высочайшее качество работ."
                className="text-lg text-gray-700 mb-8 leading-relaxed"
                tag="p"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <EditableContent
                    id="stat-1-number"
                    defaultContent="500+"
                    className="text-3xl font-bold text-accent"
                    tag="div"
                  />
                  <EditableContent
                    id="stat-1-label"
                    defaultContent="Восстановленных предметов"
                    className="text-sm text-gray-600"
                    tag="div"
                  />
                </div>
                <div className="text-center">
                  <EditableContent
                    id="stat-2-number"
                    defaultContent="15"
                    className="text-3xl font-bold text-accent"
                    tag="div"
                  />
                  <EditableContent
                    id="stat-2-label"
                    defaultContent="Лет опыта"
                    className="text-sm text-gray-600"
                    tag="div"
                  />
                </div>
                <div className="text-center">
                  <EditableContent
                    id="stat-3-number"
                    defaultContent="200+"
                    className="text-3xl font-bold text-accent"
                    tag="div"
                  />
                  <EditableContent
                    id="stat-3-label"
                    defaultContent="Довольных клиентов"
                    className="text-sm text-gray-600"
                    tag="div"
                  />
                </div>
              </div>

              <Button
                onClick={() => scrollToSection("contact")}
                className="bg-primary text-white px-8 py-4 text-lg hover:bg-primary/90"
                data-testid="about-cta"
              >
                <EditableContent id="about-cta" defaultContent="Связаться с нами" />
              </Button>
            </div>

            <div className="lg:pl-8">
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
                alt="Мастер за работой"
                className="rounded-xl shadow-2xl w-full"
                data-testid="about-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50" data-testid="contact-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <EditableContent
              id="contact-title"
              defaultContent="Свяжитесь с нами"
              className="text-4xl md:text-5xl font-display font-bold text-primary mb-6"
              tag="h2"
            />
            <EditableContent
              id="contact-subtitle"
              defaultContent="Готовы обсудить ваш проект? Свяжитесь с нами для бесплатной консультации"
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              tag="p"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ContactForm />

            <div>
              <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                <EditableContent
                  id="contact-info-title"
                  defaultContent="Контактная информация"
                  className="text-2xl font-display font-semibold mb-6"
                  tag="h3"
                />
                <div className="space-y-4">
                  <div className="flex items-center">
                    <i className="fas fa-map-marker-alt text-primary text-xl w-8"></i>
                    <EditableContent
                      id="contact-address"
                      defaultContent="г. Москва, ул. Мастеров, д. 15"
                      className="text-gray-700"
                      tag="span"
                    />
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-phone text-primary text-xl w-8"></i>
                    <EditableContent
                      id="contact-phone-display"
                      defaultContent="+7 (495) 123-45-67"
                      className="text-gray-700"
                      tag="span"
                    />
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-envelope text-primary text-xl w-8"></i>
                    <EditableContent
                      id="contact-email-display"
                      defaultContent="info@masterpiece-studio.ru"
                      className="text-gray-700"
                      tag="span"
                    />
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-primary text-xl w-8"></i>
                    <EditableContent
                      id="contact-hours"
                      defaultContent="Пн-Пт: 9:00-18:00, Сб: 10:00-16:00"
                      className="text-gray-700"
                      tag="span"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg">
                <EditableContent
                  id="social-title"
                  defaultContent="Мы в социальных сетях"
                  className="text-2xl font-display font-semibold mb-6"
                  tag="h3"
                />
                <div className="flex space-x-4">
                  <a href="#" className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-all" data-testid="social-vk">
                    <i className="fab fa-vk text-xl"></i>
                  </a>
                  <a href="#" className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-all" data-testid="social-instagram">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                  <a href="#" className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-all" data-testid="social-telegram">
                    <i className="fab fa-telegram text-xl"></i>
                  </a>
                  <a href="#" className="bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-all" data-testid="social-whatsapp">
                    <i className="fab fa-whatsapp text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12" data-testid="footer">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <EditableContent
                id="footer-company"
                defaultContent="Мастерская Искусства"
                className="text-2xl font-display font-bold mb-4"
                tag="h3"
              />
              <EditableContent
                id="footer-description"
                defaultContent="Профессиональная реставрация мебели и создание уникальных арт-объектов с 2008 года."
                className="text-gray-300 leading-relaxed"
                tag="p"
              />
            </div>
            <div>
              <EditableContent
                id="footer-services-title"
                defaultContent="Услуги"
                className="text-lg font-semibold mb-4"
                tag="h4"
              />
              <ul className="space-y-2 text-gray-300">
                <li>
                  <EditableContent
                    id="footer-service-1"
                    defaultContent="Реставрация мебели"
                    className="hover:text-white transition-colors"
                    tag="a"
                  />
                </li>
                <li>
                  <EditableContent
                    id="footer-service-2"
                    defaultContent="Художественная отделка"
                    className="hover:text-white transition-colors"
                    tag="a"
                  />
                </li>
                <li>
                  <EditableContent
                    id="footer-service-3"
                    defaultContent="Изготовление на заказ"
                    className="hover:text-white transition-colors"
                    tag="a"
                  />
                </li>
                <li>
                  <EditableContent
                    id="footer-service-4"
                    defaultContent="Консультации"
                    className="hover:text-white transition-colors"
                    tag="a"
                  />
                </li>
              </ul>
            </div>
            <div>
              <EditableContent
                id="footer-contact-title"
                defaultContent="Контакты"
                className="text-lg font-semibold mb-4"
                tag="h4"
              />
              <div className="space-y-2 text-gray-300">
                <EditableContent
                  id="footer-phone"
                  defaultContent="+7 (495) 123-45-67"
                  tag="p"
                />
                <EditableContent
                  id="footer-email"
                  defaultContent="info@masterpiece-studio.ru"
                  tag="p"
                />
                <EditableContent
                  id="footer-address"
                  defaultContent="г. Москва, ул. Мастеров, д. 15"
                  tag="p"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <EditableContent
              id="footer-copyright"
              defaultContent="© 2024 Мастерская Искусства. Все права защищены."
              className="text-gray-400"
              tag="p"
            />
          </div>
        </div>
      </footer>

      <GalleryModal
        open={isGalleryModalOpen}
        onOpenChange={setIsGalleryModalOpen}
        image={selectedImage}
      />
      
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  );
}
