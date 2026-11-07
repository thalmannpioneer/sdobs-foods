// Страница «Изменить данные».
// Кнопка «Изменить» делает поля доступными и превращается в «Сохранить»;
// «Сохранить» проверяет поля, сохраняет данные и снова блокирует форму.
// Данные хранятся в localStorage браузера. Пароль локально не сохраняется:
// его нужно отправлять на сервер (см. комментарий в save()).

const STORAGE_KEY = 'sdobs:profile';
const STATUS_TIMEOUT = 3000;
const PASSWORD_MASK = '**********';

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function initProfileForm(form) {
  const fields = [...form.querySelectorAll('.field')];
  const button = form.querySelector('.profile__submit');
  const status = form.querySelector('.profile__status');
  let isEditing = false;
  let statusTimer;

  // Сохранённые ранее значения подставляются в поля (кроме пароля)
  const stored = readStored();

  fields.forEach((field) => {
    if (field.dataset.secret === undefined && stored[field.name] !== undefined) {
      field.value = stored[field.name];
    }
  });

  function setEditing(value) {
    isEditing = value;
    fields.forEach((field) => {
      field.disabled = !value;
    });
    button.textContent = value ? 'Сохранить' : 'Изменить';

    if (value) fields[0].focus();
  }

  function showStatus(text) {
    status.textContent = text;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => {
      status.textContent = '';
    }, STATUS_TIMEOUT);
  }

  function save() {
    const data = {};

    fields.forEach((field) => {
      // Пароль не пишем в localStorage: после сохранения снова показываем маску.
      // Здесь же можно отправить новый пароль на сервер.
      if (field.dataset.secret !== undefined) {
        field.value = PASSWORD_MASK;
        return;
      }

      field.value = field.value.trim();
      data[field.name] = field.value;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      showStatus('Не удалось сохранить данные');
      return false;
    }

    return true;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Первое нажатие: включаем редактирование
    if (!isEditing) {
      setEditing(true);
      return;
    }

    // Второе нажатие: проверяем и сохраняем
    if (!form.reportValidity()) return;

    if (save()) {
      setEditing(false);
      showStatus('Данные сохранены');
    }
  });

  // Enter в поле адреса сохраняет форму, а не переносит строку
  form.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.tagName === 'TEXTAREA') {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  setEditing(false);
  // setEditing(false) не должен забирать фокус при загрузке
  document.activeElement?.blur?.();
}

export function initProfileForms() {
  document.querySelectorAll('[data-profile-form]').forEach(initProfileForm);
}
