// Общие функции форматирования для модулей

const numberFormat = new Intl.NumberFormat('ru-RU');

// Цена с неразрывными пробелами: 4 200 ₽
export const formatPrice = (value) => `${numberFormat.format(value)}\u00a0₽`;

// Выбор формы слова по числу: forms = ['товар', 'товара', 'товаров']
export function plural(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}
