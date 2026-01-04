// ==UserScript==
// @name         哪吒详情页直接展示网络波动卡片
// @version      2.0
// @description  哪吒详情页直接展示网络波动卡片
// @author       https://github.com/imhuimie
// @match        https://tz.cuowu.de/*
// @grant        none
// ==/UserScript==
(function () {
    'use strict';
    let hasClicked = false;
    let isServerPage = false;
    // 检查是否在服务器详情页
    function checkServerPage() {
        return /\/server\/\d+/.test(window.location.pathname);
    }
    // 查找并点击网络标签
    function clickNetworkTab() {
        const tabs = document.querySelectorAll('.server-info-tab .cursor-pointer');
        for (const tab of tabs) {
            if (tab.textContent?.includes('网络')) {
                tab.click();
                console.log('[UserScript] 已点击网络标签');
                return true;
            }
        }
        return false;
    }
    // 查找并点击Peak cut开关
    function clickPeakSwitch(retryCount = 10, interval = 300) {
        const switches = document.querySelectorAll('button[role="switch"]');
        for (const sw of switches) {
            // 检查开关旁边是否有"Peak cut"文本
            const parent = sw.parentElement;
            if (parent && parent.textContent?.includes('Peak cut')) {
                // 只有在开关未激活时才点击
                if (sw.getAttribute('aria-checked') !== 'true') {
                    sw.click();
                    console.log('[UserScript] 已点击 Peak cut 开关');
                }
                return true;
            }
        }
        
        if (retryCount > 0) {
            console.log('[UserScript] 未找到 Peak cut 开关，等待重试...');
            setTimeout(() => clickPeakSwitch(retryCount - 1, interval), interval);
        } else {
            console.log('[UserScript] 超过最大重试次数，未找到 Peak cut 开关');
        }
        return false;
    }
    // 隐藏标签切换区域
    function hideTabSection() {
        const tabSection = document.querySelector('.server-info > section.flex.items-center');
        if (tabSection) {
            tabSection.style.display = 'none';
            console.log('[UserScript] 已隐藏标签切换区域');
        }
    }
    // 同时显示详情和网络区域
    function showBothSections() {
        const serverInfo = document.querySelector('.server-info');
        if (!serverInfo) return;
        const children = serverInfo.children;
        // 通常结构：[0]=头部信息, [1]=标签区, [2]=概览, [3]=详情, [4]=网络
        // 确保第4个和第5个子元素都可见
        for (let i = 2; i < children.length; i++) {
            const child = children[i];
            if (child.tagName === 'DIV' || child.tagName === 'SECTION') {
                child.style.display = 'block';
            }
        }
        console.log('[UserScript] 已设置所有区域可见');
    }
    // 主执行函数
    function execute() {
        if (!checkServerPage()) return;
        if (hasClicked) return;
        const serverInfo = document.querySelector('.server-info');
        if (!serverInfo) return;
        hasClicked = true;
        console.log('[UserScript] 检测到服务器详情页，开始执行...');
        // 1. 先点击网络标签，触发网络内容加载
        setTimeout(() => {
            clickNetworkTab();
            
            // 2. 等待内容加载后显示所有区域
            setTimeout(() => {
                showBothSections();
                hideTabSection();
                
                // 3. 尝试点击Peak开关
                setTimeout(() => clickPeakSwitch(15, 300), 300);
            }, 500);
        }, 500);
    }
    // 监听DOM变化
    const observer = new MutationObserver(() => {
        const currentIsServerPage = checkServerPage();
        
        // 页面切换时重置状态
        if (currentIsServerPage !== isServerPage) {
            isServerPage = currentIsServerPage;
            hasClicked = false;
        }
        
        if (isServerPage && !hasClicked) {
            execute();
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
    // 初始执行
    setTimeout(execute, 1000);
})();
