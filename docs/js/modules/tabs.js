// Вкладки («Описание» / «Отзывы»).
// Разметка: [data-tabs] > [role="tablist"] с кнопками [role="tab"] (aria-controls = id панели)
// и панели [role="tabpanel"].

function initTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls')));

  function select(index) {
    tabs.forEach((tab, i) => {
      const isActive = i === index;

      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (panels[i]) panels[i].hidden = !isActive;
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));

    // Переключение вкладок стрелками клавиатуры
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = (i + step + tabs.length) % tabs.length;

      select(next);
      tabs[next].focus();
    });
  });

  // Начальная вкладка — та, у которой aria-selected="true"
  select(Math.max(0, tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true')));
}

export function initTabsAll() {
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
}
