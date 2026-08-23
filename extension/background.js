// 🤖 Background Service Worker — Background Auto-Clicker Engine
let autoClickerTabIds = new Set();
let alarmName = "auto_clicker_tick_alarm";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "START_BACKGROUND_AUTO_CLICKER") {
        if (sender.tab && sender.tab.id) {
            autoClickerTabIds.add(sender.tab.id);
            console.log(`🤖 Started Background Auto-Clicker for Tab ${sender.tab.id}`);
            ensureAlarmRunning();
            sendResponse({ status: "started", tabId: sender.tab.id });
        }
    } else if (message.action === "STOP_BACKGROUND_AUTO_CLICKER") {
        if (sender.tab && sender.tab.id) {
            autoClickerTabIds.delete(sender.tab.id);
            console.log(`⏹️ Stopped Background Auto-Clicker for Tab ${sender.tab.id}`);
            if (autoClickerTabIds.size === 0) {
                chrome.alarms.clear(alarmName);
            }
            sendResponse({ status: "stopped" });
        }
    }
    return true;
});

function ensureAlarmRunning() {
    chrome.alarms.get(alarmName, (alarm) => {
        if (!alarm) {
            chrome.alarms.create(alarmName, { periodInMinutes: 0.05 }); // ~3 seconds interval
        }
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === alarmName) {
        if (autoClickerTabIds.size === 0) {
            chrome.alarms.clear(alarmName);
            return;
        }

        autoClickerTabIds.forEach((tabId) => {
            chrome.tabs.sendMessage(tabId, { action: "AUTO_CLICKER_BACKGROUND_TICK" }, (res) => {
                if (chrome.runtime.lastError) {
                    // Tab might be closed or navigated away
                    autoClickerTabIds.delete(tabId);
                }
            });
        });
    }
});
