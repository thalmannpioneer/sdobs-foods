// Кабинет начальника производства: реестр подтверждённых заказов.
// Фильтры по статусу, поиск, сортировка, смена статуса и комментарий к заказу.
// Данные заказа лежат в data-атрибутах строки .pc-row (см. pages/production.html).

import { plural } from '../utils/format.js';

const STATUSES = {
  'in-production': 'В производстве',
  produced: 'Произведено',
};

function initProduction(root) {
  const list = root.querySelector('.pc-table__body');
  const filters = [...root.querySelectorAll('[data-pc-filter]')];
  const search = root.querySelector('[data-pc-search]');
  const sortButton = root.querySelector('[data-pc-sort]');
  const footer = root.querySelector('[data-pc-shown]');
  const empty = root.querySelector('.pc-table__empty');

  const getRows = () => [...list.querySelectorAll('.pc-row')];
  const stat = (name) => root.querySelector(`[data-pc-stat="${name}"]`);
  const caption = (name) => root.querySelector(`[data-pc-caption="${name}"]`);

  let activeFilter = 'all';
  let newestFirst = true;

  /* ---------- Счётчики и список ---------- */

  function updateStats() {
    const rows = getRows();
    const total = rows.length;
    const inProduction = rows.filter((row) => row.dataset.status === 'in-production').length;
    const produced = rows.filter((row) => row.dataset.status === 'produced').length;

    stat('total').textContent = total;
    stat('in-production').textContent = inProduction;
    stat('produced').textContent = produced;

    caption('total').textContent = plural(total, [
      'подтвержденный заказ',
      'подтвержденных заказа',
      'подтвержденных заказов',
    ]);
    caption('in-production').textContent = plural(inProduction, [
      'заказ в работе',
      'заказа в работе',
      'заказов в работе',
    ]);
    caption('produced').textContent = plural(produced, [
      'заказ готов к отгрузке',
      'заказа готовы к отгрузке',
      'заказов готовы к отгрузке',
    ]);

    filters.forEach((filter) => {
      const key = filter.dataset.pcFilter;
      const count = key === 'all' ? total : rows.filter((row) => row.dataset.status === key).length;

      filter.querySelector('[data-pc-filter-count]').textContent = count;
    });
  }

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    const rows = getRows();
    let visible = 0;

    rows.forEach((row) => {
      const byStatus = activeFilter === 'all' || row.dataset.status === activeFilter;
      const byQuery = query === '' || row.textContent.toLowerCase().includes(query);

      row.hidden = !(byStatus && byQuery);
      if (!row.hidden) visible += 1;
    });

    const isFiltered = activeFilter !== 'all' || query !== '';

    footer.textContent = isFiltered
      ? `Показано заказов: ${visible} из ${rows.length}`
      : `Показаны все заказы: ${visible} из ${rows.length}`;
    empty.hidden = visible !== 0;
  }

  function applySort() {
    const rows = getRows().sort((a, b) => a.dataset.created.localeCompare(b.dataset.created));

    if (newestFirst) rows.reverse();
    list.append(...rows);
    sortButton.textContent = newestFirst ? 'Сначала новые' : 'Сначала старые';
  }

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      activeFilter = filter.dataset.pcFilter;
      filters.forEach((item) => item.classList.toggle('is-active', item === filter));
      applyFilters();
    });
  });

  search.addEventListener('input', applyFilters);

  sortButton.addEventListener('click', () => {
    newestFirst = !newestFirst;
    applySort();
  });

  /* ---------- Сохранение статуса и комментария ---------- */

  function saveRow(row) {
    const status = row.querySelector('[data-pc-select]').value;
    const comment = row.querySelector('[data-pc-comment]').value.trim();
    const chip = row.querySelector('.pc-status');
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    row.dataset.status = status;
    chip.className = `pc-status pc-status--${status}`;
    chip.querySelector('[data-pc-status-text]').textContent = STATUSES[status];
    row.querySelector('[data-pc-time]').textContent = `Сегодня, ${time}`;
    row.querySelector('[data-pc-note]').textContent = 'Последние изменения сохранены';

    // Пустой комментарий не сохраняем как пробелы
    row.querySelector('[data-pc-comment]').value = comment;

    updateStats();
    applyFilters();
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pc-save]');

    if (button) saveRow(button.closest('.pc-row'));
  });

  // Enter в поле комментария сохраняет заказ
  list.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('[data-pc-comment]')) {
      event.preventDefault();
      saveRow(event.target.closest('.pc-row'));
    }
  });

  applySort();
  updateStats();
  applyFilters();
}

export function initProductions() {
  document.querySelectorAll('[data-production]').forEach(initProduction);
}
