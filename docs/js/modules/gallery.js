// Галерея товара: большое фото и ряд миниатюр со стрелками.
// Разметка: [data-gallery] > .gallery__main (img) и кнопки .gallery__thumb[data-full],
// стрелки .gallery__arrow--prev / .gallery__arrow--next.

const ACTIVE_CLASS = 'is-active';

function initGallery(root) {
  const main = root.querySelector('.gallery__main');
  const thumbs = [...root.querySelectorAll('.gallery__thumb')];
  const prevButton = root.querySelector('.gallery__arrow--prev');
  const nextButton = root.querySelector('.gallery__arrow--next');

  if (!main || thumbs.length === 0) return;

  let index = 0;

  function goTo(i) {
    index = (i + thumbs.length) % thumbs.length;

    main.src = thumbs[index].dataset.full;
    thumbs.forEach((thumb, n) => thumb.classList.toggle(ACTIVE_CLASS, n === index));
  }

  thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => goTo(i)));
  prevButton?.addEventListener('click', () => goTo(index - 1));
  nextButton?.addEventListener('click', () => goTo(index + 1));
}

export function initGalleries() {
  document.querySelectorAll('[data-gallery]').forEach(initGallery);
}
