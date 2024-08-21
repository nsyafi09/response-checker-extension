let logEntries = [];
let status = "Ready";

// Listener for network requests
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
        const url = details.url;
        const method = details.method;
        const statusCode = details.statusCode;
        const headers = details.responseHeaders;
        const allLowerCase = headers.every(header => header.name === header.name.toLowerCase());

        let statusMessage = "Success";
        let nonLowerCaseHeaders = '';

        if (!allLowerCase) {
            statusMessage = "Fail";
            nonLowerCaseHeaders = headers.filter(header => header.name !== header.name.toLowerCase())
                                          .map(header => header.name)
                                          .join(', ');
        }

        logEntries.push({
            url: url,
            method: method,
            statusCode: statusCode,
            nonLowerCaseHeaders: nonLowerCaseHeaders,
            status: statusMessage
        });

        chrome.storage.local.set({ logEntries: logEntries }, () => {
            chrome.action.setBadgeText({ text: statusMessage });
            chrome.action.setBadgeBackgroundColor({ color: statusMessage === "Success" ? "#4CAF50" : "#F44336" });
        });

        // chrome.notifications.create({
        //     type: 'basic',
        //     iconUrl: 'icons/icon128.png',
        //     title: 'Header Case Checker',
        //     message: `URL: ${url} | Method: ${method} | Status: ${statusMessage}`
        // });
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);


// Handle messages to clear data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'clearLogEntries') {
        clearLogEntries();
        sendResponse({ status: 'success' });
    }
});

// Clear data when page is refreshed or new page is entered
function clearLogEntries() {
    logEntries = [];
    chrome.storage.local.remove('logEntries', () => {
        chrome.action.setBadgeText({ text: '' }); // Clear badge text
        chrome.action.setBadgeBackgroundColor({ color: '#FFFFFF' }); // Set badge to default color
    });
}