/* ============================================================
   CONTENUTI DEL QUIZ  —  modifica SOLO questo file
   ------------------------------------------------------------
   Ogni domanda:
     id       : identificativo univoco e stabile (non riusarlo per
                una domanda diversa a partita in corso)
     image    : percorso dell'immagine (metti i tuoi file in /images)
     alt      : descrizione dell'immagine (accessibilità)
     question : il testo della domanda
     answers  : le risposte multiple (2, 3, 4 o più)
     correct  : indice della risposta giusta (0 = la prima)
   ============================================================ */

window.QUIZ_QUESTIONS = [
  {
    id: 'b1',
    image: 'images/beast-capelli.jpg',
    alt: 'Beast seduto con la giacca bianca di montone',
    question: 'Cosa è stato utilizzato come prodotto per i capelli?',
    answers: [
      'Garnier',
      'Loreal',
      'Olio di semi',
      'Niente, capelli mai lavati'
    ],
    correct: 3
  },
  {
    id: 'b2',
    image: 'images/beast-sardegna.jpg',
    alt: 'Beast in camicia fantasia, all\'aperto, con vista sulle colline',
    question: 'Viste le condizioni di Beast, cos\'è successo?',
    answers: [
      'Ha gognato troppo al Ritual la sera prima',
      'L\'ha preso da Soncio ed è dolorante',
      'Sta guardando un comunista (è Ramma)',
      'Ha appena vomitato'
    ],
    correct: 0
  },
  {
    id: 'b3',
    image: 'images/beast-dragonball.jpg',
    alt: 'Beast in pigiama di Dragon Ball Z',
    question: 'Perché Beast ha questo costume?',
    answers: [
      'Vuole diventare Goku',
      'Sta cercando di scacciare tutte',
      'Sta uscendo al Magnani',
      'Vuole conquistare un Hikikomori'
    ],
    correct: 3
  },
  {
    id: 'b4',
    image: 'images/mariola-bocca.jpg',
    alt: 'Mariola con un rivolo rosso all\'angolo della bocca',
    question: 'Cos\'ha in bocca Mariola?',
    answers: [
      'Sangue a causa del morso della Dalila',
      'Succo di mirtillo',
      'Mestruo',
      'Pittura'
    ],
    correct: 2
  }
];
