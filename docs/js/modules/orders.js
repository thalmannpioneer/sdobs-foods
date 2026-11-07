// Список заказов: раскрытие и сворачивание подробностей заказа.
// Разметка: .order (класс is-open у раскрытого заказа) с кнопкой .order__toggle
// и любыми кнопками с атрибутом data-order-toggle («Подробнее о заказе», «Свернуть подробности»).

const OPEN_CLASS = 'is-open';

function initOrder(order) {
  const toggle = order.querySelector('.order__toggle');
  const triggers = order.querySelectorAll('[data-order-toggle]');

  if (!toggle) return;

  function setOpen(isOpen) {
    order.classList.toggle(OPEN_CLASS, isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Свернуть заказ' : 'Раскрыть заказ');
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => setOpen(!order.classList.contains(OPEN_CLASS)));
  });

  // Начальное состояние берём из разметки (class="order is-open")
  setOpen(order.classList.contains(OPEN_CLASS));
}

export function initOrders() {
  document.querySelectorAll('.order').forEach(initOrder);
}
