// Кабинет оператора: очередь заказов на подтверждение.
// Поиск, сортировка, подтверждение и отмена заказов, боковая карточка редактирования.
// Данные заказа лежат в data-атрибутах строки .op-row (см. pages/operator.html).

import { formatPrice, plural } from '../utils/format.js';

const SELECTED_CLASS = 'is-selected';

const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' });

// «24 октября 2026 г.» -> «24 октября 2026»
const formatDate = (date) => dateFormat.format(date).replace(/\s?г\.$/, '');

const lowerFirst = (text) => text.charAt(0).toLowerCase() + text.slice(1);
const upperFirst = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function initOperator(root) {
  const list = root.querySelector('.op-table__body');
  const badge = root.querySelector('[data-op-count]');
  const shown = root.querySelector('[data-op-shown]');
  const empty = root.querySelector('.op-table__empty');
  const search = root.querySelector('[data-op-search]');
  const sortButton = root.querySelector('[data-op-sort]');
  const sortLabel = root.querySelector('[data-op-sort-label]');
  const modal = root.querySelector('[data-op-modal]');
  const form = root.querySelector('.op-drawer');

  const field = (name) => form.querySelector(`[data-op="${name}"]`);
  const getRows = () => [...list.querySelectorAll('.op-row')];

  let currentRow = null;
  let sortAscending = true;

  /* ---------- Счётчики, поиск и сортировка ---------- */

  function updateCounts() {
    const rows = getRows();
    const total = rows.length;
    const visible = rows.filter((row) => !row.hidden).length;
    const word = total % 10 === 1 && total % 100 !== 11 ? 'заказа' : 'заказов';

    badge.textContent = total;
    shown.textContent = `Показано ${visible} из ${total} ${word}`;
    empty.hidden = visible !== 0;
  }

  function matches(row, query) {
    const { id, name, phone } = row.dataset;
    const text = `${id} №${id} ${name} ${phone}`.toLowerCase();
    const digits = query.replace(/\D/g, '');

    return (
      text.includes(query) ||
      (digits.length >= 3 && (phone.replace(/\D/g, '').includes(digits) || id.includes(digits)))
    );
  }

  function applyFilter() {
    const query = search.value.trim().toLowerCase();

    getRows().forEach((row) => {
      row.hidden = query !== '' && !matches(row, query);
    });
    updateCounts();
  }

  function applySort() {
    const rows = getRows().sort((a, b) => a.dataset.created.localeCompare(b.dataset.created));

    if (!sortAscending) rows.reverse();
    list.append(...rows);
    sortLabel.textContent = sortAscending ? 'Сначала ранние' : 'Сначала поздние';
  }

  search.addEventListener('input', applyFilter);

  sortButton.addEventListener('click', () => {
    sortAscending = !sortAscending;
    applySort();
  });

  /* ---------- Строка таблицы ---------- */

  function renderRow(row) {
    const { address, note, date, time } = row.dataset;

    row.querySelector('[data-field="address"]').textContent = address;
    row.querySelector('[data-field="note"]').textContent = note;
    row.querySelector('[data-field="date"]').textContent = formatDate(new Date(`${date}T00:00`));
    row.querySelector('[data-field="time"]').textContent = time;
  }

  function removeRow(row) {
    row.remove();
    updateCounts();
  }

  list.addEventListener('click', (event) => {
    const action = event.target.closest('[data-op-action]');
    const row = event.target.closest('.op-row');

    if (!row) return;

    if (action) {
      if (action.dataset.opAction === 'confirm') removeRow(row);

      if (action.dataset.opAction === 'cancel' && window.confirm(`Отменить заказ №${row.dataset.id}?`)) {
        removeRow(row);
      }
      return;
    }

    openDrawer(row);
  });

  list.addEventListener('keydown', (event) => {
    const row = event.target.closest('.op-row');

    if (row && event.target === row && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openDrawer(row);
    }
  });

  /* ---------- Боковая карточка заказа ---------- */

  function renderItems(items) {
    const box = field('items');
    let units = 0;
    let total = 0;

    box.replaceChildren();

    items.forEach((item) => {
      const element = document.createElement('div');
      const photo = document.createElement('img');
      const info = document.createElement('div');
      const name = document.createElement('p');
      const meta = document.createElement('p');
      const cost = document.createElement('p');

      element.className = 'op-item';
      photo.className = 'op-item__photo';
      photo.src = `../img/cakes/${item.img}`;
      photo.alt = '';
      info.className = 'op-item__info';
      name.className = 'op-item__name';
      name.textContent = item.name;
      meta.className = 'op-item__meta';
      meta.textContent = `${item.qty} шт. × ${formatPrice(item.price)}`;
      cost.className = 'op-item__cost';
      cost.textContent = formatPrice(item.qty * item.price);

      info.append(name, meta);
      element.append(photo, info, cost);
      box.append(element);

      units += item.qty;
      total += item.qty * item.price;
    });

    field('summary').textContent =
      `${units} ${plural(units, ['товар', 'товара', 'товаров'])} · ` +
      `${items.length} ${plural(items.length, ['позиция', 'позиции', 'позиций'])}`;
    field('total').textContent = formatPrice(total);
  }

  function fillDrawer(row) {
    const created = new Date(row.dataset.created);
    const { address, note, date, time, comment } = row.dataset;
    const timeSelect = field('time');

    field('title').textContent = `Заказ №${row.dataset.id}`;
    field('created').textContent = `от ${formatDate(created)}, ${timeFormat.format(created)}`;
    field('name').textContent = row.dataset.name;
    field('phone').textContent = row.dataset.phone;
    renderItems(JSON.parse(row.dataset.items));

    field('address').value = `${address},\n${lowerFirst(note)}`;
    field('date').value = date;

    // Если интервала нет в списке, добавляем его
    if (![...timeSelect.options].some((option) => option.value === time)) {
      timeSelect.add(new Option(time, time));
    }
    timeSelect.value = time;

    field('comment').value = comment ?? '';
    form.elements.status.value = 'confirmed';
  }

  function openDrawer(row) {
    currentRow?.classList.remove(SELECTED_CLASS);
    currentRow = row;
    row.classList.add(SELECTED_CLASS);

    fillDrawer(row);
    modal.hidden = false;
    form.querySelector('[data-op-close]').focus();
  }

  function closeDrawer() {
    modal.hidden = true;
    currentRow?.classList.remove(SELECTED_CLASS);
    currentRow?.focus?.();
    currentRow = null;
  }

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-op-close]') || event.target === modal.querySelector('.op-overlay')) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeDrawer();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentRow || !form.reportValidity()) return;

    // Первая строка адреса — адрес, остальное — примечание (подъезд, этаж)
    const [first, ...rest] = field('address').value.split('\n');

    currentRow.dataset.address = first.trim().replace(/,$/, '');
    currentRow.dataset.note = upperFirst(rest.join(' ').trim());
    currentRow.dataset.date = field('date').value;
    currentRow.dataset.time = field('time').value;
    currentRow.dataset.comment = field('comment').value.trim();
    renderRow(currentRow);

    // «Подтверждён» и «Отменён» убирают заказ из очереди, «Оставить» — нет
    const status = form.elements.status.value;
    const row = currentRow;

    closeDrawer();
    if (status !== 'pending') removeRow(row);
  });

  applySort();
  updateCounts();
}

export function initOperators() {
  document.querySelectorAll('[data-operator]').forEach(initOperator);
}
