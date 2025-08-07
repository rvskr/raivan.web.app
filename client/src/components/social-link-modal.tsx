import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { Plus, X } from "lucide-react";
import { SocialLink } from "@shared/schema";

interface SocialLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialData?: SocialLink | null;
}

export const SocialLinkModal = ({ isOpen, onClose, title, initialData }: SocialLinkModalProps) => {
  const [platform, setPlatform] = useState(initialData?.platform || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Предустановленные платформы с иконками Font Awesome
  const predefinedPlatforms = [
    { name: "Вконтакте", value: "fab fa-vk", domain: "vk.com" },
    { name: "Instagram", value: "fab fa-instagram", domain: "instagram.com" },
    { name: "Telegram", value: "fab fa-telegram", domain: "t.me" },
    { name: "WhatsApp", value: "fab fa-whatsapp", domain: "wa.me" },
    { name: "Facebook", value: "fab fa-facebook", domain: "facebook.com" },
  ];

  const handleSave = async () => {
    if (!platform || !url || !icon) {
      toast({
        title: "Ошибка",
        description: "Платформа, URL и иконка обязательны.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (initialData?.id) {
        await setDoc(doc(db, "social-links", initialData.id), { platform, url, icon }, { merge: true });
      } else {
        await addDoc(collection(db, "social-links"), { platform, url, icon });
      }
      toast({
        title: "Успех",
        description: "Социальная ссылка сохранена.",
      });
      onClose();
    } catch (e) {
      console.error("Ошибка сохранения ссылки:", e);
      toast({
        title: "Ошибка",
        description: `Не удалось сохранить ссылку: ${e instanceof Error ? e.message : "Неизвестная ошибка"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора предустановленной платформы
  const handlePlatformSelect = (platformObj: (typeof predefinedPlatforms)[0]) => {
    setPlatform(platformObj.name);
    setIcon(platformObj.value);
    if (!url.includes(platformObj.domain)) {
      setUrl(`https://${platformObj.domain}/`);
    }
    setIsCustom(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? "Отредактируйте ссылку на соцсеть." : "Добавьте новую ссылку на соцсеть."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Выбор платформы */}
          <div>
            <Label>Платформа</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {predefinedPlatforms.map((p) => (
                <Button
                  key={p.value}
                  type="button"
                  variant={platform === p.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlatformSelect(p)}
                  className="flex flex-col items-center py-3"
                >
                  <i className={`${p.value} text-lg`}></i>
                  <span className="text-xs mt-1">{p.name}</span>
                </Button>
              ))}
              <Button
                type="button"
                variant={isCustom ? "default" : "outline"}
                size="sm"
                onClick={() => setIsCustom(true)}
                className="flex flex-col items-center py-3"
              >
                <Plus className="text-lg" />
                <span className="text-xs mt-1">Своя</span>
              </Button>
            </div>
          </div>

          {/* Ввод названия для кастомной платформы */}
          {isCustom && (
            <div>
              <Input
                placeholder="Название платформы"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>
          )}

          {/* Ссылка */}
          <div>
            <Label>Ссылка</Label>
            <Input
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Выбор иконки */}
          {!isCustom ? (
            <div>
              <Label>Иконка</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {predefinedPlatforms.map((p) => (
                  <Button
                    key={p.value}
                    type="button"
                    variant={icon === p.value ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setIcon(p.value)}
                    className="p-3"
                  >
                    <i className={`${p.value} text-xl`}></i>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <Label>Иконка (CSS-класс или URL)</Label>
              <Input
                placeholder="fab fa-custom или https://..."
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
          )}

          {/* Предпросмотр иконки */}
          {icon && (
            <div>
              <Label>Предпросмотр</Label>
              <div className="p-3 bg-gray-100 rounded text-center">
                {icon.startsWith("http") ? (
                  <img src={icon} alt="Preview" className="h-8 w-8 inline-block" />
                ) : (
                  <i className={`${icon} text-2xl text-primary`}></i>
                )}
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={isLoading} className="mt-4 w-full">
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};