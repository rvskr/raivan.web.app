import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useEditableContent } from "@/hooks/use-editable-content";
import { EditableContent } from "@/components/editable-content";
import { useAdmin } from "@/hooks/use-admin";
import { Service, ContactFormContent } from "@shared/schema";

interface ContactFormProps {
  services: Service[];
}

export function ContactForm({ services }: ContactFormProps) {
  const { isAdmin } = useAdmin();
  const [isEditingMode, setIsEditingMode] = useState(isAdmin);
  const formContent = useEditableContent("contact-form") as ContactFormContent;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Automatically select the first service when services are available
  useEffect(() => {
    if (!formData.service && services.length > 0) {
      setFormData((prev) => ({ ...prev, service: services[0].id }));
    }
  }, [services, formData.service]);

  useEffect(() => {
    setIsEditingMode(isAdmin);
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        submittedAt: new Date(),
      });

      toast({
        title: "Заявка отправлена",
        description: "Спасибо! Мы свяжемся с вами в ближайшее время.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        service: services.length > 0 ? services[0].id : "", // Reset to first service
        message: "",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <EditableContent
        id="contact-form-title"
        defaultContent="Отправьте заявку"
        className="text-2xl font-display font-semibold mb-6"
        tag="h3"
        isEditable={isEditingMode}
      />
      <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
        <div>
          <Label htmlFor="name">
            <EditableContent
              id="contact-form-nameLabel"
              defaultContent="Имя *"
              tag="span"
              isEditable={isEditingMode}
            />
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="input-name"
          />
        </div>
        <div>
          <Label htmlFor="email">
            <EditableContent
              id="contact-form-emailLabel"
              defaultContent="Email *"
              tag="span"
              isEditable={isEditingMode}
            />
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            data-testid="input-email"
          />
        </div>
        <div>
          <Label htmlFor="phone">
            <EditableContent
              id="contact-form-phoneLabel"
              defaultContent="Телефон"
              tag="span"
              isEditable={isEditingMode}
            />
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            data-testid="input-phone"
          />
        </div>
        <div>
          <Label htmlFor="service">
            <EditableContent
              id="contact-form-serviceLabel"
              defaultContent="Тип услуги"
              tag="span"
              isEditable={isEditingMode}
            />
          </Label>
          <Select
            value={formData.service}
            onValueChange={(value) => setFormData({ ...formData, service: value })}
            disabled={services.length === 0}
          >
            <SelectTrigger data-testid="select-service">
              <SelectValue
                placeholder={
                  <EditableContent
                    id="contact-form-servicePlaceholder"
                    defaultContent="Выберите услугу"
                    tag="span"
                    isEditable={isEditingMode}
                  />
                }
              />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="message">
            <EditableContent
              id="contact-form-messageLabel"
              defaultContent="Сообщение *"
              tag="span"
              isEditable={isEditingMode}
            />
          </Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={4}
            placeholder={formContent?.messagePlaceholder || "Опишите ваш проект..."}
            data-testid="textarea-message"
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          data-testid="button-submit"
        >
          <EditableContent
            id="contact-form-submitButton"
            defaultContent="Отправить заявку"
            tag="span"
            isEditable={isEditingMode}
          />
        </Button>
      </form>
    </div>
  );
}