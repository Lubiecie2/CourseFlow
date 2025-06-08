# Table

- [Table](#table)
  - [O projekcie](#o-projekcie)
  - [Wymagania wstępne](#wymagania-wstępne)
  - [Instalacja zależności](#instalacja-zależności)
  - [Uruchamianie aplikacji](#uruchamianie-aplikacji)
    - [Uruchamianie w trybie deweloperskim](#uruchamianie-w-trybie-deweloperskim)
    - [Uruchamianie w trybie produkcyjnym](#uruchamianie-w-trybie-produkcyjnym)
    - [Uruchamianie z Docker Compose](#uruchamianie-z-docker-compose)
  - [Struktura projektu](#struktura-projektu)
  - [Powiązane projekty](#powiązane-projekty)

## O projekcie

CourseFlow to platforma edukacyjna online, zaprojektowana do tworzenia, zarządzania i korzystania z interaktywnych kursów. Aplikacja składa się z dwóch głównych części: frontendu opartego na Vue.js/Nuxt.js oraz backendu wykorzystującego Node.js z Express.

System umożliwia zarządzanie kursami, testami, certyfikatami, notatkami oraz interakcjami między użytkownikami, oferując bogate doświadczenie edukacyjne dla uczniów.

## Wymagania wstępne

- Zainstalowany [Node.js](https://nodejs.org/) (v16+)
- Zainstalowany [npm](https://www.npmjs.com/)
- Zainstalowany [Docker](https://www.docker.com/) (opcjonalnie, do uruchomienia w kontenerze)
- Działający backend [CourseFlow Backend](https://github.com/Lubiecie2/CourseFlow_Back)

## Instalacja zależności

Aby zainstalować wszystkie wymagane zależności, uruchom poniższe polecenia:

```bash
npm install
```

## Uruchamianie aplikacji

### Uruchamianie w trybie deweloperskim

Aby uruchomić aplikację w trybie deweloperskim, użyj poniższego polecenia:

```bash
npm run dev
```

### Uruchamianie w trybie produkcyjnym

Aby uruchomić aplikację w trybie produkcyjnym, użyj poniższego polecenia:

```bash
npm run build
```

### Uruchamianie z Docker Compose

Projekt zawiera konfigurację Docker Compose, która pozwala na łatwe uruchomienie całego środowiska:

```bash
docker-compose up --build
```

## Struktura projektu

```
.
CourseFlow/                          # Frontend aplikacji (Nuxt/Vue)
├── .nuxt/                           # Katalog kompilacji Nuxt.js
├── .output/                         # Wygenerowane pliki produkcyjne
├── .vscode/                         # Konfiguracja VSCode
├── assets/                          # Zasoby statyczne (CSS, obrazy)
├── components/                      # Komponenty Vue.js
│   └── Node/                        # Komponenty dla różnych treści
├── composables/                     # Współdzielona logika
├── i18n/                            # Pliki lokalizacji i tłumaczeń
├── layouts/                         # Układy stron (layouts)
├── middleware/                      # Middleware Nuxt
├── node_modules/                    # Moduły
├── pages/                           # Strony aplikacji
│   ├── community/                   # Sekcja społecznościowa
│   │   ├── notes/                   # Podstrony notatek
│   │   └── questions/               # Podstrony pytań i odpowiedzi
│   ├── course/                      # Sekcja kursów
│   │   └── [id]/                    # Szczegóły kursu (dynamiczne ID)
│   │       ├── chapter/             # Podstrony rozdziałów
│   │       │   └── [chapterId]/     # Szczegóły rozdziału
│   │       └── test/                # Podstrony testów
│   ├── editCourse/                  # Sekcja edycji kursów
│   │   └── [id]/                    # Edycja kursu (dynamiczne ID)
│   │       ├── editChapter/         # Edycja rozdziałów
│   │       └── editTests/           # Edycja testów
│   ├── joinCourse/                  # Przypisanie kursu użytkownika
│   ├── options/                     # Partycjonowanie danych
│   ├── profile/                     # Sekcja profilu użytkownika
│   └── users/                       # Zarządzanie użytkownikami
├── plugins/                         # Wtyczki Nuxt.js
├── public/                          # Pliki publiczne
│   └── images/                      # Obrazy publiczne
├── server/                          # Kod serwerowy Nuxt.js
├── stores/                          # Zarządzanie stanem (Pinia)
├── .dockerignore                    # Pliki ignorowane przez Docker
├── .env                             # Zmienne środowiskowe
├── .gitignore                       # Pliki ignorowane przez Git
├── .npmrc                           # Konfiguracja npm
├── app.vue                          # Główny komponent aplikacji
├── Dockerfile                       # Konfiguracja Docker
├── nuxt.config.ts                   # Konfiguracja Nuxt.js
├── package.json                     # Zależności i skrypty npm
├── README.md                        # Dokumentacja projektu
├── tailwind.config.js               # Konfiguracja Tailwind CSS
└── tsconfig.json                    # Konfiguracja TypeScript
```

## Powiązane projekty

- [CourseFlow Backend](https://github.com/Lubiecie2/CourseFlow_Back) - Repozytorium backendu aplikacji CourseFlow zawierające API, logikę biznesową oraz połączenie z bazą danych
