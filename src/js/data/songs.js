/**
 * Catálogo de canciones (usuario, 12-10-2026): **sin letra**. De cada canción
 * se guarda solo el nombre, el artista, el género, si es famosa y palabras
 * sueltas de su parte más conocida (el coro o lo que todos cantan):
 *   - `clave`: la palabra propia de esa canción, la más reconocible
 *     ("despacito", "gasolina", "kuduro").
 *   - `palabras`: otras palabras de la parte famosa; varias se comparten con
 *     otras canciones ("bailando", "cabeza", "reggaetón").
 * La mitad de las rondas sale una palabra clave y la otra mitad una
 * compartida (gameLogic.js → pickWeightedWord).
 * Las listas se arman y el usuario las revisa de a 20 antes de que
 * entren (PENDIENTES.md, "Catálogo grande sin letras"). Meta: las 100 mejores
 * de cada género, en español. Las canciones de los géneros que todavía no
 * tienen su tanda quedan como ejemplo.
 */
import { EDICION } from "../version.js";

const c = (title, artist, genre, clave, palabras = [], famous = true) => ({ title, artist, genre, famous, clave, palabras });

export const SONG_DB = [
  // ---------- Reggaetón (tanda 1, revisada por el usuario el 12-10-2026) ----------
  c("Despacito", "Luis Fonsi ft. Daddy Yankee", "reggaeton", "despacito", ["besos", "bailar", "pasito", "suavecito", "cuello"]),
  c("Gasolina", "Daddy Yankee", "reggaeton", "gasolina", ["dame", "encanta"]),
  c("Danza Kuduro", "Don Omar ft. Lucenzo", "reggaeton", "kuduro", ["cabeza", "cintura", "vuelta"]),
  c("Lo Que Pasó, Pasó", "Daddy Yankee", "reggaeton", "pasó"),
  c("Tusa", "Karol G ft. Nicki Minaj", "reggaeton", "tusa", ["amiga", "excusa"]),
  c("Con Calma", "Daddy Yankee ft. Snow", "reggaeton", "calma", ["mueve"]),
  c("Mi Gente", "J Balvin ft. Willy William", "reggaeton", "gente", ["música", "ritmo", "cabeza"]),
  c("Felices los 4", "Maluma", "reggaeton", "felices", ["cuatro"]),
  c("Hawái", "Maluma", "reggaeton", "hawái", ["foto"]),
  c("Ginza", "J Balvin", "reggaeton", "ginza", ["reggaetón", "dale"]),
  c("Échame la Culpa", "Luis Fonsi ft. Demi Lovato", "reggaeton", "culpa"),
  c("Chantaje", "Shakira ft. Maluma", "reggaeton", "chantaje", ["quieras"]),
  c("Súbeme la Radio", "Enrique Iglesias ft. Descemer Bueno y Zion & Lennox", "reggaeton", "radio", ["súbeme", "canción"]),
  c("Reggaetón Lento", "CNCO", "reggaeton", "lento", ["reggaetón"]),
  c("El Perdón", "Nicky Jam ft. Enrique Iglesias", "reggaeton", "perdón", ["verdad", "casando"]),
  c("Hasta el Amanecer", "Nicky Jam", "reggaeton", "amanecer"),
  c("Tití Me Preguntó", "Bad Bunny", "reggaeton", "tití", ["novias"]),
  c("Me Porto Bonito", "Bad Bunny ft. Chencho Corleone", "reggaeton", "bonito"),
  c("Dile", "Don Omar", "reggaeton", "dile", ["bailando"]),
  c("Rompe", "Daddy Yankee", "reggaeton", "rompe"),

  // ---------- Pop (tanda 2, aprobada por el usuario el 12-10-2026) ----------
  c("Bailando", "Enrique Iglesias ft. Descemer Bueno y Gente de Zona", "pop", "bailando", ["cuerpo", "vacío"]),
  c("La Bicicleta", "Carlos Vives y Shakira", "pop", "bicicleta"),
  c("Color Esperanza", "Diego Torres", "pop", "esperanza", ["saber", "cara", "futuro", "corazón"]),
  c("Corazón Partío", "Alejandro Sanz", "pop", "partío", ["corazón", "noche", "frío", "emociones"]),
  c("La Tortura", "Shakira ft. Alejandro Sanz", "pop", "tortura", ["invierno", "rosal"]),
  c("María", "Ricky Martin", "pop", "maría", ["pasito"]),
  c("Me Enamoré", "Shakira", "pop", "enamoré"),
  c("A Dios le Pido", "Juanes", "pop", "pido", ["ojos", "mirada", "madre"]),
  c("La Camisa Negra", "Juanes", "pop", "camisa", ["negra", "alma", "luto"]),
  c("Tacones Rojos", "Sebastián Yatra", "pop", "tacones", ["rojos"]),
  c("Robarte un Beso", "Carlos Vives y Sebastián Yatra", "pop", "robarte", ["beso"]),
  c("Waka Waka (Esto es África)", "Shakira", "pop", "waka", ["áfrica", "vamos"]),
  c("Andas en Mi Cabeza", "Chino y Nacho ft. Daddy Yankee", "pop", "andas", ["cabeza"]),
  c("Cómo Mirarte", "Sebastián Yatra", "pop", "mirarte"),
  c("Vente Pa' Ca", "Ricky Martin ft. Maluma", "pop", "vente"),
  c("Mi Persona Favorita", "Alejandro Sanz y Camila Cabello", "pop", "favorita", ["persona"]),
  c("La Gozadera", "Gente de Zona ft. Marc Anthony", "pop", "gozadera", ["miami"]),
  c("Hijo de la Luna", "Mecano", "pop", "hijo", ["luna", "gitana", "amanecer", "madre"]),
  c("Bulería", "David Bisbal", "pop", "bulería"),
  c("Rosas", "La Oreja de Van Gogh", "pop", "rosas"),

  // ---------- Rock en español (tanda 3, aprobada por el usuario el 12-10-2026) ----------
  c("De Música Ligera", "Soda Stereo", "rock", "ligera", ["música", "amor"]),
  c("Persiana Americana", "Soda Stereo", "rock", "persiana", ["americana"]),
  c("Cuando Pase el Temblor", "Soda Stereo", "rock", "temblor"),
  c("Lamento Boliviano", "Enanitos Verdes", "rock", "boliviano", ["loco", "corazón"]),
  c("La Muralla Verde", "Enanitos Verdes", "rock", "muralla", ["verde"]),
  c("Clavado en un Bar", "Maná", "rock", "clavado", ["bar"]),
  c("Rayando el Sol", "Maná", "rock", "rayando", ["sol", "desesperación"]),
  c("En el Muelle de San Blas", "Maná", "rock", "muelle", ["sola", "olvido"]),
  c("Labios Compartidos", "Maná", "rock", "labios", ["compartidos"]),
  c("Oye Mi Amor", "Maná", "rock", "oye", ["amor"]),
  c("Mariposa Traicionera", "Maná", "rock", "mariposa", ["traicionera"]),
  c("Entre Dos Tierras", "Héroes del Silencio", "rock", "tierras", ["aire", "respirar"]),
  c("La Flaca", "Jarabe de Palo", "rock", "flaca"),
  c("Mil Horas", "Los Abuelos de la Nada", "rock", "horas", ["mil"]),
  c("Florecita Rockera", "Aterciopelados", "rock", "florecita", ["rockera"]),
  c("Tren al Sur", "Los Prisioneros", "rock", "tren", ["sur", "viaje"]),
  c("El Baile de los que Sobran", "Los Prisioneros", "rock", "sobran", ["baile", "piedras"]),
  c("Kumbala", "La Maldita Vecindad", "rock", "kumbala", ["pasión", "música", "pareja"]),
  c("La Negra Tomasa", "Caifanes", "rock", "tomasa", ["negra"]),
  c("Me Gustas Tú", "Manu Chao", "rock", "gustas", ["aviones", "viajar"]),

  // Desde aquí, tandas armadas y cargadas sin revisión una por una
  // (usuario, 12-10-2026: "hazlo igual con los demás géneros hasta que te
  // pida retomar ese pendiente"). El usuario las revisa al retomarlo.

  // ---------- Salsa (tanda 4) ----------
  c("Vivir Mi Vida", "Marc Anthony", "salsa", "vivir", ["reír", "bailar", "gozar"]),
  c("La Vida Es un Carnaval", "Celia Cruz", "salsa", "carnaval", ["vida", "llorar"]),
  c("Quimbara", "Celia Cruz", "salsa", "quimbara"),
  c("Ríe y Llora", "Celia Cruz", "salsa", "ríe", ["llora"]),
  c("Pedro Navaja", "Rubén Blades", "salsa", "navaja", ["sorpresas", "vida"]),
  c("Idilio", "Willie Colón", "salsa", "idilio"),
  c("Llorarás", "Oscar D'León", "salsa", "llorarás"),
  c("Qué Locura Enamorarme de Ti", "Eddie Santiago", "salsa", "locura", ["enamorarme"]),
  c("Aguanile", "Héctor Lavoe y Willie Colón", "salsa", "aguanile"),
  c("El Cantante", "Héctor Lavoe", "salsa", "cantante"),
  c("Periódico de Ayer", "Héctor Lavoe", "salsa", "periódico", ["ayer"]),
  c("Valió la Pena", "Marc Anthony", "salsa", "pena", ["valió"]),
  c("Te Conozco Bien", "Marc Anthony", "salsa", "conozco"),
  c("La Rebelión", "Joe Arroyo", "salsa", "rebelión", ["negra"]),
  c("En Barranquilla Me Quedo", "Joe Arroyo", "salsa", "barranquilla", ["quedo"]),
  c("Cali Pachanguero", "Grupo Niche", "salsa", "pachanguero", ["cali"]),
  c("Una Aventura", "Grupo Niche", "salsa", "aventura"),
  c("Conciencia", "Gilberto Santa Rosa", "salsa", "conciencia"),
  c("Cuenta Conmigo", "Jerry Rivera", "salsa", "cuenta"),
  c("Desnúdate Mujer", "Frankie Ruiz", "salsa", "mujer"),

  // ---------- Balada (tanda 5) ----------
  c("Amor Eterno", "Rocío Dúrcal", "balada", "eterno", ["tristeza", "ojos", "amor"]),
  c("Hasta Que Te Conocí", "Juan Gabriel", "balada", "conocí", ["amor", "vida", "dolor"]),
  c("Querida", "Juan Gabriel", "balada", "querida"),
  c("Mientes", "Camila", "balada", "mientes", ["tiempo", "busca", "llegas"]),
  c("Todo Cambió", "Camila", "balada", "cambió", ["amor", "decir"]),
  c("Me Va a Extrañar", "Ricardo Montaner", "balada", "extrañar", ["despertar", "suspirar", "jardín"]),
  c("Tengo Todo Excepto a Ti", "Luis Miguel", "balada", "excepto", ["amor", "tengo"]),
  c("La Incondicional", "Luis Miguel", "balada", "incondicional", ["amar", "espera"]),
  c("Ahora Te Puedes Marchar", "Luis Miguel", "balada", "marchar", ["amar", "puedes"]),
  c("Por Debajo de la Mesa", "Luis Miguel", "balada", "mesa", ["sentir", "sabes"]),
  c("Inolvidable", "Luis Miguel", "balada", "inolvidable", ["amor", "alegría", "mentira"]),
  c("Hoy Tengo Ganas de Ti", "Alejandro Fernández ft. Christina Aguilera", "balada", "ganas", ["quiero", "manos", "camino"]),
  c("Abrázame", "Julio Iglesias", "balada", "abrázame", ["vas", "quisieras"]),
  c("Me Olvidé de Vivir", "Julio Iglesias", "balada", "olvidé", ["vivir", "viento", "sueños"]),
  c("Bésame Mucho", "Consuelo Velázquez", "balada", "bésame", ["noche", "mucho", "perderte"]),
  c("Contigo Aprendí", "Armando Manzanero", "balada", "aprendí"),
  c("Tu Cárcel", "Marco Antonio Solís", "balada", "cárcel", ["cariño"]),
  c("Si No Te Hubieras Ido", "Marco Antonio Solís", "balada", "hubieras", ["vivir", "espera", "frío"]),
  c("Azul", "Cristian Castro", "balada", "azul", ["amor", "mar", "ilusión"]),
  c("No Me Doy por Vencido", "Luis Fonsi", "balada", "vencido", ["esperar"]),

  // ---------- Cumbia (tanda 6) ----------
  c("La Pollera Colorá", "Pedro Salcedo y Wilson Choperena", "cumbia", "pollera", ["colorá", "baila", "tambores"]),
  c("La Cumbia Sampuesana", "José Barros", "cumbia", "sampuesana", ["bailan", "ganas", "muévete"]),
  c("La Cumbia Cienaguera", "Luis Enrique Martínez", "cumbia", "cienaguera", ["mañana"]),
  c("Colombia Tierra Querida", "Lucho Bermúdez", "cumbia", "colombia", ["cantando", "viviré", "tierra"]),
  c("La Colegiala", "Rodolfo y su Típica", "cumbia", "colegiala", ["coqueta", "libros"]),
  c("Cariñito", "Los Hijos del Sol", "cumbia", "cariñito", ["lloro", "amarte", "vida"]),
  c("Cómo Te Voy a Olvidar", "Los Ángeles Azules", "cumbia", "olvidar", ["estás", "voy"]),
  c("17 Años", "Los Ángeles Azules", "cumbia", "años", ["amor"]),
  c("El Listón de Tu Pelo", "Los Ángeles Azules", "cumbia", "listón", ["pelo", "olvida", "vanidad", "orgullo"]),
  c("Nunca Es Suficiente", "Los Ángeles Azules ft. Natalia Lafourcade", "cumbia", "suficiente", ["enamorar", "jugando"]),
  c("No Me Arrepiento de Este Amor", "Gilda", "cumbia", "arrepiento", ["amor", "corazón", "cueste", "quiero"]),
  c("Fuiste", "Gilda", "cumbia", "fuiste", ["perdiste"]),
  c("Se Me Ha Perdido un Corazón", "Gilda", "cumbia", "perdido", ["corazón", "devuelva", "puerta"]),
  c("Corazón Valiente", "Gilda", "cumbia", "valiente", ["corazón", "tengo", "quererte"]),
  c("Juana la Cubana", "Fito Olivares", "cumbia", "juana", ["cubana", "bailen", "ritmo"]),
  c("Baila Esta Cumbia", "Selena", "cumbia", "cumbia", ["baila", "ritmo", "cintura"]),
  c("Bidi Bidi Bom Bom", "Selena", "cumbia", "bidi", ["emociona", "razona"]),
  c("Como la Flor", "Selena", "cumbia", "flor", ["duele", "amor", "perder"]),
  c("Amor Prohibido", "Selena", "cumbia", "prohibido", ["amor", "murmuran", "calles"]),
  c("Cumbia Sobre el Río", "Celso Piña", "cumbia", "río", ["acordeona", "suena", "emociona"]),

  // ---------- Bachata (tanda 7) ----------
  c("Propuesta Indecente", "Romeo Santos", "bachata", "propuesta", ["aventura"]),
  c("Corazón Sin Cara", "Prince Royce", "bachata", "cara", ["corazón"]),
  c("Eres Mía", "Romeo Santos", "bachata", "mía"),
  c("Imitadora", "Romeo Santos", "bachata", "imitadora", ["dime"]),
  c("Llévame Contigo", "Romeo Santos", "bachata", "llévame"),
  c("Odio", "Romeo Santos ft. Drake", "bachata", "odio", ["tiempo"]),
  c("Frío, Frío", "Juan Luis Guerra", "bachata", "frío", ["agua", "río", "fuente"]),
  c("La Diabla", "Romeo Santos", "bachata", "diabla", ["revancha", "barajas"]),
  c("Obsesión", "Aventura", "bachata", "obsesión", ["amor", "loco", "corazón"]),
  c("Hermanita", "Aventura", "bachata", "hermanita", ["lloras"]),
  c("Dile al Amor", "Aventura", "bachata", "dile", ["amor"]),
  c("Mi Corazoncito", "Aventura", "bachata", "corazoncito", ["soñar", "déjenme"]),
  c("El Perdedor", "Aventura", "bachata", "perdedor"),
  c("Inmortal", "Aventura", "bachata", "inmortal", ["amo", "siento", "entender"]),
  c("Cuándo Volverás", "Aventura", "bachata", "volverás", ["dime"]),
  c("Darte un Beso", "Prince Royce", "bachata", "darte", ["beso", "quiero", "falte", "nada"]),
  c("Las Cosas Pequeñas", "Prince Royce", "bachata", "pequeñas", ["cosas", "quiero"]),
  c("Bachata en Fukuoka", "Juan Luis Guerra", "bachata", "fukuoka", ["bachata", "cantar", "alegra", "nota"]),
  c("Bachata Rosa", "Juan Luis Guerra", "bachata", "rosa", ["bachata", "amor", "calor", "sol"]),
  c("Burbujas de Amor", "Juan Luis Guerra", "bachata", "burbujas", ["pez", "pecera"]),
  c("Te Extraño", "Xtreme", "bachata", "extraño", ["estoy", "sufriendo", "sentir"]),

  // ---------- Merengue (tanda 8) ----------
  c("La Bilirrubina", "Juan Luis Guerra", "merengue", "bilirrubina", ["sube", "miras"]),
  c("Ojalá Que Llueva Café", "Juan Luis Guerra", "merengue", "café", ["llueva", "campo"]),
  c("El Niágara en Bicicleta", "Juan Luis Guerra", "merengue", "niágara", ["bicicleta"]),
  c("A Pedir Su Mano", "Juan Luis Guerra", "merengue", "mano", ["viene", "quiera", "palos"]),
  c("Visa Para un Sueño", "Juan Luis Guerra", "merengue", "visa", ["sueño", "buscando", "razón", "volver"]),
  c("Las Avispas", "Juan Luis Guerra", "merengue", "avispas", ["piquen", "cara", "señor"]),
  c("El Costo de la Vida", "Juan Luis Guerra", "merengue", "costo", ["vida", "peso", "pie"]),
  c("La Cosquillita", "Juan Luis Guerra", "merengue", "cosquillita", ["pinta", "rosa"]),
  c("Suavemente", "Elvis Crespo", "merengue", "suavemente", ["bésame", "labios", "sentir"]),
  c("Tu Sonrisa", "Elvis Crespo", "merengue", "sonrisa", ["cara", "fascina", "vida"]),
  c("Píntame", "Elvis Crespo", "merengue", "píntame", ["carita", "corazón", "pinta"]),
  c("La Dueña del Swing", "Los Hermanos Rosario", "merengue", "swing"),
  c("Rompecintura", "Los Hermanos Rosario", "merengue", "rompecintura", ["baila", "cadera", "cintura"]),
  c("El Baile del Perrito", "Wilfrido Vargas", "merengue", "perrito", ["baile"]),
  c("El Jardinero", "Wilfrido Vargas", "merengue", "jardinero", ["caes", "caer"]),
  c("El Tiburón", "Proyecto Uno", "merengue", "tiburón", ["pares", "sigue"]),
  c("El Africano", "Wilfrido Vargas", "merengue", "africano", ["mami", "quiere"]),
  c("Pégame Tu Vicio", "Eddy Herrera", "merengue", "pégame", ["vicio", "labios"]),
  c("Volvió Juanita", "Milly Quezada", "merengue", "juanita", ["volvió", "celebrar", "fiestecita"]),
  c("Compadre Pedro Juan", "Luis Alberti", "merengue", "compadre", ["baile", "jaleo", "sabroso"]),

  // ---------- Regional mexicano (tanda 9) ----------
  c("El Rey", "Vicente Fernández", "regional", "rey", ["dinero"]),
  c("Volver, Volver", "Vicente Fernández", "regional", "volver", ["brazos", "perder"]),
  c("Hermoso Cariño", "Vicente Fernández", "regional", "cariño", ["dios", "niño", "mandado"]),
  c("Mujeres Divinas", "Vicente Fernández", "regional", "divinas", ["mujeres", "camino", "queda", "adorar"]),
  c("Por Tu Maldito Amor", "Vicente Fernández", "regional", "amor", ["penas", "terminar"]),
  c("Cielito Lindo", "Tradicional mexicana", "regional", "cielito", ["llores", "canta", "corazones", "alegran"]),
  c("México Lindo y Querido", "Jorge Negrete", "regional", "méxico", ["digan", "traigan", "estoy"]),
  c("La Bikina", "Rubén Fuentes", "regional", "bikina"),
  c("Si Nos Dejan", "José Alfredo Jiménez", "regional", "dejan", ["cielo", "nubes", "mano"]),
  c("Ella", "José Alfredo Jiménez", "regional", "rogarle"),
  c("La Media Vuelta", "José Alfredo Jiménez", "regional", "media", ["vuelta", "quiero"]),
  c("Paloma Negra", "Lola Beltrán", "regional", "paloma", ["negra"]),
  c("Un Puño de Tierra", "Antonio Aguilar", "regional", "puño", ["tierra", "gusto", "llevarme", "voy"]),
  c("La Puerta Negra", "Los Tigres del Norte", "regional", "puerta", ["negra", "quiero", "quieres"]),
  c("La Bamba", "Tradicional mexicana", "regional", "bamba"),
  c("Golpes en el Corazón", "Los Tigres del Norte", "regional", "golpes", ["corazón", "promesas", "amor"]),
  c("Mi Credo", "K-Paz de la Sierra", "regional", "credo"),
  c("El Sinaloense", "Banda El Recodo", "regional", "sinaloense", ["sinaloa"]),
  c("La Chona", "Los Tucanes de Tijuana", "regional", "chona", ["mueve"]),

  // ---------- Trap y urbano (tanda 10) ----------
  c("Mañana Será Bonito", "Karol G", "urbano", "mañana", ["bonito", "nadie", "brillo"]),
  c("Shakira: Bzrp Music Sessions, Vol. 53", "Bizarrap ft. Shakira", "urbano", "facturan", ["lloran", "tipos", "igualita"]),
  c("Quevedo: Bzrp Music Sessions, Vol. 52", "Bizarrap ft. Quevedo", "urbano", "quédate", ["noches", "contigo"]),
  c("Columbia", "Quevedo", "urbano", "columbia"),
  c("Ojitos Lindos", "Bad Bunny ft. Bomba Estéreo", "urbano", "ojitos", ["lindos"]),
  c("Te Felicito", "Shakira ft. Rauw Alejandro", "urbano", "felicito", ["bien"]),
  c("Adán y Eva", "Paulo Londra", "urbano", "adán", ["eva", "noche", "palabras", "pecado"]),
  c("Nena Maldición", "Paulo Londra", "urbano", "nena"),
  c("Si Antes Te Hubiera Conocido", "Karol G", "urbano", "conocido", ["hubiera", "amigos"]),
  c("Ay, Dios Mío!", "Karol G", "urbano", "dios", ["mío", "rico"]),
  c("Mayores", "Becky G ft. Bad Bunny", "urbano", "mayores", ["grandes", "loca"]),
  c("Tal Vez", "Paulo Londra", "urbano", "vez", ["divertirse", "triste"]),
  c("Nublado", "Paulo Londra", "urbano", "nublado", ["ahora", "ambiente"]),
  c("Baila Baila Baila", "Ozuna", "urbano", "baila", ["esto"]),
  c("Vaina Loca", "Ozuna y Manuel Turizo", "urbano", "vaina"),
  c("Mi Cama", "Karol G", "urbano", "cama", ["suena"]),
  c("Una Lady Como Tú", "Manuel Turizo", "urbano", "lady", ["quiero"]),
  c("La Bachata", "Manuel Turizo", "urbano", "bachata", ["pido"]),];

