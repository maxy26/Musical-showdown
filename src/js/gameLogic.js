import { state } from "./state.js";
import { SONG_DB } from "./data/songs.js";
import { weightedPick } from "./utils.js";
import { groupName, pickRepresentative } from "./groups.js";
import { effectiveRoundTime, effectiveMultipliers, attemptsPerRound, scoringRules } from "./screens/config/modes.js";
import { roundScoreChanges, roundValue } from "./scoring.js";
import { relayRules, relayStatus, relayPenaltyChanges } from "./relay.js";
import {
  roundRobinSequence, groupOrderSequence, newGroupMemory, pickGroupDuelPlayers,
  newClassicMemory, isBalanced, nextClassicMode, pickClassicPair, recordClassicDuel, applyRelayToMemory,
} from "./pairing.js";
import { render } from "./router.js";
import { playTick, efecto, nuevaRonda, cuenta, finTiempo } from "./sound.js";
import { loadSettings, cuentaValida } from "./settings.js";

/**
 * Elige una palabra ponderando por: nº de canciones disponibles que la
 * contienen, si aparece en el coro (mayor peso) y si esas canciones son
 * reconocibles/famosas (mayor peso). Ver diseño, sección 14.
 */
export function pickWeightedWord() {
  const c = state.config;
  // Las canciones no se bloquean: una ya cantada se puede volver a cantar
  // (decisión del usuario, 01-10-2026).
  const available = SONG_DB.filter((s) => c.genres.includes(s.genre));
  const wordScores = {};
  available.forEach((s) => {
    Object.keys(s.words).forEach((w) => {
      if (!s.words[w]) return;
      let weight = 1;
      if (s.chorusWords.includes(w)) weight += 3;
      if (s.famous) weight += 2;
      wordScores[w] = (wordScores[w] || 0) + weight;
    });
  });
  const words = Object.keys(wordScores);
  if (words.length === 0) return null;
  return weightedPick(words, words.map((w) => wordScores[w]));
}

/**
 * Duelo de Clásico entre `participants` (jugadores en Individual, nombres de
 * grupos en Grupal): avanza las fases al azar / con ventaja según el
 * equilibrio de puntos y elige con equilibrio de partidos (ver pairing.js).
 */
export function pickClassicDuel(participants) {
  const memory = state.classic;
  const mode = nextClassicMode(memory, isBalanced(participants.map((p) => state.scores[p] || 0)));
  const pair = pickClassicPair({
    participants, scores: state.scores, matches: state.matchCounts, memory, mode,
  });
  recordClassicDuel(memory, pair[0], pair[1], participants);
  return pair;
}

/**
 * Reinicia lo que se lleva de la partida para elegir los duelos: cuántos
 * jugó cada uno, cuántas veces cantó cada jugador (Grupal) y el avance del
 * orden de Alternativo 1. Se llama al empezar cada partida.
 */
export function resetMatchTracking() {
  state.matchCounts = {};
  state.singCounts = {};
  state.alt1 = { step: 0, memory: newGroupMemory() };
  state.classic = newClassicMemory();
  state.contrib = {};
  state.answerTimes = {};
  state.relays = {};
}

/** Quién responde ahora por el lado `side`: el compañero llamado con el comodín, el representante o el participante. */
export function currentSinger(side) {
  const r = state.round;
  return r.sub?.[side] || (side === "A" ? r.showA : r.showB) || (side === "A" ? r.participantA : r.participantB);
}

/** Intentos que le quedan al lado `side` en esta ronda (Infinity = sin límite). */
export function attemptsLeft(side) {
  return attemptsPerRound(state.config) - (state.round.attemptsUsed?.[side] || 0);
}

/** Qué pasa si `side` pide un relevo ahora ("blocked" / "ok" / "extra"; ver relay.js). */
export function relayCheck(side) {
  const rules = relayRules(state.config);
  if (!rules) return { status: "blocked" };
  const r = state.round;
  const team = side === "A" ? r.participantA : r.participantB;
  return relayStatus({ round: r, side, left: state.relays[team] ?? 0, rules, attemptsLeft: attemptsLeft(side) });
}

