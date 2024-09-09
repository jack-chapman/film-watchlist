const movieResultsElement = document.getElementById("movie-results")
const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
let movieResults = []


// Prompt to use search
movieResultsElement.innerHTML = ` 
    <div class="start-placeholder"> 
         <i class="fa-solid fa-film"></i> <p>Start exploring</p>
    </div>
`

//No searches found message
function renderNoResultsMessage() {
    movieResultsElement.innerHTML = ` 
    <div class="no-search-placeholder"> 
    <i class="fa-solid fa-film"></i> <p>No results found, sorry!</p>
</div>
`
}

//Search button and results
searchBtn.addEventListener("click", function () {
    fetch(`http://www.omdbapi.com/?apikey=863d41df&s=${searchInput.value}&type=movie`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "False") {
                return renderNoResultsMessage()
            } else {
                getMovieDetails(data.Search)
            }
        })
})

//Get movie details from search movie imdb ID
function getMovieDetails(moviesArr) {
    const requests = []
    moviesArr.forEach(movie => {
        requests.push(fetch(`http://www.omdbapi.com/?apikey=863d41df&i=${movie.imdbID}&type=movie`).then(res => res.json()))
    })
    Promise.all(requests)
        .then(responses => {
            movieResults = responses.filter((movie) => {
                return movie.Title !== "N/A" && movie.Poster !== "N/A"
            })
            renderMovieResults()
        })
}

function getSavedMovies() {
    const storedWatchlist = localStorage.getItem("Watchlist")
    let movieWatchlist = []

    if (storedWatchlist !== null) {
        movieWatchlist = JSON.parse(storedWatchlist)
    }
    return movieWatchlist
}

function saveToWatchlist(filmID) {

    const movieWatchlist = getSavedMovies()
    const alreadyInWatchlist = movieWatchlist.find((movie) => {
        return movie.imdbID === filmID
    })
    if (alreadyInWatchlist) {
        return
    }
    const foundMovie = movieResults.find((movie) => {
        return movie.imdbID === filmID
    })

    movieWatchlist.push(foundMovie)
    const savedMovies = JSON.stringify(movieWatchlist)
    localStorage.setItem("Watchlist", savedMovies)

}

function renderMovieResults() {

    const addToWatchlistBtnInnerHtml = `<i class="fa-solid fa-circle-plus"></i> Watchlist `
    const alreadySavedBtnInnerHtml = `<i class="fa-solid fa-circle-check"></i> Added to Watchlist`

    const movieWatchlist = getSavedMovies()
    let htmlString = ""
    movieResults.forEach(data => {

        const alreadyInWatchlist = movieWatchlist.find((movie) => {
            return movie.imdbID === data.imdbID
        })

        const btnInnerHtml = alreadyInWatchlist ? alreadySavedBtnInnerHtml : addToWatchlistBtnInnerHtml

        htmlString += `
        <div class="movie-result">
            <div class="poster-details">
                <img class="poster-img" src="${data.Poster}" />   
            </div>
            <div class="movie-details">    
                <div class="movie-title">      
                        <h2> ${data.Title}</h2>
                        <p> ${data.Ratings[0] === undefined ? "Rating unavailable" : data.Ratings[0]?.Value.split("/")[0]} <i class="fa-solid fa-star"></i></p>
                </div>
                        <div class="small-detail">
                            <p> ${data.Runtime === "N/A" ? "Runtime unavailable" : data.Runtime} </p>
                            <p> ${data.Genre === "N/A" ? "Genre unavailable" : data.Genre} </p>
                            
                            <button data-add-button data-add-id="${data.imdbID}" class="watchlist-btn"> ${btnInnerHtml} </button>
                        </div>
                        <div class="about-detail"> 
                            <p>${data.Plot === "N/A" ? "No description available" : data.Plot}</p> 
                        </div> 
                </div>
            </div>    
                `
    })
    movieResultsElement.innerHTML = htmlString
    document.querySelectorAll("[data-add-button]").forEach(button => {
        button.addEventListener('click', () => {
            saveToWatchlist(button.dataset.addId)
            button.innerHTML = alreadySavedBtnInnerHtml
        })
    })
}