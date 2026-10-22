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
  c("Te Boté", "Nio García, Casper Mágico, Darell y otros", "reggaeton", "boté", ["bebé"]),
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
  c("Waka Waka (Esto es África)", "Shakira", "pop", "waka", ["áfrica"]),
  c("Andas en Mi Cabeza", "Chino y Nacho ft. Daddy Yankee", "pop", "andas", ["cabeza"]),
  c("Cómo Mirarte", "Sebastián Yatra", "pop", "mirarte"),
  c("Vente Pa' Ca", "Ricky Martin ft. Maluma", "pop", "vente"),
  c("Mi Persona Favorita", "Alejandro Sanz y Camila Cabello", "pop", "favorita", ["persona"]),
  c("La Gozadera", "Gente de Zona ft. Marc Anthony", "pop", "gozadera", ["miami"]),
  c("Hijos de la Luna", "Mecano", "pop", "hijos", ["luna", "gitana", "amanecer"]),
  c("Bulería", "David Bisbal", "pop", "bulería"),
  c("Rosas", "La Oreja de Van Gogh", "pop", "rosas"),

  // ---------- Rock en español (tanda 3, aprobada por el usuario el 12-10-2026) ----------
  c("De Música Ligera", "Soda Stereo", "rock", "ligera", ["música", "amor"]),
  c("Persiana Americana", "Soda Stereo", "rock", "persiana", ["americana"]),
  c("Cuando Pase el Temblor", "Soda Stereo", "rock", "temblor"),
  c("Lamento Boliviano", "Enanitos Verdes", "rock", "boliviano", ["borracho", "loco", "corazón"]),
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
  c("Kumbala", "La Maldita Vecindad", "rock", "kumbala"),
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
  c("En Barranquilla Me Quedo", "Joe Arroyo", "salsa", "barranquilla"),
  c("Cali Pachanguero", "Grupo Niche", "salsa", "pachanguero", ["cali"]),
  c("Una Aventura", "Grupo Niche", "salsa", "aventura"),
  c("Conciencia", "Gilberto Santa Rosa", "salsa", "conciencia"),
  c("Cuenta Conmigo", "Jerry Rivera", "salsa", "cuenta"),
  c("Desnúdate Mujer", "Frankie Ruiz", "salsa", "desnúdate", ["mujer"]),

  // ---------- Balada (tanda 5) ----------
  c("Amor Eterno", "Rocío Dúrcal", "balada", "eterno", ["tristeza", "ojos"]),
  c("Hasta Que Te Conocí", "Juan Gabriel", "balada", "conocí"),
  c("Querida", "Juan Gabriel", "balada", "querida"),
  c("Mientes", "Camila", "balada", "mientes"),
  c("Todo Cambió", "Camila", "balada", "cambió"),
  c("Me Va a Extrañar", "Ricardo Montaner", "balada", "extrañar"),
  c("Tengo Todo Excepto a Ti", "Luis Miguel", "balada", "excepto"),
  c("La Incondicional", "Luis Miguel", "balada", "incondicional"),
  c("Ahora Te Puedes Marchar", "Luis Miguel", "balada", "marchar"),
  c("Por Debajo de la Mesa", "Luis Miguel", "balada", "mesa"),
  c("Inolvidable", "Luis Miguel", "balada", "inolvidable"),
  c("Hoy Tengo Ganas de Ti", "Alejandro Fernández ft. Christina Aguilera", "balada", "ganas"),
  c("Abrázame", "Julio Iglesias", "balada", "abrázame"),
  c("Me Olvidé de Vivir", "Julio Iglesias", "balada", "olvidé", ["vivir"]),
  c("Bésame Mucho", "Consuelo Velázquez", "balada", "bésame", ["noche"]),
  c("Contigo Aprendí", "Armando Manzanero", "balada", "aprendí"),
  c("Tu Cárcel", "Marco Antonio Solís", "balada", "cárcel"),
  c("Si No Te Hubieras Ido", "Marco Antonio Solís", "balada", "hubieras"),
  c("Azul", "Cristian Castro", "balada", "azul"),
  c("No Me Doy por Vencido", "Luis Fonsi", "balada", "vencido"),

  // ---------- Cumbia (tanda 6) ----------
  c("La Pollera Colorá", "Pedro Salcedo y Wilson Choperena", "cumbia", "pollera", ["colorá"]),
  c("La Cumbia Sampuesana", "José Barros", "cumbia", "sampuesana"),
  c("La Cumbia Cienaguera", "Luis Enrique Martínez", "cumbia", "cienaguera"),
  c("Colombia Tierra Querida", "Lucho Bermúdez", "cumbia", "colombia"),
  c("La Colegiala", "Rodolfo y su Típica", "cumbia", "colegiala"),
  c("Cariñito", "Los Hijos del Sol", "cumbia", "cariñito"),
  c("Cómo Te Voy a Olvidar", "Los Ángeles Azules", "cumbia", "olvidar"),
  c("17 Años", "Los Ángeles Azules", "cumbia", "años"),
  c("El Listón de Tu Pelo", "Los Ángeles Azules", "cumbia", "listón", ["pelo"]),
  c("Nunca Es Suficiente", "Los Ángeles Azules ft. Natalia Lafourcade", "cumbia", "suficiente"),
  c("No Me Arrepiento de Este Amor", "Gilda", "cumbia", "arrepiento", ["amor"]),
  c("Fuiste", "Gilda", "cumbia", "fuiste"),
  c("Se Me Ha Perdido un Corazón", "Gilda", "cumbia", "perdido", ["corazón"]),
  c("Corazón Valiente", "Gilda", "cumbia", "valiente", ["corazón"]),
  c("Juana la Cubana", "Fito Olivares", "cumbia", "juana", ["cubana"]),
  c("Baila Esta Cumbia", "Selena", "cumbia", "cumbia"),
  c("Bidi Bidi Bom Bom", "Selena", "cumbia", "bidi"),
  c("Como la Flor", "Selena", "cumbia", "flor"),
  c("Amor Prohibido", "Selena", "cumbia", "prohibido", ["amor"]),
  c("Cumbia Sobre el Río", "Celso Piña", "cumbia", "río"),

  // ---------- Bachata (tanda 7) ----------
  c("Propuesta Indecente", "Romeo Santos", "bachata", "indecente", ["propuesta"]),
  c("Eres Mía", "Romeo Santos", "bachata", "mía"),
  c("Imitadora", "Romeo Santos", "bachata", "imitadora"),
  c("Llévame Contigo", "Romeo Santos", "bachata", "llévame"),
  c("Odio", "Romeo Santos ft. Drake", "bachata", "odio"),
  c("Sobredosis", "Romeo Santos ft. Ozuna", "bachata", "sobredosis"),
  c("La Diabla", "Romeo Santos", "bachata", "diabla"),
  c("Obsesión", "Aventura", "bachata", "obsesión"),
  c("Hermanita", "Aventura", "bachata", "hermanita"),
  c("Los Infieles", "Aventura", "bachata", "infieles"),
  c("Mi Corazoncito", "Aventura", "bachata", "corazoncito"),
  c("El Perdedor", "Aventura", "bachata", "perdedor"),
  c("Inmortal", "Aventura", "bachata", "inmortal"),
  c("Cuándo Volverás", "Aventura", "bachata", "volverás"),
  c("Darte un Beso", "Prince Royce", "bachata", "darte", ["beso"]),
  c("Las Cosas Pequeñas", "Prince Royce", "bachata", "pequeñas"),
  c("Bachata en Fukuoka", "Juan Luis Guerra", "bachata", "fukuoka", ["bachata"]),
  c("Bachata Rosa", "Juan Luis Guerra", "bachata", "rosa", ["bachata"]),
  c("Burbujas de Amor", "Juan Luis Guerra", "bachata", "burbujas", ["pez", "pecera"]),
  c("Te Extraño", "Xtreme", "bachata", "extraño"),

  // ---------- Merengue (tanda 8) ----------
  c("La Bilirrubina", "Juan Luis Guerra", "merengue", "bilirrubina"),
  c("Ojalá Que Llueva Café", "Juan Luis Guerra", "merengue", "café", ["llueva", "campo"]),
  c("El Niágara en Bicicleta", "Juan Luis Guerra", "merengue", "niágara", ["bicicleta"]),
  c("A Pedir Su Mano", "Juan Luis Guerra", "merengue", "mano"),
  c("Visa Para un Sueño", "Juan Luis Guerra", "merengue", "visa", ["sueño"]),
  c("Las Avispas", "Juan Luis Guerra", "merengue", "avispas"),
  c("El Costo de la Vida", "Juan Luis Guerra", "merengue", "costo", ["vida"]),
  c("La Cosquillita", "Juan Luis Guerra", "merengue", "cosquillita"),
  c("Suavemente", "Elvis Crespo", "merengue", "suavemente", ["bésame"]),
  c("Tu Sonrisa", "Elvis Crespo", "merengue", "sonrisa"),
  c("Píntame", "Elvis Crespo", "merengue", "píntame"),
  c("La Dueña del Swing", "Los Hermanos Rosario", "merengue", "swing"),
  c("Rompecintura", "Los Hermanos Rosario", "merengue", "rompecintura"),
  c("El Baile del Perrito", "Wilfrido Vargas", "merengue", "perrito", ["baile"]),
  c("El Jardinero", "Wilfrido Vargas", "merengue", "jardinero"),
  c("Abusadora", "Wilfrido Vargas", "merengue", "abusadora"),
  c("El Africano", "Wilfrido Vargas", "merengue", "africano"),
  c("Pégame Tu Vicio", "Eddy Herrera", "merengue", "vicio"),
  c("Volvió Juanita", "Milly Quezada", "merengue", "juanita"),
  c("Compadre Pedro Juan", "Luis Alberti", "merengue", "compadre"),

  // ---------- Regional mexicano (tanda 9) ----------
  c("El Rey", "Vicente Fernández", "regional", "rey", ["dinero"]),
  c("Volver, Volver", "Vicente Fernández", "regional", "volver", ["brazos"]),
  c("Hermoso Cariño", "Vicente Fernández", "regional", "cariño"),
  c("Mujeres Divinas", "Vicente Fernández", "regional", "divinas", ["mujeres"]),
  c("Por Tu Maldito Amor", "Vicente Fernández", "regional", "maldito", ["amor"]),
  c("Cielito Lindo", "Tradicional mexicana", "regional", "cielito", ["llores"]),
  c("México Lindo y Querido", "Jorge Negrete", "regional", "méxico"),
  c("La Bikina", "Rubén Fuentes", "regional", "bikina"),
  c("Si Nos Dejan", "José Alfredo Jiménez", "regional", "dejan"),
  c("Ella", "José Alfredo Jiménez", "regional", "rogarle"),
  c("La Media Vuelta", "José Alfredo Jiménez", "regional", "media", ["vuelta"]),
  c("Paloma Negra", "Lola Beltrán", "regional", "paloma", ["negra"]),
  c("Un Puño de Tierra", "Antonio Aguilar", "regional", "puño", ["tierra"]),
  c("Contrabando y Traición", "Los Tigres del Norte", "regional", "contrabando", ["traición"]),
  c("La Puerta Negra", "Los Tigres del Norte", "regional", "puerta", ["negra"]),
  c("Jefe de Jefes", "Los Tigres del Norte", "regional", "jefes"),
  c("Golpes en el Corazón", "Los Tigres del Norte", "regional", "golpes", ["corazón"]),
  c("Mi Credo", "K-Paz de la Sierra", "regional", "credo"),
  c("El Sinaloense", "Banda El Recodo", "regional", "sinaloense"),
  c("La Chona", "Los Tucanes de Tijuana", "regional", "chona"),

  // ---------- Trap y urbano (tanda 10) ----------
  c("Sola", "Anuel AA", "urbano", "sola"),
  c("Bichota", "Karol G", "urbano", "bichota"),
  c("TQG", "Karol G ft. Shakira", "urbano", "grande"),
  c("Shakira: Bzrp Music Sessions, Vol. 53", "Bizarrap ft. Shakira", "urbano", "facturan", ["lloran"]),
  c("Quevedo: Bzrp Music Sessions, Vol. 52", "Bizarrap ft. Quevedo", "urbano", "quédate"),
  c("Columbia", "Quevedo", "urbano", "columbia"),
  c("La Bebé (Remix)", "Yng Lvcas ft. Peso Pluma", "urbano", "bebé"),
  c("Callaíta", "Bad Bunny", "urbano", "callaíta"),
  c("Safaera", "Bad Bunny", "urbano", "safaera"),
  c("Yonaguni", "Bad Bunny", "urbano", "yonaguni"),
  c("Ojitos Lindos", "Bad Bunny ft. Bomba Estéreo", "urbano", "ojitos"),
  c("Mónaco", "Bad Bunny", "urbano", "mónaco"),
  c("La Jumpa", "Arcángel ft. Bad Bunny", "urbano", "jumpa"),
  c("Te Felicito", "Shakira ft. Rauw Alejandro", "urbano", "felicito"),
  c("Adán y Eva", "Paulo Londra", "urbano", "adán", ["eva"]),
  c("Nena Maldición", "Paulo Londra", "urbano", "maldición"),
  c("Mamichula", "Trueno ft. Nicki Nicole", "urbano", "mamichula"),
  c("Despechá", "Rosalía", "urbano", "despechá"),
  c("Saoko", "Rosalía", "urbano", "saoko"),
  c("Feliz Cumpleaños Ferxxo", "Feid", "urbano", "cumpleaños"),];

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

/** Géneros que tienen al menos una canción (los que marca "Todos"). */
export function availableGenres() {
  return GENRES.filter((g) => SONG_DB.some((s) => s.genre === g));
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
