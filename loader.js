// Tijdelijke loader (v0.x): laadt de Slater-bestanden 1-op-1 vanaf GitHub via jsDelivr,
// met dezelfde pagina-regels als het Slater-laadscript (slater/_loader-staging.js).
// Wordt vervangen door één main.js zodra alles is samengevoegd en opgeschoond.

const paths = window.location.pathname.split('/');
const file = (name) => new URL(`./src/${name}`, import.meta.url).href;

// Op alle pagina's
import(file('examples-slider.js'));
import(file('form-label.js'));
import(file('lenis.js'));
import(file('logos.js'));
import(file('play-video.js'));
import(file('reviews.js'));

// Per pagina, zelfde regel als Slater: laatste URL-deel, of een CMS-template ("detail_" + map)
function onPages(pages, name) {
  const path = paths[paths.length - 1];
  const itemPath = paths[paths.length - 2];
  if (pages.includes(path) || pages.includes('detail_' + itemPath) || pages.includes(itemPath + '/item')) {
    import(file(name));
  }
}

onPages([''], 'header-video.js');
onPages(['over-ons'], 'team-slider.js');
onPages(['testpage'], 'testcode.js');
onPages(['detail_werken-bij'], 'vacatures-slider.js');
