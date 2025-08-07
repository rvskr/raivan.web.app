import { Badge } from "@/components/ui/badge";
import { useContent } from "@/hooks/use-content";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

export function FirebaseStatus() {
  const { isOnline, isFirebaseReady } = useContent();

  if (!isFirebaseReady) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <WifiOff className="w-3 h-3" />
        Режим демо
      </Badge>
    );
  }

  return (
    <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          Firebase подключен
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          Локальный режим
        </>
      )}
    </Badge>
  );
}