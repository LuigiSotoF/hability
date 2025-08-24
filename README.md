# 🏠 Hability - Plataforma de Evaluación y Compra de Inmuebles

Hability es una plataforma inteligente que automatiza la evaluación y compra de inmuebles en Colombia a través de WhatsApp, utilizando IA para analizar videos, documentos y datos de propiedades.

## 🚀 Características

- **Chatbot de WhatsApp** para interacción con usuarios
- **Análisis de videos** de propiedades usando IA
- **Investigación profunda** de zonas y mercados inmobiliarios
- **Evaluación automática** de propiedades
- **Dashboard administrativo** para gestión de datos
- **Integración con Supabase** para base de datos
- **API de OpenAI** para procesamiento de lenguaje natural

## 📋 Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Cuenta de Supabase
- API Key de OpenAI
- Acceso a servicios de WhatsApp Business API

## 🛠️ Instalación

1. **Clona el repositorio**
```bash
git clone <tu-repositorio>
cd hability
```

2. **Instala las dependencias**
```bash
npm install
# o
yarn install
# o
pnpm install
# o
bun install
```

3. **Configura las variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI Configuration
OPENAI_API_KEY=
```

**⚠️ Importante**: Estas variables son obligatorias para el funcionamiento del proyecto.

## 🔧 Configuración de Variables de Entorno

### Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. En Settings > API, copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI
1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una nueva API key
3. Copia la key → `OPENAI_API_KEY`

### Variables Requeridas

El proyecto requiere **3 variables de entorno obligatorias**:

1. **NEXT_PUBLIC_SUPABASE_URL** - URL de tu proyecto Supabase
2. **SUPABASE_SERVICE_ROLE_KEY** - Clave de servicio de Supabase  
3. **OPENAI_API_KEY** - Clave de API de OpenAI

Sin estas variables configuradas, el proyecto no funcionará correctamente.

## 🗄️ Configuración de Base de Datos

El proyecto utiliza Supabase. Asegúrate de tener las siguientes tablas configuradas:

- `users` - Información de usuarios
- `chats` - Historial de conversaciones
- `houses` - Datos de propiedades
- `offerts` - Ofertas realizadas

## 🚀 Ejecución

### Desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
# o
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Producción
```bash
npm run build
npm start
```

## 📱 Webhooks

El sistema utiliza webhooks para procesar:

- **Mensajes de WhatsApp**: `/api/webhook/messages-upsert`
- **Resultados de análisis de video**: `/api/webhook/video-upload-result`
- **Resultados de investigación profunda**: `/api/webhook/deep-research-result`

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/              # API Routes
│   └── dashboard/        # Dashboard pages
├── components/           # React Components
├── lib/                 # Utilities & Services
│   ├── interceptors/    # HTTP Interceptors
│   ├── providers/       # Service Providers
│   ├── services/        # Business Logic
│   └── types/          # TypeScript Types
```

## 🔒 Seguridad

- Las variables de entorno sensibles están en `.gitignore`
- Usa `SUPABASE_SERVICE_ROLE_KEY` solo en el servidor
- Valida todas las entradas de webhook
- Implementa rate limiting en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Verifica que todas las variables de entorno estén configuradas
2. Asegúrate de que los servicios externos estén funcionando
3. Revisa los logs del servidor para errores específicos
4. Consulta la documentación de las APIs externas

## 🔄 Actualizaciones

Para mantener el proyecto actualizado:

```bash
npm update
# o
yarn upgrade
```

---

**Nota**: Este proyecto está en desarrollo activo. Algunas características pueden cambiar sin previo aviso.
