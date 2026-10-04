(() => {
  const root = document.documentElement;
  root.classList.add('has-js');
  try {
    if (localStorage.getItem('theme') === 'light') root.dataset.theme = 'light';
  } catch {}

  document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.theme-toggle');
    const sync = () => {
      const light = root.dataset.theme === 'light';
      const german = root.lang === 'de';
      buttons.forEach(button => {
        const label = german
          ? (light ? 'Dunkles Design aktivieren' : 'Helles Design aktivieren')
          : (light ? 'Switch to dark theme' : 'Switch to light theme');
        button.setAttribute('aria-label', label);
        button.setAttribute('title', label);
      });
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      if (theme === 'light') root.dataset.theme = 'light';
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', theme); } catch {}
      sync();
    }));
    sync();
  });
})();
