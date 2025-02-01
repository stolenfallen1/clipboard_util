interface MessageResponse {
    success: boolean;
    message?: string;
}

document.addEventListener('copy', () => {

    const selection = window.getSelection();
    if (selection) {
        const selectedText = selection.toString().trim();
        if (!selectedText) {
            return;
        } else {
            chrome.runtime.sendMessage({
                type: 'NEW_SELECTION',
                text: selectedText
            }, (response: MessageResponse) => {
                console.log(response);
            });
        }
    }
});