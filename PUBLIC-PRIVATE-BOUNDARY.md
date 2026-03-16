# Public / Private Boundary

Questa nota separa in modo esplicito cio' che puo' restare nel comparatore pubblico da cio' che dovra' vivere in una futura area privata del viaggio.

## Oggi: comparatore pubblico

Il sito statico pubblico serve a confrontare opzioni e condividere una fotografia delle alternative attuali.

Contenuti ammessi:
- voli, alloggi e parcheggi
- prezzi e differenze di costo
- note comparative non sensibili
- link pubblici ai fornitori
- stato del confronto condivisibile via URL

Contenuti da escludere:
- codici prenotazione, check-in, boarding pass
- nomi completi, contatti, dati identificativi dei bambini
- assegnazioni camere, posti, documenti, numeri pratica
- note operative private del gruppo

## URL sharing

La condivisione via URL introdotta nel comparatore deve contenere solo:
- voli selezionati
- alloggi selezionati
- parcheggio selezionato
- ordinamento del confronto

Non deve contenere:
- note libere
- dati personali
- contenuti di planner futuro
- riferimenti sensibili o prenotazioni

## Deploy pubblico

Il workflow GitHub Pages pubblica solo il bundle pubblico preparato in CI.

Bundle pubblico consentito:
- `index.html`
- `assets/`
- `data/`

Tutto il resto del repository e' escluso dall'artefatto Pages.

## Prossimo passo per la futura area privata

Quando il progetto uscira' dalla sola comparazione, il planner dovra' vivere in una superficie separata:
- repo privata o cartella/app separata
- deploy protetto
- eventuali segreti e dati operativi fuori dal bundle statico pubblico

## Regola pratica

Se un'informazione non e' adatta a stare in una query string pubblica o in un file statico pubblico, non deve stare nel comparatore.