/**
 * Relevo: el lado `side` le pasa el turno a `substitute`, un compañero de su
 * equipo. Si es un relevo de más, en ese momento el equipo resta la mitad del
 * valor de la ronda y el rival suma esa misma mitad (la ronda sigue).
 *   - Alternativo 1: el que entra reemplaza al que pidió por el resto de la
 *     ronda; para los emparejamientos cuenta el que entró.
 *   - Alternativo 2 (comodín): el compañero responde una vez en lugar del
 *     representante; si falla, el turno vuelve al representante. Si todavía no
 *     respondió, otro compañero puede entrar en su lugar (cuenta como relevo).
 * @returns {Array|null} los cambios de puntos de la penalización, si hubo
 */
export function useRelay(side, substitute) {
  const r = state.round;
  const rules = relayRules(state.config);
  const check = relayCheck(side);
  if (!rules || check.status === "blocked") return null;
  const team = side === "A" ? r.participantA : r.participantB;

  if (check.status === "extra") efecto("falla"); // el relevo normal suena con el clic del botón
  let penalty = null;
  if (check.status === "extra") {
    // Relevo de más: penalización en el momento; no gasta del total ni del máximo por ronda.
    penalty = applyScoreChanges(relayPenaltyChanges(side, r.multiplier));
  } else {
    if (check.usesTotal) state.relays[team] = Math.max(0, (state.relays[team] ?? 0) - 1);
    r.relaysThisRound = { ...r.relaysThisRound, [side]: (r.relaysThisRound?.[side] || 0) + 1 };
  }

  if (rules.lifeline) {
    r.sub = { ...r.sub, [side]: substitute };
  } else {
    const g = side === "A" ? r.groupA : r.groupB;
    const requester = side === "A" ? r.showA : r.showB;
    const rival = side === "A" ? r.showB : r.showA;
    applyRelayToMemory(state.groups.map((x) => x.players), g, requester, substitute, rival, state.singCounts, state.alt1.memory);
    if (side === "A") r.showA = substitute; else r.showB = substitute;
  }
  return penalty;
}

