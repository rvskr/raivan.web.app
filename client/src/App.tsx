import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthModal } from "@/components/auth-modal";
import { useAdmin } from "@/hooks/use-admin";
import { useState, useEffect, Suspense } from "react";
import Home from "@/pages/home";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { queryClient } from "./lib/queryClient";
import { Loader2 } from "lucide-react";

function Router() {
  // `useAdmin` - это хук, который определяет, является ли пользователь администратором
  const { isAdmin, isLoading } = useAdmin();
  // `useState` для управления видимостью модального окна, по умолчанию оно скрыто
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Обратите внимание: `useEffect` с таймером был удалён, чтобы убрать задержку

  return (
    <>
      {/* Компонент Switch для навигации по маршрутам */}
      <Switch>
        {/* Главная страница */}
        <Route path="/" component={Home} />
        {/* Маршрут для страницы администратора, доступен только для админов */}
        <Route path="/admin">{isAdmin ? <Admin /> : <NotFound />}</Route>
        {/* Маршрут по умолчанию для несуществующих страниц */}
        <Route component={NotFound} />
      </Switch>
      {/* Модальное окно для авторизации. Его видимость теперь управляется только вручную */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}

function App() {
  return (
    // `QueryClientProvider` для доступа к TanStack Query
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* `Suspense` для отображения загрузчика во время загрузки компонентов */}
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-screen bg-neutral text-dark">
              <div className="flex flex-col items-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-lg text-gray-600">Загрузка...</p>
              </div>
            </div>
          }
        >
          <Router />
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
