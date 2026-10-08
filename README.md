# ozo-scripts

Maatwerk-JavaScript voor de Webflow-site van OZOverbindzorg ([ozoverbindzorg.nl](https://www.ozoverbindzorg.nl)).

## Status

- `main.js`: alle maatwerkcode in één bestand (vanaf v1.0.0). Elk onderdeel start alleen als zijn element op de pagina staat.
- `src/` + `loader.js`: de oorspronkelijke Slater-bestanden, 1-op-1 (v0.1.0). Blijft staan als referentie tot v1 live draait.

## Laden in Webflow

Site settings → Footer, op de plek van het oude Slater-script:

```html
<script src="https://cdn.jsdelivr.net/gh/OZO-Verbindzorg/ozo-scripts@v1.0.1/main.min.js"></script>
```

`main.min.js` wordt door jsDelivr automatisch verkleind uit `main.js`. GSAP, ScrollTrigger en Observer komen van Webflow zelf (Site settings → GSAP); Lenis, Swiper, Finsweet en Vimeo laadt `main.js` alleen waar nodig.

## Werkwijze

1. Wijzig `main.js` en commit.
2. Maak een nieuwe tag (`v1.0.1`, `v1.1.0`, ...) en push die.
3. Zet het nieuwe versienummer in de Webflow-footer en publiceer eerst naar staging (`ozo-verbindzorg.webflow.io`).
4. Na testen: publiceren naar de live site.

Geen wachtwoorden, API-sleutels of persoonsgegevens in deze repository: hij is openbaar.
