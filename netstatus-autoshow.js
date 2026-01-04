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
                console.log('[自定义脚本] 已点击网络标签');
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
            if (parent && parent.textContent?.includes('Peak cut')) {
                if (sw.getAttribute('aria-checked') !== 'true') {
                    sw.click();
                    console.log('[自定义脚本] 已点击 Peak cut 开关');
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
        if (tabSection) {
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
            if (child.tagName === 'DIV' || child.tagName === 'SECTION') {
                child.style.display = 'block';
            }
        }
    }

    // 主执行函数
    function execute() {
        if (!checkServerPage()) return;
        if (hasClicked) return;

        const serverInfo = document.querySelector('.server-info');
        if (!serverInfo) return;

        hasClicked = true;

        setTimeout(() => {
            clickNetworkTab();
            
            setTimeout(() => {
                showBothSections();
                hideTabSection();
                setTimeout(() => clickPeakSwitch(15, 300), 300);
            }, 500);
        }, 500);
    }

    // 监听DOM变化
    const observer = new MutationObserver(() => {
        const currentIsServerPage = checkServerPage();
        
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

    setTimeout(execute, 1000);
})();
