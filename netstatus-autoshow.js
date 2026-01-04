/**
 * 哪吒探针详情页增强脚本 v3.0
 * 功能：在服务器详情页同时展示详情和网络波动卡片
 */

// ========== CSS部分（安全，不会循环） ==========
const nezhaStyle = document.createElement('style');
nezhaStyle.id = 'nezha-enhance-style';
nezhaStyle.textContent = `
  .server-info > section.flex.items-center.my-2 {
    display: none !important;
  }
  .server-info > div:nth-child(4),
  .server-info > div:nth-child(5) {
    display: block !important;
  }
`;
if (!document.getElementById('nezha-enhance-style')) {
  document.head.appendChild(nezhaStyle);
}

// ========== JS部分（最小化，防重复） ==========
(function() {
  if (window.__nezhaEnhanceLoaded) return;
  window.__nezhaEnhanceLoaded = true;

  function isServerPage() {
    return /^\/server\/\d+$/.test(window.location.pathname);
  }

  function triggerNetworkLoad() {
    const tabs = document.querySelectorAll('.server-info-tab [class*="cursor-pointer"]');
    for (const tab of tabs) {
      if (tab.textContent && tab.textContent.trim() === '网络') {
        tab.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        setTimeout(tryClickPeak, 1000);
        return true;
      }
    }
    return false;
  }

  function tryClickPeak() {
    const switchBtn = document.querySelector('button[role="switch"]');
    if (switchBtn && switchBtn.getAttribute('aria-checked') !== 'true') {
      const parent = switchBtn.closest('div');
      if (parent && parent.textContent && parent.textContent.includes('Peak')) {
        switchBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    }
  }

  let lastPath = '';
  let attempts = 0;

  function checkAndExecute() {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      attempts = 0;
    }
    if (!isServerPage()) return;

    const serverInfo = document.querySelector('.server-info');
    if (!serverInfo && attempts < 30) {
      attempts++;
      setTimeout(checkAndExecute, 200);
      return;
    }

    const networkDiv = serverInfo?.children[4];
    if (networkDiv && (!networkDiv.textContent || networkDiv.textContent.trim().length < 10)) {
      if (attempts < 30) {
        attempts++;
        if (!triggerNetworkLoad()) {
          setTimeout(checkAndExecute, 200);
        }
      }
    }
  }

  // 监听SPA路由变化
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function() { origPush.apply(this, arguments); setTimeout(checkAndExecute, 100); };
  history.replaceState = function() { origReplace.apply(this, arguments); setTimeout(checkAndExecute, 100); };
  window.addEventListener('popstate', () => setTimeout(checkAndExecute, 100));

  // 初始执行
  setTimeout(checkAndExecute, 500);
})();
