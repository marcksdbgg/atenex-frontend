// File: components/chat/retrieved-documents-panel.tsx
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, Info, Star, Download, Loader2, Eye, X } from 'lucide-react';
import { RetrievedDoc } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from '@/lib/utils';


export interface RetrievedDocumentsPanelProps {
  documents: RetrievedDoc[];
  isLoading: boolean;
  highlightCitaTag?: string;
}


// Permite exponer scroll y highlight a través de ref
export const RetrievedDocumentsPanel = forwardRef<any, RetrievedDocumentsPanelProps>(
  function RetrievedDocumentsPanel({ documents, isLoading, highlightCitaTag }, ref) {
    const [selectedDoc, setSelectedDoc] = useState<RetrievedDoc | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // refs para scroll y highlight
    const fragmentRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const [highlighted, setHighlighted] = useState<string | null>(null);

    // Permite scroll y highlight externo
    useImperativeHandle(ref, () => ({
        scrollToCitaTag: (citaTag: string) => {
            const key = citaTag.replace(/\[|\]/g, '');
            const el = fragmentRefs.current[key];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlighted(key);
                setTimeout(() => setHighlighted(null), 1800);
            }
        }
    }));

    // Si highlightCitaTag cambia desde props, hacer scroll y highlight
    useEffect(() => {
        if (highlightCitaTag) {
            const key = highlightCitaTag.replace(/\[|\]/g, '');
            const el = fragmentRefs.current[key];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setHighlighted(key);
                setTimeout(() => setHighlighted(null), 1800);
            }
        }
    }, [highlightCitaTag]);

    const handleViewDocument = (doc: RetrievedDoc) => {
        setSelectedDoc(doc);
        setIsDialogOpen(true);
    };

    const handleDownloadDocument = (doc: RetrievedDoc) => {
        const message = `Descarga solicitada para: ${doc.file_name || doc.id}`;
        console.log(message);
        toast.info("Descarga No Implementada", {
             description: `El endpoint de backend para descargar '${doc.file_name || doc.id}' aún no está disponible.`,
             action: { label: "Cerrar", onClick: () => {} },
        });
    };

    // Agrupar por document_id y preparar metadatos para mejor UX
    // Agrupar por document_id y mostrar correctamente los fragmentos y metadatos
    const groupedDocs = React.useMemo(() => {
        const groups: Record<string, {
            file_name: string|null,
            document_id: string|null,
            fragments: RetrievedDoc[],
        }> = {};
        for (const doc of documents) {
            const docId = doc.document_id || 'sin_id';
            if (!groups[docId]) {
                groups[docId] = {
                    file_name: doc.file_name || doc.metadata?.file_name || null,
                    document_id: doc.document_id || null,
                    fragments: [],
                };
            }
            groups[docId].fragments.push(doc);
        }
        return groups;
    }, [documents]);

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <div className="flex h-full flex-col bg-background">
                <div className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 flex flex-col gap-0.5 shadow-sm">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-base text-foreground">Fuentes Relevantes</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Documentos utilizados para generar la respuesta.</span>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                    <div className="p-3 space-y-3">
                        {isLoading && documents.length === 0 && (
                            <div className='space-y-2'>
                                {[...Array(3)].map((_, i) => (
                                    <Card key={`skel-${i}`} className="p-3 border border-border/50 bg-card opacity-70">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <Skeleton className="h-4 w-3/4 rounded" />
                                            <Skeleton className="h-3 w-8 rounded-sm" />
                                        </div>
                                        <Skeleton className="h-3 w-full rounded" />
                                        <Skeleton className="h-3 w-1/2 rounded mt-1" />
                                        <div className="flex justify-between items-center mt-2">
                                            <Skeleton className="h-2.5 w-16 rounded" />
                                            <Skeleton className="h-3 w-3 rounded" />
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {!isLoading && documents.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 px-4 min-h-[200px]">
                                <Info className="h-8 w-8 mb-3 opacity-50" />
                                <p className="text-sm font-medium mb-1">Sin Fuentes</p>
                                <p className="text-xs">No se encontraron fuentes específicas para la última consulta.</p>
                            </div>
                        )}
                        {Object.entries(groupedDocs).map(([docId, group], groupIdx) => (
                            <div key={docId} className="mb-4">
                                <div className="font-semibold text-base text-foreground flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-primary" />
                                    {group.file_name || group.document_id || 'Documento sin nombre'}
                                </div>
                                <div className="space-y-2 ml-6">
                                    {group.fragments.map((frag, fragIdx) => {
                                        const citaKey = frag.cita_tag ? frag.cita_tag.replace(/\[|\]/g, '') : `${groupIdx + 1}.${fragIdx + 1}`;
                                        // Extraer solo el número de la cita_tag para el círculo
                                        let num = `${fragIdx + 1}`;
                                        if (frag.cita_tag) {
                                          const match = frag.cita_tag.match(/\d+/);
                                          if (match) num = match[0];
                                        }
                                        return (
                                            <DialogTrigger asChild key={frag.id || `frag-${fragIdx}`}> 
                                                <Card
                                                    ref={el => { fragmentRefs.current[citaKey] = el; }}
                                                    className={cn(
                                                        "cursor-pointer transition-all duration-150 bg-card/95 hover:bg-accent/10",
                                                        "border border-border/70 hover:border-primary/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/40",
                                                        highlighted === citaKey && "ring-2 ring-primary/70 border-primary/80 animate-fade-in"
                                                    )}
                                                    onClick={() => handleViewDocument(frag)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleViewDocument(frag)}
                                                    tabIndex={0}
                                                    title={`Ver detalles de: ${frag.file_name || frag.cita_tag || 'fragmento'}`}
                                                >
                                                    <CardContent className="p-0">
                                                        <div className="flex items-center gap-2 px-3 pt-3">
                                                            <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center text-xs font-mono bg-muted text-muted-foreground rounded-full border border-border/60">
                                                                {num}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="block font-medium text-foreground/95 truncate text-sm" title={frag.file_name || frag.cita_tag || (frag.id && typeof frag.id === 'string' ? `Fragmento ${frag.id.substring(0, 8)}` : 'Fragmento')}>
                                                                    {frag.file_name || frag.cita_tag || (frag.id && typeof frag.id === 'string' ? `Fragmento ${frag.id.substring(0, 8)}` : 'Fragmento')}
                                                                </span>
                                                                <span className="block text-[11px] text-muted-foreground truncate">
                                                                    {frag.metadata?.title ? `Título: ${frag.metadata.title}` : frag.metadata?.page ? `Página: ${frag.metadata.page}` : ''}
                                                                </span>
                                                            </div>
                                                            <span className="ml-2 text-xs text-muted-foreground">Relevancia: <span className="font-semibold">{frag.score != null ? frag.score.toFixed(2) : 'N/D'}</span></span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed px-10 pb-2 pt-1">
                                                            {frag.content_preview || <span className="italic opacity-70">Vista previa no disponible.</span>}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </DialogTrigger>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {selectedDoc && (
                    <DialogContent className="sm:max-w-2xl lg:max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] max-h-[85vh] p-0 bg-background shadow-xl border border-border rounded-xl">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b">
                            <DialogTitle className="truncate text-lg flex items-center gap-2" title={selectedDoc.file_name || selectedDoc.cita_tag || selectedDoc.document_id || 'Detalles del Documento'}>
                                <FileText className="inline-block h-5 w-5 align-text-bottom text-primary" />
                                {selectedDoc.file_name || selectedDoc.cita_tag || selectedDoc.document_id || 'Detalles del Documento'}
                            </DialogTitle>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                                {/* Hide UUIDs unless in debug mode (add a debug flag if needed) */}
                                {/* <span>ID Doc: <span className="font-mono text-[11px]">{selectedDoc.document_id ? `${selectedDoc.document_id.substring(0,12)}...` : 'N/D'}</span></span> */}
                                {/* <span>ID Frag: <span className="font-mono text-[11px]">{selectedDoc.id}</span></span> */}
                                <span>Relevancia: <span className="font-medium">{selectedDoc.score?.toFixed(4) ?? 'N/D'}</span></span>
                                {selectedDoc.metadata?.page && <span>Página: <span className="font-mono text-[11px]">{selectedDoc.metadata.page}</span></span>}
                                {selectedDoc.metadata?.title && <span>Título: <span className="font-mono text-[11px]">{selectedDoc.metadata.title}</span></span>}
                            </div>
                        </DialogHeader>
                        <ScrollArea className="overflow-y-auto px-6 py-4 max-h-[calc(85vh-180px)]">
                            <div className="space-y-4 text-sm">
                                <div>
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contenido Relevante (Vista Previa Completa):</Label>
                                    <blockquote className="mt-1 border-l-4 pl-4 text-sm text-foreground/80 max-h-[300px] overflow-y-auto pretty-scrollbar whitespace-pre-wrap break-words">
                                        {selectedDoc.content || selectedDoc.content_preview || <span className="italic opacity-70">Contenido no disponible.</span>}
                                    </blockquote>
                                </div>
                                {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 && (
                                    <div>
                                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metadatos:</Label>
                                        <pre className="mt-1 max-h-[150px] w-full overflow-auto rounded-md border bg-muted/30 p-3 text-[11px] font-mono whitespace-pre-wrap break-all pretty-scrollbar">
                                            {JSON.stringify(selectedDoc.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <DialogFooter className="sm:justify-between px-6 py-4 border-t bg-muted/30">
                            <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(selectedDoc)} disabled={!selectedDoc.file_name || selectedDoc.file_name === "None"}>
                                <Download className="mr-2 h-4 w-4" />Descargar Original {(selectedDoc.file_name && selectedDoc.file_name !== "None") ? '' : '(N/D)'}
                            </Button>
                            <DialogClose asChild><Button variant="secondary" size="sm">Cerrar</Button></DialogClose>
                        </DialogFooter>
                    </DialogContent>
                )}
            </div>
            <style jsx global>{`
                .pretty-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .pretty-scrollbar::-webkit-scrollbar-track { background: hsl(var(--muted) / 0.3); border-radius: 3px; }
                .pretty-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 3px; }
                .pretty-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.7); }
            `}</style>
        </Dialog>
    );
});

// Helper Label component (si no existe globalmente)
const Label = ({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
    <label className={cn("block text-sm font-medium text-foreground", className)} {...props}>
        {children}
    </label>
);