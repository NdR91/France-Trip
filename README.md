# France Trip

Comparatore statico per valutare rapidamente le opzioni di volo, alloggio e parcheggio per il viaggio di settembre. Il progetto e' pensato per fotografare le alternative disponibili oggi, con una base semplice da evolvere in seguito.

## Cosa include

- confronto combinazioni volo + alloggio + parcheggio
- ordinamento per prezzo totale
- selezioni persistite in `localStorage`
- sintesi decisionale con opzione piu economica, piu comoda e logistica Disneyland
- struttura pronta per pubblicazione su GitHub Pages

## Roadmap

- roadmap implementativa completa in `ROADMAP.md`

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

## Backlog operativo

### Adesso

- mantenere aggiornati prezzi, link e note delle opzioni in `data/site-data.js`
- tenere pubblici solo contenuti adatti a un sito statico condivisibile
- rifinire il confronto man mano che emergono nuove alternative

### Dopo

- aggiungere condivisione del confronto via URL
- introdurre shortlist e preferiti per il gruppo
- aggiungere campi specifici per famiglie, transfer e ritmo giornaliero

### Piu avanti

- separare una versione pubblica del comparatore da una futura area privata del viaggio
- evolvere il progetto da comparatore a travel planner
- valutare migrazione a hosting protetto come Cloudflare Pages + Access

## Confine pubblico / privato

Questo repository oggi pubblica un sito statico completo tramite GitHub Pages. Di conseguenza, tutto cio' che finisce nei file deployati (`index.html`, `assets/`, `data/`) e' da considerare pubblico.

### Contenuti adatti al sito condivisibile

- alternative di volo, alloggio e parcheggio
- prezzi e note comparative
- programma generale e logistica non sensibile
- link pubblici ai fornitori

### Contenuti da non mettere nel sito statico

- biglietti, codici prenotazione e check-in
- nomi completi, contatti, assegnazioni camere o posti
- documenti, dati di minori identificabili e dettagli operativi sensibili

Quando il progetto evolvera' oltre il comparatore, questi contenuti dovranno vivere fuori dal pacchetto statico pubblico o dietro un sistema di accesso dedicato.

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
