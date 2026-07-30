# Quiz Party 🎯

Quiz a immagini per più persone, sincronizzato tra tutti i telefoni. Nessun codice da
inserire: si apre il link, si scrive il proprio nome e si gioca. Interfaccia essenziale
in stile iOS, con tema chiaro e scuro automatici.

Come funziona una domanda:

1. Immagine + domanda + risposte multiple.
2. Appena rispondi: la risposta **giusta si illumina di verde**, quella **sbagliata che hai
   scelto di rosso**.
3. Subito sotto compare **"Come ha risposto il gruppo"**: la percentuale di chi ha
   indovinato quella domanda, quante persone hanno scelto ogni singola risposta e la
   **media generale del gruppo finora**. Si aggiorna da sé mentre gli altri rispondono.
4. Alla fine: il tuo punteggio, la media del gruppo, la percentuale di corrette per ogni
   domanda e la classifica — uguale su tutti i telefoni.

## Perché Netlify (e non Vercel)

Su **Netlify** la sincronizzazione funziona senza configurare niente: la Function usa
**Netlify Blobs**, un archivio già incluso nel sito. Nessun database, nessun account
esterno, nessuna chiave da copiare.

Su Vercel servirebbe collegare a mano un archivio esterno (Redis/Upstash o Postgres) con
relative variabili d'ambiente. Fattibile, ma con più passaggi e più cose che possono
rompersi. Questo progetto è stato scritto e **provato** su Netlify.

## Pubblicare su Netlify

### Opzione A — drag & drop (la più rapida)

1. Vai su [app.netlify.com/drop](https://app.netlify.com/drop) (serve un account gratuito).
2. Trascina lo zip `quiz-party-netlify.zip`.
3. Netlify ti dà un indirizzo tipo `https://nome-casuale-123.netlify.app`: quello è il link
   da mandare a tutti. Funziona da qualsiasi rete, non serve essere sullo stesso wi-fi.

> ⚠️ Col drag & drop Netlify **non** esegue `npm install`: il pacchetto caricato deve già
> contenere `node_modules` con `@netlify/blobs`, altrimenti la function parte in errore e
> resta tutto "Offline". Lo zip qui sopra lo contiene già (solo la dipendenza di
> produzione, senza `netlify-cli`). Per rigenerarlo da capo:
>
> ```bash
> rsync -a --exclude node_modules --exclude .netlify quiz-multiplayer/ /tmp/quiz-party/
> cd /tmp/quiz-party && npm install --omit=dev && zip -qr ~/quiz-party-netlify.zip .
> ```

### Opzione B — da Git (consigliata se poi cambi domande e immagini)

1. Metti la cartella in un repository GitHub.
2. Su Netlify: **Add new site → Import an existing project** e scegli il repo.
3. Lascia i valori proposti (li legge da `netlify.toml`):
   - Build command: *vuoto*
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
4. **Deploy**. Da lì in poi ogni commit aggiorna il sito da solo.

### Verificare che la sincronizzazione sia attiva

Tre controlli, dal più veloce al più completo:

1. **La spia in alto a destra.** Se dice **"N in gioco"** (pallino verde) la sincronizzazione
   funziona. Se dice **"Offline"** (pallino arancione) no: stai giocando in locale con un
   server statico, oppure la Function non è stata pubblicata.
2. **L'endpoint.** Apri nel browser
   `https://tuosito.netlify.app/api/quiz?room=PROVA`
   Deve rispondere con un JSON tipo `{"room":"PROVA","players":[]}`.
   Se vedi una pagina 404, la Function non è stata pubblicata: controlla su Netlify
   *Site configuration → Functions* che compaia la function `quiz`.
3. **Due dispositivi.** Apri il link su due telefoni e rispondi alla prima domanda su uno
   solo: sull'altro il riquadro "Come ha risposto il gruppo" passa a `2 su 2` entro
   **2-3 secondi**, senza toccare niente.

## Giocare in gruppo

1. Mandi il link a tutti (il pulsante **Copia link** nella schermata finale lo copia per te).
2. Ognuno scrive solo il **proprio nome** e parte: non c'è nessun codice da inserire, la
   partita è unica e chi apre il link entra automaticamente insieme agli altri.
3. Non serve aspettarsi: ognuno va col suo ritmo, le medie si aggiornano man mano.
4. **Azzera la partita per tutti**, in fondo alla schermata dei risultati, cancella le
   risposte di tutti e permette di ricominciare da capo con un nuovo gruppo.

## Provarlo in locale

```bash
npm install
npm run dev
```

Apri `http://localhost:8888`. Serve `netlify dev` (non un server statico qualsiasi) perché
`/api/quiz` è una Function: con un server statico il gioco funziona comunque, ma in
**modalità offline**, senza condivisione dei risultati — e l'app lo segnala con un avviso
in cima alla pagina.

## Cambiare domande e immagini

Tutti i contenuti stanno in un solo file: **`js/questions.js`**

```js
{
  id: 'q1',                       // identificativo stabile
  image: 'images/q1.svg',         // metti i tuoi file (jpg/png/webp/svg) in /images
  alt: 'descrizione immagine',
  question: 'La domanda?',
  answers: ['A', 'B', 'C', 'D'],  // da 2 a 6 risposte
  correct: 0                      // indice della risposta giusta (0 = la prima)
}
```

- Puoi aggiungere o togliere domande: il totale (`/7`) si adatta da solo.
- Le immagini attuali sono **segnaposto** disegnate in SVG: sostituiscile con le tue.
  Formato consigliato: proporzione 16:10, larghezza ~1200px, JPG o WebP compresso.
- Se cambi le domande a partita già avviata, azzera la partita: i punteggi salvati si
  riferiscono agli `id` precedenti.

## Struttura

```
index.html
css/style.css
js/questions.js             ← contenuti (domande, risposte, immagini)
js/app.js                   ← logica del gioco e sincronizzazione
images/q1…q7.svg            ← immagini segnaposto
netlify/functions/quiz.mjs  ← API di sincronizzazione (Netlify Blobs)
netlify.toml
```

## Note tecniche

- Nessun framework, nessuna build: HTML, CSS e JavaScript puri.
- Ogni giocatore scrive nel **proprio** record (`PARTITA/playerId`): due telefoni che
  rispondono nello stesso istante non si sovrascrivono a vicenda. La "stanza" è fissa
  (`ROOM` in `js/app.js`): se un giorno ti servissero gruppi separati, basta cambiarla.
- Il server **non conosce le risposte giuste**: salva solo l'indice scelto. Punteggi e medie
  li calcola il telefono, che ha l'unica copia delle soluzioni.
- Aggiornamento dei dati del gruppo: ogni 2,5 secondi (in pausa quando la pagina è in
  background, per non consumare batteria).
- `netlify-cli` è tra le `devDependencies` solo per far funzionare `npm run dev`: se vuoi
  build più veloci su Netlify puoi rimuoverlo e usare `npx netlify dev`.
