import { state } from "./state.js";
import { SONG_DB } from "./data/songs.js";
import { weightedPick } from "./utils.js";
import { groupName, pickGroupPairTemporary, pickRepresentative } from "./groups.js";
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
 * Elige el enfrentamiento individual. Los jugadores con menos puntaje
 * tienen mayor probabilidad de ser elegidos, para mantener el equilibrio
 * (diseño, sección 2).
 */
export function pickIndividualPair() {
  const players = state.config.players;
  if (players.length === 2) return [players[0], players[1]];
  const maxScore = Math.max(...players.map((p) => state.scores[p]));
  const weights = players.map((p) => Math.max(1, maxScore - state.scores[p] + 5));
  const a = weightedPick(players, weights);
  const bCandidates = players.filter((p) => p !== a);
  const bWeights = bCandidates.map((p) => Math.max(1, maxScore - state.scores[p] + 5));
  const b = weightedPick(bCandidates, bWeights);
  return [a, b];
}

export function startNextRound() {
  const c = state.config;
  const word = pickWeightedWord();
  const mult =
    c.multipliers.length && Math.random() < 0.5
      ? c.multipliers[Math.floor(Math.random() * c.multipliers.length)]
      : null;

  let A, B, showA = null, showB = null, groupA = null, groupB = null;
  if (c.battleType === "individual") {
    [A, B] = pickIndividualPair();
  } else {
    // Qué grupos se enfrentan: REGLA TEMPORAL (al azar con equilibrio de
    // partidos) hasta programar las reglas de Clásico y Alternativo 1.
    const names = state.groups.map((g, i) => groupName(g, i, c.groupTerm));
    const [ia, ib] = pickGroupPairTemporary(names.map((n) => state.matchCounts[n] || 0));
    A = names[ia];
    B = names[ib];
    groupA = ia; // posición del grupo, para usar su color en la ronda
    groupB = ib;
    // Quién canta por cada grupo: al azar entre los que menos han participado.
    showA = pickRepresentative(state.groups[ia].players, state.singCounts);
    showB = pickRepresentative(state.groups[ib].players, state.singCounts);
    state.singCounts[showA] = (state.singCounts[showA] || 0) + 1;
    state.singCounts[showB] = (state.singCounts[showB] || 0) + 1;
  }
  state.matchCounts[A] = (state.matchCounts[A] || 0) + 1;
  state.matchCounts[B] = (state.matchCounts[B] || 0) + 1;

  state.round = {
    participantA: A, participantB: B, showA, showB, groupA, groupB,
    word, multiplier: mult,
    timeLeft: c.roundTime, timerId: null, paused: false, phase: "intro",
    selected: null, lastResult: null,
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
  if (c.roundTime === 0) return; // sin tiempo
  clearInterval(state.round.timerId);
  state.round.timerId = setInterval(() => {
    if (state.round.paused) return;
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

function timeOut() {
  state.round.lastResult = { type: "timeout" };
  state.screen = "round-result";
  render();
}

export function finishRoundManual() {
  clearInterval(state.round.timerId);
  state.round.lastResult = { type: "finished" };
  state.screen = "round-result";
  render();
}

export function resolveAnswer(correct) {
  const r = state.round;
  const who = r.selected === "A" ? r.participantA : r.participantB;

  if (correct) {
    const base = 100; // sin multiplicador, la ronda suma de 100 en 100
    const pts = base * (r.multiplier || 1);
    state.scores[who] += pts;
    state.usedSongs.push(songKey(state.verify.selectedSong));
    r.lastResult = { type: "correct", who, pts, newScore: state.scores[who] };
    state.screen = "round-result";
  } else {
    r.lastResult = { type: "incorrect" };
    state.screen = "round-result-incorrect";
  }
  render();
}
