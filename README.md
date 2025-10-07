# Atenex Frontend

## 1. Overview

Este repositorio contiene la aplicación frontend para **Atenex**, una plataforma B2B SaaS que permite a los usuarios consultar las bases de conocimiento de su empresa utilizando lenguaje natural. Construida con Next.js (App Router), TypeScript, Tailwind CSS y shadcn/ui, proporciona una interfaz moderna, receptiva y fácil de usar para interactuar con los microservicios del backend de Atenex.

## 2. Core Features

*   **Autenticación:** Flujos seguros de Inicio de Sesión (Login) a través de Supabase.
*   **Chat Interface:** Permite a los usuarios hacer preguntas en lenguaje natural y recibir respuestas generadas por el pipeline RAG del backend.
    *   Historial de chats persistente.
    *   Posibilidad de iniciar nuevos chats y eliminar chats existentes.
*   **Visualización de Documentos Fuente:** Muestra los fragmentos de documentos relevantes recuperados por el backend y utilizados para generar respuestas, en un panel lateral redimensionable.
*   **Gestión de la Base de Conocimiento:**
    *   **Subida de Documentos:** Interfaz para subir nuevos documentos (PDF, DOCX, TXT, MD, HTML, XLS, XLSX) al Ingest Service. Admite arrastrar y soltar, y selección múltiple.
    *   **Seguimiento de Estado:** Visualiza el estado de procesamiento de los documentos subidos (En Cola, Procesando, Procesado, Error).
    *   **Acciones sobre Documentos:** Reintentar procesamiento, refrescar estado, eliminar documentos (individual y masivamente).
    *   **Estadísticas de Documentos**: Visualización de métricas sobre el total de documentos, chunks y estados.
*   **Panel de Administración:**
    *   **Estadísticas Generales:** Visualización de métricas de compañías y usuarios totales.
    *   **Gestión de Entidades:** Formularios para crear nuevas compañías y usuarios (asignándolos a compañías).
*   **Configuración de Usuario:** Permite a los usuarios ver y (simuladamente) actualizar su nombre de perfil. Muestra ID de empresa.
*   **Páginas Estáticas Informativas:**
    *   Landing Page (`/`) con descripción del producto, características y casos de uso.
    *   Acerca de (`/about`)
    *   Contacto (`/contact`) con formulario.
    *   Ayuda (`/help`)
    *   Política de Privacidad (`/privacy`)
    *   Términos de Servicio (`/terms`)
*   **Diseño Responsivo:** Se adapta a varios tamaños de pantalla (escritorio, tableta, móvil).
*   **Tematización:** Soporta múltiples temas (Automático/Sistema, Claro Profesional, Oscuro Elegante, Zinc) con selector de paleta.

## 3. Architecture

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#5EEAD4', 'lineColor': '#A1A1AA', 'textColor': '#E4E4E7', 'secondaryColor': '#3B82F6', 'tertiaryColor': '#EC4899'}}}%%
graph LR
    User[End User] --> Browser[Browser: Atenex Frontend (Next.js)]

    subgraph Vercel / Hosting Provider
        Browser
    end

    Browser -->|HTTPS API Calls| APIGateway[API Gateway]
    Browser -->|Auth Calls| SupabaseAuth[Supabase Auth]

    subgraph Backend Infrastructure (e.g., Kubernetes, Serverless)
        APIGateway -->|Route + Auth Inject| QueryService[Query Service]
        APIGateway -->|Route + Auth Inject| IngestService[Ingest Service]
        APIGateway -->|Route + Auth Inject| AdminService[(Future) Admin Service]

        QueryService --> Milvus[(Vector DB: Milvus)]
        QueryService --> LLM_API[LLM API (e.g., Gemini, OpenAI)]
        QueryService --> EmbeddingAPI[Embedding API (e.g., OpenAI)]
        QueryService --> SupabaseLogs[(Supabase: Logs)]

        IngestService --> ObjectStorage[(Object Storage: MinIO)]
        IngestService --> Milvus
        IngestService --> SupabaseMeta[(Supabase: Metadata)]
        IngestService --> EmbeddingAPI

        AdminService --> SupabaseMeta
        AdminService --> SupabaseLogs
    end

    style Browser fill:#111827,stroke:#5EEAD4,stroke-width:2px,color:#E4E4E7
    style APIGateway fill:#374151,stroke:#9CA3AF,stroke-width:1px,color:#E4E4E7
    style SupabaseAuth fill:#3ECF8E,stroke:#249C6C,stroke-width:1px,color:#E4E4E7
    style QueryService fill:#1F2937,stroke:#6B7280,stroke-width:1px,color:#E4E4E7
    style IngestService fill:#1F2937,stroke:#6B7280,stroke-width:1px,color:#E4E4E7
    style AdminService fill:#1F2937,stroke:#6B7280,stroke-width:1px,color:#E4E4E7
