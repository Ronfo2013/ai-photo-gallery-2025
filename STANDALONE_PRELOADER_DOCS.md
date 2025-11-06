# 🎨 Standalone Preloader Component

Un componente preloader completamente autonomo e riutilizzabile per qualsiasi sistema React/TypeScript.

## ✨ Caratteristiche

- 🎯 **Zero dipendenze esterne** - Tutto incluso nel componente
- 🎨 **4 stili predefiniti** - Glassmorphism, Modern, Minimal, Elegant
- 🌈 **Completamente personalizzabile** - Colori, animazioni, testi
- 📱 **Responsive** - Funziona su tutti i dispositivi
- ⚡ **Performante** - CSS animations ottimizzate
- 🔧 **TypeScript** - Tipizzazione completa
- 📦 **Plug & Play** - Copia e usa immediatamente

## 🚀 Installazione

### Metodo 1: Copia diretta
```bash
# Copia il file nel tuo progetto
cp StandalonePreloader.tsx your-project/components/
```

### Metodo 2: Download singolo
Scarica solo il file `StandalonePreloader.tsx` - è tutto ciò che serve!

## 📖 Utilizzo Base

```tsx
import StandalonePreloader from './components/StandalonePreloader';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Simula caricamento
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsLoading(false);
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <StandalonePreloader
        appName="La Mia App"
        progress={progress}
        customText="Caricamento in corso..."
      />
    );
  }

  return <div>La tua app è caricata!</div>;
}
```

## 🎨 Stili Disponibili

### 1. Glassmorphism (Default)
```tsx
<StandalonePreloader
  appName="My App"
  style="glassmorphism"
  primaryColor="#14b8a6"
  secondaryColor="#8b5cf6"
/>
```
- Effetto vetro con blur
- Orbs fluttuanti animate
- Gradiente shimmer sul testo

### 2. Modern
```tsx
<StandalonePreloader
  appName="Modern App"
  style="modern"
  primaryColor="#3b82f6"
  backgroundColor="#1f2937"
/>
```
- Design pulito e minimalista
- Spinner circolare
- Gradiente di sfondo

### 3. Minimal
```tsx
<StandalonePreloader
  appName="Minimal"
  style="minimal"
  primaryColor="#ffffff"
  backgroundColor="#000000"
/>
```
- Tre dots pulsanti
- Design ultra-minimale
- Perfetto per app essenziali

### 4. Elegant
```tsx
<StandalonePreloader
  appName="Elegant App"
  style="elegant"
  primaryColor="#f59e0b"
  secondaryColor="#ef4444"
/>
```
- Spinner SVG animato
- Font serif elegante
- Animazioni fluide

## ⚙️ Props Complete

| Prop | Tipo | Default | Descrizione |
|------|------|---------|-------------|
| `appName` | `string` | **Required** | Nome dell'applicazione |
| `logoUrl` | `string \| null` | `null` | URL del logo (opzionale) |
| `progress` | `number` | `0` | Progresso 0-100 |
| `style` | `PreloaderStyle` | `'glassmorphism'` | Stile del preloader |
| `backgroundColor` | `string` | `'#0f172a'` | Colore di sfondo |
| `primaryColor` | `string` | `'#14b8a6'` | Colore primario |
| `secondaryColor` | `string` | `'#8b5cf6'` | Colore secondario |
| `showLogo` | `boolean` | `true` | Mostra il logo |
| `showProgress` | `boolean` | `true` | Mostra barra progresso |
| `customText` | `string` | `''` | Testo personalizzato |
| `animationSpeed` | `AnimationSpeed` | `'normal'` | Velocità animazioni |
| `onReady` | `() => void` | `undefined` | Callback quando pronto |
| `zIndex` | `number` | `100` | Z-index personalizzato |

## 🎯 Esempi Pratici

### Caricamento App con Progress
```tsx
function AppLoader() {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simula caricamento risorse
    const loadResources = async () => {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setProgress(i);
      }
      setIsReady(true);
    };
    loadResources();
  }, []);

  if (!isReady) {
    return (
      <StandalonePreloader
        appName="Photo Gallery"
        progress={progress}
        style="glassmorphism"
        customText="Caricamento galleria..."
        logoUrl="/logo.png"
      />
    );
  }

  return <MainApp />;
}
```

### Preloader per Route Loading
```tsx
function RoutePreloader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <StandalonePreloader
      appName="Navigazione"
      style="minimal"
      showProgress={false}
      showLogo={false}
      customText="Caricamento pagina..."
      animationSpeed="fast"
      zIndex={1000}
    />
  );
}
```

