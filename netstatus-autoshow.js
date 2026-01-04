(function() {
  if (window.__nezhaLoaded) return;
  window.__nezhaLoaded = true;

  function isServerPage() {
    return /^\/server\/\d+$/.test(window.location.pathname);
  }

  let executed = {};

  function run() {
    if (!isServerPage()) return;
    
    const path = window.location.pathname;
    if (executed[path]) return;

    const serverInfo = document.querySelector('.server-info');
    const tabs = document.querySelectorAll('.server-info-tab [class*="cursor-pointer"]');
    if (!serverInfo || tabs.length < 2) {
      setTimeout(run, 300);
      return;
    }

    // 找到网络标签
    let networkTab = null;
    for (const tab of tabs) {
      if (tab.textContent?.trim() === '网络') {
        networkTab = tab;
        break;
      }
    }
    if (!networkTab) {
      setTimeout(run, 300);
      return;
    }

    executed[path] = true;

    // 第一步：点击网络标签加载数据
    networkTab.click();

    // 第二步：等待数据加载后，让两个区域都显示
    setTimeout(() => {
      // 隐藏标签栏
      const tabSection = serverInfo.querySelector('section.flex.items-center');
      if (tabSection) tabSection.style.display = 'none';

      // 显示两个内容区域
      if (serverInfo.children[3]) serverInfo.children[3].style.display = 'block';
      if (serverInfo.children[4]) serverInfo.children[4].style.display = 'block';

      // 尝试点击Peak开关
      setTimeout(() => {
        const sw = document.querySelector('button[role="switch"]');
        if (sw && sw.getAttribute('aria-checked') !== 'true') {
          sw.click();
        }
      }, 500);
    }, 800);
  }

  // 监听路由变化
  const origPush = history.pushState;
  history.pushState = function() {
    origPush.apply(this, arguments);
    setTimeout(run, 300);
  };
  window.addEventListener('popstate', () => setTimeout(run, 300));

  // 初始执行
  setTimeout(run, 800);
})();
