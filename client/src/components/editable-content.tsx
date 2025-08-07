import { useState } from "react";
import { useAdmin } from "@/hooks/use-admin";
import { useContent } from "@/hooks/use-content";

interface EditableContentProps {
  id: string;
  defaultContent: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

export function EditableContent({ 
  id, 
  defaultContent, 
  className = "", 
  tag: Tag = "span",
  children 
}: EditableContentProps) {
  const { isAdmin } = useAdmin();
  const { getContent, updateContent } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const content = getContent(id, defaultContent);

  const handleEdit = () => {
    if (!isAdmin) return;
    setEditValue(content);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateContent(id, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[50px] p-2 border-2 border-primary rounded resize-none"
          autoFocus
          data-testid={`edit-textarea-${id}`}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-opacity-90"
            data-testid={`button-save-${id}`}
          >
            Сохранить
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            data-testid={`button-cancel-${id}`}
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <Tag
      className={`${className} ${isAdmin ? 'cursor-pointer hover:bg-yellow-100 hover:outline-2 hover:outline-dashed hover:outline-primary' : ''}`}
      onClick={handleEdit}
      data-testid={`editable-${id}`}
    >
      {children || content}
    </Tag>
  );
}
