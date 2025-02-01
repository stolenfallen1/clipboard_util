<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ClipboardStorage {
    items: string[];
    timestamps: number[];
}

const clipboardItems = ref<string[]>([]);
const timestamps = ref<number[]>([]);
const maxItems = 20;

const addToHistory = async (text: string) => {
    if (!text || clipboardItems.value.includes(text)) return;

    clipboardItems.value.unshift(text);
    timestamps.value.unshift(Date.now());

    if (clipboardItems.value.length > maxItems) {
        clipboardItems.value.pop();
        timestamps.value.pop();
    }

    await chrome.storage.local.set({
        items: clipboardItems.value,
        timestamps: timestamps.value
    })
}

const copyToClipboard = async (text: string) => {
    try {

        await navigator.clipboard.writeText(text);
        const index = clipboardItems.value.indexOf(text);
        if (index > 0) {
            clipboardItems.value.splice(index, 1);
            timestamps.value.splice(index, 1);
            await addToHistory(text);
        }

    } catch (error) {
        console.error('Failed to copy: ', error);
    }
}

const getTimeAgo = (index: number): string | undefined => {

    const diff = Date.now() - timestamps.value[index];
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
}

const deleteItem = async (index: number) => {
    try {
        await chrome.runtime.sendMessage({  type: 'DELETE_ITEM', index });
    } catch (error) {
        console.error('Failed to delete: ', error);
    }
}

onMounted(async () => {
    try {
        const storage = await chrome.storage.local.get(['items', 'timestamps']) as ClipboardStorage;
        clipboardItems.value = storage.items || [];
        timestamps.value = storage.timestamps || [];

        chrome.storage.onChanged.addListener((changes) => {
            if (changes.items?.newValue) clipboardItems.value = changes.items.newValue;
            if (changes.timestamps?.newValue) timestamps.value = changes.timestamps.newValue;
        });
    } catch (error) {
        console.error('Failed to load: ', error);
    }
});

</script>

<template>
    <div class="clipboard-container">
        <h2>Clipboard History</h2>
        <div class="clipboard-list">
            <div
                v-for="(item, index) in clipboardItems"
                :key="index"
                class="clipboard-item"
            >
                <div class="item-content" @click="copyToClipboard(item)">
                <span class="item-text">{{ item }}</span>
                <span class="item-time">{{ getTimeAgo(index) }}</span>
                </div>
                <button class="delete-btn" @click="deleteItem(index)">🗑️</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.clipboard-container {
    width: 300px;
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;
    background-color: white;
    color: #333;
    border: 1px solid #ccc;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.clipboard-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.clipboard-item {
    padding: 8px;
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}

.clipboard-item:hover {
    background-color: #f5f5f5;
}

.item-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}

.item-time {
    font-size: 0.8em;
    color: #666;
}

.item-content {
    flex-grow: 1;
    cursor: pointer;
}

.delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
}

.delete-btn:hover {
    opacity: 1;
}
</style>