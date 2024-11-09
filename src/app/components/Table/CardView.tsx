import React, { useEffect, useRef } from 'react';
import { FiCheckSquare, FiFolder, FiEdit, FiSave, FiTrash2 } from 'react-icons/fi';
import { Item, ItemProperty } from '@/app/types/table';
import OwnerButton from './OwnerButton'; // Change to default import
import { useAppStore } from '@/app/store/appStore';
import { toast } from 'react-toastify'; // Add this import
import { CardViewProps, EditableContentProps, AutoResizeTextAreaProps } from '@/app/types/table';

const AutoResizeTextArea = ({ content }: AutoResizeTextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [content]);

  return (
    <div className="text-sm text-[var(--muted-foreground)]">
      {content || ''}
    </div>
  );
};

const EditableContent = ({ 
  isEditing, 
  value, 
  onChange, 
  name,
  type = 'text',
  className = ''
}: EditableContentProps) => {
  if (!isEditing) {
    return type === 'textarea' ? (
      <div className="min-h-[1.5rem]">
        <AutoResizeTextArea content={value ? String(value) : null} />
      </div>
    ) : (
      <span className={className}>{value}</span>
    );
  }

  return type === 'textarea' ? (
    <textarea
      name={name}
      value={value === true ? '' : value || ''}
      onChange={onChange}
      className={`w-full p-2 bg-yellow-50 dark:bg-yellow-900 border border-blue-500 
                rounded-lg focus:outline-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  ) : (
    <input
      type={type}
      name={name}
      value={value === true ? '' : value || ''}
      onChange={onChange}
      className={`w-full p-2 bg-yellow-50 dark:bg-yellow-900 border border-blue-500 
                rounded-lg focus:outline-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const ToastContent = (
    <div>
      <p>{message}</p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => {
            toast.dismiss();
            onConfirm();
          }}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Đồng ý
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            if (onCancel) onCancel();
          }}
          className="px-2 py-1 bg-gray-500 text-white rounded"
        >
          Hủy
        </button>
      </div>
    </div>
  );

  toast(ToastContent, {
    autoClose: false,
    closeButton: false,
  });
};

const CardView: React.FC<CardViewProps> = ({
  items,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
}) => {
  const { history, setHistory, setShouldReloadTable } = useAppStore();

  const handleCardClick = (item: Item, isEditing: boolean) => {
    if (isEditing) {
      showConfirmationToast(
        "Bạn có đang chỉnh sửa nội dung. Bạn có chắc muốn rời đi không?",
        () => navigateToChild(item)
      );
      return;
    }

    navigateToChild(item);
  };

  const navigateToChild = (item: Item) => {
    const newHistory = [...history, {
      id: item.id,
      url: `/api/project/${item.id}/child`,
      title: item.title || "",
    }];
    setHistory(newHistory);
    setShouldReloadTable(true);
  };

  const getDiffLevelStyle = (level: number | null | undefined) => {
    if (level === null || level === undefined) return "bg-gray-100 text-gray-800";
    switch (level) {
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {items.map((item) => (
        <div 
          key={item.id}
          onClick={() => handleCardClick(item, item.isEditing)}
          className={`group bg-[var(--card)] border border-[var(--border)] rounded-lg 
                    shadow-sm transition-all duration-200 p-4 relative
                    ${!item.isEditing ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''}
                    ${item.isEditing ? 'ring-2 ring-blue-500' : 'hover:bg-[var(--muted)]'}`}
        >
          {/* Card Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {item.type.toLowerCase() === 'task' ? (
                <FiCheckSquare className="w-5 h-5" />
              ) : (
                <FiFolder className="w-5 h-5" />
              )}
              <EditableContent
                isEditing={item.isEditing}
                value={item.title}
                name="title"
                onChange={(e) =>
                  handleChange(
                    item.index,
                    'title' as ItemProperty,
                    e.target.value
                  )
                }
                className="font-medium text-[var(--foreground)]"
              />
            </div>
            {/* Action Buttons - Reordered */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                          text-[var(--foreground)] rounded-full transition-all"
                onClick={() => handleEditItem(item.index)}
                aria-label={item.isEditing ? "Save" : "Edit"}
              >
                {item.isEditing ? (
                  <FiSave className="w-4 h-4" />
                ) : (
                  <FiEdit className="w-4 h-4" />
                )}
              </button>
              <button
                className="p-1.5 bg-[var(--muted)] hover:bg-[var(--muted-foreground)]
                          text-[var(--foreground)] rounded-full transition-all"
                onClick={() => handleDeleteItem(item.id)}
                aria-label="Delete"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
              <OwnerButton
                owner={item.owner}
                managersCount={item.managersCount}
                onClick={() => openManagers(item)}
                size="small"
              />
            </div>
          </div>

          {/* Card Content */}
          <div className="space-y-3">
            {/* Description */}
            {(item.description || item.isEditing) && (
              <EditableContent
                isEditing={item.isEditing}
                value={item.description}
                name="description"
                type="textarea"
                onChange={(e) =>
                  handleChange(
                    item.index,
                    'description' as ItemProperty,
                    e.target.value
                  )
                }
              />
            )}

            {/* Dates */}
            {(item.beginTime || item.endTime || item.isEditing) && (
              <div className="grid grid-cols-2 gap-2">
                <EditableContent
                  isEditing={item.isEditing}
                  value={item.beginTime ? item.beginTime.substring(0, 16) : ''}
                  name="beginTime"
                  type="datetime-local"
                  onChange={(e) =>
                    handleChange(
                      item.index,
                      'beginTime' as ItemProperty,
                      e.target.value
                    )
                  }
                />
                <EditableContent
                  isEditing={item.isEditing}
                  value={item.endTime ? item.endTime.substring(0, 16) : ''}
                  name="endTime"
                  type="datetime-local"
                  onChange={(e) =>
                    handleChange(
                      item.index,
                      'endTime' as ItemProperty,
                      e.target.value
                    )
                  }
                />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              {item.diffLevel !== null && (
                <span className={`text-xs px-2 py-1 rounded-full ${getDiffLevelStyle(item.diffLevel)}`}>
                  {['Dễ', 'Trung bình', 'Khó'][item.diffLevel - 1] || 'Không xác định'}
                </span>
              )}
              
              <div className="flex-grow">
                {item.type.toLowerCase() === 'task' ? (
                  <input
                    type="checkbox"
                    checked={item.progress === 100}
                    onChange={() => handleUpdateProgress(item.id, item.progress === 100 ? 0 : 100)}
                    className="form-checkbox h-4 w-4 text-green-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardView;