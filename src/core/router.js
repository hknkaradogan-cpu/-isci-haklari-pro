// Basit hash tabanlı yönlendirici (#severance gibi düz adlar)
const routes = {};
let outlet = null, current = null;
const listeners = [];

export function registerRoutes(map) { Object.assign(routes, map); }
export function onRouteChange(fn) { listeners.push(fn); }
export function nav(name) {
  if (location.hash.slice(1) === name) render();
  else location.hash = name;
}
export function back() {
  if (history.length > 1 && current !== 'dashboard') history.back();
  else nav('dashboard');
}
export const currentRoute = () => current;

function render() {
  const name = location.hash.slice(1) || 'dashboard';
  const page = routes[name] || routes.dashboard;
  current = routes[name] ? name : 'dashboard';
  const view = document.createElement('div');
  view.className = 'view enter';
  outlet.replaceChildren(view);
  page.render(view);
  window.scrollTo(0, 0);
  document.title = current === 'dashboard' ? 'İşçi Hakları Pro' : `${page.title} · İşçi Hakları Pro`;
  listeners.forEach((fn) => fn(current));
}

export function startRouter(el) {
  outlet = el;
  window.addEventListener('hashchange', render);
  render();
}
