// Кабинет администратора: разделы «Пользователи», «Архив заказов» и «Отчётность».
// Разделы переключаются боковым меню (адрес с якорем: admin.html#archive).
// Данные строк лежат в data-атрибутах (см. pages/admin.html).

const ROLES = {
  client: 'Клиент',
  courier: 'Курьер',
  production: 'Начальник производства',
  manager: 'Менеджер',
  admin: 'Администратор',
};

const TITLES = {
  users: 'Пользователи',
  archive: 'Архив заказов',
  reports: 'Отчётность',
};

const pad = (n) => String(n).padStart(2, '0');

// 2026-10-24 -> 24.10.2026
const formatDate = (iso) => iso.split('-').reverse().join('.');

/* ---------- Переключение разделов ---------- */

function initNavigation(root) {
  const links = [...root.querySelectorAll('[data-admin-nav]')];
  const sections = [...root.querySelectorAll('[data-admin-section]')];

  function show(name) {
    const target = TITLES[name] ? name : 'users';

    sections.forEach((section) => {
      section.hidden = section.dataset.adminSection !== target;
    });

    links.forEach((link) => {
      const isActive = link.dataset.adminNav === target;

      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    document.title = `${TITLES[target]} — Сдобс Фудс`;
  }

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      history.replaceState(null, '', `#${link.dataset.adminNav}`);
      show(link.dataset.adminNav);
    });
  });

  window.addEventListener('hashchange', () => show(location.hash.slice(1)));
  show(location.hash.slice(1));
}

/* ---------- Пользователи ---------- */

function initUsers(root) {
  const section = root.querySelector('[data-admin-section="users"]');
  const list = section.querySelector('.ad-table__body');
  const search = section.querySelector('[data-users-search]');
  const roleFilter = section.querySelector('[data-users-role]');
  const shown = section.querySelector('[data-users-shown]');
  const empty = section.querySelector('.ad-table__empty');
  const sortButton = section.querySelector('[data-users-sort]');
  const modal = section.querySelector('[data-user-modal]');
  const form = modal.querySelector('form');

  const getRows = () => [...list.querySelectorAll('.ad-user')];
  let newestFirst = true;
  let currentRow = null;

  function renderRow(row) {
    const { name, org, email, phone, role } = row.dataset;
    const roleCell = row.querySelector('[data-cell="role"]');

    row.querySelector('[data-cell="name"]').textContent = name;
    row.querySelector('[data-cell="org"]').textContent = org;
    row.querySelector('[data-cell="email"]').textContent = email;
    row.querySelector('[data-cell="phone"]').textContent = phone;
    roleCell.textContent = ROLES[role];
    roleCell.classList.toggle('is-staff', role !== 'client');
  }

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const digits = query.replace(/\D/g, '');
    const role = roleFilter.value;
    const rows = getRows();
    let visible = 0;

    rows.forEach((row) => {
      const { name, org, email, phone } = row.dataset;
      const text = `${name} ${org} ${email} ${phone}`.toLowerCase();
      const byQuery =
        query === '' ||
        text.includes(query) ||
        (digits.length >= 3 && phone.replace(/\D/g, '').includes(digits));
      const byRole = role === 'all' || row.dataset.role === role;

      row.hidden = !(byQuery && byRole);
      if (!row.hidden) visible += 1;
    });

    const isFiltered = query !== '' || role !== 'all';

    shown.textContent = isFiltered
      ? `Найдено пользователей: ${visible}`
      : `Показано 1–${rows.length} из ${list.dataset.total} пользователей`;
    empty.hidden = visible !== 0;
  }

  function applySort() {
    const rows = getRows().sort((a, b) => a.dataset.date.localeCompare(b.dataset.date));

    if (newestFirst) rows.reverse();
    list.append(...rows);
    sortButton.textContent = `Регистрация ${newestFirst ? '↓' : '↑'}`;
  }

  section.querySelector('[data-users-apply]').addEventListener('click', applyFilters);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyFilters();
  });
  section.querySelector('[data-users-reset]').addEventListener('click', () => {
    search.value = '';
    roleFilter.value = 'all';
    applyFilters();
  });
  sortButton.addEventListener('click', () => {
    newestFirst = !newestFirst;
    applySort();
  });

  /* Редактирование пользователя */

  const field = (name) => form.elements[name];

  function closeModal() {
    modal.hidden = true;
    currentRow = null;
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-user-edit]');

    if (!button) return;

    currentRow = button.closest('.ad-user');
    ['name', 'org', 'email', 'phone', 'role'].forEach((key) => {
      field(key).value = currentRow.dataset[key];
    });
    modal.hidden = false;
    field('name').focus();
  });

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-modal-close]') || event.target.classList.contains('op-overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeModal();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentRow || !form.reportValidity()) return;

    ['name', 'org', 'email', 'phone', 'role'].forEach((key) => {
      currentRow.dataset[key] = field(key).value.trim();
    });
    renderRow(currentRow);
    closeModal();
    applyFilters();
  });

  applySort();
  applyFilters();
}

