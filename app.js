// Get data that was stored by the background.js
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['logEntries'], (result) => {
        const logEntries = result.logEntries || [];
        updateUI(logEntries);
    });

    // For generate-report button
    document.getElementById('generate-report').addEventListener('click', () => {
        generateReport();
    });

    // for clear data button
    document.getElementById('clear-data').addEventListener('click', () => {
        // Send message to background script to clear data
        chrome.runtime.sendMessage({ action: 'clearLogEntries' }, (response) => {
            if (response.status === 'success') {
                updateUI([]); // Clear UI
            } else {
                console.error('Failed to clear data.');
            }
        });
    });
});

// == Function to Update Extension App
function updateUI(entries) {
    const statusElement = document.getElementById('app-status');
    const tableBody = document.getElementById('table-body');

    if (!statusElement || !tableBody) {
        console.error('Error: Required elements not found.');
        return;
    }

    // Determine status
    const allSuccess = entries.length > 0 && entries.every(entry => entry.status === 'Success');
    const status = allSuccess ? 'Success' : 'Fail';
    statusElement.textContent = `Status: ${status}`;
    statusElement.className = status === 'Success' ? 'info-header success' : 'info-header fail';

    // Populate the table
    tableBody.innerHTML = ''; // Clear existing table rows
    entries.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.url}</td>
            <td>${entry.method}</td>
            <td>${entry.statusCode}</td>
            <td>${entry.nonLowerCaseHeaders || '-'}</td>
            <td>${entry.status}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Generate HTML report
function generateReport() {
    chrome.storage.local.get(['logEntries'], (result) => {
        const logEntries = result.logEntries || [];
        const reportWindow = window.open('', '_blank');

        let html = `
            <html>
            <head>
                <title>Report</title>
                <link rel="stylesheet" href="css/report.css">
            </head>
            <body>
                <div id="report-section">
                    <h1>API Call Report</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>Request URL</th>
                                <th>Request Method</th>
                                <th>Status Code</th>
                                <th>Non-Lowercase Headers</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logEntries.map(entry => `
                                <tr>
                                    <td id="request-url">${entry.url}</td>
                                    <td>${entry.method}</td>
                                    <td>${entry.statusCode}</td>
                                    <td>${entry.nonLowerCaseHeaders || '-'}</td>
                                    <td class="${entry.status.toLowerCase()}">${entry.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
        `;

        reportWindow.document.write(html);
        reportWindow.document.close();
    });
}
