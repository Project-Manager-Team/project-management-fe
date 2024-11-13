import { EditableContentProps } from '@/app/types/common';
import AutoResizeTextArea from './AutoResizeTextArea';

export const EditableContent = ({
  isEditing,
  value,
  onChange,
  name,
  type = "text",
  className = "",
}: EditableContentProps) => {
  if (!isEditing) {
    return type === "textarea" ? (
      <div className="min-h-[1.5rem]">
        <AutoResizeTextArea content={value ? String(value) : null} />
      </div>
    ) : (
      <span className={className}>{value}</span>
    );
  }

  return type === "textarea" ? (
    <textarea
      name={name}
      value={value === true ? "" : value || ""}
      onChange={onChange}
      className={`w-full p-2 bg-black-50 dark:bg-black-900 border border-blue-500 
                rounded-lg focus:outline-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <input
      type={type}
      name={name}
      value={value === true ? "" : value || ""}
      onChange={onChange}
      className={`w-full p-2 bg-white-50 dark:bg-black-900 border border-blue-500 
                rounded-lg focus:outline-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default EditableContent;