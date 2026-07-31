/* ============================================================
   CONTENUTI DEL QUIZ  —  modifica SOLO questo file
   ------------------------------------------------------------
   Ogni domanda:
     id       : identificativo univoco e stabile (non riusarlo per
                una domanda diversa a partita in corso)
     image    : opzionale — percorso dell'immagine (file in /images).
                Se manca, la domanda è di solo testo
     focus    : opzionale — quale parte della foto tenere quando viene
                ritagliata nel riquadro 3:4. Es. 'center 20%' alza
                l'inquadratura, 'center' (default) resta al centro
     alt      : descrizione dell'immagine (accessibilità)
     question : il testo della domanda
     answers  : le risposte multiple (2, 3, 4 o più)
     correct  : indice della risposta giusta (0 = la prima)

   L'ordine dell'array è l'ordine di gioco: foto e domande di testo
   sono alternate per non averle tutte in blocco.
   ============================================================ */

window.QUIZ_QUESTIONS = [
  {
    id: 'b1',
    image: 'images/beast-capelli.jpg',
    focus: 'center 18%',   // foto molto verticale: tengo inquadrata la testa
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
    id: 'b5',
    question: 'Anime preferito di Beast',
    answers: ['One Piece', 'Hamtaro', 'Dragon Ball', 'Death Note'],
    correct: 0
  },
  {
    id: 'b6',
    question: 'Qual è la bestemmia più detta da Beast? Dio…',
    answers: ['Cane', 'Porco', 'Troia', 'Pezzente'],
    correct: 0
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
    id: 'b7',
    question: 'Quanti buchi aveva nella minchia da piccolino?',
    answers: ['1', '2', '3', '15'],
    correct: 1
  },
  {
    id: 'b8',
    question: 'Quale testicolo di Beast è di dimensioni anomale?',
    answers: ['Sinistro', 'Destro', 'Nessuno, sono entrambi piccoli'],
    correct: 0
  },
  {
    id: 'b14',
    image: 'images/beast-mykonos.jpg',
    focus: 'center 25%',   // screenshot molto verticale: taglia via la barra di stato
    alt: 'Beast a torso nudo in spiaggia con occhiali da sole',
    question: 'Cosa stava facendo Beast a Mykonos?',
    answers: [
      'Flexando il body',
      'Trattenendo uno stronzo abnorme',
      'Era in locco',
      'Fissando una luccicosa in lontananza'
    ],
    correct: 0
  },
  {
    id: 'b9',
    question: 'Quali sono le scene realmente successe?',
    answers: [
      'Distrutto una porta di una scuola',
      'Postato una foto nudo sul divano su Instagram',
      'Esclamato "pipita Higuain" durante un rapporto',
      'Tutte le precedenti'
    ],
    correct: 3
  },
  {
    id: 'b10',
    question: 'Qual è lo snack preferito da Beast quando gioca alla Play?',
    answers: ['Nutella B-ready', 'Oreo', 'Prosciutto crudo', 'Patatine'],
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
    id: 'b11',
    question: 'Che diploma ha Beast?',
    answers: ['Agrario', 'Meccanico', 'Economia', 'Terza media'],
    correct: 2
  },
  {
    id: 'b12',
    question: 'Dove ha perso la verginità Manfre?',
    answers: [
      'Sul pedalò',
      'Nell\'orto di Alfred',
      'È ancora vergine',
      'Alle medie nell\'aula di musica (da qui deriva suonatore Jones)'
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
  },
  {
    id: 'b13',
    question: 'Di quale colore Beast beve la Monster?',
    answers: ['Bianca', 'Rosa', 'Azzurra', 'Nera tempesta'],
    correct: 0
  }
];
