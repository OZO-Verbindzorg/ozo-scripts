# ozo-scripts

Maatwerk-JavaScript voor de Webflow-site van OZOverbindzorg ([ozoverbindzorg.nl](https://www.ozoverbindzorg.nl)).

## Status

`slater/` bevat de scripts zoals ze op 8 oktober 2026 in Slater stonden (project 9398), ongewijzigd, als startpunt. Deze worden samengevoegd tot één `main.js`, dat via jsDelivr in Webflow wordt geladen en Slater vervangt.

## Laden in Webflow

Vaste versie (tag), als laatste script in Site settings → Footer:

```html
<script src="https://cdn.jsdelivr.net/gh/OZO-Verbindzorg/ozo-scripts@v1.0.0/main.js"></script>
```

## Werkwijze

1. Wijzig `main.js` en commit.
2. Maak een nieuwe tag (`v1.0.1`, `v1.1.0`, ...) en push die.
3. Zet het nieuwe versienummer in de Webflow-footer en publiceer eerst naar staging (`ozo-verbindzorg.webflow.io`).
4. Na testen: publiceren naar de live site.

Geen wachtwoorden, API-sleutels of persoonsgegevens in deze repository: hij is openbaar.
