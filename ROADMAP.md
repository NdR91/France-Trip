# Roadmap

Roadmap implementativa del comparatore, costruita sul backlog attuale e su una review mirata di UX, UI, palette e testi/font.

## Stato attuale

- motore di confronto statico funzionante per voli, alloggi e parcheggio
- deploy automatico su GitHub Pages
- deploy Pages ristretto al solo bundle pubblico preparato in CI
- immagini alloggi integrate nelle card
- stato condivisibile via URL per il confronto pubblico
- `assets/app.js` spezzato in moduli piu piccoli
- principali regressioni recenti corrette: layout card, intro superflua, reset del carosello mobile

## Diagnosi sintetica

### UX

- il flusso e' comprensibile, ma su mobile il confronto richiede ancora troppo scorrimento e troppa scansione laterale
- il prodotto si comporta ancora piu' come catalogo che come assistente decisionale
- il blocco `Nel confronto` e' utile, ma quando le selezioni aumentano diventa denso
- i caroselli mobile funzionano, ma non sono ancora il pattern definitivo

### UI

- il linguaggio visivo e' pulito e coerente
- le card alloggio sono la parte piu' pesante: foto, metadati, pill e CTA convivono in uno spazio troppo denso su mobile
- lo stato selected/unselected e' leggibile, ma puo' diventare piu' elegante e meno rigido
- il blocco combinazioni e' il cuore del prodotto e deve diventare ancora piu' dominante

### Palette

- la base soft e luminosa funziona bene
- blu e arancio hanno gia' un buon ruolo semantico
- il sistema colore va disciplinato meglio: oggi convivono troppi accenti senza una gerarchia pienamente esplicita
- alcuni grigi secondari sono troppo deboli, soprattutto su mobile

### Testi e Font

- `DM Sans` e `DM Mono` sono adatti al prodotto e non richiedono sostituzione immediata
- i microcopy sono chiari ma non ancora completamente rifiniti come tono di prodotto
- label e hint secondari possono essere piu' leggibili e meno spenti su mobile
- alcune insight vanno rese piu' naturali e piu' affidabili nel tono

## Principi guida

- mobile first nelle decisioni di layout
- prima aiutare a decidere, poi mostrare tutto il catalogo
- meno densita', piu' segnali forti
- sistema visivo coerente prima di aggiungere nuove feature
- evitare redesign generici: preservare il tono editoriale morbido gia' presente

## Backlog consolidato

### P0 - Da affrontare per primi

- decidere il pattern mobile finale per la selezione: carosello migliorato o lista verticale compatta
- alleggerire le card alloggio su mobile con una variante piu' sintetica
- rendere il blocco `Nel confronto` piu' compatto e scalabile su mobile
- portare il miglior risultato piu' vicino all'inizio del flusso
- fare review cross-device dedicata a mobile density, touch e leggibilita'

### P1 - Miglioramenti ad alto valore

- raffinare selected, unselected, best state e gerarchia visiva delle card
- ridurre la lunghezza verticale delle insight card su mobile
- disciplinare la palette in un sistema semantico chiaro
- migliorare contrasto di label secondari, stati esclusi e hint
- rifinire microcopy di sezioni, insight, badge e CTA

### P2 - Manutenibilita' e feature abilitative

- modularizzare `assets/app.js` separando rendering, stato e helper
- aggiungere condivisione via URL delle selezioni
- valutare shortlist o preferiti condivisibili

### P3 - Evoluzione futura

- separare comparatore pubblico e planner privato
- aggiungere livelli informativi per famiglie, transfer e ritmo giornaliero
- evolvere il progetto da comparatore a travel planner

## Roadmap implementativa

### Fase 1 - Stabilizzazione mobile

Obiettivo: rendere l'esperienza mobile solida e piu' veloce da usare.

- definire il pattern finale di selezione mobile
- comprimere le card stay su mobile mostrando solo segnali essenziali
- migliorare il comportamento dei toggle sezione
- rendere il riepilogo selezioni piu' ordinato quando il numero di chip cresce
- validare tap, scroll, selezione e leggibilita' a 375px

### Fase 2 - Gerarchia decisionale

Obiettivo: fare emergere subito la scelta migliore.

- anticipare il summary decisionale rispetto alla lunga esplorazione del catalogo
- dare piu' peso alla combinazione migliore
- velocizzare il confronto tra combo vicine per prezzo e comodita'
- semplificare le insight per mobile

### Fase 3 - Rifinitura visual system

Obiettivo: trasformare la UI in un sistema piu' intenzionale e coerente.

- definire una palette semantica ufficiale
- unificare badge, chip, pill e stati
- rendere selected/unselected/best immediatamente riconoscibili
- bilanciare meglio immagini, metadati e azioni nelle card

### Fase 4 - Copy e tipografia

Obiettivo: aumentare chiarezza e tono di prodotto.

- rivedere titoli sezione, hint e CTA
- migliorare il linguaggio delle insight
- riallineare pesi e contrasti tipografici secondari
- verificare dove il mono va mantenuto e dove puo' essere ridotto

### Fase 5 - Architettura e feature di continuita'

Obiettivo: preparare il codice e il prodotto alla prossima ondata di evoluzione.

- spezzare `assets/app.js` in moduli piu' semplici
- introdurre URL sharing
- preparare il confine tra comparatore pubblico e planner privato

## Prossimo step consigliato

Partire dalla Fase 1 con un intervento mirato su mobile:

1. prototipo di card stay mobile piu' compatta
2. revisione del blocco `Nel confronto` per molte selezioni
3. decisione finale tra carosello e lista verticale
