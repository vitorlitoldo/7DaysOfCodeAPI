const $movieList = document.querySelector('.filmes')
const $inputSearch = document.querySelector('.search-box input')
const $buttonSearch = document.querySelector('.search-box button')
const $inputCheck = document.querySelector('.filmes-favoritos input')

const favoriteMovies = [];
const searchMovie = [];
const movies = [];

$buttonSearch.addEventListener('click', searchMovies)
$inputCheck.addEventListener('change', updateMovies)

$inputSearch.addEventListener('keyup', function(event) {
    if (event.keyCode == 13)
    {
        searchMovies()
        return
    }
})

async function getPopularMovies() 
{
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=085a90f11bedc8447faebb1443e265a3&language=en-US&page=1`
    const fetchResponse = await fetch(url)
    const { results } = await fetchResponse.json()
    movies.push(...results)
    return results
} 

async function getMoviesByName(name)
{
    const url = `https://api.themoviedb.org/3/search/movie?api_key=085a90f11bedc8447faebb1443e265a3&query=${name}&language=en-US&page=1`
    const fetchResponse = await fetch(url)
    const { results } = await fetchResponse.json()
    searchMovie.length = 0
    searchMovie.push(...results)
    return results
}

window.onload = async function() 
{
    const savedFavorites = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    favoriteMovies.push(...savedFavorites)

    await getPopularMovies()
    updateMovies()
}

function getDate(movie)
{
    const { release_date } = movie
    const year = new Date(release_date).getFullYear()
    return year
}

function updateMovies()
{
    const inputValue = $inputSearch.value

    let moviesToDisplay = [];

    if ($inputCheck.checked) 
    {
        if (inputValue === '') 
        {
            moviesToDisplay = favoriteMovies;
        } 
        else
        {
            moviesToDisplay = favoriteMovies.filter(fav => searchMovie.some(s => s.id === fav.id));
        }
    } 
    else 
    {
        moviesToDisplay = inputValue === '' ? movies : searchMovie;
    }

    renderMovies(moviesToDisplay);
}

function renderMovies(movie)
{
    $movieList.innerHTML = movie.map(item => `
        <ul>
                <li class="imagem-filme">
                    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="img-filme">
                </li>
                <div class="name-points">
                    <li class="nome-filme">${item.title} (${getDate(item)})</li>
                    <li class="pontos-favoritar">
                        <p class="pontos">
                            <img src="/images/star.svg" alt="point">${item.vote_average.toFixed(1)}
                        </p>
                        <p class="favoritar">
                            <img class="favorite-button" data-id="${item.id}" src="${favoriteMovies.some(fav => fav.id === item.id) ? '/images/favorited.svg' : '/images/heart.svg'}" alt="favorite">Favoritar
                        </p>
                    </li>
                </div>
                <li class="descricao">
                    <p>${item.overview}</p>
                </li>
            </ul>
        </div>
    `).join('')

    document.querySelectorAll('.favorite-button').forEach($button => {
        $button.addEventListener('click', function() {
            const movieId = this.getAttribute('data-id')
            favoriteMovie(movieId)
        })
    })
}

async function searchMovies()
{
    const inputValue = $inputSearch.value

    await getMoviesByName(inputValue)
    updateMovies()
}

function favoriteMovie(movieId)
{
    inputValue = $inputSearch.value
    let movieToFavorite;

    if (inputValue != '')
    {
        movieToFavorite = searchMovie.find(item => item.id === parseInt(movieId))
    }
    else 
    {
        movieToFavorite = movies.find(item => item.id === parseInt(movieId))
    }

    const isFavorite = favoriteMovies.some(item => item.id === movieToFavorite.id)
    
    if (!isFavorite)
    {
        favoriteMovies.push(movieToFavorite)
    }
    else
    {
        const indexToRemove = favoriteMovies.findIndex(item => item.id === movieToFavorite.id)
        
        if (indexToRemove > -1)
        {
            favoriteMovies.splice(indexToRemove, 1)
        }
    }

    localStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies))

    updateMovies()
}