```

El frontend interactúa con:
1.  **Supabase Auth** para la autenticación de usuarios y gestión de sesiones (obtención de JWT).
2.  El **API Gateway**, que enruta las solicitudes autenticadas (con el token JWT) a los microservicios de backend apropiados (`Query Service`, `Ingest Service`, etc.).

Las cabeceras `X-User-ID` y `X-Company-ID` se envían a los servicios de backend para la autorización y el filtrado de datos a nivel de tenant/usuario.

## 4. Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (v15+ con App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (personalizados)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **State Management:**
    *   Autenticación: Hook `useAuth` personalizado interactuando con Supabase.
    *   Estado local de componentes (`useState`, `useEffect`).
    *   Hooks personalizados para datos (`useDocumentStatuses`, `useUploadDocument`).
*   **Forms:** [React Hook Form](https://react-hook-form.com/) con [Zod](https://zod.dev/) para validación.
*   **API Client:** Funciones personalizadas en `lib/api.ts` usando `fetch`.
*   **Notifications:** [Sonner](https://sonner.emilkowal.ski/) (para toasts).
*   **Markdown Rendering:** [React Markdown](https://github.com/remarkjs/react-markdown) con `remark-gfm`.
*   **Theming:** [Next-Themes](https://github.com/pacocoursey/next-themes).
*   **File Uploads:** [React Dropzone](https://react-dropzone.js.org/).
*   **Resizable Panels:** [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels).
*   **3D Animations (Landing):** [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction), [Drei](https://github.com/pmndrs/drei), [Three.js](https://threejs.org/).
*   **Linting/Formatting:** ESLint, Prettier (Configuración recomendada).

## 5. Project Structure

```
atenex-frontend/
├── app/                      # Next.js App Router Directory
│   ├── (app)/                # Grupo de Rutas Autenticadas Principales
│   │   ├── admin/            # Rutas del Panel de Administración
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── [[...chatId]]/ # Ruta dinámica para chats existentes o nuevos
│   │   │       └── page.tsx  # Interfaz principal de Chat
│   │   ├── knowledge/
│   │   │   └── page.tsx      # Gestión de la Base de Conocimiento
│   │   ├── layout.tsx        # Layout para Rutas Autenticadas (Sidebar, Header)
│   │   └── settings/
│   │       └── page.tsx      # Configuración de Usuario
│   ├── (auth)/               # Grupo de Rutas de Autenticación
│   │   ├── layout.tsx        # Layout para Rutas de Autenticación
│   │   └── login/
│   │       └── page.tsx      # Página de Inicio de Sesión
│   ├── about/page.tsx        # Página "Acerca de Nosotros"
│   ├── contact/page.tsx      # Página de "Contacto"
│   ├── help/page.tsx         # Página de "Ayuda"
│   ├── privacy/page.tsx      # Página de "Política de Privacidad"
│   ├── terms/page.tsx        # Página de "Términos de Servicio"
│   ├── globals.css           # Estilos Globales y Variables de Tema Tailwind
│   ├── layout.tsx            # Layout Raíz (proveedores de tema y autenticación)
│   └── page.tsx              # Landing Page Pública
├── components/               # Componentes Reutilizables de UI
│   ├── admin/                # Componentes específicos del panel de admin
│   │   ├── AdminManagement.tsx
│   │   └── AdminStats.tsx
│   ├── animations/           # Componentes de animación (ej. Three.js)
│   │   └── snakeanimation.tsx
│   ├── auth/                 # Componentes de autenticación
│   │   └── login-form.tsx
│   ├── chat/                 # Componentes de la interfaz de chat
│   │   ├── chat-history.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-message.tsx
│   │   └── retrieved-documents-panel.tsx
│   ├── icons/                # Iconos SVG personalizados
│   │   └── atenex-logo.tsx
│   ├── knowledge/            # Componentes de gestión de conocimiento
│   │   ├── document-status-list.tsx
│   │   └── file-uploader.tsx
│   ├── layout/               # Componentes de layout (Sidebars, Headers)
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── theme-palette-button.tsx # Botón para cambiar tema
│   ├── theme-provider.tsx    # Proveedor de Tema (next-themes)
│   └── ui/                   # Componentes shadcn/ui (instalados vía CLI)
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── sonner.tsx        # Toasts/Notifications
│       ├── table.tsx
│       ├── textarea.tsx
│       └── tooltip.tsx
├── lib/                      # Funciones de utilidad, cliente API, Hooks, Constantes
│   ├── api.ts                # Cliente API y definiciones de tipos para backend
│   ├── auth/
│   │   └── helpers.ts        # Tipos/interfaces para autenticación
│   ├── constants.ts          # Constantes de la aplicación (APP_NAME, etc.)
│   ├── hooks/                # Hooks de React personalizados
│   │   ├── useAuth.tsx       # Hook de autenticación (integra Supabase)
│   │   ├── useDocumentStatuses.ts # Hook para estados de documentos
│   │   └── useUploadDocument.ts   # Hook para subida de documentos
│   └── utils.ts              # Funciones de utilidad generales (cn, getApiGatewayUrl)
├── public/                   # Assets Estáticos
│   └── icons/                # (Actualmente vacío, para favicons, etc.)
├── .env.local                # Variables de entorno locales (NO SUBIR A GIT)
├── .gitignore                # Archivos/Carpetas a ignorar por Git
├── components.json           # Configuración de shadcn/ui
├── next-env.d.ts             # Definiciones de tipos para Next.js
├── next.config.mjs           # Configuración de Next.js
├── package.json              # Dependencias y scripts del proyecto
├── postcss.config.js         # Configuración de PostCSS (para Tailwind)
├── tailwind.config.js        # Configuración de Tailwind CSS
├── tsconfig.json             # Configuración de TypeScript
└── README.md                 # Este archivo
```

## 6. Getting Started

### Prerequisites

*   Node.js (v18 o LTS más reciente recomendada)
*   npm, yarn, o pnpm (pnpm es usado en este proyecto, ver `package.json`)

### Installation

1.  **Clona el repositorio:**
    ```bash
    git clone <repository-url>
    cd atenex-frontend
    ```
2.  **Instala dependencias:**
    ```bash
    pnpm install
    # o si prefieres npm:
    # npm install
    # o si prefieres yarn:
    # yarn install
    ```
3.  **Configura las Variables de Entorno:**
    *   Crea un archivo `.env.local` en la raíz del proyecto. Puedes copiar `.env.local.example` si existe, o crearlo desde cero.
    *   Define las siguientes variables:
        ```dotenv
        # URL base de tu API Gateway (expuesto con ngrok o similar si es local)
        NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:8080 # O la URL de tu gateway desplegado

        # Credenciales de Supabase (requeridas para el cliente JS de Supabase)
        NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto-id>.supabase.co
        NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-supabase-anon-key>

        # Opcional: Para saltar la verificación de autenticación durante el desarrollo
        # Establecer a 'true' para bypass, cualquier otro valor o ausente para requerir autenticación.
        NEXT_PUBLIC_BYPASS_AUTH=false
        ```
    *   **Importante:** Reemplaza los placeholders con tus propias URLs y claves.

4.  **Inicializa shadcn/ui (si no está ya configurado):**
    *   Si es la primera vez o necesitas reconfigurar, ejecuta:
        ```bash
        npx shadcn-ui@latest init
        ```
    *   Sigue las instrucciones. Esto creará/actualizará `components.json` y potencialmente `globals.css` y `tailwind.config.js`. La configuración base ya está en el proyecto.

5.  **Añade los componentes shadcn/ui necesarios (si alguno falta):**
    *   El proyecto ya debería tener los componentes necesarios en `components/ui`. Si alguno faltase o quisieras añadir uno nuevo, usa:
        ```bash
        npx shadcn-ui@latest add <nombre-componente>
        ```
    *   Los componentes actualmente utilizados son: `alert-dialog`, `alert`, `avatar`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `progress`, `resizable`, `scroll-area`, `select`, `separator`, `skeleton`, `sonner`, `table`, `textarea`, `tooltip`.

### Running Locally

```bash
pnpm dev
# o
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) (o el puerto especificado) en tu navegador.

