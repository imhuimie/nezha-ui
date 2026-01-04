(function () {
    'use strict';

    let hasExecuted = false;
    let isProcessing = false;

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
                return true;
            }
        }
        return false;
    }

    // 查找并点击Peak cut开关
    function clickPeakSwitch(retryCount = 10, interval = 300) {
        const switches = document.querySelectorAll('button[role="switch"]');
        for (const sw of switches) {
            const parent = sw.parentElement;
            if (parent && parent.textContent?.includes('Peak')) {
                if (sw.getAttribute('aria-checked') !== 'true') {
                    sw.click();
                }
                return true;
            }
        }
        if (retryCount > 0) {
            setTimeout(() => clickPeakSwitch(retryCount - 1, interval), interval);
        }
        return false;
    }

    // 隐藏标签切换区域
    function hideTabSection() {
        const tabSection = document.querySelector('.server-info > section.flex.items-center');
        if (tabSection && tabSection.style.display !== 'none') {
            tabSection.style.display = 'none';
        }
    }

    // 同时显示详情和网络区域
    function showBothSections() {
        const serverInfo = document.querySelector('.server-info');
        if (!serverInfo) return;

        const children = serverInfo.children;
        for (let i = 2; i < children.length; i++) {
            const child = children[i];
            if ((child.tagName === 'DIV' || child.tagName === 'SECTION') && child.style.display === 'none') {
                child.style.display = 'block';
            }
        }
    }

    // 主执行函数
    function execute() {
        if (!checkServerPage()) return;
        if (hasExecuted || isProcessing) return;

        const serverInfo = document.querySelector('.server-info');
        if (!serverInfo || serverInfo.children.length < 3) return;

        isProcessing = true;

        // 暂停observer
        observer.disconnect();

        setTimeout(() => {
            clickNetworkTab();
            
            setTimeout(() => {
                showBothSections();
                hideTabSection();
                hasExecuted = true;
                isProcessing = false;
                
                setTimeout(() => clickPeakSwitch(10, 300), 300);
            }, 500);
        }, 300);
    }

    // 监听URL变化重置状态
    let lastPath = window.location.pathname;
    
    const observer = new MutationObserver(() => {
        // 检查URL是否变化
        if (window.location.pathname !== lastPath) {
            lastPath = window.location.pathname;
            hasExecuted = false;
            isProcessing = false;
        }
        
        if (!hasExecuted && !isProcessing && checkServerPage()) {
            execute();
        }
    });

    const root = document.querySelector('#root');
    if (root) {
        observer.observe(root, {
            childList: true,
            subtree: true
        });
    }

    // 初始执行
    setTimeout(execute, 800);
})();
