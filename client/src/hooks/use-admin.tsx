import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Проверяем localStorage для временного входа
    const savedAdmin = localStorage.getItem('isAdmin');
    if (savedAdmin === 'true') {
      setIsAdmin(true);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    // Временный вход для демонстрации (без Firebase)
    if (email === "admin@example.com" && password === "admin123") {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в админ панель",
      });
      return true;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в админ панель",
      });
      return true;
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: "Попробуйте: admin@example.com / admin123 или настройте Firebase",
        variant: "destructive",
      });
      return false;
    }
  };

  const signOutAdmin = async () => {
    try {
      // Очищаем локальное сохранение
      localStorage.removeItem('isAdmin');
      setIsAdmin(false);
      
      await signOut(auth);
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из админ панели",
      });
    } catch (error) {
      // Даже если Firebase выход не сработал, очищаем локальное состояние
      localStorage.removeItem('isAdmin');
      setIsAdmin(false);
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из админ панели",
      });
    }
  };

  return {
    isAdmin,
    isLoading,
    signIn,
    signOut: signOutAdmin,
  };
}