## 7. Key Implementation Details

*   **Autenticación:**
    *   Gestionada mediante el hook `useAuth` (`lib/hooks/useAuth.tsx`), que interactúa directamente con **Supabase** para el inicio de sesión, manejo de usuarios y tokens JWT.
    *   El token JWT obtenido de Supabase se almacena en `localStorage` (manejado por el cliente de Supabase) y se incluye en las cabeceras `Authorization: Bearer <token>` de las solicitudes a la API protegida.
    *   El objeto `user` en el contexto de autenticación contiene `userId`, `email`, `name`, `companyId`, `roles` (si aplica), y un flag `isAdmin` (determinado en el frontend comparando el email con una constante `ADMIN_EMAIL`).
*   **Cliente API:**
    *   `lib/api.ts` proporciona una función `request` genérica y funciones específicas para interactuar con el API Gateway.
    *   Maneja la inclusión automática del token de autenticación y cabeceras personalizadas como `X-User-ID` y `X-Company-ID` para la autorización a nivel de tenant.
    *   Incluye mapeo de respuestas y manejo de errores (`ApiError`).
*   **Enrutamiento:**
    *   Utiliza el **App Router** de Next.js.
    *   Organizado con grupos de rutas:
        *   `(app)` para rutas autenticadas de la aplicación principal (e.g., `/chat`, `/knowledge`, `/settings`, `/admin`).
        *   `(auth)` para rutas de autenticación (e.g., `/login`).
        *   Páginas públicas a nivel raíz (`/`, `/about`, `/contact`, `/help`, `/privacy`, `/terms`).
