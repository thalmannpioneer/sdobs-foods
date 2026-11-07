// Страница авторизации: переключение форм «Авторизация» / «Регистрация».
// Разметка: формы с атрибутом data-auth-form="login" | "register".
// Форма определяется по якорю в адресе: login.html#register открывает регистрацию.

const TITLES = {
  login: 'Авторизация — Сдобс Фудс',
  register: 'Регистрация — Сдобс Фудс',
};

function showForm(panels) {
  const target = location.hash === '#register' ? 'register' : 'login';

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.authForm !== target;
  });

  document.title = TITLES[target];
}

// Подтверждение пароля должно совпадать с паролем
function initPasswordMatch(form) {
  const password = form.elements.password;
  const confirm = form.elements.confirm;

  if (!password || !confirm) return;

  const check = () => {
    confirm.setCustomValidity(
      confirm.value && confirm.value !== password.value ? 'Пароли не совпадают' : ''
    );
  };

  password.addEventListener('input', check);
  confirm.addEventListener('input', check);
}

export function initAuthForms() {
  // panels — всё, что показывается по состоянию страницы (формы и пояснения к ним)
  const panels = [...document.querySelectorAll('[data-auth-form]')];
  const forms = panels.filter((panel) => panel.tagName === 'FORM');

  if (panels.length === 0) return;

  forms.forEach((form) => {
    initPasswordMatch(form);

    // Отправка данных на сервер подключается позже
    form.addEventListener('submit', (event) => event.preventDefault());
  });

  showForm(panels);
  window.addEventListener('hashchange', () => showForm(panels));
}
