LazyCarbs Frontend
!

Dieses Repository enthält das React Frontend für den LazyCarbs Bolus-Rechner, entwickelt mit Vite und Tailwind CSS. Es bietet die Benutzeroberfläche zur Eingabe von Mahlzeit- und persönlichen Daten und kommuniziert mit dem separaten Java Spring Boot Backend, um Insulin-Bolus-Berechnungen durchzuführen.

Inhaltsverzeichnis
Über das Projekt

Technologien

Installation

Nutzung

Kommunikation mit dem Backend

Beitrag

Lizenz

Kontakt

Über das Projekt
Das LazyCarbs Frontend ist die interaktive Web-Oberfläche für eine Anwendung, die Diabetikern hilft, ihren Insulin-Bolus präziser zu berechnen. Es sendet Benutzerdaten an ein Java Spring Boot Backend, das die komplexe Berechnungslogik enthält, und zeigt die Ergebnisse übersichtlich an.

Technologien
React: Eine JavaScript-Bibliothek zum Erstellen von Benutzeroberflächen.

Vite: Ein schneller Build-Tool, der für moderne Webprojekte optimiert ist.

TypeScript: Eine typisierte Obermenge von JavaScript, die die Entwicklung robusterer Anwendungen ermöglicht.

Tailwind CSS: Ein Utility-First-CSS-Framework für schnelles und responsives Styling.

Installation
Um das Frontend lokal auszuführen, stelle sicher, dass du Node.js und npm (oder Yarn) installiert hast.

Repository klonen:

git clone https://github.com/luzenkoaleks/LazyCarbs-frontend.git
cd LazyCarbs-frontend

Abhängigkeiten installieren:

npm install # oder yarn install

Nutzung
Um das Frontend zu nutzen, musst du sicherstellen, dass das zugehörige Java Spring Boot Backend läuft (standardmäßig auf http://localhost:8080).

Frontend starten:

npm run dev # oder yarn dev

Das Frontend wird im Entwicklungsmodus gestartet und ist normalerweise unter http://localhost:5173 erreichbar.

Webanwendung im Browser:
Öffne deinen Webbrowser und navigiere zu der im Terminal angezeigten Adresse (z.B. http://localhost:5173).

Kommunikation mit dem Backend
Das Frontend sendet POST-Anfragen an den /api/calculate-Endpunkt des Backends (standardmäßig http://localhost:8080/api/calculate). Stelle sicher, dass das Backend läuft und für Cross-Origin Resource Sharing (CORS) aus dem Frontend-Ursprung (http://localhost:5173) konfiguriert ist.

Beitrag
Beiträge sind willkommen! Wenn du Ideen für Verbesserungen oder neue Funktionen hast, öffne bitte ein Issue oder erstelle einen Pull Request.

Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert. Weitere Details findest du in der LICENSE-Datei.

Kontakt
Alexander Luzenko / luzenkoaleks