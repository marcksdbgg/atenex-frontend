// File: components/chat/chat-history.tsx (MODIFICADO - Iteración 2)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquareText, Trash2, Loader2, AlertCircle, RefreshCw, History } from 'lucide-react'; // Añadido History icon
import { cn } from '@/lib/utils';
import { getChats, deleteChat, ChatSummary, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

export function ChatHistory() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading: isAuthLoading, signOut } = useAuth();

    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chatToDelete, setChatToDelete] = useState<ChatSummary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const fetchChatHistory = useCallback(async (showToast = false) => {
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        const isAuthenticated = !!user || bypassAuth;

        if (!isAuthLoading && !isAuthenticated) {
            setChats([]);
            setError(null);
            setIsLoading(false);
            return;
        }

        if (!bypassAuth && isAuthLoading) {
            setIsLoading(true);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const fetchedChats = await getChats();
            fetchedChats.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            setChats(fetchedChats);
            if (showToast) toast.success("Historial de chats actualizado");
        } catch (err) {
            let message = "No se pudo cargar el historial de chats.";
            if (err instanceof ApiError) {
                message = err.message || message;
                if (err.status === 401 || err.status === 403) { message = "Sesión expirada o inválida. Por favor, inicia sesión de nuevo."; signOut(); }
                else if (err.status === 422) { message = `Fallo al procesar la solicitud: ${err.message}`; }
            } else if (err instanceof Error) { message = err.message; }
            setError(message);
            setChats([]);
            if (showToast) toast.error("Error al Cargar Chats", { description: message });
        } finally {
            setIsLoading(false);
        }
    }, [user, isAuthLoading, signOut]);

    useEffect(() => {
        fetchChatHistory(false);
    }, [fetchChatHistory]);

    const openDeleteConfirmation = (chat: ChatSummary, event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        setChatToDelete(chat);
        setIsAlertOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!chatToDelete) return;
        setIsDeleting(true);
        try {
            await deleteChat(chatToDelete.id);
            setChats(prev => prev.filter(chat => chat.id !== chatToDelete.id));
            toast.success("Chat Eliminado", { description: `Chat "${chatToDelete.title || chatToDelete.id.substring(0, 8)}" eliminado.` });
            const currentChatId = pathname.split('/').pop();
            if (currentChatId === chatToDelete.id) {
                router.push('/chat');
            }
        } catch (err) {
            let message = "No se pudo eliminar el chat.";
            if (err instanceof ApiError) {
                message = err.message || message;
                if (err.status === 401 || err.status === 403) signOut();
            } else if (err instanceof Error) { message = err.message; }
            toast.error("Fallo al Eliminar", { description: message });
        } finally {
            setIsDeleting(false);
            setIsAlertOpen(false);
            setChatToDelete(null);
        }
    };

    const renderContent = () => {
        const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
        const isAuthenticated = !!user || bypassAuth;

        if (isLoading || (!bypassAuth && isAuthLoading)) {
            // Skeleton más representativo
            return (
                <div className="space-y-2 p-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div className="px-2 py-6 text-center text-muted-foreground">
                    <p className="text-xs mb-2">Inicia sesión para ver el historial.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="px-3 py-6 text-center text-destructive-foreground bg-destructive/10 rounded-md m-2">
                    <AlertCircle className="mx-auto h-6 w-6 mb-2 text-destructive" />
                    <p className="text-sm font-medium mb-1">Error al Cargar</p>
                    <p className="text-xs mb-3">{error}</p>
                    <Button variant="destructive" size="sm" onClick={() => fetchChatHistory(true)} className="bg-destructive/80 hover:bg-destructive">
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5"/> Reintentar
                    </Button>
                </div>
            );
        }

        if (chats.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 gap-2">
                    <History className="h-12 w-12 mb-2 opacity-40"/>
                    <p className="text-base font-semibold mb-1">No tienes chats previos</p>
                    <p className="text-xs mb-2">Inicia una nueva conversación para verla aquí.</p>
                    <Button variant="outline" size="sm" onClick={() => router.push('/chat')}>
                        Nuevo Chat
                    </Button>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-2">
                {chats.map((chat) => {
                    const isActive = pathname === `/chat/${chat.id}`;
                    // Eliminar el prefijo "Chat: " si existe en el título
                    let displayTitle = chat.title || `Chat ${chat.id.substring(0, 8)}...`;
                    if (displayTitle.toLowerCase().startsWith('chat:')) {
                        displayTitle = displayTitle.replace(/^chat:\s*/i, '');
                    }
                    const displayDate = new Date(chat.updated_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
                    return (
                        <div
                            key={chat.id}
                            className={cn(
                                'relative flex items-center group w-full bg-card border shadow-sm rounded-lg px-3 py-2 transition hover:shadow-md',
                                isActive ? 'ring-2 ring-primary/40 border-primary/40' : 'border-border',
                            )}
                        >
                            <div className="flex flex-1 min-w-0 items-center gap-2 text-left relative">
                                <Link href={`/chat/${chat.id}`} passHref legacyBehavior>
                                    <a
                                        className={cn(
                                            'flex flex-1 min-w-0 items-center gap-2',
                                            isActive ? 'text-primary font-semibold' : 'text-foreground/80 hover:text-foreground',
                                        )}
                                        title={displayTitle}
                                        style={{ minWidth: 0 }}
                                    >
                                        <MessageSquareText className="h-4 w-4 flex-shrink-0 opacity-80" />
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="truncate font-medium max-w-[12rem] sm:max-w-[16rem] md:max-w-[20rem]" title={displayTitle}>{displayTitle}</span>
                                            <span className="text-xs text-muted-foreground/80">{displayDate}</span>
                                        </div>
                                    </a>
                                </Link>
                    <div className="flex-shrink-0 flex items-center ml-2 opacity-100">
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost" size="icon"
                                className={cn(
                                    'h-8 w-8 p-0 rounded-full border border-transparent transition',
                                    'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                                    'chat-history-delete-btn',
                                    isDeleting && chatToDelete?.id === chat.id ? 'opacity-50 cursor-not-allowed' : ''
                                )}
                                onClick={(e) => openDeleteConfirmation(chat, e)}
                                aria-label={`Eliminar chat: ${displayTitle}`}
                                disabled={isDeleting && chatToDelete?.id === chat.id}
                                tabIndex={0}
                            >
                                {isDeleting && chatToDelete?.id === chat.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                    </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <div className="flex flex-col h-full">
                {/* Header del historial */}
                <div className="flex justify-between items-center px-2 pt-1 pb-2 border-b shrink-0 mb-1 bg-background/80 backdrop-blur-sm">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                        Historial
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => fetchChatHistory(true)}
                        disabled={isLoading || isAuthLoading}
                        title="Actualizar historial"
                    >
                        <RefreshCw className={cn("h-4 w-4", (isLoading || isAuthLoading) && "animate-spin")} />
                        <span className="sr-only">Actualizar Historial</span>
                    </Button>
                </div>
                {/* ScrollArea para el contenido */}
                <ScrollArea className="flex-1 min-h-0 px-0 py-1">
                    <div className="flex flex-col gap-2 p-1">
                        {renderContent()}
                    </div>
                </ScrollArea>
            </div>

            {/* AlertDialog se mantiene igual */}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el chat
                        <span className="font-medium"> "{(chatToDelete?.title && chatToDelete?.title.toLowerCase().startsWith('chat:') ? chatToDelete?.title.replace(/^chat:\s*/i, '') : chatToDelete?.title) || chatToDelete?.id?.substring(0, 8)}"</span> y todos sus mensajes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirmed}
                        disabled={isDeleting}
                        className={buttonVariants({ variant: "destructive" })}
                    >
                        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Eliminar Permanentemente
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}