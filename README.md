# ozo-scripts

Maatwerk-JavaScript voor de Webflow-site van OZOverbindzorg ([ozoverbindzorg.nl](https://www.ozoverbindzorg.nl)).

## Status

- `src/` bevat de scripts zoals ze op 8 oktober 2026 in Slater stonden (project 9398), ongewijzigd.
- `loader.js` laadt ze 1-op-1 met dezelfde pagina-regels als Slater (`slater/_loader-staging.js`). Dit is de tussenstap (v0.x).
- Daarna worden ze samengevoegd en opgeschoond tot één `main.js` (v1.0.0).

## Laden in Webflow (v0.x)

In Site settings → Footer, op de plek van het Slater-script:

```html
<script>
document.addEventListener("DOMContentLoaded", function () {
  var s = document.createElement("script");
  s.type = "module";
  s.src = "https://cdn.jsdelivr.net/gh/OZO-Verbindzorg/ozo-scripts@v0.1.0/loader.js";
  document.body.appendChild(s);
});
</script>
```

## Werkwijze

1. Wijzig `main.js` en commit.
2. Maak een nieuwe tag (`v1.0.1`, `v1.1.0`, ...) en push die.
3. Zet het nieuwe versienummer in de Webflow-footer en publiceer eerst naar staging (`ozo-verbindzorg.webflow.io`).
4. Na testen: publiceren naar de live site.

Geen wachtwoorden, API-sleutels of persoonsgegevens in deze repository: hij is openbaar.
