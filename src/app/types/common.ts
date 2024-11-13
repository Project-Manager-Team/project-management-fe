
export interface EditableContentProps {
  isEditing: boolean;
  value: string | number | boolean | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  name: string;
  type?: string;
  className?: string;
}

export interface AutoResizeTextAreaProps {
  content: string | null;
}