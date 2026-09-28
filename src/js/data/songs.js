/**
 * Base de datos local de canciones (mock para pruebas).
 * TODO: reemplazar por una fuente/API real de letras una vez se decida
 * cuál permite legalmente el uso necesario (ver sección 37 del diseño:
 * aspecto legal de las letras — no asumir que una fuente gratuita
 * permite copiar/almacenar/redistribuir letras).
 */
export const SONG_DB = [
  {
    title: "Color Esperanza", artist: "Diego Torres", genre: "pop",
    chorusWords: ["saber", "abrir", "cielo"],
    words: { saber: true, abrir: true, cielo: true, cerrar: false },
    famous: true,
    lyric: "Sé que hay en tus ojos con solo mirar\nQue estás cansado de andar y de andar\nY caminar girando siempre en un lugar\n\nSé que las ventanas se pueden abrir\ncambiar el aire depende de ti\nte ayudará, vale más poder reír\nque vivir con ese miedo atroz",
  },
  {
    title: "Color Esperanza (en vivo)", artist: "Diego Torres", genre: "pop",
    chorusWords: ["saber", "abrir", "cielo"],
    words: { saber: true, abrir: true, cielo: true },
    famous: true,
    lyric: "[versión en vivo]\nSé que hay en tus ojos con solo mirar\nQue estás cansado de andar y de andar",
  },
  {
    title: "Amor Eterno", artist: "Rocío Dúrcal", genre: "balada",
    chorusWords: ["amor", "corazón", "olvido"],
    words: { amor: true, "corazón": true, olvido: true },
    famous: true,
    lyric: "Tú eres la tristeza de mis ojos\nque lloran en silencio por tu amor\nme miro en el espejo y veo en mi rostro\nel tiempo que he sufrido por tu adiós",
  },
  {
    title: "Bailando", artist: "Enrique Iglesias", genre: "pop",
    chorusWords: ["bailando", "cuerpo", "amor"],
    words: { bailando: true, cuerpo: true, amor: true },
    famous: true,
    lyric: "Yo no tengo suerte con el amor\nSoy como el fuego, ay, me quemo yo\nBailando, bailando\nTu cuerpo y el mío llenando el vacío",
  },
  {
    title: "La Bicicleta", artist: "Carlos Vives & Shakira", genre: "pop",
    chorusWords: ["bicicleta", "sol", "playa"],
    words: { bicicleta: true, sol: true, playa: true },
    famous: true,
    lyric: "Se te acabó la timidez\nY empezó la temporada\nDe montar bicicleta\nContigo hasta la playa",
  },
  {
    title: "Despacito", artist: "Luis Fonsi", genre: "reggaeton",
    chorusWords: ["despacito", "piel", "cuerpo"],
    words: { despacito: true, piel: true, cuerpo: true },
    famous: true,
    lyric: "Despacito\nQuiero respirar tu cuello despacito\nDeja que te diga cosas al oído",
  },
  {
    title: "Gasolina", artist: "Daddy Yankee", genre: "reggaeton",
    chorusWords: ["gasolina", "bailar", "noche"],
    words: { gasolina: true, bailar: true, noche: true },
    famous: true,
    lyric: "A ella le gusta la gasolina\nDame más gasolina\nComo le encanta la gasolina\nDame más gasolina",
  },
  {
    title: "Vivir Mi Vida", artist: "Marc Anthony", genre: "salsa",
    chorusWords: ["vivir", "reír", "cantar"],
    words: { vivir: true, "reír": true, cantar: true },
    famous: true,
    lyric: "Voy a reír, voy a bailar\nVivir mi vida, la la la la\nVoy a reír, voy a gozar\nVivir mi vida, la la la la",
  },
  {
    title: "Entre Dos Tierras", artist: "Héroes del Silencio", genre: "rock",
    chorusWords: ["tierra", "razón", "olvido"],
    words: { tierra: true, "razón": true, olvido: true },
    famous: false,
    lyric: "No pidas más razón que sinrazón\nde algo que nunca la tuvo\nCuando decidas venirte a por mí\nsabrás que aquí me tuvo",
  },
];

// Los 5 géneros musicales más famosos/reconocidos (asunción: mezcla de
// géneros globales y latinos, ya que el juego está en español).
export const GENRES = ["pop", "rock", "reggaeton", "salsa", "balada"];

// Nombre visible de cada género (el id es interno, sin tildes).
const GENRE_NAMES = {
  pop: "Pop",
  rock: "Rock",
  reggaeton: "Reggaetón",
  salsa: "Salsa",
  balada: "Balada",
};

/** Nombre visible de un género a partir de su id ("reggaeton" -> "Reggaetón"). */
export function genreName(id) {
  return GENRE_NAMES[id] || id;
}
