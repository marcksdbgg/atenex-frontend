// File: components/chat/chat-input.tsx (MODIFICADO - Iteración 3.4)
"use client";

import React, { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
  };

  // Auto-resize logic in useEffect to handle external value changes too (e.g., clearing)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height first
      // Set height based on scroll height, but enforce max-height via CSS
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`; // 160px = 10rem (max-h-40)
    }
  }, [inputValue]); // Re-run when input value changes

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !isLoading) {
      onSendMessage(trimmedValue);
      setInputValue(''); // Clear input after sending
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault(); // Prevent newline on Enter
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end space-x-2">
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Pregúntale a Atenex..."
        className={cn(
            "flex-1 resize-none min-h-[40px] max-h-40", // min/max height
            "py-2 pr-12 pl-3", // Ajuste de padding (más a la derecha para botón)
            "rounded-lg border border-input", // Estilo de borde
            "text-sm shadow-sm placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring", // Estilo focus
            "disabled:cursor-not-allowed disabled:opacity-50" // Estilo disabled
        )}
        rows={1} // Empezar con una sola fila
        disabled={isLoading}
        aria-label="Entrada de chat"
      />
      {/* Botón posicionado absolutamente dentro del form */}
      <Button
        type="submit"
        size="icon"
        className={cn(
            "absolute right-2 bottom-2 h-8 w-8 flex-shrink-0 rounded-lg", // Posición y tamaño
            "transition-colors duration-150"
        )}
        disabled={isLoading || !inputValue.trim()}
        aria-label="Enviar mensaje"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}