// Кабинет курьера: список доставок за смену.
// Переключатель «В пути / Доставлен», фильтры, сводка и обновление времени.
// Состояние карточки хранится в её атрибутах: data-status ("transit" | "delivered")
// и data-comment (комментарий к заказу, который показывается, пока заказ в пути).

import { plural } from '../utils/format.js';

const timeNow = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

function initCourier(root) {
  const cards = [...root.querySelectorAll('.cr-card')];
  const filters = [...root.querySelectorAll('[data-cr-filter]')];
  const empty = root.querySelector('.cr-empty');
  const refresh = root.querySelector('[data-cr-refresh]');
  const updated = root.querySelector('[data-cr-updated]');
  const stat = (name) => root.querySelector(`[data-cr-stat="${name}"]`);
  const caption = (name) => root.querySelector(`[data-cr-caption="${name}"]`);

  let activeFilter = 'all';

  const count = (status) => cards.filter((card) => card.dataset.status === status).length;

  /* ---------- Сводка и фильтры ---------- */

  function updateStats() {
    const total = cards.length;
    const transit = count('transit');
    const delivered = count('delivered');

    stat('total').textContent = total;
    stat('transit').textContent = transit;
    stat('delivered').textContent = delivered;

    caption('total').textContent = plural(total, [
      'заказ на сегодня',
      'заказа на сегодня',
      'заказов на сегодня',
    ]);
    caption('delivered').textContent = plural(delivered, ['доставлен', 'доставлено', 'доставлено']);

    filters.forEach((filter) => {
      const key = filter.dataset.crFilter;
      const value = key === 'all' ? total : count(key);

      filter.querySelector('[data-cr-filter-count]').textContent = value;
    });
  }

  function applyFilter() {
    let visible = 0;

    cards.forEach((card) => {
      card.hidden = activeFilter !== 'all' && card.dataset.status !== activeFilter;
      if (!card.hidden) visible += 1;
    });

    empty.hidden = visible !== 0;
  }

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      activeFilter = filter.dataset.crFilter;
      filters.forEach((item) => item.classList.toggle('is-active', item === filter));
      applyFilter();
    });
  });

  /* ---------- Статус доставки ---------- */

  // Строка под адресом: комментарий, пока заказ в пути, и отметка о вручении после доставки
  function renderNote(card) {
    const note = card.querySelector('.cr-note');
    const text = note.querySelector('[data-cr-note-text]');
    const isDelivered = card.dataset.status === 'delivered';

    if (isDelivered) {
      text.textContent = card.dataset.deliveredText;
    } else {
      text.textContent = card.dataset.comment;
    }

    note.classList.toggle('is-done', isDelivered);
    note.hidden = text.textContent === '';
  }

  cards.forEach((card) => {
    card.addEventListener('change', (event) => {
      if (!event.target.matches('input[type="radio"]')) return;

      card.dataset.status = event.target.value;

      if (card.dataset.status === 'delivered') {
        card.dataset.deliveredText = `Вручено клиенту в ${timeNow()}.`;
      }

      renderNote(card);
      updateStats();
      applyFilter();
    });

    renderNote(card);
  });

  /* ---------- Обновление списка ---------- */

  refresh.addEventListener('click', () => {
    updated.textContent = `Обновлено в ${timeNow()}`;
  });

  updateStats();
  applyFilter();
}

export function initCouriers() {
  document.querySelectorAll('[data-courier]').forEach(initCourier);
}
