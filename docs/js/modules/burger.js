// Мобильное меню-бургер в шапке (телефонное разрешение).
// Разметка: .header > .header__inner > button.burger и .header > nav.mobile-menu.
// Меню открывается классом is-open у .header.

const OPEN_CLASS = 'is-open';
const DESKTOP_QUERY = '(min-width: 768px)';

function initBurger(header) {
  const burger = header.querySelector('.burger');
  const menu = header.querySelector('.mobile-menu');

  if (!burger || !menu) return;

  function setOpen(isOpen) {
    header.classList.toggle(OPEN_CLASS, isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }

  burger.addEventListener('click', () => {
    setOpen(!header.classList.contains(OPEN_CLASS));
  });

  // Переход по любой ссылке закрывает меню
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Клик вне шапки закрывает меню
  document.addEventListener('click', (event) => {
    if (!header.contains(event.target)) setOpen(false);
  });

  // Escape закрывает меню и возвращает фокус на кнопку
  header.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains(OPEN_CLASS)) {
      setOpen(false);
      burger.focus();
    }
  });

  // При переходе на планшет и компьютер мобильное меню закрывается
  window.matchMedia(DESKTOP_QUERY).addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

export function initBurgers() {
  document.querySelectorAll('.header').forEach(initBurger);
}
