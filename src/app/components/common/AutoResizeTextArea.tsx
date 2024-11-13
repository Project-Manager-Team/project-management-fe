import React, { useEffect, useRef } from "react";
import { AutoResizeTextAreaProps } from "@/app/types/common";

const AutoResizeTextArea = ({ content }: AutoResizeTextAreaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to calculate new scrollHeight
      textarea.style.height = "auto";
      // Set height based on scrollHeight to auto-resize
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  return (
    <textarea
      ref={textareaRef}
      value={content || ""}
      readOnly
      className="text-sm text-[var(--muted-foreground)] w-full resize-none overflow-hidden bg-transparent"
    />
  );
};

export default AutoResizeTextArea;
