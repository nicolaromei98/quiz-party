/* ============================================================
   Quiz Party — logica del gioco (nessuna dipendenza esterna)
   Le domande stanno in js/questions.js
   La sincronizzazione passa da /api/quiz (netlify/functions/quiz.mjs)
   ============================================================ */
(function () {
  'use strict';

  var QS = window.QUIZ_QUESTIONS || [];
  var TOTAL = QS.length;
  var KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];
  var POLL_MS = 2500;

  var LS = { id: 'quizparty.playerId', name: 'quizparty.name' };

  // partita unica: chi apre il link gioca con tutti gli altri
  var ROOM = 'PARTITA';

  var state = {
    screen: 'join',        // join | quiz | result
    playerId: localStorage.getItem(LS.id) || newId(),
    name: localStorage.getItem(LS.name) || '',
    index: 0,
    answers: {},           // { qid: indiceScelto }
    revealed: false,
    group: null,           // { players: [...] } dal server
    online: null,          // null = ancora da capire, true/false
    syncError: ''
  };
  localStorage.setItem(LS.id, state.playerId);

  var pollTimer = null;
  var app = document.getElementById('app');

  /* ------------------------- utils ------------------------- */

  function newId() {
    return 'p' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function shareUrl() {
    return location.origin + location.pathname;
  }

  function myScore() {
    return scoreOf(state.answers);
  }

  function scoreOf(answers) {
    var n = 0;
    QS.forEach(function (q) {
      if (answers && answers[q.id] === q.correct) n++;
    });
    return n;
  }

  /* --------------------------- API -------------------------- */

  function apiUrl() {
    return '/api/quiz?room=' + encodeURIComponent(ROOM);
  }

  function pushAnswers(finished) {
    return fetch(apiUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        playerId: state.playerId,
        name: state.name,
        answers: state.answers,
        finished: !!finished
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      state.online = true;
      state.syncError = '';
      if (data && data.players) state.group = data;
      return data;
    }).catch(function (err) {
      state.online = false;
      state.syncError = err.message || 'errore di rete';
    });
  }

  function pullGroup() {
    return fetch(apiUrl(), { headers: { 'accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        state.online = true;
        state.syncError = '';
        state.group = data;
        return data;
      })
      .catch(function (err) {
        state.online = false;
        state.syncError = err.message || 'errore di rete';
      });
  }

  function resetRoom() {
    return fetch(apiUrl(), { method: 'DELETE' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .catch(function () { state.online = false; });
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(function () {
      pullGroup().then(function () {
        // durante il quiz aggiorno i numeri in place, per non far "saltare" la domanda
        if (state.screen === 'result') { render(); return; }
        updatePresencePill();
        refreshGroupPanel();
      });
    }, POLL_MS);
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  /* ---------------------- aggregazione ---------------------- */

  function aggregate() {
    var players = (state.group && state.group.players) || [];
    var me = players.filter(function (p) { return p.id === state.playerId; });
    if (!me.length) {
      // includo sempre me stesso, anche se offline
      players = players.concat([{ id: state.playerId, name: state.name, answers: state.answers, finished: allAnswered() }]);
    }

    var rows = players.map(function (p) {
      var answered = QS.filter(function (q) { return p.answers && p.answers[q.id] != null; }).length;
      return {
        id: p.id,
        name: p.name || 'Anonimo',
        score: scoreOf(p.answers),
        answered: answered,
        finished: answered >= TOTAL
      };
    });

    rows.sort(function (a, b) { return b.score - a.score || b.answered - a.answered || a.name.localeCompare(b.name); });

    var finishedRows = rows.filter(function (r) { return r.finished; });
    var base = finishedRows.length ? finishedRows : rows;
    var avg = base.length ? base.reduce(function (s, r) { return s + r.score; }, 0) / base.length : 0;

    var perQuestion = QS.map(function (q) {
      var votes = players.filter(function (p) { return p.answers && p.answers[q.id] != null; });
      var right = votes.filter(function (p) { return p.answers[q.id] === q.correct; }).length;
      return {
        id: q.id,
        question: q.question,
        votes: votes.length,
        right: right,
        pct: votes.length ? Math.round(right * 100 / votes.length) : 0
      };
    });

    return {
      rows: rows,
      players: rows.length,
      finished: finishedRows.length,
      avg: avg,
      avgPct: TOTAL ? Math.round(avg * 100 / TOTAL) : 0,
      perQuestion: perQuestion
    };
  }

  function allAnswered() {
    return QS.every(function (q) { return state.answers[q.id] != null; });
  }

  // tutti i giocatori noti, me compreso (anche se il server non mi ha ancora registrato)
  function allPlayers() {
    var players = ((state.group && state.group.players) || []).slice();
    if (!players.some(function (p) { return p.id === state.playerId; })) {
      players.push({ id: state.playerId, name: state.name, answers: state.answers });
    }
    return players;
  }

  // statistiche su una singola domanda: quante persone hanno scelto ogni risposta
  function questionAggregate(q) {
    var players = allPlayers();
    var counts = q.answers.map(function () { return 0; });
    var votes = 0;
    players.forEach(function (p) {
      var v = p.answers ? p.answers[q.id] : null;
      if (v != null && counts[v] != null) { counts[v]++; votes++; }
    });
    var right = counts[q.correct] || 0;

    // media generale del gruppo sulle risposte date finora
    var scores = players.map(function (p) { return scoreOf(p.answers); });
    var given = players.map(function (p) {
      return QS.filter(function (qq) { return p.answers && p.answers[qq.id] != null; }).length;
    });
    var totScore = scores.reduce(function (s, n) { return s + n; }, 0);
    var totGiven = given.reduce(function (s, n) { return s + n; }, 0);

    return {
      counts: counts,
      votes: votes,
      right: right,
      pct: votes ? Math.round(right * 100 / votes) : 0,
      players: players.length,
      runAvg: players.length ? totScore / players.length : 0,
      runPct: totGiven ? Math.round(totScore * 100 / totGiven) : 0
    };
  }

  // blocco "come ha risposto il gruppo", mostrato dopo ogni immagine
  function groupPanel(q) {
    var a = questionAggregate(q);
    var rows = q.answers.map(function (text, i) {
      var n = a.counts[i];
      var pct = a.votes ? Math.round(n * 100 / a.votes) : 0;
      var good = i === q.correct;
      return '<div class="qstat">' +
        '<div class="qstat-head">' +
          '<span>' + (good ? '✓ ' : '') + esc(text) + '</span>' +
          '<span>' + n + ' · ' + pct + '%</span>' +
        '</div>' +
        '<div class="bar"><i class="' + (good ? '' : 'i--muted') + '" style="width:' + pct + '%"></i></div>' +
      '</div>';
    }).join('');

    return '' +
      '<div class="qstat-top">' +
        '<p class="section-title">Come ha risposto il gruppo</p>' +
        '<span class="pill">' + a.votes + ' su ' + a.players + '</span>' +
      '</div>' +
      '<div class="score score--mini">' +
        '<b>' + a.pct + '<i>%</i></b>' +
        '<span>ha indovinato questa domanda</span>' +
      '</div>' +
      rows +
      '<p class="footnote" style="margin-top:14px">Media generale del gruppo finora: <b>' +
        a.runAvg.toFixed(1) + '/' + TOTAL + '</b> · ' + a.runPct + '% di risposte corrette</p>' +
      (state.online === false
        ? ''
        : '<p class="footnote" style="margin-top:6px">Si aggiorna da sé mentre gli altri rispondono.</p>');
  }

  function refreshGroupPanel() {
    var box = document.getElementById('gpanel');
    if (!box) return;
    box.innerHTML = groupPanel(QS[state.index]);
  }

  /* ------------------------- schermate ---------------------- */

  function statusPill() {
    var players = (state.group && state.group.players) ? state.group.players.length : (state.online === false ? 1 : 0);
    if (state.online === false) {
      return '<span class="pill" id="presence"><i class="dot dot--off"></i>Offline</span>';
    }
    return '<span class="pill" id="presence"><i class="dot"></i>' +
      (players || 1) + ' in gioco</span>';
  }

  function updatePresencePill() {
    var el = document.getElementById('presence');
    if (!el) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = statusPill();
    el.replaceWith(tmp.firstChild);
  }

  function offlineNotice() {
    if (state.online !== false) return '';
    return '<div class="notice"><b>Sincronizzazione non attiva.</b> Puoi giocare da solo, ma i risultati non vengono condivisi. ' +
      'In locale avvia il progetto con <code>netlify dev</code>; online funziona automaticamente su Netlify.</div>';
  }

  function viewJoin() {
    return '' +
      '<section class="card anim" style="display:flex;flex-direction:column;gap:22px">' +
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          '<h1 class="title">Facciamo gognare Beast</h1>' +
          '<p class="subtitle">' + TOTAL + ' immagini, una domanda per volta. Dopo ogni risposta vedi come ha risposto il gruppo, e alla fine la media di tutti.</p>' +
        '</div>' +
        '<div>' +
          '<label class="label" for="nm">Il tuo nome</label>' +
          '<input class="input" id="nm" maxlength="20" placeholder="Come ti chiami?" value="' + esc(state.name) + '" autocomplete="nickname">' +
        '</div>' +
        '<button class="btn" id="go">Inizia</button>' +
        '<p id="joinErr" class="footnote" style="display:none;color:var(--bad)"></p>' +
      '</section>';
  }

  function viewQuiz() {
    var q = QS[state.index];
    var chosen = state.answers[q.id];
    var revealed = state.revealed && chosen != null;

    var answers = q.answers.map(function (text, i) {
      var cls = 'answer';
      var mark = '';
      if (revealed) {
        if (i === q.correct) { cls += ' is-correct'; mark = '<span class="mark">✓</span>'; }
        else if (i === chosen) { cls += ' is-wrong'; mark = '<span class="mark">✕</span>'; }
        else { cls += ' is-idle'; }
      }
      return '<button class="' + cls + '" data-i="' + i + '"' + (revealed ? ' disabled' : '') + '>' +
        '<span class="key">' + KEYS[i] + '</span><span>' + esc(text) + '</span>' + mark + '</button>';
    }).join('');

    var feedback = '';
    if (revealed) {
      feedback = chosen === q.correct
        ? '<p class="feedback" style="color:var(--ok)">Risposta corretta</p>'
        : '<p class="feedback">La risposta giusta era <b>' + esc(q.answers[q.correct]) + '</b></p>';
    }

    var last = state.index === TOTAL - 1;

    return '' +
      '<div class="topbar">' +
        '<span class="pill">Domanda ' + (state.index + 1) + '/' + TOTAL + '</span>' +
        statusPill() +
      '</div>' +
      '<div class="progress"><i style="width:' + Math.round((state.index + (revealed ? 1 : 0)) * 100 / TOTAL) + '%"></i></div>' +
      offlineNotice() +
      // le domande senza foto mostrano solo il testo
      (q.image
        ? '<figure class="figure anim"><img src="' + esc(q.image) + '" alt="' + esc(q.alt || '') +
            '" style="object-position:' + esc(q.focus || 'center') + '"' +
            ' onerror="this.style.display=\'none\';this.parentNode.classList.add(\'figure--missing\')"></figure>'
        : '') +
      '<h2 class="question">' + esc(q.question) + '</h2>' +
      '<div class="answers' + (revealed ? ' revealed' : '') + '" id="answers">' + answers + '</div>' +
      feedback +
      (revealed ? '<section class="card anim" id="gpanel">' + groupPanel(q) + '</section>' : '') +
      (revealed ? '<button class="btn" id="next">' + (last ? 'Vedi i risultati' : 'Prossima domanda') + '</button>' : '');
  }

  function viewResult() {
    var a = aggregate();
    var mine = myScore();
    var pct = TOTAL ? Math.round(mine * 100 / TOTAL) : 0;

    var qstats = a.perQuestion.map(function (s, i) {
      return '<div class="qstat">' +
        '<div class="qstat-head"><span>' + (i + 1) + '. ' + esc(s.question) + '</span>' +
          '<span>' + s.right + '/' + s.votes + ' · ' + s.pct + '%</span></div>' +
        '<div class="bar"><i style="width:' + s.pct + '%"></i></div>' +
      '</div>';
    }).join('');

    var rank = a.rows.map(function (r, i) {
      return '<li' + (r.id === state.playerId ? ' class="me"' : '') + '>' +
        '<span class="pos">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(r.name) + (r.id === state.playerId ? ' <span class="st">(tu)</span>' : '') + '</span>' +
        (r.finished ? '' : '<span class="st">' + r.answered + '/' + TOTAL + '</span>') +
        '<span class="sc">' + r.score + '</span>' +
      '</li>';
    }).join('');

    return '' +
      '<div class="topbar">' +
        '<span class="pill">Risultati</span>' +
        statusPill() +
      '</div>' +
      offlineNotice() +
      '<section class="card anim">' +
        '<div class="score">' +
          '<span>Il tuo risultato</span>' +
          '<b>' + mine + '<i>/' + TOTAL + '</i></b>' +
          '<span>' + pct + '% di risposte corrette</span>' +
        '</div>' +
      '</section>' +
      '<section class="card">' +
        '<p class="section-title" style="margin-bottom:12px">Risultato del gruppo</p>' +
        '<div class="stats">' +
          '<div class="stat"><b>' + a.avg.toFixed(1) + '</b><span>media</span></div>' +
          '<div class="stat"><b>' + a.avgPct + '%</b><span>media %</span></div>' +
          '<div class="stat"><b>' + a.players + '</b><span>giocatori</span></div>' +
        '</div>' +
        '<p class="footnote" style="margin-top:12px">' +
          (a.finished < a.players
            ? 'In attesa di ' + (a.players - a.finished) + ' giocator' + (a.players - a.finished === 1 ? 'e' : 'i') + '…'
            : 'Tutti hanno finito') +
        '</p>' +
      '</section>' +
      '<section class="card">' +
        '<p class="section-title" style="margin-bottom:14px">Risposte corrette per domanda</p>' +
        qstats +
      '</section>' +
      '<section class="card">' +
        '<p class="section-title" style="margin-bottom:12px">Classifica</p>' +
        '<ol class="rank">' + rank + '</ol>' +
      '</section>' +
      '<div class="btn-row">' +
        '<button class="btn btn--ghost" id="again">Rigioca</button>' +
        '<button class="btn btn--ghost" id="share">Copia link</button>' +
      '</div>' +
      '<p class="footnote">I risultati si aggiornano da soli ogni ' + (POLL_MS / 1000) + ' secondi.</p>' +
      '<button class="btn btn--quiet" id="wipe">Azzera la partita per tutti</button>';
  }

  /* -------------------------- render ------------------------ */

  function render() {
    var html = state.screen === 'join' ? viewJoin()
             : state.screen === 'quiz' ? viewQuiz()
             : viewResult();
    app.innerHTML = html;
    bind();
  }

  function bind() {
    if (state.screen === 'join') {
      var nm = document.getElementById('nm');
      nm.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); });
      document.getElementById('go').addEventListener('click', start);

      function start() {
        var name = nm.value.trim().slice(0, 20);
        var err = document.getElementById('joinErr');
        if (!name) { err.textContent = 'Scrivi il tuo nome per continuare.'; err.style.display = 'block'; nm.focus(); return; }
        state.name = name;
        localStorage.setItem(LS.name, name);
        state.screen = 'quiz';
        state.index = 0;
        state.revealed = false;
        render();
        pushAnswers(false).then(render);
        startPolling();
      }
      return;
    }

    if (state.screen === 'quiz') {
      var box = document.getElementById('answers');
      if (box) {
        box.addEventListener('click', function (e) {
          var b = e.target.closest('.answer');
          if (!b || state.revealed) return;
          var q = QS[state.index];
          state.answers[q.id] = Number(b.dataset.i);
          state.revealed = true;
          render();
          // invio la risposta e riporto subito i dati freschi del gruppo
          pushAnswers(allAnswered()).then(function () {
            updatePresencePill();
            refreshGroupPanel();
          });
        });
      }
      var next = document.getElementById('next');
      if (next) {
        next.addEventListener('click', function () {
          if (state.index < TOTAL - 1) {
            state.index++;
            state.revealed = false;
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            state.screen = 'result';
            pushAnswers(true).then(pullGroup).then(render);
            render();
          }
        });
      }
      return;
    }

    // result
    document.getElementById('again').addEventListener('click', function () {
      state.answers = {};
      state.index = 0;
      state.revealed = false;
      state.screen = 'quiz';
      render();
      pushAnswers(false);
    });

    document.getElementById('share').addEventListener('click', function (e) {
      var btn = e.currentTarget;
      var url = shareUrl();
      var done = function () { btn.textContent = 'Link copiato ✓'; setTimeout(function () { btn.textContent = 'Copia link'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { prompt('Copia il link:', url); });
      } else {
        prompt('Copia il link:', url);
      }
    });

    document.getElementById('wipe').addEventListener('click', function () {
      if (!confirm('Cancellare le risposte di tutti i giocatori?\nL\'operazione non è annullabile.')) return;
      resetRoom().then(function () {
        state.answers = {};
        state.index = 0;
        state.revealed = false;
        state.group = { players: [] };
        state.screen = 'quiz';
        render();
      });
    });
  }

  /* --------------------------- avvio ------------------------ */

  if (!TOTAL) {
    app.innerHTML = '<div class="card"><h1 class="title">Nessuna domanda</h1><p class="subtitle">Aggiungi le domande in <code>js/questions.js</code>.</p></div>';
    return;
  }

  render();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stopPolling(); return; }
    if (state.screen !== 'join') { pullGroup().then(render); startPolling(); }
  });
})();
