// следить за кнопкой загрузить еще
// сделать пагинацию

const axios = require('axios').default;
import Notiflix from 'notiflix';
import './css/styles.css';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.classList.add('is-hidden');

let page = 1;
const fotoPerPage = 40;
searchForm.addEventListener('submit', onSubmit);
loadMoreButton.addEventListener('click', loadMoreFotos);

function loadMoreFotos() {
  const searchQuery = searchForm.elements.searchQuery.value;
  goSearch(searchQuery).then(function (response) {
    let totalPages = response.data.totalHits / fotoPerPage;
    const responseArr = response.data.hits;
    limitPageChecker(totalPages);
    createGalleryMarkup(responseArr);
    page += 1;
  });
}

function onSubmit(evt) {
  evt.preventDefault();
  clearMarkup();
  const searchQuery = searchForm.elements.searchQuery.value;
  goSearch(searchQuery)
    .then(function (response) {
      const responseArr = response.data.hits;
      let totalPages = response.data.totalHits / fotoPerPage;
      if (responseArr.length === 0) {
        Notiflix.Notify.failure(
          '"Sorry, there are no images matching your search query. Please try again."'
        );
      } else {
        createGalleryMarkup(responseArr);
        showLoadMoreButton();
        limitPageChecker(totalPages);
        Notiflix.Notify.success(
          `Hooray! We found ${response.data.totalHits} images.`
        );
        page += 1;
      }
    })
    .catch(error => console.log(error));
  // evt.currentTarget.reset();
}

async function goSearch(query) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: '32613318-c4586bdc29b7e1cabb37e9d30',
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: fotoPerPage,
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

function createGalleryMarkup(searchResponse) {
  const markup = searchResponse.reduce(
    (
      acc,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) =>
      acc +
      `<div class="photo-card"><a href=${largeImageURL}>
  <img src=${webformatURL} alt=${tags} loading="lazy" width="350" height="200"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div>`,
    ''
  );

  gallery.insertAdjacentHTML('beforeend', markup);
  let galleryLightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  galleryLightbox.on('show.simplelightbox');
  galleryLightbox.refresh();
}

function clearMarkup() {
  gallery.innerHTML = '';
  loadMoreButton.classList.add('is-hidden');
  page = 1;
}

function showLoadMoreButton() {
  loadMoreButton.classList.remove('is-hidden');
}

function limitPageChecker(totalPages) {
  if (page > totalPages) {
    loadMoreButton.classList.add('is-hidden');
    Notiflix.Notify.warning(
      'Were sorry, but youve reached the end of search results.'
    );
    return;
  }
}
