<div align="center">
  <h1>🎭 Avalon Digital: The Resistance</h1>
  <p><strong>Una adaptación digital de alta fidelidad del juego de deducción social The Resistance: Avalon</strong></p>
</div>

## 📖 Descripción

Avalon Digital es una versión digital completa del popular juego de mesa "The Resistance: Avalon". Incluye mecánicas de pase-y-juega, revelación de roles, y un Heraldo impulsado por IA para narración dramática.

### ✨ Características

- 🎮 Modo multijugador local (pass-and-play)
- 🤖 Narración AI con Google Gemini
- 🌐 Modo online con Supabase
- 🎨 Diseño moderno y responsive
- 🌍 Soporte multiidioma
- 📱 Optimizado para móviles (iOS y Android)

## 🚀 Instalación Local

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn

### Pasos

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/albertabera/avelon.git
   cd avelon
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   
   Copia `.env.example` a `.env.local` y completa los valores:
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus claves API:
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
   - `GEMINI_API_KEY`: Tu API key de Google Gemini
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe (opcional)
   - `VITE_REVENUECAT_API_KEY`: API key de RevenueCat (opcional)

4. **Ejecuta el proyecto en desarrollo:**
   ```bash
   npm run dev
   ```

   La app estará disponible en `http://localhost:5173`

## 📱 Builds Móviles

Este proyecto usa **Expo** para generar builds iOS y Android.

### Build para iOS (App Store)

1. **Instala EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Inicia sesión en Expo:**
   ```bash
   eas login
   ```

3. **Configura el proyecto:**
   ```bash
   eas build:configure
   ```

4. **Crea build de iOS:**
   ```bash
   eas build --platform ios
   ```

5. **Sube a App Store:**
   ```bash
   eas submit --platform ios
   ```

### Build para Android (Google Play)

```bash
eas build --platform android
eas submit --platform android
```

## 🛠️ Tecnologías

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Mobile:** Expo (anteriormente Capacitor)
- **Backend:** Supabase
- **AI:** Google Gemini
- **Pagos:** Stripe + RevenueCat
- **Styling:** CSS vanilla

## 📂 Estructura del Proyecto

```
avalon-digital/
├── components/         # Componentes React
├── contexts/          # Contextos de React
├── services/          # Servicios (API, Stripe, etc.)
├── public/            # Assets públicos
├── types.ts           # Definiciones TypeScript
├── i18n.ts            # Traducciones
├── app.json           # Configuración Expo
└── eas.json           # Configuración EAS Build
```

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build de producción
npm run preview          # Preview del build

# Expo
eas build --platform ios     # Build iOS
eas build --platform android # Build Android
eas submit                   # Submit a stores
```

## 📄 Licencia

Este proyecto es privado.

## 👨‍💻 Autor

Alberto Tabera - [@albertabera](https://github.com/albertabera)

---

<div align="center">
  <p>Hecho con ❤️ para la comunidad de jugadores de Avalon</p>
</div>
