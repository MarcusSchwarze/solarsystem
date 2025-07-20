# Solarsystem

Interaktive 3D‑Darstellung des Sonnensystems im Browser. Drei‑JS rendert Sonne, Planeten und ausgewählte Monde in Echtzeit. Ein schlankes HUD erlaubt es, die Simulation zu steuern und die Kamera auf einzelne Himmelskörper zu richten.

## Funktionsumfang

* Acht Planeten, Sonne und 14 Monde mit Texturen in hoher Auflösung
* Frei drehbare Kamera mit sanfter Dämpfung
* Sternenfeld als Instanced Mesh für hohe Bildraten
* Schieberegler für Simulationsgeschwindigkeit
* Button „Flieg mich dahin“ für automatische Kameraflüge
* Dropdown zum schnellen Wechsel des Zielobjekts
* Kompakte Oberfläche ohne Build‑Schritt – direkt im Browser lauffähig

## Online‑Demo

*Link folgt nach Veröffentlichung.*

## Schnellstart

1. Repository klonen

   ```bash
   git clone https://github.com/MarcusSchwarze/solarsystem.git
   cd solarsystem
   ```
2. Beliebigen HTTP‑Server starten, zum Beispiel

   ```bash
   npx serve .
   ```

   oder die VS Code‑Erweiterung **Live Server** verwenden.
3. `http://localhost:3000` im Browser öffnen.

> Öffnen des `index.html` per Doppelklick reicht nicht, weil Module über `file://` nicht geladen werden.

### Systemvoraussetzungen

* Aktueller Chromium‑ oder Firefox‑Browser mit WebGL 2
* Desktop‑GPU mit mindestens 256 MB Speicher

## Bedienung

| Aktion               | Steuerung                 |
| -------------------- | ------------------------- |
| Szene drehen         | Linke Maustaste ziehen    |
| Kamera zoomen        | Mausrad                   |
| Zeitraffer ändern    | Geschwindigkeits‑Slider   |
| Ziel wählen          | Dropdown oben rechts      |
| Automatischer Flug   | Button „Flieg mich dahin“ |
| Follow‑Modus beenden | **Esc**                   |

## Konfiguration und Erweiterung

* Neue Himmelskörper in `planets.js` ergänzen.
* Größen‑ und Neigungsskalierung über Konstanten `SIZE_SCALE` und `INC_SCALE` in `utils.js` anpassen.
* Texturen unter `textures/planets/` im JPG‑ oder WebP‑Format ablegen.

## Entwicklungsleitfaden

```bash
npm install   # optional, nur für Linting
npm run lint  # eslint --fix
```

* ESLint‑Konfiguration befindet sich in `.eslintrc`.
* Empfohlene Tools: Prettier, EditorConfig, GitHub Actions für Continuous Integration.

## Roadmap

* Realistischer Maßstab (optionaler „Real Mode“)
* Zeitabhängige Bahn­elemente (VSOP87 oder JPL DE)
* Tooltip mit physikalischen Kenndaten
* Mobile‑Optimierung (Progressive LOD)

## Lizenz

Apache License 2.0 – siehe `LICENSE`.

## Danksagung

Projekt baut auf **[Three‑JS](https://threejs.org)** auf. Dank an alle Mitwirkenden, Testerinnen und Tester für Feedback und Beiträge.
