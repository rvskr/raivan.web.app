import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // There is no more temporary localStorage check, as we are relying solely on Firebase authentication.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
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
        description: "Неверный email или пароль",
        variant: "destructive",
      });
      return false;
    }
  };

  const signOutAdmin = async () => {
    try {
      await signOut(auth);
      setIsAdmin(false);
      toast({
        title: "Выход выполнен",
        description: "Вы вышли из админ панели",
      });
    } catch (error) {
      setIsAdmin(false);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы. Попробуйте еще раз.",
        variant: "destructive",
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