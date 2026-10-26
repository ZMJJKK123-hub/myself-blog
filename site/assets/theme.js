(() => {
  let theme = 'light';
  try { theme = localStorage.getItem('liyixin-theme') || 'light'; } catch {}
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
})();
