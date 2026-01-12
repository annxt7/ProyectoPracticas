const db = require("../config/dbconect");

exports.searchCatalog = async (req, res) => {
  const { category, query } = req.query;

  if (!query) return res.json([]);
  const searchTerm = `%${query}%`;

  try {
    // CATEGORÍA ESPECÍFICA
    if (category && category !== 'General' && category !== 'Custom') {
      
      switch (category) {
        case "Music":
          const [musicResults] = await db.query(
            `SELECT music_id AS id, 'Music' AS type, title, artist, album, release_year, cover_url 
             FROM Catalog_Music WHERE title LIKE ? OR artist LIKE ? LIMIT 20`,
            [searchTerm, searchTerm]
          );
          return res.json(musicResults);

        case "Books":
          const [bookResults] = await db.query(
            `SELECT book_id AS id, 'Books' AS type, title, author, isbn, publisher, cover_url 
             FROM Catalog_Books WHERE title LIKE ? OR author LIKE ? LIMIT 20`,
            [searchTerm, searchTerm]
          );
          return res.json(bookResults);

        case "Movies":
          const [movieResults] = await db.query(
            `SELECT movie_id AS id, 'Movies' AS type, title, director, release_year, genre, poster_url 
             FROM Catalog_Movies WHERE title LIKE ? LIMIT 20`,
            [searchTerm]
          );
          return res.json(movieResults);

        case "Shows":
          const [showResults] = await db.query(
            `SELECT show_id AS id, 'Shows' AS type, title, seasons, platform, release_year, poster_url 
             FROM Catalog_Shows WHERE title LIKE ? LIMIT 20`,
            [searchTerm]
          );
          return res.json(showResults);

        case "Games":
          const [gameResults] = await db.query(
            `SELECT game_id AS id, 'Games' AS type, title, developer, platform, release_year, poster_url 
             FROM Catalog_Games WHERE title LIKE ? LIMIT 20`,
            [searchTerm]
          );
          return res.json(gameResults);

        default:
          return res.status(400).json({ error: "Categoría no válida" });
      }
    }

    // 2. BÚSQUEDA GENERAL 
    
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

    const [music, books, movies, shows, games] = await Promise.all([
      searchMusic, searchBooks, searchMovies, searchShows, searchGames
    ]);

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