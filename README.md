# Solarsystem

Interaktive 3D‑Darstellung des Sonnensystems im Browser. Drei‑JS rendert Sonne, Planeten und ausgewählte Monde in Echtzeit. Ein schlankes HUD erlaubt es, die Simulation zu steuern und die Kamera auf einzelne Himmelskörper zu richten.

---

## Funktionsumfang

* Acht Planeten, Sonne und 14 Monde mit hochauflösenden Texturen
* Frei drehbare Kamera mit sanfter Dämpfung
* Sternenfeld als Instanced Mesh für hohe Bildraten
* Schieberegler für Simulationsgeschwindigkeit
* Button **Flieg mich dahin** für automatische Kameraflüge
* Dropdown zum schnellen Wechsel des Zielobjekts
* Zwei Betriebsarten: **Demo Mode** (vergrößerte Planeten und Bahnneigungen) und **Real Mode** (echter Maßstab, präzise Ephemeriden)

## Online‑Demo

*Link folgt nach Veröffentlichung.*

---

## Schnellstart

```bash
# Repository klonen
git clone https://github.com/MarcusSchwarze/solarsystem.git
cd solarsystem

# Beliebigen HTTP‑Server starten (Beispiel)
npx serve .
```

Der Start per Doppelklick auf `index.html` funktioniert nicht, weil ES‑Module über `file://` nicht geladen werden.

### Systemvoraussetzungen

* Aktueller Chromium‑ oder Firefox‑Browser mit WebGL 2
* Desktop‑GPU mit mindestens 256 MB Speicher

---

## Betriebsarten

| Modus         | Eigenschaften                                                                                                  | Zielgruppe                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Demo Mode** | Größen‑ und Neigungsskalierung, vereinfachte Kepler‑Solver                                                     | Schnelle Übersicht, Präsentationen |
| **Real Mode** | Maßstab 1:1, zeitabhängige Bahn­elemente (VSOP87/DE440), echte Rotationsraten, inverse Quadratgesetz für Licht | Fachunterricht, Recherche          |

Der Modus lässt sich über den Schalter **Realismus** im HUD umstellen. Standard ist **Demo Mode**.

---

## Physikalische Genauigkeit

### 1. Bahnmechanik

* Ephemeriden basieren auf **VSOP87** (Planeten) und **JPL DE440** (Monde).
* Die numerische Lösung der Kepler‑Gleichung erfolgt per Newton‑Iteration mit Zeitschritt ∆t = 1 Tag.
* Bezugssystem: J2000‑Ekliptik mit Bary­zentrums‑Ursprung.
* Zeitbasis: Dynamische Zeit (TDB), intern als Julianisches Datum.

### 2. Skalierung

| Größe           | Demo Mode | Real Mode |
| --------------- | --------- | --------- |
| Planetenradius  | ×3        | ×1        |
| Bahnneigung     | ×10       | ×1        |
| Lichtintensität | Fix       | 1 ⁄ r²    |

### 3. Rotationen

* Eigendrehperioden aus IAU‑Konventionen (2021).
* Axialkippung (Obliquity) beim Rendern berücksichtigt.
* Präzession und Nutation werden derzeit nicht modelliert.

### 4. Limitierungen

* Keine gravitative Wechselwirkung zwischen Körpern (n‑Body).
* Atmosphären‑ und Wolken­simulationen fehlen.
* Entfernungen >100 AU werden nicht dargestellt.

---

## Bedienung

| Aktion               | Steuerung                   |
| -------------------- | --------------------------- |
| Szene drehen         | Linke Maustaste ziehen      |
| Kamera zoomen        | Mausrad                     |
| Zeitraffer ändern    | Geschwindigkeits‑Slider     |
| Realismus umschalten | Checkbox **Realismus**      |
| Ziel wählen          | Dropdown oben rechts        |
| Automatischer Flug   | Button **Flieg mich dahin** |
| Follow‑Modus beenden | **Esc**                     |

---

## Konfiguration und Erweiterung

* **Konstanten** befinden sich in `src/config.js`.
* **Ephemeriden** werden aus vor‑berechneten JSON‑Tabellen unter `data/ephem/` geladen.
* Neue Himmelskörper in `src/planets.js` ergänzen (Radius, Masse, Texturen).
* Texturen im Verzeichnis `public/textures/` ablegen, vorzugsweise WebP.

---

## Entwicklungsleitfaden

```bash
npm install      # Setup für Linting & Tools
npm run dev      # Vite‑Dev‑Server mit Hot Reload
echo             # (Optionale) weitere Kommandos
npm run build    # Minifizierter Production‑Build
npm run lint     # eslint --fix
```

* ESLint‑Konfiguration in `.eslintrc`.
* Prettier und EditorConfig sorgen für einheitliches Format.
* GitHub Actions prüft Lint‑ und Build‑Schritte.

---

## Roadmap

1. **Atmosphären**: Rayleigh‑ und Mie‑Streuung für Erde, Venus und Titan.
2. **n‑Body‑Option**: vereinfachter symplektischer Integrator für Planetenresonanzen.
3. **GPU‑Instancing für Monde** zur Reduktion der Drawcalls.
4. **Accessibility**: Tastaturnavigation, ARIA‑Labels, mehrsprachige Oberfläche.
5. **Progressive Web App** (PWA) mit Offline‑Fallback.

---

## Lizenz

Apache License 2.0 – siehe `LICENSE`.

## Danksagung

Projekt basiert auf **[Three‑JS](https://threejs.org)**. Ephemeriden‑Daten stammen von **IMCCE** (VSOP87) und **NASA JPL** (DE‑Serie). Ein Dank geht an alle Mitwirkenden, Testerinnen und Tester für Feedback und Beiträge.
