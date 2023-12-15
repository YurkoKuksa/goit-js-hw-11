import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createMarkup } from './js/create-markup';
import { getPhotos } from './js/api';
import { hideSpinner, showSpinner } from './js/spin';

const refs = {
  form: document.querySelector('.search-form'),

  gallery: document.querySelector('.js-gallery'),
  loadMore: document.querySelector('.js-load-more'),
  //   spinnerEl: document.querySelector('.js-backdrop'),
  target: document.querySelector('.target-element'),
};

let searchQuery;
let page = 1;
const perPage = 40;

let options = {
  root: null,
  rootMargin: '100px',
  threshold: 1.0,
};
let callback = (entries, observer) => {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      showSpinner();
      try {
        page += 1;
        const { hits, totalHits } = await getPhotos(searchQuery, page, perPage);
        console.log(hits);

        refs.gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
        lightbox.refresh();
        if (page === Math.ceil(totalHits / perPage)) {
          observer.unobserve(refs.target);
        }
      } catch (error) {
        Notify.failure('An error occurred while fetching photos.');
      } finally {
        hideSpinner();
      }
    }

    // Each entry describes an intersection change for one observed
    // target element:
    //   entry.boundingClientRect
    //   entry.intersectionRatio
    //   entry.intersectionRect
    //   entry.isIntersecting
    //   entry.rootBounds
    //   entry.target
    //   entry.time
  });
};

let observer = new IntersectionObserver(callback, options);

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

refs.form.addEventListener('submit', onSubmit);

async function onSubmit(event) {
  event.preventDefault();

  searchQuery = event.target.elements.searchQuery.value.trim();
  page = 1;
  refs.gallery.innerHTML = '';
  observer.unobserve(refs.target);
  showSpinner();
  try {
    const { hits, totalHits } = await getPhotos(searchQuery, page, perPage);

    if (hits.length === 0) {
      Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      refs.gallery.innerHTML = '';
      return;
    }
    if (totalHits > 0) {
      Notify.success(`Hooray! We found ${totalHits} images.`);
    }

    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
    lightbox.refresh();
    if (totalHits > 40) {
      observer.observe(refs.target);
    }
  } catch (error) {
    Notify.failure('An error occurred while fetching photos.');
  } finally {
    hideSpinner();
  }
}