### Preloader per Upload File
```tsx
function FileUploadPreloader({ uploadProgress }: { uploadProgress: number }) {
  return (
    <StandalonePreloader
      appName="Upload"
      progress={uploadProgress}
      style="modern"
      primaryColor="#10b981"
      customText={`Caricamento file... ${uploadProgress}%`}
      showLogo={false}
    />
  );
}
```

## 🎨 Personalizzazione Avanzata

### Colori Personalizzati
```tsx
<StandalonePreloader
  appName="Brand App"
  primaryColor="#ff6b6b"      // Rosso brand
  secondaryColor="#4ecdc4"    // Teal brand
  backgroundColor="#2c3e50"   // Sfondo scuro
/>
```

### Animazioni Personalizzate
```tsx
<StandalonePreloader
  appName="Fast App"
  animationSpeed="fast"       // slow | normal | fast
  style="glassmorphism"
/>
```

### Logo Personalizzato
```tsx
<StandalonePreloader
  appName="My Company"
  logoUrl="https://mysite.com/logo.png"
  showLogo={true}
/>
```

## 🔧 Integrazione con Framework

### Next.js
```tsx
// pages/_app.tsx
import { useState, useEffect } from 'react';
import StandalonePreloader from '../components/StandalonePreloader';

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <StandalonePreloader appName="My Next.js App" />;
  }

  return <Component {...pageProps} />;
}
```

### Vite/React
```tsx
// main.tsx
import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import StandalonePreloader from './components/StandalonePreloader';
import App from './App';

function Root() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Simula inizializzazione app
    setTimeout(() => setIsAppReady(true), 1500);
  }, []);

  if (!isAppReady) {
    return <StandalonePreloader appName="Vite App" />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
```

### React Native (Web)
```tsx
import StandalonePreloader from './StandalonePreloader';

function AppContainer() {
  const [isReady, setIsReady] = useState(false);

  if (!isReady) {
    return (
      <StandalonePreloader
        appName="React Native Web"
        style="modern"
        onReady={() => setIsReady(true)}
      />
    );
  }

  return <NativeApp />;
}
```

## 🎭 Casi d'Uso

### 1. **App Loading**
- Caricamento iniziale dell'applicazione
- Inizializzazione servizi
- Precaricamento risorse

### 2. **Route Transitions**
- Navigazione tra pagine
- Lazy loading componenti
- Code splitting

### 3. **Data Loading**
- Fetch API data
- Database queries
- File processing

### 4. **File Operations**
- Upload files
- Download content
- Image processing

### 5. **Authentication**
- Login process
- Token validation
- User initialization

## 🎨 Temi Predefiniti

### Tema Dark
```tsx
const darkTheme = {
  backgroundColor: '#0f172a',
  primaryColor: '#14b8a6',
  secondaryColor: '#8b5cf6'
};
```

### Tema Light
```tsx
const lightTheme = {
  backgroundColor: '#f8fafc',
  primaryColor: '#0f766e',
  secondaryColor: '#7c3aed'
};
```

### Tema Brand
```tsx
const brandTheme = {
  backgroundColor: '#1a202c',
  primaryColor: '#ff6b6b',
  secondaryColor: '#4ecdc4'
};
```

## 🚀 Performance Tips

1. **Usa `zIndex` appropriato** per evitare conflitti
2. **Disabilita `showProgress`** se non necessario
3. **Scegli `animationSpeed: 'fast'`** per app veloci
4. **Usa `style: 'minimal'`** per performance massime
5. **Precarica il logo** per evitare flash

## 📱 Responsive Design

Il componente è completamente responsive e si adatta automaticamente a:
- 📱 Mobile (320px+)
- 📟 Tablet (768px+)  
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔧 Troubleshooting

### Problema: Preloader non si nasconde
```tsx
// ✅ Corretto
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // Assicurati di chiamare setIsLoading(false)
  loadData().then(() => setIsLoading(false));
}, []);

return isLoading ? <StandalonePreloader /> : <App />;
```

### Problema: Animazioni lag
```tsx
// ✅ Usa animazioni più veloci
<StandalonePreloader
  animationSpeed="fast"
  style="minimal" // Stile più leggero
/>
```

### Problema: Z-index conflicts
```tsx
// ✅ Imposta z-index alto
<StandalonePreloader
  zIndex={9999}
  // Altri props...
/>
```

## 📄 Licenza

MIT License - Libero per uso commerciale e personale.

## 🤝 Contributi

Il componente è estratto dal progetto AI Photo Gallery 2025.
Per miglioramenti o bug reports, contatta il team di sviluppo.

---

**🎉 Buon coding con il tuo nuovo preloader!**
