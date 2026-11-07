// Выпадающее меню в шапке.
// Разметка: .dropdown > .dropdown__toggle (кнопка-стрелка) + .dropdown__menu (список ссылок)

const OPEN_CLASS = 'is-open';

function setOpen(dropdown, isOpen) {
  const toggle = dropdown.querySelector('.dropdown__toggle');

  dropdown.classList.toggle(OPEN_CLASS, isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
}

function initDropdown(dropdown) {
  const toggle = dropdown.querySelector('.dropdown__toggle');
  const menu = dropdown.querySelector('.dropdown__menu');

  if (!toggle || !menu) return;

  // Клик по стрелке открывает и закрывает меню
  toggle.addEventListener('click', () => {
    setOpen(dropdown, !dropdown.classList.contains(OPEN_CLASS));
  });

  // Клик по пункту меню закрывает его (переход по якорю выполнит браузер)
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(dropdown, false);
  });

  // Клик вне меню закрывает его
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) setOpen(dropdown, false);
  });

  // Escape закрывает меню и возвращает фокус на стрелку
  dropdown.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdown.classList.contains(OPEN_CLASS)) {
      setOpen(dropdown, false);
      toggle.focus();
    }
  });
}

export function initDropdowns() {
  document.querySelectorAll('.dropdown').forEach(initDropdown);
}
