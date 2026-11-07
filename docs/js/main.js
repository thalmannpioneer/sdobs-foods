// Точка входа: подключает модули отдельных элементов сайта
import { initDropdowns } from './modules/dropdown.js';
import { initBurgers } from './modules/burger.js';
import { initCarousels } from './modules/carousel.js';
import { initAuthForms } from './modules/auth.js';
import { initGalleries } from './modules/gallery.js';
import { initTabsAll } from './modules/tabs.js';
import { initProfileForms } from './modules/profile.js';
import { initCarts } from './modules/cart.js';
import { initOrders } from './modules/orders.js';
import { initOperators } from './modules/operator.js';
import { initProductions } from './modules/production.js';
import { initCouriers } from './modules/courier.js';
import { initAdmins } from './modules/admin.js';

initDropdowns();
initBurgers();
initCarousels();
initAuthForms();
initGalleries();
initTabsAll();
initProfileForms();
initCarts();
initOrders();
initOperators();
initProductions();
initCouriers();
initAdmins();
