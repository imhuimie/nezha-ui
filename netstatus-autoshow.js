// ==UserScript==
// @version      1.1
// @description  哪吒详情页直接展示网络波动卡片 (兼容新版)
// @author       https://github.com/imhuimie
// ==/UserScript==

(function () {
    'use strict';

    // 配置：CSS类名和选择器
    // 注意：Tailwind 类名可能会变，尽量使用结构性选择器
    const SELECTORS = {
        // server-info 容器
        serverInfo: '.server-info',
        // 详情页切换按钮所在的 Section (需要隐藏)
        tabSection: '.server-info > section:nth-of-type(1)', /* 通常是第一个 section */
        // 详情卡片 (旧版是3,4; 新版通常是 server-info 的直接子元素)
        // 假设除去第一个 section (tab selector)，剩下的 div 都是内容卡片
        contentCards: '.server-info > div',
        // Peak 按钮
        peakButton: '#Peak'
    };

    let hasClicked = false;
    let divVisible = false;

    // 获取“网络”按钮 (通过文本内容查找，比 nth-child 更稳健)
    function getNetworkButton() {
        const potentialButtons = document.querySelectorAll('.server-info section div');
        for (const btn of potentialButtons) {
            if (btn.innerText.includes('网络') || btn.innerText.includes('Network')) {
                // 往往点击的是这个 div 或者它的父级，寻找 cursor-pointer
                if (btn.classList.contains('cursor-pointer')) return btn;
                return btn.closest('.cursor-pointer');
            }
        }
        // Fallback: 假设是第二个可点击的 tab
        return document.querySelector('.server-info section div.relative.cursor-pointer:nth-child(2)');
    }

    // 强制显示所有详情卡片 (CPU/内存 和 网络)
    function forceBothVisible() {
        const cards = document.querySelectorAll(SELECTORS.contentCards);
        cards.forEach(card => {
            // 简单粗暴：所有 server-info 下的 div 直接显示
            // 排除掉可能是干扰项的元素 (如果有)
            if (getComputedStyle(card).display === 'none') {
                card.style.setProperty('display', 'block', 'important');
            }
        });
    }

    // 隐藏 Tab 切换栏
    function hideSection() {
        const section = document.querySelector(SELECTORS.tabSection);
        if (section) {
            section.style.setProperty('display', 'none', 'important');
        }
    }

    // 尝试点击“网络”按钮以加载网络图表
    function tryClickButton() {
        const btn = getNetworkButton();
        if (btn && !hasClicked) {
            console.log('[UserScript] Clicking Network button...');
            btn.click();
            hasClicked = true;
            // 点击后，页面可能会重新渲染部分内容，稍后强制显示
            setTimeout(forceBothVisible, 500);
            setTimeout(forceBothVisible, 1500);
        }
    }

    // 尝试点击 Peak 按钮 (如果存在)
    function tryClickPeak(retryCount = 10, interval = 200) {
        const peakBtn = document.querySelector(SELECTORS.peakButton);
        if (peakBtn) {
            peakBtn.click();
            console.log('[UserScript] Clicked Peak button');
        } else if (retryCount > 0) {
            setTimeout(() => tryClickPeak(retryCount - 1, interval), interval);
        }
    }

    const observer = new MutationObserver(() => {
        const cards = document.querySelectorAll(SELECTORS.contentCards);
        
        // 只要能找到详情卡片，就认为是加载了
        const isLoaded = cards.length > 0;

        if (isLoaded) {
            // 如果还没点击过，且现在可见了
            if (!hasClicked) {
                 // 很多时候页面刚加载时只显示了 Detail (CPU/RAM)，Network 是隐藏的或不存在的
                 // 我们需要点击 Network 按钮来把 Network 图表加载出来
                 hideSection();
                 tryClickButton();
                 setTimeout(() => tryClickPeak(15, 200), 300);
            }
            
            // 持续强制显示
            forceBothVisible();
        }
    });

    const root = document.querySelector('#root');
    if (root) {
        observer.observe(root, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
    }
})();
