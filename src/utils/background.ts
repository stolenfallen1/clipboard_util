chrome.runtime.onInstalled.addListener(async () => {
    await chrome.storage.local.set({ items: [], timestamps: [] });

    chrome.contextMenus.create({
        id: 'copyToClipboard',
        title: 'Copy to Clipboard Util',
        contexts: ['selection'],
    });

    const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
    for (const tab of tabs) {
        if (tab.id) {
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                });
            } catch (error) {
                console.error(`Failed to inject into tab ${tab.id}:`, error);
            }
        }
    }
});

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, _tab?: chrome.tabs.Tab) => {
    if (info.menuItemId === 'copyToClipboard' && info.selectionText) {
        handleNewCopy(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'NEW_SELECTION' && message.text) {
        handleNewCopy(message.text);
    }
    if (message.type === 'DELETE_ITEM' && message.index !== undefined) {
        handleDeleteItem(message.index);
    }
    return true;
});

async function handleNewCopy(text: string) {
    try {
        const storage = await chrome.storage.local.get(['items', 'timestamps']);
        let items = Array.isArray(storage.items) ? storage.items : [];
        let timestamps = Array.isArray(storage.timestamps)? storage.timestamps : [];

        if (!items.includes(text)) {
            items.unshift(text);
            timestamps.unshift(Date.now());
        } 

        await chrome.storage.local.set({ items, timestamps });
    } catch (error) {
        console.error('Error handling new copy:', error);
        return;
    }
}

async function handleDeleteItem(index: number) {
    try {
        const storage = await chrome.storage.local.get(['items', 'timestamps']);
        const items = Array.isArray(storage.items)? storage.items : [];
        const timestamps = Array.isArray(storage.timestamps)? storage.timestamps : [];

        items.splice(index, 1);
        timestamps.splice(index, 1);

        await chrome.storage.local.set({ items, timestamps });
    } catch (error) {
        console.error('Error handling deleting items:', error);
        return;
    }
}