(function() {
  if (window.__nz) return;
  window.__nz = true;

  function run() {
    if (!/^\/server\/\d+$/.test(location.pathname)) return;
    
    const tab = [...document.querySelectorAll('.server-info-tab [class*="cursor-pointer"]')]
      .find(t => t.textContent?.trim() === '网络');
    if (!tab) return setTimeout(run, 300);

    tab.click();

    setTimeout(() => {
      const info = document.querySelector('.server-info');
      if (!info) return;
      
      const sec = info.querySelector('section.flex.items-center');
      if (sec) sec.style.display = 'none';
      
      if (info.children[3]) info.children[3].style.display = 'block';
      if (info.children[4]) info.children[4].style.display = 'block';

      // 只点击一次Peak
      const sw = document.querySelector('button[role="switch"]');
      if (sw && sw.getAttribute('aria-checked') !== 'true') sw.click();
    }, 1000);
  }

  setTimeout(run, 500);
  window.addEventListener('popstate', () => { window.__nz = false; setTimeout(run, 300); });
})();
