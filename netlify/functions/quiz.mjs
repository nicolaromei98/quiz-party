import { getStore } from '@netlify/blobs';

/*
  Sincronizzazione della partita.

  GET    /api/quiz?room=CODICE  -> { room, players: [ { id, name, answers, finished, updatedAt } ] }
  POST   /api/quiz?room=CODICE  -> salva/aggiorna il record del giocatore e restituisce lo stato aggiornato
  DELETE /api/quiz?room=CODICE  -> azzera la partita

  Ogni giocatore ha il proprio blob (chiave "ROOM/playerId"): così due telefoni che
  rispondono nello stesso istante non si sovrascrivono a vicenda.
  Il server non conosce le risposte giuste: memorizza solo l'indice scelto e il
  punteggio viene calcolato dal client, che ha l'unica copia delle soluzioni.
*/

const MAX_PLAYERS = 200;
const MAX_ANSWERS = 50;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

const cleanRoom = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
const cleanId = (v) => String(v || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
const cleanName = (v) => String(v || '').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 20) || 'Anonimo';

function cleanAnswers(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const [k, v] of Object.entries(raw).slice(0, MAX_ANSWERS)) {
    const key = String(k).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
    const idx = Number(v);
    if (key && Number.isInteger(idx) && idx >= 0 && idx < 26) out[key] = idx;
  }
  return out;
}

const store = () => getStore({ name: 'quiz-party', consistency: 'strong' });

async function readPlayers(room) {
  const s = store();
  const { blobs } = await s.list({ prefix: `${room}/` });
  const records = await Promise.all(
    blobs.slice(0, MAX_PLAYERS).map((b) => s.get(b.key, { type: 'json' }).catch(() => null))
  );
  return records.filter(Boolean).sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
}

export default async function handler(req) {
  const url = new URL(req.url);
  const room = cleanRoom(url.searchParams.get('room'));
  if (!room) return json({ error: 'Parametro "room" mancante o non valido.' }, 400);

  try {
    if (req.method === 'GET') {
      return json({ room, players: await readPlayers(room) });
    }

    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: 'Corpo della richiesta non valido.' }, 400);
      }

      const playerId = cleanId(body.playerId);
      if (!playerId) return json({ error: 'Parametro "playerId" mancante.' }, 400);

      const key = `${room}/${playerId}`;
      const prev = await store().get(key, { type: 'json' }).catch(() => null);

      const record = {
        id: playerId,
        name: cleanName(body.name || (prev && prev.name)),
        answers: { ...(prev ? prev.answers : {}), ...cleanAnswers(body.answers) },
        finished: !!body.finished,
        createdAt: (prev && prev.createdAt) || Date.now(),
        updatedAt: Date.now()
      };

      await store().setJSON(key, record);
      return json({ room, player: record, players: await readPlayers(room) });
    }

    if (req.method === 'DELETE') {
      const s = store();
      const { blobs } = await s.list({ prefix: `${room}/` });
      await Promise.all(blobs.map((b) => s.delete(b.key)));
      return json({ room, deleted: blobs.length, players: [] });
    }

    return json({ error: 'Metodo non supportato.' }, 405);
  } catch (err) {
    return json({ error: 'Errore di archiviazione: ' + (err && err.message ? err.message : 'sconosciuto') }, 500);
  }
}

export const config = {
  path: '/api/quiz',
  method: ['GET', 'POST', 'DELETE']
};
