const db = require("../config/dbconect");

exports.searchCatalog = async (req, res) => {
  const { category, query } = req.query;

  // Si no hay texto de búsqueda, devolvemos vacío
  if (!query) return res.json([]);

  const searchTerm = `%${query}%`;
  let sql = "";
  let params = [];

  try {
    // ---------------------------------------------------------
    // OPCIÓN A: BÚSQUEDA ESPECÍFICA (Music, Books, Games...)
    // ---------------------------------------------------------
    if (category && category !== 'General' && category !== 'Custom') {
      
      switch (category) {
        case "Music":
          sql = `SELECT music_id AS id, 'Music' AS type, title, artist, album, release_year, cover_url 
                 FROM Catalog_Music WHERE title LIKE ? OR artist LIKE ? LIMIT 20`;
          params = [searchTerm, searchTerm];
          break;

        case "Books":
          sql = `SELECT book_id AS id, 'Books' AS type, title, author, isbn, publisher, cover_url 
                 FROM Catalog_Books WHERE title LIKE ? OR author LIKE ? LIMIT 20`;
          params = [searchTerm, searchTerm];
          break;

        case "Movies":
          sql = `SELECT movie_id AS id, 'Movies' AS type, title, director, release_year, genre, poster_url 
                 FROM Catalog_Movies WHERE title LIKE ? LIMIT 20`;
          params = [searchTerm];
          break;

        case "Shows":
          sql = `SELECT show_id AS id, 'Shows' AS type, title, seasons, platform, release_year, poster_url 
                 FROM Catalog_Shows WHERE title LIKE ? LIMIT 20`;
          params = [searchTerm];
          break;

        case "Games":
          sql = `SELECT game_id AS id, 'Games' AS type, title, developer, platform, release_year, poster_url 
                 FROM Catalog_Games WHERE title LIKE ? LIMIT 20`;
          params = [searchTerm];
          break;

        default:
          return res.status(400).json({ error: "Categoría no válida" });
      }

      // Ejecutamos la consulta específica y DEVOLVEMOS la respuesta aquí para terminar
      const [results] = await db.query(sql, params);
      return res.json(results);
    }

    // ---------------------------------------------------------
    // OPCIÓN B: BÚSQUEDA GENERAL / CUSTOM (Busca en todo)
    // ---------------------------------------------------------
    
    // Preparamos las 5 consultas en paralelo
    // Nota: Usamos alias (AS) para que el frontend reciba siempre 'subtitle' e 'image'
    // sin importar si viene de autor, artista, poster o cover.
    
    const searchMusic = db.query(
      `SELECT music_id as id, 'Music' as type, title, artist as subtitle, release_year, cover_url as image 
       FROM Catalog_Music WHERE title LIKE ? OR artist LIKE ? LIMIT 5`, 
      [searchTerm, searchTerm]
    );

    const searchBooks = db.query(
      `SELECT book_id as id, 'Books' as type, title, author as subtitle, publisher as extra_info, cover_url as image 
       FROM Catalog_Books WHERE title LIKE ? OR author LIKE ? LIMIT 5`, 
      [searchTerm, searchTerm]
    );

    const searchMovies = db.query(
      `SELECT movie_id as id, 'Movies' as type, title, director as subtitle, release_year, poster_url as image 
       FROM Catalog_Movies WHERE title LIKE ? LIMIT 5`, 
      [searchTerm]
    );

    const searchShows = db.query(
      `SELECT show_id as id, 'Shows' as type, title, platform as subtitle, release_year, poster_url as image 
       FROM Catalog_Shows WHERE title LIKE ? LIMIT 5`, 
      [searchTerm]
    );

    const searchGames = db.query(
      `SELECT game_id as id, 'Games' as type, title, developer as subtitle, platform as extra_info, poster_url as image 
       FROM Catalog_Games WHERE title LIKE ? LIMIT 5`, 
      [searchTerm]
    );

    // Ejecutamos todas a la vez
    const [music, books, movies, shows, games] = await Promise.all([
      searchMusic, searchBooks, searchMovies, searchShows, searchGames
    ]);

    // Combinamos los resultados (recuerda que db.query devuelve [rows, fields], por eso tomamos el índice 0)
    const combinedResults = [
      ...music[0],
      ...books[0],
      ...movies[0],
      ...shows[0],
      ...games[0]
    ];

    res.json(combinedResults);

  } catch (error) {
    console.error("Error buscando en catálogo:", error);
    res.status(500).json({ error: "Error interno al buscar en el catálogo" });
  }
};