// 只用CSS控制显示，JS只执行一次点击
(function() {
    // 1. 注入CSS样式（安全，不会触发React问题）
    const style = document.createElement('style');
    style.textContent = `
        .server-info > div:nth-child(4),
        .server-info > div:nth-child(5) {
            display: block !important;
        }
        .server-info > section.flex.items-center {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // 2. 一次性点击网络标签加载数据
    function clickOnce() {
        const tabs = document.querySelectorAll('.server-info-tab .cursor-pointer');
        for (const tab of tabs) {
            if (tab.textContent?.includes('网络')) {
                tab.click();
                // 点击Peak开关
                setTimeout(() => {
                    const sw = document.querySelector('button[role="switch"]');
                    if (sw && sw.getAttribute('aria-checked') !== 'true') {
                        sw.click();
                    }
                }, 1000);
                return;
            }
        }
        // 如果没找到，300ms后重试（最多重试20次）
        if (clickOnce.retry < 20) {
            clickOnce.retry++;
            setTimeout(clickOnce, 300);
        }
    }
    clickOnce.retry = 0;

    // 页面加载后执行一次
    if (document.readyState === 'complete') {
        setTimeout(clickOnce, 500);
    } else {
        window.addEventListener('load', () => setTimeout(clickOnce, 500));
    }
})();
