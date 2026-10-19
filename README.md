# MapQuizzzes (MapQuizzzes-nl)

**MapQuizzzes** is een flexibel, webgebaseerd framework voor het maken van interactieve, op GPS gebaseerde outdoor puzzeltochten voor de smartphone. Het draait volledig in de browser van de gebruiker, is installeerbaar als Progressive Web App (PWA) en vereist geen registratie of aanmelding voor de gebruiker.


**English version:** **[https://github.com/ahrenstk/MapQuizzzes](https://github.com/ahrenstk/MapQuizzzes)**

**German version:** **[https://github.com/ahrenstk/MapQuizzzes-de](https://github.com/ahrenstk/MapQuizzzes-de)**


---

## 🚀 Live-demo

Je kunt de live-demo **[Bourtange-Quiz](https://ahrens.tk/MapQuizzzes-nl)** bekijken. Stel je voor dat je de **[Vesting Bourtange](https://www.bourtange.nl)** bezoekt en het daar ter plaatse speelt. Je kunt ook de **[Münster-Quiz](https://ahrens.tk/muensterquiz-nl)** bekijken en, mocht je eens in het mooie Münster zijn, de quizvragen daar ter plekke beantwoorden.

---

## 🛠️ Voor wie is MapQuizzzes de perfecte oplossing?

**MapQuizzzes** slaat de brug tussen ontdekkingsdrang en digitale interactie. Het is het ideale hulpmiddel voor iedereen die mensen op een speelse manier in beweging wil krijgen, wil enthousiasmeren en kennis direct op locatie wil laten beleven. 

### 🌟 Perfect geschikt voor:
* **Toerisme- & stadsmarketingexperts:** Verander klassieke rondleidingen in boeiende, interactieve ontdekkingstochten en trek bezoekers op een speelse manier in de ban van jouw regio.
* **Ervaringspedagogen & scholen:** Ontwerp moderne, op GPS gebaseerde speurtochten en interactieve leerpaden in de frisse lucht.
* **Evenementenbureaus & teambuilding-aanbieders:** Creëer op maat gemaakte outdoor rally's voor bedrijfsevenementen, verenigingsuitjes of privéfeesten.
* **Creatieve geesten & avonturiers:** Maak heel eenvoudig je eigen, persoonlijke puzzeltocht voor vrienden en familie.

---

### 💡 Jouw weg naar een eigen outdoorquiz

Het beste als eerste: **MapQuizzzes is volledig gratis!** Jouw weg naar een eigen MapQuizzz is heel eenvoudig:

1. **Bliksemsnelle installatie:** Pak de software simpelweg uit in een map op je webserver – en de technische basis staat al.
2. **Creatieve vormgeving:** Het leukste deel is aan jou – het tot leven wekken van je tour! Jij bepaalt de locaties, de puzzelvragen en de beloningen. 
3. **Direct starten:** Om direct te zien wat er mogelijk is, wordt MapQuizzzes geleverd met een **volwaardige demotour**. Deze toont je direct alle vier de flexibele tour-modi in actie en dient als het perfecte, gemakkelijk te begrijpen sjabloon voor je eigen meesterwerk.


---

## ✨ Features

- **Pure browser-applicatie:** Alle logica draait in de browser. Er vindt geen gegevensopslag aan de serverzijde plaats.
- **PWA-Ready:** Kan net als een native app worden toegevoegd aan het startscherm van Android- en iOS-apparaten.
- **Geen aanmelding:** Gebruikers kunnen direct en zonder account aan de slag.
- **Interactieve kaarten:** MapQuizzzes maakt met Leaflet gebruik van het kaartmateriaal van OpenStreetMap en Esri.
- **GPS-navigatie:** Toont de eigen locatie en biedt een navigatiefunctie naar de puzzellocaties via Google Maps.
- **Flexibele tour-modi:**
    - **Stap voor stap:** Ontgrendelt de volgende puzzel pas na het oplossen van de vorige.
    - **Hele kaart:** Alle puzzels zijn vanaf het begin zichtbaar incl. GPX-track.
    - **Hemelsbreed (Lijn):** "Vergelijkbaar met stap voor stap" maar dan met een rechte lijn (hemelsbreed) zonder GPX-track.
    - **Freestyle:** Vergelijkbaar met "Hele kaart" maar zonder GPX-track.
- **Veelzijdige puzzels:**
    - Multiplechoice-vragen of open vragen (telkens 3 seconden antwoordtijd).
    - Tips maar ook vragen kunnen optioneel worden gebruikt.
    - Voor elke locatie wordt een afbeelding gebruikt.
    - Optioneel kunnen bij elke locatie extra modale vensters worden geopend en links naar externe websites worden gebruikt.
- **Aanpasbaar & uitbreidbaar:** Alle tours, puzzels en teksten worden geconfigureerd via eenvoudige `JSON`-bestanden.
- **Meertaligheid:** Het ontwerp is vanaf de basis meertalig en kan eenvoudig worden uitgebreid met andere talen.
- **Open Source:** Uitgebracht onder de MIT-licentie.

---

## 🛠️ Technische structuur

1. `/index.php`: Hoofdprogramma, dat onder andere de hoofdconfiguratie (`MapQuizzzes.json`) laadt
2. `/MapQuizzzes.json`: Hoofdconfiguratie voor taal, startpagina en tourselectie (submappen elk inclusief `quizdata.json`)
3. `/Tourname/quizdata.json`: Configuratievebestand voor een individuele tour met JSON-objecten voor elke locatie met afbeeldingsnaam, coördinaten, vragen, tips, antwoorden, enz.)
4. `js/MapQuizzzes.js` en `css/MapQuizzzes.css`: JavaScript en CSS van MapQuizzzes


---

## 🚀 Eigen quiztour maken

MapQuizzzes is **geen** kant-en-klaar bouwpakketsysteem voor het maken van interactieve quizzen. Maar met een beetje oefening is het niet moeilijk om je eigen puzzeltochten te maken:

1. **Submappen verwijderen of hernoemen:**
   - in de demo: Vesting (Stap voor stap), Vesting (Hele kaart), Vesting (Hemelsbreed), Vesting (Freestyle)

2. **Nieuwe submappen voor elke tour aanmaken of hernoemen:**
   - bijv. `Mijn eerste tour`, `Mijn tweede tour` 

3. **MapQuizzzes.json aanpassen:**
    - eigen quiznaam, info voor de startpagina, registreren van de tours bijv. `Mijn eerste tour`, `Mijn tweede tour` 

4. **Benodigde bestanden naar de tourmap kopiëren:**
   - Afbeeldingen in twee resoluties, gebruik gerust `upload.php` uit de demo-tourmappen voor het automatisch aanmaken van de juiste afbeeldingsgrootten.
   - optioneel extra aanvullende informatie samenstellen (modalheader, modalfooter, modalextra).

4. **`quizdata.json` per tour aanpassen:**
    - Kopieer het `quizdata.json`-bestand van de demo en pas het aan voor je eigen tour.
    - elk JSON-object bevat de gegevens die nodig zijn voor elke afzonderlijke locatie.

5. **Handleiding, colofon, privacyverklaring aanpassen:**
   - Pas de bestanden aan of maak ze opnieuw voor jouw doeleinden. Je kunt het colofon en de privacyverklaring ook extern linken.

Klaar! Je MapQuizzzes-instantie met jouw tours is klaar voor gebruik. 

---

## 📄 Licentie

Dit project valt onder de **MIT-licentie**. De licentiedetails vind je in het bestand `LICENSE`.
