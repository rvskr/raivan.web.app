import { useQueries } from "@tanstack/react-query";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { GalleryItem, Service, Category, SocialLink } from "@shared/schema";
import { useEffect } from "react";

export const fetchFirebaseData = async (collectionName: string, orderField?: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const q = orderField ? query(collection(db, collectionName), orderBy(orderField, "asc")) : collection(db, collectionName);
    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        resolve(data);
      },
      error => {
        console.error(`Ошибка загрузки ${collectionName}:`, error);
        reject(error);
      }
    );
    return () => unsubscribe();
  });
};

export const fetchCategories = () => fetchFirebaseData("categories", "order");
export const fetchGalleryItems = () => fetchFirebaseData("gallery", "order");
export const fetchServices = () => fetchFirebaseData("services", "order");
export const fetchSocialLinks = () => fetchFirebaseData("social-links", "order");

export function useFirebaseQuery() {
  const { toast } = useToast();

  const errorMessages = {
    categories: "Не удалось загрузить категории",
    gallery: "Не удалось загрузить галерею",
    services: "Не удалось загрузить услуги",
    socialLinks: "Не удалось загрузить социальные ссылки",
  };

  const [categoriesQuery, galleryItemsQuery, servicesQuery, socialLinksQuery] = useQueries({
    queries: [
      {
        queryKey: ["categories"],
        queryFn: fetchCategories,
        staleTime: Infinity,
      },
      {
        queryKey: ["gallery"],
        queryFn: fetchGalleryItems,
        staleTime: Infinity,
      },
      {
        queryKey: ["services"],
        queryFn: fetchServices,
        staleTime: Infinity,
      },
      {
        queryKey: ["social-links"],
        queryFn: fetchSocialLinks,
        staleTime: Infinity,
      },
    ],
  });

  useEffect(() => {
    if (categoriesQuery.error) {
      toast({
        title: "Ошибка",
        description: `${errorMessages.categories}: ${categoriesQuery.error.message}`,
        variant: "destructive",
      });
    }
    if (galleryItemsQuery.error) {
      toast({
        title: "Ошибка",
        description: `${errorMessages.gallery}: ${galleryItemsQuery.error.message}`,
        variant: "destructive",
      });
    }
    if (servicesQuery.error) {
      toast({
        title: "Ошибка",
        description: `${errorMessages.services}: ${servicesQuery.error.message}`,
        variant: "destructive",
      });
    }
    if (socialLinksQuery.error) {
      toast({
        title: "Ошибка",
        description: `${errorMessages.socialLinks}: ${socialLinksQuery.error.message}`,
        variant: "destructive",
      });
    }
  }, [categoriesQuery.error, galleryItemsQuery.error, servicesQuery.error, socialLinksQuery.error, toast]);

  return {
    categories: (categoriesQuery.data ?? []) as Category[],
    galleryItems: (galleryItemsQuery.data ?? []) as GalleryItem[],
    services: (servicesQuery.data ?? []) as Service[],
    socialLinks: (socialLinksQuery.data ?? []) as SocialLink[],
  };
}