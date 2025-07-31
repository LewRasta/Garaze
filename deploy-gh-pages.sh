#!/bin/bash
# Skrypt do wdrożenia aplikacji na GitHub Pages

# Budowanie aplikacji
npm run build

# Przejście do folderu z buildem
cd dist

# Inicjalizacja repozytorium git w dist
git init
git remote add origin https://github.com/LewRasta/BAMBERSTAL.git
git checkout -b gh-pages

# Dodanie i commit plików
git add .
git commit -m "Deploy to GitHub Pages"

# Wypchnięcie na gałąź gh-pages
git push --force origin gh-pages

# Powrót do katalogu głównego
cd ..

echo "Wdrożenie zakończone. Strona powinna być dostępna pod https://LewRasta.github.io/BAMBERSTAL/"
