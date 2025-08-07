import { useQuery } from "@tanstack/react-query";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Content, HeroSectionContent, AboutSectionContent, NavSectionContent, FooterContent } from "@shared/schema";

export function useEditableContent<T extends Content | HeroSectionContent | AboutSectionContent | NavSectionContent | FooterContent>(id: string) {
  const fetchContent = async (): Promise<T> => {
    return new Promise((resolve, reject) => {
      const docRef = doc(db, "editable-content", id);
      const unsubscribe = onSnapshot(
        docRef,
        snapshot => {
          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() } as T;
            localStorage.setItem(`editable-content-${id}`, JSON.stringify(data)); // Сохраняем в localStorage
            resolve(data);
          } else {
            resolve({} as T); // Пустой объект при отсутствии данных
          }
        },
        error => {
          console.error(`Ошибка загрузки контента для ${id}:`, error);
          reject(error);
        }
      );
      return () => unsubscribe();
    });
  };

  const { data } = useQuery({
    queryKey: ["editable-content", id],
    queryFn: fetchContent,
    staleTime: Infinity,
    initialData: () => {
      const cached = localStorage.getItem(`editable-content-${id}`); // Проверяем кэш
      return cached ? JSON.parse(cached) : undefined;
    },
  });

  return data ?? ({} as T);
}