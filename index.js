// Variable declaration
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const movies = []
const data_panel = document.querySelector("#data-panel")
const layoutIcons = document.querySelector("#layout-icons");
const cardLayoutIcon = document.querySelector("#card-layout");
const listLayoutIcon = document.querySelector("#list-layout");
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
  renderMovieList(getMoviesByPage(currentPage))
}).catch((error) => {
  console.log(error)
})
// Functions
// Function: Render movie list
function renderMovieList(data) {
  if (data_panel.dataset.layout === "card-layout") {
    displayCardLayout(data);
  } else if (data_panel.dataset.layout === "list-layout") {
    displayListLayout(data);
  }
}
//function: display card layout
function displayCardLayout(data) {
  let rawHTML = "";
  data.forEach((item) => {
    //title, image
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
      }"> More </button>
          <button class="btn btn-info btn-add-favorite" id="btn-add-favorite" data-id="${item.id
      }">+</button>
          
        </div>
      </div>
    </div>
  </div>`;
  });

  data_panel.innerHTML = rawHTML;
}
//function: display list layout
function displayListLayout(data) {
  let rawHTML =
    '<table class="table" id="movie-table"><thead><tr><th class="col-md-8" scope="col">Movie Title</th><th class="col-md-4" scope="col"></th></tr></thead><tbody>';
  data.forEach((item) => {
    rawHTML += `
      <tr>
        <th class="fs-5" scope="row">${item.title}</th>
        <td class="d-flex justify-content-end"><button class="btn btn-primary btn-show-movie me-2" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}"> More </button>
          <button class="btn btn-info btn-add-favorite me-3" id="btn-add-favorite" data-id="${item.id}">+</button>
        </td>
      </tr>
      `;
  });
  rawHTML += "</tbody></table>";
  data_panel.innerHTML = rawHTML;
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
//Function: remove movie from favorite list
function removeFromFavorite(id) {
  let list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  //一旦傳入的 id 在收藏清單中不存在，或收藏清單是空的，就結束這個函式
  if (!list || !list.length) return;
  //透過 id 找到要刪除電影的 index
  const movieIndex = list.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) return;
  //刪除該筆電影
  list.splice(movieIndex, 1);
  //存回 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
  //更新頁面(only in favorite list)
  // renderMovieList(getMoviesByPage(currentPage));
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
  let rawHTML = '<li class="page-item"><a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a></li>';
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
  <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
  `;
  }
  rawHTML += '<li class="page-item"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a></li>';
  paginator.innerHTML = rawHTML;
  document.querySelector('[data-page="1"]').parentElement.classList.add("active");
}
// Event Listeners
//Listen to layout icons
layoutIcons.addEventListener("click", function (event) {
  if (event.target.matches("#list-layout")) {
    data_panel.dataset.layout = "list-layout";
    listLayoutIcon.style.color = "blue";
    cardLayoutIcon.style.color = "";
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#card-layout")) {
    data_panel.dataset.layout = "card-layout";
    cardLayoutIcon.style.color = "blue";
    listLayoutIcon.style.color = "";
    renderMovieList(getMoviesByPage(currentPage));
  }
});
// Listen to data panel
data_panel.addEventListener("click", function (event) {
  console.log(event.target);
  let list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".switch-add-btn")) {
    removeFromFavorite(Number(event.target.dataset.id));
    event.target.innerText = "+";
    event.target.classList.toggle("switch-add-btn");
  } else if (event.target.matches("#btn-add-favorite")) {
    addToMovie(Number(event.target.dataset.id));
    event.target.innerHTML = "-";
    event.target.classList.toggle("switch-add-btn");
  }
});
// Listen to paginator
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return;
  //active status
  let activePage = document.querySelectorAll(".active");
  if (activePage) {
    activePage.forEach((item) => {
      item.classList.remove("active");
    });
  }
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  if (event.target.ariaLabel !== "Previous" && event.target.ariaLabel !== "Next"){
    currentPage = page
    event.target.parentElement.classList.add("active");
  } else if (event.target.ariaLabel === "Previous") {
    currentPage -= 1;
    if (currentPage < 1) {
      currentPage = 1;
    }
  } else if (event.target.ariaLabel === "Next") {
    currentPage += 1;
    if (currentPage > numberOfPages) {
      currentPage = numberOfPages;
    }
  } 
  //更新畫面
  renderMovieList(getMoviesByPage(currentPage))
})
// Listen to search form
search_form.addEventListener("submit", function onsearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = search_input.value.trim().toLowerCase()
  if (!keyword.length) {
    currentPage = 1;
    filteredMovies.length = 0;
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  }
  filteredMovies = movies.filter(function filterMovie(movie) {
    return movie.title.toLowerCase().includes(keyword)
  });
  if (filteredMovies.length === 0) {
    return alert(`There is no movie with your keyword: ${keyword} `)
  }
  currentPage = 1;
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
});