export function startNextRound() {
  nuevaRonda();
  const c = state.config;
  const word = pickWeightedWord();
  // Multiplicadores y reloj según el modo (Clásico: ninguno de los dos).
  const multipliers = effectiveMultipliers(c);
  const roundTime = effectiveRoundTime(c);
  const mult =
    multipliers.length && Math.random() < 0.5
      ? multipliers[Math.floor(Math.random() * multipliers.length)]
      : null;

  const alt1 = c.mode === "alternativo1";
  const alt2 = c.mode === "alternativo2";
  let A, B, showA = null, showB = null, groupA = null, groupB = null;
  if (c.battleType === "individual") {
    if (alt1) {
      // Alternativo 1: orden fijo "primero contra último" que rota; al
      // terminar el ciclo vuelve a empezar (sin ventaja para nadie).
      const seq = roundRobinSequence(c.players.length);
      const [i, j] = seq[state.alt1.step % seq.length];
      state.alt1.step++;
      A = c.players[i];
      B = c.players[j];
    } else {
      [A, B] = pickClassicDuel(c.players);
    }
  } else {
    const names = state.groups.map((g, i) => groupName(g, i, c.groupTerm));
    let ia, ib;
    if (alt1) {
      // Alternativo 1: orden fijo de grupos y jugadores (ver pairing.js).
      const seq = groupOrderSequence(state.groups.length);
      [ia, ib] = seq[state.alt1.step % seq.length];
      state.alt1.step++;
      [showA, showB] = pickGroupDuelPlayers(
        state.groups.map((g) => g.players), ia, ib, state.singCounts, state.alt1.memory
      );
    } else if (alt2) {
      // Alternativo 2: los grupos se emparejan al azar como en Clásico y los
      // jugadores de cada grupo salen en orden como en Alternativo 1.
      const [na, nb] = pickClassicDuel(names);
      ia = names.indexOf(na);
      ib = names.indexOf(nb);
      [showA, showB] = pickGroupDuelPlayers(
        state.groups.map((g) => g.players), ia, ib, state.singCounts, state.alt1.memory
      );
    } else {
      // Clásico: qué grupos se enfrentan, con las mismas fases que en Individual.
      const [na, nb] = pickClassicDuel(names);
      ia = names.indexOf(na);
      ib = names.indexOf(nb);
      // Quién canta por cada grupo: al azar entre los que menos han participado.
      showA = pickRepresentative(state.groups[ia].players, state.singCounts);
      showB = pickRepresentative(state.groups[ib].players, state.singCounts);
      state.singCounts[showA] = (state.singCounts[showA] || 0) + 1;
      state.singCounts[showB] = (state.singCounts[showB] || 0) + 1;
    }
    A = names[ia];
    B = names[ib];
    groupA = ia; // posición del grupo, para usar su color en la ronda
    groupB = ib;
  }
  // Relevo (Grupal, Alternativo 1 y 2): cada equipo empieza con el total de la partida.
  const relays = relayRules(c);
  if (relays) {
    [A, B].forEach((n) => { if (state.relays[n] === undefined) state.relays[n] = relays.total; });
  }
  state.matchCounts[A] = (state.matchCounts[A] || 0) + 1;
  state.matchCounts[B] = (state.matchCounts[B] || 0) + 1;

  state.round = {
    participantA: A, participantB: B, showA, showB, groupA, groupB,
    word, multiplier: mult,
    timeLeft: roundTime, timerId: null, paused: false, phase: "intro",
    selected: null, lastResult: null,
    attemptsUsed: { A: 0, B: 0 }, // intentos fallidos de cada lado (ver attemptsLeft)
    elapsed: 0, // segundos de la ronda sin contar pausas (ver startTimer)
    answeredAt: { A: null, B: null }, // segundo en que se tocó el botón de cada lado
    attempted: { A: false, B: false }, // si el lado ya respondió en esta ronda
    relaysThisRound: { A: 0, B: 0 }, // relevos normales usados en esta ronda (los de más no cuentan)
    sub: { A: null, B: null }, // Alternativo 2: compañero llamado con el comodín que todavía no respondió
  };
  state.screen = "round";

  const segundos = cuentaValida(loadSettings().countdown);
  if (segundos > 0) { contarAntesDeLaRonda(segundos); return; }
  // Sin cuenta: presentación de 1,5 s ("A VS B") antes de iniciar el conteo.
  setTimeout(empezarConteo, 1500);
}

function empezarConteo() {
  if (state.screen !== "round") return;
  state.round.phase = "counting";
  render();
  startTimer();
}

/**
 * Cuenta antes de cada ronda (3, 2, 1…), configurable en Ajustes (usuario,
 * 06-10-2026). Una capa transparente con el número tapa la pantalla y no deja
 * tocar nada (ni la pausa) hasta que termina.
 */
function contarAntesDeLaRonda(segundos) {
  const capa = document.createElement("div");
  capa.className = "cuenta-capa";
  capa.innerHTML = `<div class="cuenta-num pop">${segundos}</div>`;
  const bloquear = (e) => { e.preventDefault(); e.stopPropagation(); };
  const EVENTOS = ["keydown", "click", "pointerdown"];
  EVENTOS.forEach((t) => document.addEventListener(t, bloquear, true));
  document.body.appendChild(capa);
  let quedan = segundos;
  setTimeout(() => cuenta(quedan), 60);
  const paso = () => {
    quedan--;
    if (quedan > 0) {
      const num = capa.querySelector(".cuenta-num");
      num.textContent = quedan;
      num.classList.remove("pop"); void num.offsetWidth; num.classList.add("pop"); // repite la animación
      cuenta(quedan);
      setTimeout(paso, 1000);
      return;
    }
    cuenta(0);
    EVENTOS.forEach((t) => document.removeEventListener(t, bloquear, true));
    capa.classList.add("is-closing");
    setTimeout(() => capa.remove(), 250);
    empezarConteo();
  };
  setTimeout(paso, 1000);
}

