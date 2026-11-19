(() => {
  const button = document.getElementById('language');
  const blocks = [...document.querySelectorAll('[data-ko]')].map(node => [node, node.textContent]);
  const petImages = [...document.querySelectorAll('[data-alt-ko]')].map(node => [node, node.alt]);
  const links = document.querySelectorAll('[data-local-section]');
  let language = navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en';

  function render() {
    document.documentElement.lang = language;
    button.lang = language === 'ko' ? 'en' : 'ko';
    button.textContent = language === 'ko' ? 'English' : '한국어';
    for (const [node, english] of blocks) node.textContent = language === 'ko' ? node.dataset.ko : english;
    for (const [node, english] of petImages) node.alt = language === 'ko' ? node.dataset.altKo : english;
    for (const link of links) link.hash = language;
  }

  button.addEventListener('click', () => {
    language = language === 'en' ? 'ko' : 'en';
    render();
  });
  render();
  button.hidden = false;
})();
