import Fastify from 'fastify';
import "dotenv/config";

// Créer une instance Fastify
const fastify = Fastify();

// Définir une route simple
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Variables d'environnement
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY; // Utilisation sécurisée

if (!API_KEY) {
  console.error("ERREUR: La clé API TMDB est manquante. Définissez-la dans .env");
  process.exit(1);
}

// Fonction pour rechercher un film par titre
async function getMovie(query) {
  const url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`
    }
  };
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erreur API TMDB: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error("Erreur lors de la récupération du film :", err);
    return { error: "Impossible de récupérer le film" };
  }
}

// Fonction pour obtenir l'ID d'un film
async function getMovieId(query) {
  const data = await getMovie(query);
  if (data.results && data.results.length > 0) {
    return data.results[0].id;
  } else {
    console.error("Aucun film trouvé pour :", query);
    return null;
  }
}

// Ajouter un film à la watchlist
async function postWatchlist(title) {
  const id = await getMovieId(title);
  if (!id) {
    console.error(`Impossible d'ajouter "${title}" à la watchlist, ID non trouvé.`);
    return { error: `Film "${title}" non trouvé.` };
  }

  const url = `${TMDB_BASE_URL}/account/21763769/watchlist`;
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ media_type: 'movie', media_id: id, watchlist: true })
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Erreur API TMDB: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error("Erreur lors de l'ajout à la watchlist :", err);
    return { error: "Impossible d'ajouter le film à la watchlist" };
  }
}

// Route pour rechercher un film
fastify.get('/search', async (request, reply) => {
  const query = request.query.name;
  if (!query) return reply.status(400).send({ error: "Paramètre 'name' requis." });

  const data = await getMovie(query);
  return reply.send({ results: data });
});

// Route pour ajouter un film à la watchlist
fastify.post('/watchlist/title/:title', async (request, reply) => {
  const title = request.params.title;
  if (!title) return reply.status(400).send({ error: "Titre requis." });

  const result = await postWatchlist(title);
  return reply.send(result);
});

// Route pour supprimer un film de la watchlist (par ID)
fastify.delete('/watchlist/:id', async (request, reply) => {
  const movieId = request.params.id;
  if (!movieId) return reply.status(400).send({ error: "ID requis." });

  return reply.send({ message: `Film avec ID ${movieId} retiré de la watchlist.` });
});

// Route pour supprimer un film de la watchlist (par titre)
fastify.delete('/watchlist/title/:title', async (request, reply) => {
  const title = request.params.title;
  if (!title) return reply.status(400).send({ error: "Titre requis." });

  return reply.send({ message: `Film intitulé "${title}" retiré de la watchlist.` });
});

// Démarrer le serveur
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
    console.log(`🚀 Serveur démarré sur http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    console.error("Erreur au démarrage du serveur :", err);
    process.exit(1);
  }
};

start();
