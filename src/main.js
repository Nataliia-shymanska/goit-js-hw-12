'use strict';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { renderImages } from './js/render-functions';
import { getImages } from './js/pixabay-api';

const refs = {
  imageSearchForm: document.querySelector('.image-search-form'),
  imageSearchInput: document.querySelector('.image-search-input'),
  submitButton: document.querySelector('.image-search-btn'),
  imageList: document.querySelector('.image-gallery'),
  loader: document.querySelector('.image-loader'),
  more: document.querySelector('.load-more-btn'),
  upBtn: document.querySelector('.up-button'),
};

let request;
let page = 1;
let maxPage = 1;
const per_page = 15;

const lightbox = new SimpleLightbox('.image-gallery-item a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  animationSpeed: 300,
  widthRatio: 1,
  heightRatio: 0.95,
  disableRightClick: true,
});

refs.imageSearchForm.addEventListener('submit', async e => {
  e.preventDefault();

  request = e.target.elements.userData.value.trim();
  page = 1;

  if (!request) {
    refs.imageList.innerHTML = '';
    hideMoreBtn();
    hideLoader();
    return iziToast.info({
      message: 'You need to enter search request!',
      position: 'topRight',
      transitionIn: 'bounceInDown',
      transitionOut: 'fadeOutDown',
    });
  }

  showLoader();
  hideMoreBtn();

  try {
    const data = await getImages(request, page, per_page);
    if (data.hits.length === 0) {
      refs.imageList.innerHTML = '';
      hideLoader();
      return iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        transitionIn: 'bounceInDown',
        transitionOut: 'fadeOutDown',
      });
    }

    const markup = renderImages(data.hits);
    refs.imageList.innerHTML = markup;

    maxPage = Math.ceil(data.totalHits / per_page);

    lightbox.refresh();
    checkBtnStatus();
  } catch (error) {
    iziToast.error({
      message: 'An error occurred. Please try again later.',
      position: 'topRight',
      transitionIn: 'bounceInDown',
      transitionOut: 'fadeOutDown',
    });
  } finally {
    hideLoader();
  }

  e.target.reset();
});

refs.more.addEventListener('click', async () => {
  page++;
  showLoader();
  hideMoreBtn();

  try {
    const data = await getImages(request, page, per_page);
    const markup = renderImages(data.hits);
    refs.imageList.insertAdjacentHTML('beforeend', markup);

    skipPrewElem();
    lightbox.refresh();
    checkBtnStatus();
  } catch (error) {
    iziToast.error({
      message: 'An error occurred. Please try again later.',
      position: 'topRight',
      transitionIn: 'bounceInDown',
      transitionOut: 'fadeOutDown',
    });
  } finally {
    hideLoader();
  }
});

function checkBtnStatus() {
  if (page >= maxPage) {
    hideMoreBtn();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight',
      transitionIn: 'bounceInDown',
      transitionOut: 'fadeOutDown',
    });
  } else {
    showMoreBtn();
  }
}

function skipPrewElem() {
  const height = refs.imageList.children[0].getBoundingClientRect().height;

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}

function showLoader() {
  refs.loader.style.display = 'block';
}

function hideLoader() {
  refs.loader.style.display = 'none';
}

function showMoreBtn() {
  refs.more.style.display = 'block';
}

function toTheTop() {
  refs.imageSearchForm.scrollIntoView({ behavior: 'smooth' });
  refs.upBtn.setAttribute('hidden', '');
}

function hideMoreBtn() {
  refs.more.style.display = 'none';
}

function checkScroll() {
  if (window.scrollY >= 50) {
    refs.upBtn.removeAttribute('hidden');
  } else {
    refs.upBtn.setAttribute('hidden', '');
  }
}

window.addEventListener('scroll', checkScroll);
refs.upBtn.addEventListener('click', toTheTop);
