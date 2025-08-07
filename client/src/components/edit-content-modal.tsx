import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface EditContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onSave: (newContent: string) => void;
  title?: string;
}

export function EditContentModal({ 
  open, 
  onOpenChange, 
  content, 
  onSave, 
  title = "Редактировать содержимое" 
}: EditContentModalProps) {
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    onSave(editValue);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="edit-content-modal">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="content">Текст</Label>
            <Textarea
              id="content"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={4}
              className="w-full"
              data-testid="textarea-edit-content"
            />
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              data-testid="button-save-content"
            >
              Сохранить
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-content"
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
