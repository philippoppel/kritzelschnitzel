# 🎨 Kritzelkomplott

Ein Gesellschaftsspiel für Mobile Safari - Finde den Schwindler beim Zeichnen!

## Spielregeln

- 3-8 Spieler teilen sich ein Gerät
- Alle außer einem Spieler (dem "Schwindler") erhalten das gleiche Wort
- Der Schwindler erfährt nur die Kategorie
- Jeder Spieler zeichnet einen Strich zum gemeinsamen Bild
- Danach stimmen alle ab, wer der Schwindler ist
- Wenn der Schwindler enttarnt wird, kann er noch gewinnen, indem er das Wort errät

## Projekt-Struktur

```
kritzelschnitzel/
├── public/
│   └── index.html          # HTML-Template
├── src/
│   ├── css/
│   │   └── styles.css      # Alle CSS-Styles
│   └── js/
│       ├── game.js         # Hauptspiel-Logik
│       ├── drawing.js      # Canvas/Zeichen-Funktionen
│       ├── voting.js       # Abstimmungssystem
│       └── app.js          # App-Initialisierung
├── assets/                 # Statische Assets
├── package.json           # Projektmetadaten
└── README.md              # Diese Datei
```

## Installation & Starten

### Einfach mit Python
```bash
npm run start
# oder
python3 -m http.server 3000 --directory .
```

### Mit Node.js
```bash
npm install
npm run dev
```

Das Spiel läuft dann auf http://localhost:3000

## Features

- ✅ Mobile Safari optimiert
- ✅ Touch-Steuerung für Zeichnen
- ✅ Modularer Code-Aufbau
- ✅ Funktionierendes Abstimmungssystem
- ✅ Responsive Design
- ✅ Offline spielbar

## Entwicklung

Das Spiel wurde von einer einzigen HTML-Datei in eine saubere Projektstruktur refactored:
- HTML, CSS und JavaScript sind getrennt
- Objektorientierte JavaScript-Architektur
- Modulares Design für einfache Erweiterung
- Verbessertes Abstimmungssystem

## Browser-Kompatibilität

Optimiert für:
- iOS Safari 12+
- Mobile Chrome
- Desktop-Browser (Chrome, Firefox, Safari, Edge)

## Lizenz

MIT License