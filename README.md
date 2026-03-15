# France Trip

Comparatore statico per valutare rapidamente le opzioni di volo, alloggio e parcheggio per il viaggio di settembre. Il progetto e' pensato per fotografare le alternative disponibili oggi, con una base semplice da evolvere in seguito.

## Cosa include

- confronto combinazioni volo + alloggio + parcheggio
- ordinamento per prezzo totale
- selezioni persistite in `localStorage`
- struttura pronta per pubblicazione su GitHub Pages

## Struttura

- `index.html` - shell della pagina
- `assets/app.css` - stile del comparatore
- `assets/app.js` - rendering UI e logica client-side
- `data/site-data.js` - dati di viaggio separati dalla UI
- `.github/workflows/deploy-pages.yml` - deploy automatico su GitHub Pages

## Mini Roadmap

### V1 - comparatore pulito

- dati separati dal layout
- combinazioni generate al volo
- pubblicazione automatica del sito

### V1.1 - decisione ferie piu solida

- aggiungere campi come flessibilita', tempi di trasferimento, note bambini, punteggio sintetico
- salvare o condividere un confronto via URL
- evidenziare meglio pro e contro di ogni opzione

### V2 - ponte verso travel planner

- riuso degli stessi dati per definire la soluzione scelta
- introduzione di giornate, trasferimenti, prenotazioni e checklist
- passaggio dal confronto statico al programma di viaggio

## Pubblicazione su GitHub Pages

1. Carica questi file nella repo `NdR91/France-Trip`
2. In GitHub vai su `Settings > Pages`
3. Seleziona `GitHub Actions` come source
4. Ogni push su `main` e ogni release pubblicata avvieranno il deploy

L'URL finale sara' qualcosa come `https://ndr91.github.io/France-Trip/`.
