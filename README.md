# MAREE LAB — Simulator de energie mareomotrică

Site educațional în limba română, inspirat de instalația Oosterschelde din Țările de Jos. Include turbine animate, reglaje, grafice, experimente și export CSV. Modelul și sursele sunt explicate în site. Rezultatele sunt simulări, nu măsurători ale centralei.

## Publicare pe GitHub Pages de pe telefon

1. Dezarhivează ZIP-ul folosind aplicația de fișiere a telefonului.
2. Deschide https://github.com în browser. Dacă nu vezi comenzile necesare, activează „Site pentru desktop” din meniul browserului.
3. Creează un repository public numit `maree-lab`. Pentru GitHub Free, folosește un repository public pentru Pages.
4. Încarcă fișierele din folderul extras în rădăcina repository-ului, folosind „Add file” → „Upload files” sau legătura „uploading an existing file” dintr-un repository gol. Selectează fișierele și salvează prin „Commit changes”.
5. Verifică să vezi `index.html`, `style.css`, `model.js` și `app.js` direct în repository. Nu încărca doar ZIP-ul și nu pune aceste fișiere într-un subfolder `maree-lab`.
6. Intră în „Settings” → „Pages”. La „Source”, selectează „Deploy from a branch”. Alege ramura care conține fișierele (de obicei `main`), folderul `/(root)` și apasă „Save”.
7. Așteaptă publicarea. Poate dura până la 10 minute. În „Settings” → „Pages”, deschide „Visit site”. Linkul va avea forma `https://NUMELE-TAU.github.io/maree-lab/` dacă ai folosit acest nume pentru repository.

Site-ul publicat pe GitHub Pages poate fi deschis de colegi și profesori fără contul tău ChatGPT.

## Fișiere

- `index.html` — pagina și explicațiile.
- `style.css` — aspectul și adaptarea pentru telefon.
- `model.js` — formulele de simulare.
- `app.js` — interacțiunile, animațiile și exportul datelor.
- `README.md` — aceste instrucțiuni.

Nu sunt necesare Node.js, npm, server, chei API sau comenzi de build. Cele patru fișiere ale aplicației trebuie păstrate în același folder. Legăturile relative funcționează și într-un repository GitHub Pages cu subcale.

## Documentație GitHub

- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Instrucțiuni verificate la 16 octombrie 2026.
