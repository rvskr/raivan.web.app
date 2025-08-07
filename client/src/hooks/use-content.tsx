import { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseReady } from "@/lib/firebase";
import { Content } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Default content for offline mode
const defaultContent = {
  "hero-title": "Мастерская Реставрации",
  "hero-subtitle": "Возвращаем красоту и жизнь вашей мебели",
  "hero-cta": "Получить консультацию",
  "about-title": "О нашей мастерской",
  "about-description": "Более 15 лет мы занимаемся профессиональной реставрацией антикварной мебели, используя традиционные методы и современные технологии.",
  "services-title": "Наши услуги",
  "gallery-title": "Наши работы",
  "contact-title": "Свяжитесь с нами",
  "contact-subtitle": "Готовы обсудить ваш проект"
};

export function useContent() {
  const [content, setContent] = useState<Record<string, string>>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(isFirebaseReady);
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseReady) {
      console.log("Firebase not configured, using offline mode");
      setIsLoading(false);
      setIsOnline(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "content"), 
      (snapshot) => {
        const contentData: Record<string, string> = { ...defaultContent };
        snapshot.forEach((doc) => {
          const data = doc.data() as Content;
          contentData[doc.id] = data.content;
        });
        setContent(contentData);
        setIsLoading(false);
        setIsOnline(true);
      },
      (error) => {
        console.warn("Firebase connection error, using offline mode:", error.message);
        setIsLoading(false);
        setIsOnline(false);
        setContent(defaultContent);
      }
    );

    return unsubscribe;
  }, []);

  const updateContent = async (id: string, newContent: string) => {
    if (!isFirebaseReady || !isOnline) {
      // Update local state even in offline mode
      setContent(prev => ({ ...prev, [id]: newContent }));
      toast({
        title: "Локальное обновление",
        description: "Изменения сохранены локально. Настройте Firebase для синхронизации.",
        variant: "default",
      });
      return;
    }

    try {
      await setDoc(doc(db, "content", id), {
        content: newContent,
        type: "text",
        updatedAt: new Date(),
      });
      toast({
        title: "Контент обновлен",
        description: "Изменения сохранены в Firebase",
      });
    } catch (error) {
      console.warn("Failed to save to Firebase:", error);
      // Still update local state
      setContent(prev => ({ ...prev, [id]: newContent }));
      toast({
        title: "Локальное сохранение",
        description: "Сохранено локально. Проверьте подключение к Firebase.",
        variant: "default",
      });
    }
  };

  const getContent = (id: string, defaultValue: string = "") => {
    return content[id] || defaultValue;
  };

  return {
    content,
    isLoading,
    updateContent,
    getContent,
    isOnline,
    isFirebaseReady,
  };
}
