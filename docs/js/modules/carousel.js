// Карусель сертификатов.
// Разметка: [data-carousel] > .carousel__viewport > .carousel__track > .carousel__slide,
// кнопки .carousel__btn--prev / .carousel__btn--next и контейнер .carousel__dots.
// Активный слайд всегда выравнивается по центру области просмотра.

const ACTIVE_CLASS = 'is-active';
const SWIPE_DISTANCE = 40;

function initCarousel(root) {
  const viewport = root.querySelector('.carousel__viewport');
  const track = root.querySelector('.carousel__track');
  const slides = [...root.querySelectorAll('.carousel__slide')];
  const prevButton = root.querySelector('.carousel__btn--prev');
  const nextButton = root.querySelector('.carousel__btn--next');
  const dotsBox = root.querySelector('.carousel__dots');

  if (!viewport || !track || slides.length === 0) return;

  // Стартуем с центрального слайда (или с data-start)
  let index = Number(root.dataset.start ?? Math.floor(slides.length / 2));

  // Точки-индикаторы создаются по числу слайдов
  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('aria-label', `Сертификат ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox?.append(dot);

    return dot;
  });

  function update() {
    const slide = slides[index];
    const offset = viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);

    track.style.transform = `translateX(${offset}px)`;
    dots.forEach((dot, i) => dot.classList.toggle(ACTIVE_CLASS, i === index));
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    update();
  }

  prevButton?.addEventListener('click', () => goTo(index - 1));
  nextButton?.addEventListener('click', () => goTo(index + 1));

  // Стрелки клавиатуры
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goTo(index - 1);
    if (event.key === 'ArrowRight') goTo(index + 1);
  });

  // Свайп на сенсорных экранах
  let startX = null;

  viewport.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
  });

  viewport.addEventListener('pointerup', (event) => {
    if (startX === null) return;

    const distance = event.clientX - startX;

    if (Math.abs(distance) > SWIPE_DISTANCE) goTo(index + (distance < 0 ? 1 : -1));
    startX = null;
  });

  viewport.addEventListener('pointercancel', () => {
    startX = null;
  });

  window.addEventListener('resize', update);
  update();
}

export function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
}