/** Todas las palabras que se pueden pedir de una canción: la clave y las demás. */
export function palabrasDe(cancion) {
  return [cancion.clave, ...(cancion.palabras || [])];
}
// Los 10 géneros del catálogo, todos con canciones en español (usuario, 12-10-2026).
export const GENRES = ["pop", "rock", "reggaeton", "salsa", "balada", "cumbia", "bachata", "merengue", "regional", "urbano"];

// Nombre visible de cada género (el id es interno, sin tildes).
const GENRE_NAMES = {
  pop: "Pop",
  rock: "Rock en español",
  reggaeton: "Reggaetón",
  salsa: "Salsa",
  balada: "Balada",
  cumbia: "Cumbia",
  bachata: "Bachata",
  merengue: "Merengue",
  regional: "Regional mexicano",
  urbano: "Trap y urbano",
};

/** Nombre visible de un género a partir de su id ("reggaeton" -> "Reggaetón"). */
export function genreName(id) {
  return GENRE_NAMES[id] || id;
}

/** Géneros de la demo gratis (usuario, 25-10-2026); la propia y la oficial traen los 10. */
export const GENRES_DEMO = ["pop", "rock", "reggaeton"];

/** Géneros que tienen al menos una canción (los que marca "Todos"); la demo solo trae GENRES_DEMO. */
export function availableGenres(edicion = EDICION) {
  const permitidos = edicion === "demo" ? GENRES_DEMO : GENRES;
  return permitidos.filter((g) => SONG_DB.some((s) => s.genre === g));
}

/** Artista principal, sin los invitados ("Luis Fonsi ft. Daddy Yankee" → "Luis Fonsi"). */
export function artistaPrincipal(artista) {
  return artista.split(/\s+ft\.\s+/i)[0].trim();
}

/** Artistas de ejemplo de un género, sin repetir y sin invitados (para la hoja "Más"). */
export function genreArtists(id, max = 4) {
  const artists = [...new Set(SONG_DB.filter((s) => s.genre === id).map((s) => artistaPrincipal(s.artist)))];
  return artists.slice(0, max);
}
