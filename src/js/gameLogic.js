import { state } from "./state.js";
import { SONG_DB } from "./data/songs.js";
import { weightedPick } from "./utils.js";
import { groupName, pickRepresentative } from "./groups.js";
import { effectiveRoundTime, effectiveMultipliers } from "./screens/config/modes.js";
import { roundScoreChanges, roundValue } from "./scoring.js";
import {
  roundRobinSequence, groupOrderSequence, newGroupMemory, pickGroupDuelPlayers,
  newClassicMemory, isBalanced, nextClassicMode, pickClassicPair, recordClassicDuel,
} from "./pairing.js";
import { render } from "./router.js";
import { playTick } from "./sound.js";

export function songKey(s) {
  return (s.title + "|" + s.lyric).trim();
}
export function isSongUsed(s) {
  return state.usedSongs.includes(songKey(s));
}

/**
 * Elige una palabra ponderando por: nº de canciones disponibles que la
 * contienen, si aparece en el coro (mayor peso) y si esas canciones son
 * reconocibles/famosas (mayor peso). Ver diseño, sección 14.
 */
export function pickWeightedWord() {
  const c = state.config;
  const available = SONG_DB.filter((s) => c.genres.includes(s.genre) && !isSongUsed(s));
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
}

export function startNextRound() {
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
    } else {
      // Clásico (y, por ahora, Alternativo 2, que aún no tiene reglas):
      // qué grupos se enfrentan, con las mismas fases que en Individual.
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
  state.matchCounts[A] = (state.matchCounts[A] || 0) + 1;
  state.matchCounts[B] = (state.matchCounts[B] || 0) + 1;

  state.round = {
    participantA: A, participantB: B, showA, showB, groupA, groupB,
    word, multiplier: mult,
    timeLeft: roundTime, timerId: null, paused: false, phase: "intro",
    selected: null, lastResult: null,
    failed: { A: false, B: false }, // Clásico: qué lado ya usó su único intento
    elapsed: 0, // segundos de la ronda sin contar pausas (ver startTimer)
    answeredAt: { A: null, B: null }, // segundo en que se tocó el botón de cada lado
  };
  state.screen = "round";

  // Presentación de 3s (palabra + multiplicador) antes de iniciar el conteo.
  setTimeout(() => {
    if (state.screen !== "round") return;
    state.round.phase = "counting";
    render();
    startTimer();
  }, 1500);
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
  const r = state.round;
  const changes = roundScoreChanges(state.config.mode, winnerSide, r.multiplier);
  return [["A", r.participantA], ["B", r.participantB]].map(([side, who]) => {
    state.scores[who] = (state.scores[who] || 0) + changes[side];
    // MVP (Grupal): el cambio de puntos del grupo se le anota a quien cantó por él.
    const singer = side === "A" ? r.showA : r.showB;
    if (singer) state.contrib[singer] = (state.contrib[singer] || 0) + changes[side];
    return { who, delta: changes[side], newScore: state.scores[who] };
  });
}

function timeOut() {
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

/**
 * ¿Hay un solo intento por jugador o equipo en cada ronda? Solo en Clásico
 * (definido por el usuario el 30-09-2026). En Alternativo 1 los intentos son
 * ilimitados; Alternativo 2 todavía no tiene reglas y sigue sin límite.
 */
export function hasSingleAttempt(mode) {
  return mode === "clasico";
}

export function resolveAnswer(correct) {
  const r = state.round;
  const who = r.selected === "A" ? r.participantA : r.participantB;

  if (correct) {
    clearInterval(r.timerId);
    state.usedSongs.push(songKey(state.verify.selectedSong));
    // MVP: en qué segundo respondió el que acertó (para desempatar por velocidad).
    const singer = (r.selected === "A" ? r.showA : r.showB) || who;
    state.answerTimes[singer] = [...(state.answerTimes[singer] || []), r.answeredAt[r.selected] || 0];
    const changes = applyRoundScores(r.selected);
    r.lastResult = { type: "correct", who, pts: roundValue(r.multiplier), changes };
    state.screen = "round-result";
  } else if (hasSingleAttempt(state.config.mode)) {
    // Clásico: ese lado ya usó su único intento. Si los dos fallaron, la
    // ronda termina de inmediato con 0 para ambos.
    r.failed = { ...r.failed, [r.selected]: true };
    if (r.failed.A && r.failed.B) {
      clearInterval(r.timerId);
      r.lastResult = { type: "both-failed", changes: applyRoundScores(null) };
      state.screen = "round-result";
    } else {
      r.lastResult = { type: "incorrect", who };
      state.screen = "round-result-incorrect";
    }
  } else {
    r.lastResult = { type: "incorrect", who };
    state.screen = "round-result-incorrect";
  }
  render();
}