export function startTimer() {
  const c = state.config;
  const timed = effectiveRoundTime(c) > 0;
  clearInterval(state.round.timerId);
  // El intervalo corre siempre para contar los segundos de la ronda (sin las
  // pausas), que se usan para desempatar el MVP por velocidad. La cuenta
  // regresiva solo existe en los modos con tiempo (no en Clásico).
  state.round.timerId = setInterval(() => {
    if (state.round.paused) return;
    state.round.elapsed = (state.round.elapsed || 0) + 1;
    if (!timed) return; // sin reloj (Clásico o "Sin tiempo")
    state.round.timeLeft--;
    if (state.round.timeLeft <= 0) {
      clearInterval(state.round.timerId);
      timeOut();
      return;
    }
    playTick(state.round.timeLeft <= 5);
    updateClockOnly();
  }, 1000);
}

function updateClockOnly() {
  const clockEl = document.querySelector(".clock");
  if (!clockEl) return;
  const t = state.round.timeLeft;
  clockEl.classList.toggle("warn", t <= 5);
  clockEl.querySelector("span").textContent = t + "s";
}

/**
 * Aplica los puntos del final de la ronda según el modo (ver scoring.js) y
 * devuelve los cambios para mostrarlos: [{ who, delta, newScore }, …].
 * `winnerSide`: "A", "B" o null si nadie acertó.
 */
function applyRoundScores(winnerSide) {
  return applyScoreChanges(roundScoreChanges(scoringRules(state.config), winnerSide, state.round.multiplier));
}

/**
 * Suma `changes` ({A, B}) a los puntajes y devuelve los cambios para mostrarlos.
 * El cambio de cada grupo se le anota (MVP) a quien responde ahora por él: si
 * acertó un compañero llamado con el comodín, el aporte es de ese compañero.
 */
function applyScoreChanges(changes) {
  const r = state.round;
  return [["A", r.participantA], ["B", r.participantB]].map(([side, who]) => {
    state.scores[who] = (state.scores[who] || 0) + changes[side];
    const singer = r.sub?.[side] || (side === "A" ? r.showA : r.showB);
    if (singer) state.contrib[singer] = (state.contrib[singer] || 0) + changes[side];
    return { who, delta: changes[side], newScore: state.scores[who] };
  });
}

function timeOut() {
  finTiempo();
  state.round.lastResult = { type: "timeout", changes: applyRoundScores(null) };
  state.screen = "round-result";
  render();
}

export function finishRoundManual() {
  clearInterval(state.round.timerId);
  state.round.lastResult = { type: "finished", changes: applyRoundScores(null) };
  state.screen = "round-result";
  render();
}

export function resolveAnswer(correct) {
  const r = state.round;
  const side = r.selected;
  const who = side === "A" ? r.participantA : r.participantB;
  efecto(correct ? "acertar" : "fallar");

  if (correct) {
    clearInterval(r.timerId);
    // MVP: en qué segundo respondió el que acertó (para desempatar por velocidad).
    const singer = currentSinger(side);
    state.answerTimes[singer] = [...(state.answerTimes[singer] || []), r.answeredAt[side] || 0];
    const changes = applyRoundScores(side);
    r.lastResult = { type: "correct", who, pts: roundValue(r.multiplier), changes };
    state.screen = "round-result";
    render();
    return;
  }

  // Falló: gasta un intento. Si respondía un compañero llamado con el comodín,
  // el turno vuelve al representante.
  r.attemptsUsed = { ...r.attemptsUsed, [side]: (r.attemptsUsed?.[side] || 0) + 1 };
  r.sub = { ...r.sub, [side]: null };
  if (attemptsLeft("A") <= 0 && attemptsLeft("B") <= 0) {
    // Los dos agotaron sus intentos: la ronda termina como "nadie acertó".
    clearInterval(r.timerId);
    r.lastResult = { type: "both-failed", changes: applyRoundScores(null) };
    state.screen = "round-result";
  } else {
    r.lastResult = { type: "incorrect", who, left: attemptsLeft(side) };
    state.screen = "round-result-incorrect";
  }
  render();
}
