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
    id: 'q1',
    image: 'images/q1.svg',
    alt: 'Silhouette di una torre in ferro al tramonto',
    question: 'Quale monumento è raffigurato nell\'immagine?',
    answers: ['Torre Eiffel', 'Big Ben', 'Torre di Pisa', 'Tokyo Tower'],
    correct: 0
  },
  {
    id: 'q2',
    image: 'images/q2.svg',
    alt: 'Pizza rotonda con pomodoro, mozzarella e basilico',
    question: 'Come si chiama questa pizza?',
    answers: ['Quattro stagioni', 'Margherita', 'Capricciosa', 'Marinara'],
    correct: 1
  },
  {
    id: 'q3',
    image: 'images/q3.svg',
    alt: 'Pianeta con un grande sistema di anelli',
    question: 'Quale pianeta del Sistema Solare è mostrato?',
    answers: ['Giove', 'Nettuno', 'Saturno', 'Marte'],
    correct: 2
  },
  {
    id: 'q4',
    image: 'images/q4.svg',
    alt: 'Cactus con due braccia sotto il sole',
    question: 'In quale ambiente cresce spontaneamente questa pianta?',
    answers: ['Foresta tropicale', 'Alta montagna', 'Palude', 'Deserto'],
    correct: 3
  },
  {
    id: 'q5',
    image: 'images/q5.svg',
    alt: 'Barca a vela con due vele bianche sul mare',
    question: 'Quale sport è associato a questa immagine?',
    answers: ['Vela', 'Canottaggio', 'Surf', 'Kayak'],
    correct: 0
  },
  {
    id: 'q6',
    image: 'images/q6.svg',
    alt: 'Tazzina bianca con caffè e vapore',
    question: 'Quale bevanda si prepara in questa tazzina?',
    answers: ['Tè verde', 'Espresso', 'Cioccolata calda', 'Camomilla'],
    correct: 1
  },
  {
    id: 'q7',
    image: 'images/q7.svg',
    alt: 'Mongolfiera colorata che vola tra le nuvole',
    question: 'Come si chiama questo mezzo di trasporto?',
    answers: ['Dirigibile', 'Deltaplano', 'Mongolfiera', 'Paracadute'],
    correct: 2
  }
];
