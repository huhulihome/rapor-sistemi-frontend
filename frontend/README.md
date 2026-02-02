# Modern Office System - Frontend

React + TypeScript + Vite ile geliştirilmiş modern ofis yönetim sistemi frontend uygulaması.

## Teknolojiler

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching & caching
- **Supabase** - Backend & Authentication

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Environment variables dosyasını oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasını Supabase bilgilerinizle güncelleyin:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

## Geliştirme

Development server'ı başlatın:
```bash
npm run dev
```

Uygulama http://localhost:5173 adresinde çalışacaktır.

## Build

Production build oluşturun:
```bash
npm run build
```

## Proje Yapısı

```
src/
├── components/       # React componentleri
│   ├── common/      # Ortak componentler
│   ├── tasks/       # Görev yönetimi componentleri
│   ├── issues/      # Sorun yönetimi componentleri
│   └── dashboard/   # Dashboard componentleri
├── pages/           # Sayfa componentleri
├── hooks/           # Custom React hooks
├── services/        # API servisleri
├── types/           # TypeScript type tanımları
├── providers/       # Context providers
└── main.tsx         # Uygulama giriş noktası
```

## Özellikler

- ✅ Modern React 19 + TypeScript
- ✅ Tailwind CSS ile responsive tasarım
- ✅ React Query ile veri yönetimi
- ✅ Supabase entegrasyonu
- ✅ Type-safe development
- ✅ Path aliases (@/ imports)
- ✅ ESLint konfigürasyonu