/* ---------- Архив заказов ---------- */

function initArchive(root) {
  const section = root.querySelector('[data-admin-section="archive"]');
  const list = section.querySelector('.ad-table__body');
  const from = section.querySelector('[data-archive-from]');
  const to = section.querySelector('[data-archive-to]');
  const status = section.querySelector('[data-archive-status]');
  const shown = section.querySelector('[data-archive-shown]');
  const empty = section.querySelector('.ad-table__empty');
  const sortButton = section.querySelector('[data-archive-sort]');

  const defaults = { from: from.value, to: to.value, status: status.value };
  const getRows = () => [...list.querySelectorAll('.ad-order')];
  let newestFirst = true;

  function applyFilters() {
    const rows = getRows();
    let visible = 0;

    rows.forEach((row) => {
      const date = row.dataset.date;
      const inPeriod = (!from.value || date >= from.value) && (!to.value || date <= to.value);
      const byStatus = status.value === 'all' || row.dataset.status === status.value;

      row.hidden = !(inPeriod && byStatus);
      if (!row.hidden) visible += 1;
    });

    const isDefault =
      from.value === defaults.from && to.value === defaults.to && status.value === defaults.status;

    shown.textContent = isDefault
      ? `Показано 1–${rows.length} из ${list.dataset.total} заказов`
      : `Найдено заказов: ${visible}`;
    empty.hidden = visible !== 0;
  }

  function applySort() {
    const rows = getRows().sort((a, b) => a.dataset.created.localeCompare(b.dataset.created));

    if (newestFirst) rows.reverse();
    list.append(...rows);
    sortButton.textContent = `Заказ / дата ${newestFirst ? '↓' : '↑'}`;
  }

  section.querySelector('[data-archive-apply]').addEventListener('click', applyFilters);
  section.querySelector('[data-archive-reset]').addEventListener('click', () => {
    from.value = defaults.from;
    to.value = defaults.to;
    status.value = defaults.status;
    applyFilters();
  });
  sortButton.addEventListener('click', () => {
    newestFirst = !newestFirst;
    applySort();
  });

  applySort();
  applyFilters();
}

/* ---------- Отчётность ---------- */

function initReports(root) {
  const section = root.querySelector('[data-admin-section="reports"]');
  const start = section.querySelector('[data-report-start]');
  const end = section.querySelector('[data-report-end]');
  const period = section.querySelector('[data-report-period]');
  const generated = section.querySelector('[data-report-generated]');

  function generate() {
    end.setCustomValidity(end.value < start.value ? 'Дата конца раньше даты начала' : '');

    if (!start.value || !end.value || !end.reportValidity()) return;

    const now = new Date();

    period.textContent = `${formatDate(start.value)} — ${formatDate(end.value)} · группировка по неделям`;
    generated.textContent =
      `Сформирован ${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ` +
      `в ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  // Выгрузка таблицы в CSV: открывается в Excel
  function exportReport() {
    const cell = (text) => `"${text.replace(/\u00a0/g, ' ').replace(/"/g, '""').trim()}"`;
    const rows = [...section.querySelectorAll('.ad-report__table tr')].map((row) =>
      [...row.children].map((item) => cell(item.textContent)).join(';')
    );
    const blob = new Blob([`\ufeff${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `report-${start.value}_${end.value}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  section.querySelector('[data-report-generate]').addEventListener('click', generate);
  section.querySelector('[data-report-export]').addEventListener('click', exportReport);
}

export function initAdmins() {
  document.querySelectorAll('[data-admin]').forEach((root) => {
    initNavigation(root);
    initUsers(root);
    initArchive(root);
    initReports(root);
  });
}
