
import React, { useEffect, useRef } from 'react';
import { AutoResizeTextAreaProps } from '@/app/types/common';

const AutoResizeTextArea = ({ content }: AutoResizeTextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [content]);

  return (
    <div className="text-sm text-[var(--muted-foreground)]">
      {content || ""}
    </div>
  );
};

export default AutoResizeTextArea;