// ==UserScript==
// @version      1.2
// @description  哪吒详情页直接展示网络波动卡片 (兼容新版-修复转圈问题)
// @author       https://www.nodeseek.com/post-349102-1
// ==/UserScript==

(function () {
    'use strict';

    // 标志位：防止重复点击和死循环
    let isSetupDone = false;
    let styleInjected = false;

    const SEARCH_INTERVAL = 300; // 轮询检查间隔(ms)
    
    // 注入CSS样式：使用 CSS 强制显示内容，比 JS 循环修改 style 更高效且稳定
    function injectStyles() {
        if (styleInjected) return;
        
        const style = document.createElement('style');
        style.innerHTML = \`
            /* 1. 隐藏包含“网络”按钮的 Tab 栏 (通常是第一个 Section) */
            .server-info > section:first-of-type {
                display: none !important;
            }

            /* 2. 强制显示所有内容卡片 */
            /* 排除第一个 section (Tab栏)，显示其他所有 section 和 div */
            .server-info > div,
            .server-info > section:not(:first-of-type) {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        \`;
        document.head.appendChild(style);
        styleInjected = true;
        console.log('[UserScript] CSS injected');
    }

    // 查找“网络”按钮
    function getNetworkButton() {
        // 查找包含“网络”或“Network”文本的可点击元素
        const potentialButtons = document.querySelectorAll('.server-info section div.cursor-pointer, .server-info section div[class*="cursor-pointer"]');
        for (const btn of potentialButtons) {
            if (btn.innerText.includes('网络') || btn.innerText.includes('Network')) {
                return btn;
            }
        }
        return null;
    }

    // 尝试点击 Peak 按钮 (独立逻辑，只重试有限次数)
    function tryClickPeak(maxRetries = 20) {
        let retries = 0;
        const peakInterval = setInterval(() => {
            const peakBtn = document.querySelector('#Peak');
            if (peakBtn) {
                peakBtn.click();
                console.log('[UserScript] Peak button clicked');
                clearInterval(peakInterval);
            } else {
                retries++;
                if (retries >= maxRetries) clearInterval(peakInterval);
            }
        }, 300);
    }

    // 核心初始化逻辑
    function initLogic() {
        // 如果页面没有 server-info，说明可能没加载完或不在详情页
        if (!document.querySelector('.server-info')) {
            // 如果之前标记了完成，但现在找不到元素了（比如路由跳转），需要重置标志位
            if (isSetupDone) {
                 isSetupDone = false;
                 console.log('[UserScript] Page reset detected, resetting flags');
            }
            return;
        }

        // 如果已经处理过，跳过
        if (isSetupDone) return;

        const netBtn = getNetworkButton();
        if (netBtn) {
            console.log('[UserScript] Found Network button, initializing...');
            
            // 1. 点击网络按钮触发加载
            netBtn.click();
            
            // 2. 注入样式 (强制显示所有内容)
            injectStyles();

            // 3. 异步点击 Peak (如果存在)
            tryClickPeak();

            // 4. 标记完成
            isSetupDone = true;
        }
    }

    // 使用 setInterval 替代 MutationObserver，避免 DOM 变更循环
    setInterval(initLogic, SEARCH_INTERVAL);

})();
