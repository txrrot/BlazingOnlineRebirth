# Naruto Blazing Rebirth — Complete Guide (Awwwards Edition) 🔥

Ghid interactiv modern, stil **Awwwards**, cu storytelling vizual, scroll cu inerție (**Lenis**), animații dinamice, multi-language switcher (EN, RO, FR, ES, KO), taburi interactive pentru iOS sideloading și hub avansat de diagnoză și depanare pentru **Naruto Blazing Rebirth / Blazing Online**.

---

## 🚀 Tehnologii folosite
- **Framework**: React 19 + TypeScript (`.tsx`)
- **Bundler & Dev Server**: Vite 8
- **Smooth Inertia Scroll**: Lenis Scroll Engine
- **Design System**: Obsidian Dark Mode, Neon Chakra Fiery Orange, Glassmorphism, Micro-animații, Layout adaptiv Mobile (iOS / Android) & Desktop
- **Internationalization (i18n)**: 5 limbi integrate complet (English, Română, Français, Español, 한국어)
- **CI/CD**: GitHub Actions automat pentru GitHub Pages (`.github/workflows/deploy.yml`)

---

## 📦 Backup Proiect Original
Pentru siguranță maximă, întregul proiect anterior (static vanilla HTML/CSS/JS) este salvat în:
1. Folderul local: [`backup-original/`](file:///c:/GITHUBPAGES/BlazingOnlineRebirth/backup-original) (`index.html`, `styles.css`, `script.js`, `README.md`)
2. Branch-ul Git dedicat: `backup-original` (`git checkout backup-original`)

---

## 💻 Rulare locală (Development)

Pentru a porni aplicația local în browser:

```bash
npm install
npm run dev
```

Aplicația va fi accesibilă la:
`http://localhost:5173/BlazingOnlineRebirth/`

Pentru a compila bundle-ul optimizat de producție:
```bash
npm run build
```

---

## 🌐 Deploy pe GitHub Pages

A fost configurat un workflow automat GitHub Actions în `.github/workflows/deploy.yml`.

### Pași pentru activare pe GitHub:
1. Mergi în repo-ul tău pe GitHub: **Settings → Pages**
2. La **Build and deployment → Source**, alege: **GitHub Actions**
3. La fiecare `git push` pe branch-ul `main`, GitHub va rula automat `npm run build` și va publica site-ul live la:
   `https://txrrot.github.io/BlazingOnlineRebirth/`

---

## ✨ Funcționalități noi implementate
1. **Hero Storytelling cu Key Visual Anime Banner**: Grafică de impact mare cu flăcări chakra neon, tipografie mare Space Grotesk și contoare statistice live (100% Free, 2 Moduri, 1000 Pearls, iOS 27 No-PC).
2. **Selector de Platforme**: Butoane rapide pentru filtrare ghid: *Android Mobile*, *iOS Sideload (No PC)*, *PC Emulators (Pie64)*.
3. **Navigare Rapidă de la o Secțiune la Alta**: Butoane inteligente la finalul fiecărei secțiuni (*Next: Offline Guide*, *Back to Online*, *Jump to Fixes*), plus Dock plutitor *Back to Top*.
4. **iOS Sideloading Tab Switcher**:
   - *Metoda 1 — Fără PC (iOS 27)* (SideInstaller + LocalDevVPN)
   - *Certificat activ cu buton de copiere 1-click* (`China-Telecom-...-p`)
   - *Pairing File (iOS 18–26)* (cu ghid pas cu pas pe PC)
   - *Metoda 2 — Cu PC (iloader)*
   - *Instalare joc în LiveContainer* (pentru bypass-ul limitei de 3 aplicații)
5. **Hub Diagnostic & Fixes în timp real**:
   - Căutare live după orice eroare (ex: *Play Protect*, *DNS*, *201*, *Pie64*, *Certificat*)
   - Filtrare pe categorii: *Online*, *Offline*, *iOS*, *Emulator*
   - Acordeon interactiv cu Pro Tips detaliate
6. **Matrice Comparativă Online vs Offline**: Tabel clar cu diferențele de stocare, bannere, multiplayer și conturi.
7. **Optimizare Mobile & Touch**: Butoane cu suprafață generoasă de atingere, drawer mobil pentru meniu și padding-uri safe-area pentru iOS.

---

**Proiect fan-made · Neoficial**  
Nu este afiliat cu Bandai Namco sau cu echipa oficială Blazing Online.  
Site creat & optimizat de [TXRROT](https://github.com/txrrot).