*   **Layout y Estilos:**
    *   `app/layout.tsx` es el layout raíz, configurando proveedores globales como `ThemeProvider` (para `next-themes`) y `AuthProvider`.
    *   `app/(app)/layout.tsx` define la estructura principal para usuarios autenticados, incluyendo `Sidebar` (colapsable y redimensionable) y `Header`.
    *   `app/(auth)/layout.tsx` provee un layout simple para las páginas de autenticación.
    *   `app/(app)/admin/layout.tsx` (`AdminLayout`) es específico para el panel de administración, con su propia `AdminSidebar`.
    *   Los estilos se definen con **Tailwind CSS v4** y componentes de **shadcn/ui**.
    *   `app/globals.css` contiene variables CSS para múltiples temas (Claro Profesional, Oscuro Elegante, Zinc) y la configuración base de Tailwind, incluyendo el plugin `@tailwindcss/typography` para el renderizado de Markdown.
    *   `components/theme-palette-button.tsx` permite al usuario cambiar entre los temas definidos.
*   **Manejo de Estado:**
    *   El estado de autenticación global es manejado por el hook `useAuth`.
    *   Hooks personalizados como `useDocumentStatuses` y `useUploadDocument` encapsulan la lógica de obtención y manipulación de datos relacionados con documentos, incluyendo estados de carga y errores.
    *   El estado local de los componentes se maneja con `useState` y `useEffect`.
*   **Notificaciones y Errores:**
    *   Las notificaciones al usuario (toasts) se gestionan con `sonner`.
    *   Los errores de API se capturan y se presentan usando `ApiError` y componentes `Alert` de shadcn/ui.
*   **Funcionalidades Destacadas:**
    *   **Chat Interactivo (`app/(app)/chat/[[...chatId]]/page.tsx`):**
        *   Soporte para chats nuevos y existentes (mediante ID de chat en la URL).
        *   Carga y guardado (simulado con `localStorage` en `ChatInterface`, backend real en `ChatPage`) del historial de mensajes.
        *   Panel lateral redimensionable (`ResizablePanelGroup`) para mostrar documentos fuente (`RetrievedDocumentsPanel`).
        *   Envío de mensajes con `ChatInput` y visualización con `ChatMessage` (soporta Markdown).
    *   **Gestión de Conocimiento (`app/(app)/knowledge/page.tsx`):**
        *   Subida de múltiples archivos con `FileUploader` (usando `react-dropzone`), con validación de tipo y tamaño.
        *   Listado de documentos (`DocumentStatusList`) con paginación "cargar más", mostrando estado, nombre, chunks y fecha.
        *   Acciones por documento: reintentar, refrescar estado, eliminar (con confirmación), y placeholder para descarga.
        *   Acciones masivas (selección múltiple): reintentar, actualizar, eliminar.
        *   Visualización de estadísticas de documentos (total, por estado, etc.) obtenidas del backend.
    *   **Panel de Administración (`app/(app)/admin/page.tsx`):**
        *   Navegación por pestañas (`?view=stats` o `?view=management`).
        *   `AdminStats`: Muestra estadísticas generales de la plataforma (total compañías, usuarios por compañía).
        *   `AdminManagement`: Formularios para crear nuevas compañías y usuarios (la creación real en backend está pendiente).

## 8. Environment Variables

El archivo `.env.local` (que **NO** debe ser subido a Git) se utiliza para configurar variables de entorno. Las principales son:

