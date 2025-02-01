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
    <div class="min-w-[350px] max-h-[500px] bg-white p-4 shadow-lg">
        <h2 class="text-2xl font-bold text-gray-800 mb-4 px-2">Clipboard History</h2>
        <div class="space-y-2 overflow-y-auto max-h-[440px] px-2">
            <div
                v-for="(item, index) in clipboardItems"
                :key="index"
                class="group bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
                <div class="flex items-center p-3 gap-3">
                    <div 
                        class="flex-1 cursor-pointer"
                        @click="copyToClipboard(item)"
                    >
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-gray-700 truncate max-w-[230px]">{{ item }}</span>
                            <span class="text-xs text-gray-500 whitespace-nowrap">{{ getTimeAgo(index) }}</span>
                        </div>
                    </div>
                    <button 
                        @click="deleteItem(index)"
                        class="text-gray-400 hover:text-red-500 transition-colors duration-200 p-1"
                    >
                        🗑️
                    </button>
                </div>
            </div>
            <div 
                v-if="clipboardItems.length === 0" 
                class="text-center py-8 text-gray-500"
            >
                No items in clipboard history
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>