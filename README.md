# Konfigurator Garażu

Interaktywny konfigurator garażu umożliwiający projektowanie i wizualizację przestrzeni garażowej w 3D.

## 🚗 Funkcje

- **Wizualizacja 3D**: Interaktywny widok garażu w czasie rzeczywistym
- **Kontrola wymiarów**: Możliwość dostosowania szerokości, długości i wysokości garażu
- **Widoki**: Przełączanie między widokiem ortograficznym a immersyjnym
- **Responsywny design**: Działanie na urządzeniach mobilnych i desktopowych
- **Eksport**: Możliwość eksportu projektu do PDF

## 🛠️ Technologie

- **React 18** - Biblioteka UI
- **TypeScript** - Typowanie statyczne
- **Vite** - Szybki bundler
- **Three.js** - Grafika 3D
- **Tailwind CSS** - Stylowanie
- **shadcn/ui** - Komponenty UI
- **React Router** - Routing
- **Electron** - Aplikacja desktopowa

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js (wersja 18 lub nowsza)
- npm lub yarn

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/lewrasta/KONFIGURATOR.git

# Przejście do katalogu projektu
cd KONFIGURATOR

# Instalacja zależności
npm install

# Uruchomienie w trybie deweloperskim
npm run dev
```

### Dostępne skrypty

```bash
# Uruchomienie serwera deweloperskiego
npm run dev

# Budowanie aplikacji
npm run build

# Podgląd zbudowanej aplikacji
npm run preview

# Uruchomienie aplikacji Electron
npm run electron:dev

# Budowanie aplikacji Electron
npm run electron:build

# Deploy na GitHub Pages
npm run deploy
```

## 📱 Użycie

1. **Otwórz aplikację** w przeglądarce lub jako aplikację desktopową
2. **Dostosuj wymiary** garażu za pomocą kontrolek
3. **Przełącz widoki** między ortograficznym a immersyjnym
4. **Eksportuj projekt** do PDF jeśli potrzebujesz

## 🌐 Demo

Aplikacja jest dostępna online pod adresem: [https://lewrasta.github.io/KONFIGURATOR/](https://lewrasta.github.io/KONFIGURATOR/)

## 📁 Struktura projektu

```
src/
├── components/          # Komponenty React
│   ├── GarageDesigner.tsx    # Główny komponent garażu
│   ├── DimensionControls.tsx # Kontrolki wymiarów
│   ├── ViewSelector.tsx      # Selektor widoków
│   └── ui/                   # Komponenty UI (shadcn/ui)
├── views/              # Komponenty widoków 3D
│   ├── OrthographicView.tsx  # Widok ortograficzny
│   └── ImmersiveView.tsx     # Widok immersyjny
├── hooks/              # Custom hooks
├── lib/                # Narzędzia i utilities
└── pages/              # Strony aplikacji
```

## 🤝 Współpraca

1. Fork repozytorium
2. Utwórz branch dla nowej funkcji (`git checkout -b feature/AmazingFeature`)
3. Commit zmiany (`git commit -m 'Add some AmazingFeature'`)
4. Push do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz Pull Request

## 📄 Licencja

Ten projekt jest dostępny na licencji MIT. Zobacz plik `LICENSE` dla szczegółów.

## 📞 Kontakt

Jeśli masz pytania lub sugestie, otwórz issue w tym repozytorium.

---

**Autor**: lewrasta  
**Wersja**: 1.0.0
