# Sortowanie przez wybieranie – wizualizacja

Prosta wizualizacja algorytmu sortowania przez wybieranie, przygotowana do pracy z uczniami szkoły podstawowej. Uczniowie są przedstawieni jako postacie o różnym wzroście, a kolejne kroki algorytmu są animowane i opisane po polsku.

## Jak uruchomić lokalnie
1. Otwórz plik `index.html` w przeglądarce (to strona startowa z linkami).
2. Wejdź w narzędzie „Sortowanie przez wybieranie”.
3. Użyj przycisków `Start`, `Pauza`, `Krok`, `Reset`.
4. Możesz wpisać własne wzrosty i kliknąć `Ustaw wzrosty`.

## Jak działa algorytm (w skrócie)
Sortowanie przez wybieranie polega na tym, że dla każdej pozycji `i`:
- szukamy najmniejszego elementu w pozostałej części tablicy,
- zamieniamy go z elementem na pozycji `i`,
- przechodzimy do następnej pozycji.

## Jak czytać kolory w wizualizacji
- Pomarańczowy: aktualna pozycja `i`
- Zielony: porównywany uczeń `j`
- Czerwony: najmniejszy znaleziony element
- Szary: część już posortowana

## Publikacja na GitHub Pages
1. Wejdź w repozytorium na GitHubie i otwórz `Settings` → `Pages`.
2. Wybierz `Deploy from a branch`.
3. Ustaw `Branch: main` oraz folder `/ (root)` i kliknij `Save`.
4. Po chwili strona będzie dostępna pod adresem:
   `https://TWOJ_LOGIN.github.io/informatyka`

## Pliki projektu
- `index.html` (strona startowa z linkami)
- `css/common.css` (wspólny styl)
- `css/home.css`
- `sortowanie-wybieranie/index.html`
- `sortowanie-wybieranie/sortowanie.css`
- `sortowanie-wybieranie/app.js`
- `sortowanie-babelkowe/index.html`
- `sortowanie-babelkowe/babelkowe.css`
- `sortowanie-babelkowe/app.js`
- `sortowanie-zliczanie/index.html`
- `sortowanie-zliczanie/zliczanie.css`
- `sortowanie-zliczanie/app.js`
- `wyszukiwanie-binarne/index.html`
- `wyszukiwanie-binarne/binarne.css`
- `wyszukiwanie-binarne/app.js`
