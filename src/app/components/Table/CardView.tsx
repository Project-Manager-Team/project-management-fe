import React, { useEffect, useRef } from 'react';
import { FiCheckSquare, FiFolder, FiEdit, FiSave, FiTrash2, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Item, ItemProperty } from '@/app/types/table';
import OwnerButton from './OwnerButton'; // Change to default import
import { useAppStore } from '@/app/store/appStore';
import { CardViewProps, EditableContentProps, AutoResizeTextAreaProps } from '@/app/types/table';
import { formatDateTime } from "@/app/utils/formatDateTime"; // Add this import at the top

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


const CardView: React.FC<CardViewProps> = ({
  items,
  handleChange,
  handleEditItem,
  handleDeleteItem,
  handleUpdateProgress,
  openManagers,
  isCreating, // Add this prop
  setIsCreating, // Add this prop
}) => {
  const { history, setHistory, setShouldReloadTable } = useAppStore();

  const handleCardClick = (item: Item, isEditing: boolean) => {
    if (isEditing || isCreating) {
      toast.warning("Vui lòng lưu thay đổi trước khi chuyển trang!");
      return;
    }
    navigateToChild(item);
  };

  const navigateToChild = (item: Item) => {
    setIsCreating(false); // Reset isCreating state
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

  const getDiffLevelLabel = (level: number | null | undefined) => {
    switch (level) {
      case 1:
        return 'Dễ';
      case 2:
        return 'Trung bình';
      case 3:
        return 'Khó';
      default:
        return 'Không xác định';
    }
  };

  // Add this function to format date display
  const renderDateContent = (dateString: string | null) => {
    if (!dateString) return null;
    const { date, time } = formatDateTime(dateString);
    return (
      <div className="flex flex-col">
        <span className="text-xs text-[var(--muted-foreground)]">
          {date}
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">
          {time}
        </span>
      </div>
    );
  };

  // Add this helper function
  const renderProgress = (item: Item) => {
    if (item.type.toLowerCase() === 'task') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateProgress(item.id, item.progress === 100 ? 0 : 100);
          }}
          className={`p-1.5 rounded-lg transition-all flex items-center gap-2 text-sm
                     ${item.progress === 100 
                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                       : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
        >
          <div className={`p-0.5 rounded ${item.progress === 100 ? 'bg-green-500' : 'bg-gray-400'}`}>
            <FiCheck className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-medium">
            {item.progress === 100 ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
          </span>
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex-grow bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${item.progress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          {item.progress}%
        </span>
      </div>
    );
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
              <div className="grid grid-cols-2 gap-4 my-3 p-2 bg-[var(--muted)] rounded-lg">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Bắt đầu
                  </span>
                  {item.isEditing ? (
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
                  ) : (
                    renderDateContent(item.beginTime)
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Kết thúc
                  </span>
                  {item.isEditing ? (
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
                  ) : (
                    renderDateContent(item.endTime)
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                {(item.diffLevel !== null || item.isEditing) && (
                  item.isEditing ? (
                    <select
                      name="diffLevel"
                      value={item.diffLevel === null ? "1" : item.diffLevel}
                      onChange={(e) => handleChange(
                        item.index,
                        'diffLevel' as ItemProperty,
                        e.target.value ? parseInt(e.target.value) : 1
                      )}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-2 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900 
                               border border-blue-500 focus:outline-none"
                    >
                      <option value="1">Dễ</option>
                      <option value="2">Trung bình</option>
                      <option value="3">Khó</option>
                    </select>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full ${getDiffLevelStyle(item.diffLevel)}`}>
                      {item.diffLevel !== null ? getDiffLevelLabel(item.diffLevel) : 'Không xác định'}
                    </span>
                  )
                )}
              </div>
              
              <div className="flex-1">
                {renderProgress(item)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardView;