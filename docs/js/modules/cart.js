// Корзина: изменение количества, удаление товаров и пересчёт итогов.
// Разметка: [data-cart] с позициями .cart-item[data-price]; кнопки с data-action
// ("decrease" | "increase" | "remove"); поля для итогов помечены data-cart-*.

import { formatPrice, plural } from '../utils/format.js';

const MIN_QTY = 1;
const MAX_QTY = 99;

function initCart(root) {
  const body = root.querySelector('.cart__body');
  const empty = root.querySelector('.cart-empty');
  const count = root.querySelector('[data-cart-count]');
  const units = root.querySelector('[data-cart-units]');
  const subtotal = root.querySelector('[data-cart-subtotal]');
  const total = root.querySelector('[data-cart-total]');

  const getItems = () => [...root.querySelectorAll('.cart-item')];

  // Пересчёт позиций и итогов заказа
  function render() {
    let totalUnits = 0;
    let totalPrice = 0;
    const items = getItems();

    items.forEach((item) => {
      const price = Number(item.dataset.price);
      const qty = Number(item.dataset.qty);
      const decrease = item.querySelector('[data-action="decrease"]');

      item.querySelector('[data-qty]').textContent = qty;
      item.querySelector('[data-line-total]').textContent = formatPrice(price * qty);
      decrease.disabled = qty <= MIN_QTY;

      totalUnits += qty;
      totalPrice += price * qty;
    });

    count.textContent = items.length
      ? `${totalUnits} ${plural(totalUnits, ['товар', 'товара', 'товаров'])} · ${items.length} ${plural(items.length, ['позиция', 'позиции', 'позиций'])}`
      : 'Корзина пуста';
    units.textContent = `Товары, ${totalUnits} шт.`;
    subtotal.textContent = formatPrice(totalPrice);
    total.textContent = formatPrice(totalPrice);

    body.hidden = items.length === 0;
    empty.hidden = items.length !== 0;
  }

  // Начальное количество берём из разметки
  getItems().forEach((item) => {
    item.dataset.qty = item.querySelector('[data-qty]').textContent.trim();
  });

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    const item = button?.closest('.cart-item');

    if (!button || !item) return;

    const qty = Number(item.dataset.qty);

    if (button.dataset.action === 'increase') item.dataset.qty = Math.min(qty + 1, MAX_QTY);
    if (button.dataset.action === 'decrease') item.dataset.qty = Math.max(qty - 1, MIN_QTY);
    if (button.dataset.action === 'remove') item.remove();

    render();
  });

  render();
}

export function initCarts() {
  document.querySelectorAll('[data-cart]').forEach(initCart);
}
