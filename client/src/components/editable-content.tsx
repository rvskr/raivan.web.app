import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useContent } from "@/hooks/use-content";
import { Edit2 } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface EditableContentProps {
  id: string;
  defaultContent?: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  isEditable?: boolean;
  onSave?: (value: string) => Promise<void>;
}

export function EditableContent({
  id,
  defaultContent = "",
  className = "",
  tag: Tag = "span",
  children,
  isEditable = false,
  onSave,
}: EditableContentProps) {
  const { isAdmin } = useAdmin();
  const { getContent, updateContent } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(defaultContent);

  const content = getContent(id, defaultContent);

  const handleEdit = () => {
    if (!isAdmin || !isEditable) return;
    setEditValue(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateContent(id, editValue);
      if (onSave) {
        await onSave(editValue);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save content:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(defaultContent);
  };

  if (isEditing && isEditable) {
    return (
      <div className="relative w-full">
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[100px] p-2 border-2 border-primary rounded resize-none bg-white text-dark"
          autoFocus
          data-testid={`edit-textarea-${id}`}
          placeholder="Нажмите 'Сохранить' для сохранения изменений"
        />
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleSave}
            className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-opacity-90"
            data-testid={`button-save-${id}`}
          >
            Сохранить
          </Button>
          <Button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            data-testid={`button-cancel-${id}`}
          >
            Отмена
          </Button>
        </div>
      </div>
    );
  }

  const isContentEmptyForAdmin = (!content || content.trim() === "") && isAdmin && isEditable;

  return (
    <Tag
      className={cn(
        className,
        isContentEmptyForAdmin && "min-h-[3rem] w-full flex items-center justify-center bg-gray-100 text-gray-500 italic p-4 rounded",
        isAdmin && isEditable
          ? "cursor-pointer hover:bg-yellow-100 hover:outline-2 hover:outline-dashed hover:outline-yellow-500 relative transition-all duration-200"
          : "",
        isAdmin && isEditable && !isContentEmptyForAdmin ? "outline-1 outline-dashed outline-yellow-300/50" : ""
      )}
      onClick={handleEdit}
      data-testid={`editable-${id}`}
      title={isAdmin && isEditable ? "Кликните для редактирования" : undefined}
    >
      {isContentEmptyForAdmin ? "Нажмите для редактирования" : children || content}
      {isAdmin && isEditable && (
        <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          ✏️
        </span>
      )}
    </Tag>
  );
}