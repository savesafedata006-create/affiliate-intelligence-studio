// Shopee Extractor Background Service Worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "FOCUS_OR_OPEN_APP_TAB") {
        const targetUrl = message.url || "http://127.0.0.1:8080/#centraldb";
        
        // Query open tabs matching the Studio URL
        chrome.tabs.query({ url: ["*://127.0.0.1:8080/*", "*://localhost:8080/*"] }, (tabs) => {
            if (tabs && tabs.length > 0) {
                // Tab is already open! Switch to existing tab & focus window
                const existingTab = tabs[0];
                chrome.tabs.update(existingTab.id, { active: true, url: targetUrl }, () => {
                    if (existingTab.windowId) {
                        chrome.windows.update(existingTab.windowId, { focused: true });
                    }
                    sendResponse({ status: "focused_existing_tab", tabId: existingTab.id });
                });
            } else {
                // No open tab found! Open a new tab
                chrome.tabs.create({ url: targetUrl }, (newTab) => {
                    sendResponse({ status: "opened_new_tab", tabId: newTab.id });
                });
            }
        });
        return true; // Keep message channel open for async response
    }
});