*   `NEXT_PUBLIC_API_GATEWAY_URL`: URL base del API Gateway que centraliza las llamadas a los microservicios de backend.
*   `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima (pública) de tu proyecto Supabase.
*   `NEXT_PUBLIC_BYPASS_AUTH` (opcional): Si se establece a `true`, se salta la verificación de autenticación para facilitar el desarrollo de ciertas vistas. **Nunca usar en producción.**

## 9. TODO / Future Enhancements

*   **Autenticación:**
    *   **Seguridad de Tokens:** Para producción, cambiar el almacenamiento de tokens JWT de `localStorage` a cookies HttpOnly para mayor seguridad.
    *   **Roles y Permisos:** Implementar un sistema de roles y permisos más granular si las necesidades de la aplicación lo requieren (actualmente `isAdmin` es un booleano simple).
*   **Funcionalidades:**
    *   **Descarga de Documentos:** Completar la funcionalidad de descarga de documentos originales en `RetrievedDocumentsPanel` y `DocumentStatusList`.
    *   **Gestión de Usuarios/Compañías (Admin):** Integrar completamente los endpoints de backend para la creación y gestión de usuarios y compañías en `AdminManagement.tsx`.
    *   **Visualización de Documentos:** Actualmente, el panel de fuentes muestra fragmentos. Considerar una vista más completa o un modal para visualizar el documento completo si es necesario.
    *   **Configuración de Perfil:** Implementar la actualización real del perfil de usuario (nombre, etc.) en el backend.
*   **Gestión de Estado y Datos:**
    *   Considerar el uso de una librería de gestión de estado del servidor como **React Query** o **SWR** para optimizar la obtención de datos, caching, y revalidación automática, especialmente para listas y datos que cambian con frecuencia (ej. estado de documentos, historial de chats).
*   **UX/UI:**
    *   **Animación de Landing Page:** Evaluar y refinar la animación `snakeanimation.tsx` o considerar alternativas para un impacto visual óptimo y rendimiento.
    *   **Accesibilidad (a11y):** Realizar una auditoría completa de accesibilidad y aplicar mejoras (atributos ARIA, navegación por teclado, contraste, etc.).
*   **Calidad y Mantenimiento:**
    *   **Pruebas:** Añadir pruebas unitarias y de integración exhaustivas para componentes críticos y flujos de usuario.
    *   **Documentación Legal:** Completar el contenido de las páginas de "Política de Privacidad" y "Términos de Servicio" con información específica y legalmente válida.
*   **Despliegue y Operaciones:**
    *   **Favicon:** Añadir un favicon y otros meta iconos en la carpeta `public/icons/`.
    *   Configurar CI/CD para automatizar pruebas y despliegues.

```

He realizado los siguientes cambios clave en el README para reflejar el estado actual de tu código:

1.  **Overview y Core Features:** Actualizado para incluir el panel de administración, las páginas estáticas y las funcionalidades detalladas del chat y la gestión de conocimiento.
2.  **Architecture:** Modificado el diagrama y la descripción para reflejar la autenticación directa con Supabase desde el frontend y la estructura de microservicios.
3.  **Tech Stack:** Actualizado con las nuevas dependencias (`sonner`, `react-markdown`, `react-resizable-panels`, `next-themes`, `react-dropzone`, `@react-three/fiber`, etc.) y la descripción de la gestión de estado.
4.  **Project Structure:** Completamente regenerado para coincidir con la estructura de archivos proporcionada.
5.  **Getting Started:**
    *   Actualizadas las variables de entorno (`.env.local`) para mostrar las de Supabase y eliminar `JWT_SECRET` del frontend.
    *   Ajustada la lista de componentes de `shadcn/ui` basada en los archivos presentes en `components/ui/`.
6.  **Key Implementation Details:**
    *   **Autenticación:** Detallado el uso del hook `useAuth` y la interacción con Supabase.
    *   **API Client:** Resaltado el uso de cabeceras `X-User-ID` y `X-Company-ID`.
    *   **Routing:** Descritos los grupos de rutas y las nuevas páginas públicas.
    *   **Styling:** Mencionados los temas de `globals.css`.
    *   **Funcionalidades Específicas:** Descripción detallada de Chat, Knowledge Base y Admin Panel.
7.  **Environment Variables:** Sección añadida para clarificar las variables necesarias.
8.  **TODO / Future Enhancements:** Revisado y actualizado para reflejar tareas pendientes y posibles mejoras basadas en el código actual.
