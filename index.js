// Variable declaration
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const movies = []
const data_panel = document.querySelector("#data-panel")
const search_form = document.querySelector("#search-form")
const search_input = document.querySelector("#search-input")
let currentPage = 1;
let filteredMovies = [];
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator")
let numberOfPages;
// get data from API using axios 
axios.get(INDEX_URL).then((response) => {
  //array(80)
  console.log(response.data.results)
  movies.push(...response.data.results)
  renderMovieList(movies)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
}).catch((error) => {
  console.log(error)
})
// Functions
// Function: Render movie list
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    //title, image
    console.log(item)
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}"> More </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          
        </div>
      </div>
    </div>
  </div>`
  });
  data_panel.innerHTML = rawHTML
}
// Function: add favorite movie to list and save in localstorage
function addToMovie(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('This movie is already in your favorite list!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}
// Function: show movie modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  modalTitle.innerText = ""
  modalDate.innerText = ""
  modalDescription.innerText = ""
  modalImage.innerHTML = ""
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}
// Function: slice movies
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //page1 -> 0-11
  //page2 -> 12-23
  //page3 -> 24-35
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}
// Function: render paginator
function renderPaginator(amount) {
  numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML =
    '<li class="page-item"><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `;
  }
  rawHTML +=
    '<li class="page-item"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
  paginator.innerHTML = rawHTML;
  document.querySelector('[data-page="1"]').parentElement.classList.add("active");
}
// Event Listeners
// Listen to data panel
data_panel.addEventListener("click", function (event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToMovie(Number(event.target.dataset.id))
  }
})
// Listen to paginator
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})
// Listen to search form
search_form.addEventListener("submit", function onsearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = search_input.value.trim().toLowerCase()
  if (!keyword.length) {
    return
  }
  filteredMovies = movies.filter(function filterMovie(movie) {
    return movie.title.toLowerCase().includes(keyword)
  })
  if (filteredMovies.length === 0) {
    return alert(`There is no movie with your keyword: ${keyword} `)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})