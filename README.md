# Naruto Blazing Rebirth — Ghid Complet (RO)

Ghid modern, stil Awwwards, pentru instalarea și troubleshooting-ul **Naruto Blazing Rebirth / Blazing Online**.

## Preview local

Deschide `index.html` în browser sau rulează un server local:

```bash
npx serve .
# sau
python -m http.server 8000
```

## Deploy pe GitHub Pages

1. Creează un repo nou pe GitHub (ex: `blazing-rebirth-guide`)
2. Uploadă toate fișierele din acest folder
3. Mergi la **Settings → Pages**
4. Source: **Deploy from a branch** → `main` / `root`
5. Salvează. În câteva minute ai link-ul:  
   `https://USERNAME.github.io/blazing-rebirth-guide`

## Structură

```
├── index.html      # Pagina principală
├── styles.css      # Design dark + animații
├── script.js       # Reveal on scroll + accordion
└── README.md
```

## Customizare

- Culori: modifică variabilele CSS din `:root` (`--accent`, `--bg` etc.)
- Text: editează direct în `index.html`
- Adaugă secțiuni noi după modelul existent

---

**Proiect fan-made · Neoficial**  
Nu este afiliat cu Bandai Namco sau cu echipa oficială Blazing Online.
