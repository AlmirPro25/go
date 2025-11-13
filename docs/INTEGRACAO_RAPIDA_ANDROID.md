# ⚡ Integração Rápida - Agente Android

## 🎯 3 Passos para Ativar

### 1️⃣ Adicionar Estado ao Store

**Arquivo:** `store/useAppStore.ts`

```typescript
// Adicionar ao interface AppState
interface AppState {
  // ... estados existentes ...
  
  // 🤖 Android Export
  isAndroidExportModalOpen: boolean;
  
  // ... outros estados ...
}

// Adicionar ao estado inicial
const initialState = {
  // ... estados existentes ...
  
  // 🤖 Android Export
  isAndroidExportModalOpen: false,
  
  // ... outros estados ...
};

// Adicionar ações
export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // ... ações existentes ...
    
    // 🤖 Android Export Actions
    openAndroidExportModal: () => {
      set({ isAndroidExportModalOpen: true });
    },
    
    closeAndroidExportModal: () => {
      set({ isAndroidExportModalOpen: false });
    },
    
    // ... outras ações ...
  }))
);
```

### 2️⃣ Adicionar Botão ao CommandBar

**Arquivo:** `components/CommandBar.tsx`

```typescript
// Importar no topo
import { useAppStore } from '@/store/useAppStore';

// Dentro do componente
const { openAndroidExportModal } = useAppStore();

// Adicionar botão na toolbar (ao lado de Export, Deploy, etc.)
<button
  onClick={openAndroidExportModal}
  disabled={!htmlCode || htmlCode === initialHtmlBase}
  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
  title="Exportar como App Android"
>
  <span className="text-lg">📱</span>
  <span className="hidden md:inline">Android</span>
</button>
```

### 3️⃣ Adicionar Modal ao App.tsx

**Arquivo:** `App.tsx`

```typescript
// Importar no topo
import { AndroidExportModal } from '@/components/AndroidExportModal';

// Extrair do store (junto com outros estados)
const {
  // ... estados existentes ...
  isAndroidExportModalOpen,
  closeAndroidExportModal,
  htmlCode,
  // ... outros estados ...
} = useAppStore();

// Adicionar modal no final do JSX (junto com outros modais)
return (
  <>
    {/* ... componentes existentes ... */}
    
    {/* 🤖 Android Export Modal */}
    <AndroidExportModal
      isOpen={isAndroidExportModalOpen}
      onClose={closeAndroidExportModal}
      htmlContent={htmlCode}
    />
    
    {/* ... outros modais ... */}
  </>
);
```

## ✅ Pronto!

Agora você tem:
- ✅ Botão "📱 Android" no CommandBar
- ✅ Modal de configuração funcionando
- ✅ Geração de projeto Android completo
- ✅ Download automático do ZIP

## 🧪 Testar

1. Gere um HTML no editor
2. Clique no botão "📱 Android"
3. Configure o app
4. Clique em "Gerar Projeto Android"
5. Aguarde o download do ZIP
6. Extraia e abra no Android Studio
7. Compile: `./gradlew assembleDebug`
8. Instale: `adb install app-debug.apk`

## 🎨 Personalizar Botão

### Estilo Alternativo 1 (Ícone Maior):
```typescript
<button
  onClick={openAndroidExportModal}
  className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
  title="Exportar como App Android"
>
  <span className="text-2xl">🤖</span>
</button>
```

### Estilo Alternativo 2 (Com Badge):
```typescript
<button
  onClick={openAndroidExportModal}
  className="relative px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
>
  <span className="text-lg">📱</span>
  <span>Android</span>
  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
    NEW
  </span>
</button>
```

### Estilo Alternativo 3 (Dropdown):
```typescript
<div className="relative group">
  <button className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">
    <span className="text-lg">📱</span>
    <span>Exportar</span>
  </button>
  <div className="absolute hidden group-hover:block top-full mt-1 bg-slate-800 rounded-lg shadow-xl p-2 min-w-[200px]">
    <button
      onClick={openAndroidExportModal}
      className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2"
    >
      <span>🤖</span>
      <span>App Android</span>
    </button>
    <button className="w-full text-left px-3 py-2 hover:bg-slate-700 rounded flex items-center gap-2">
      <span>🍎</span>
      <span>App iOS (em breve)</span>
    </button>
  </div>
</div>
```

## 🔧 Configuração Avançada

### Valores Padrão Personalizados:

**Arquivo:** `components/AndroidExportModal.tsx`

```typescript
// Modificar estado inicial
const [config, setConfig] = useState<AndroidAppConfig>({
  appName: 'Meu App Incrível',           // ← Seu nome padrão
  packageName: 'com.suaempresa.app',     // ← Seu package padrão
  versionName: '1.0.0',
  versionCode: 1,
  minSdk: 24,
  targetSdk: 34,
  htmlContent: '',
  enableJavaScript: true,
  enableGeolocation: true,                // ← Ativar GPS por padrão
  enableCamera: false,
  orientation: 'portrait',                // ← Forçar retrato
  fullscreen: true                        // ← Fullscreen por padrão
});
```

### Auto-preencher Nome do App:

```typescript
// Detectar título do HTML
useEffect(() => {
  if (htmlContent) {
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      setConfig(prev => ({
        ...prev,
        appName: titleMatch[1]
      }));
    }
  }
}, [htmlContent]);
```

## 📊 Métricas e Analytics

### Adicionar Tracking:

```typescript
const handleGenerate = async () => {
  // Analytics
  console.log('📊 Android Export iniciado', {
    appName: config.appName,
    packageName: config.packageName,
    permissions: {
      gps: config.enableGeolocation,
      camera: config.enableCamera
    }
  });
  
  setIsGenerating(true);
  
  try {
    // ... geração ...
    
    console.log('✅ Android Export concluído');
  } catch (error) {
    console.error('❌ Android Export falhou', error);
  }
};
```

## 🎯 Atalhos de Teclado

### Adicionar Hotkey:

```typescript
// No App.tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl+Shift+A = Abrir Android Export
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      openAndroidExportModal();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [openAndroidExportModal]);
```

## 🚀 Pronto para Usar!

Agora você tem um sistema completo de exportação Android integrado ao AI Web Weaver!

**Transforme HTML em APK em 3 cliques!** 🎉
