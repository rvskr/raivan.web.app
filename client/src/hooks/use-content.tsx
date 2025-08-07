import { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Content } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "content"), (snapshot) => {
      const contentData: Record<string, string> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as Content;
        contentData[doc.id] = data.content;
      });
      setContent(contentData);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateContent = async (id: string, newContent: string) => {
    try {
      await setDoc(doc(db, "content", id), {
        content: newContent,
        type: "text",
        updatedAt: new Date(),
      });
      toast({
        title: "Контент обновлен",
        description: "Изменения сохранены успешно",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
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
  };
}
