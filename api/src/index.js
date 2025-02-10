import Fastify from 'fastify';

// Créer une instance Fastify
const fastify = Fastify();

// Définir une route simple
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Démarrer le serveur sur le port 3000
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZDQyMzMyYjlmNGQ3OGNmZDlkOWM5MzZmNGU2NzM2NyIsIm5iZiI6MTczNzM4NDg4Ni43NjgsInN1YiI6IjY3OGU2M2I2MWFmYzM0NjQ2NzY1NDk1MiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.2RxJhqyxkKRfViFV9lJsW4maZ-gEh2bOoNdE9pPkY0Q"

//fonction pour trouver les film grace au titre
async function getMovie(query){
  const url = 'https://api.themoviedb.org/3/search/movie?query='+query+'&include_adult=false&language=en-US&page=1';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer '+ API_KEY
    }
  };
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json;
  } catch (err) {
    console.error(err);
  }

}

async function getMovieId(query){
  const url = 'https://api.themoviedb.org/3/search/movie?query='+query+'&include_adult=false&language=en-US&page=1';
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer '+ API_KEY
    }
  };
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json["results"][0]["id"];
  } catch (err) {
    console.error(err);
  }

}

//fonction watchlist
async function postWatchlist(title){
  const id = await getMovieId(title)
  const url = 'https://api.themoviedb.org/3/account/21763769/watchlist';
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer ' + API_KEY
    },
  body: JSON.stringify({media_type: 'movie', media_id: id , watchlist: true})
  };
try {
    const response = await fetch(url, options);
    const json = await response.json();
    return json;
  } catch (err) {
    console.error(err);
  }
}



fastify.get('/search', async (request, reply) => {
  const query = request.query.name;
  const data = await getMovie(query)

  return { message: `Recherché : ` +JSON.stringify(data)};
});




fastify.post('/watchlist/title/:title', async (request, reply) => {
  const title = request.params.title;
  // Logique pour ajouter à la watchlist avec le titre
  postWatchlist(title)
  return { message: `Film intitulé "${title}" ajouté à la watchlist.` }; 
});


fastify.delete('/watchlist/:id', async (request, reply) => {
  const movieId = request.params.id;
  // Logique pour retirer du watchlist
  return { message: `Film avec ID ${movieId} retiré de la watchlist.` };
});



fastify.delete('/watchlist/title/:title', async (request, reply) => {
  const title = request.params.title;
  // Logique pour retirer le film par titre
  return { message: `Film intitulé "${title}" retiré de la watchlist.` };
});




