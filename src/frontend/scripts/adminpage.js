import { getActiveUserCount, getFlaggedUserCount, getBannedUserCount, getFlaggedUsers } from '../../services/admin.js';

export async function getAdminCounts() {
    return {
        active: await getActiveUserCount(),
        flagged: await getFlaggedUserCount(),
        banned: await getBannedUserCount()
    };
}

// Keep your DOMContentLoaded code for the actual page
document.addEventListener('DOMContentLoaded', async () => {
    const activeUsersEl = document.getElementById('activeUsersCount');
    const flaggedUsersEl = document.getElementById('flaggedUsersCount');
    const bannedUsersEl = document.getElementById('bannedUsersCount');
    const flaggedContentList = document.getElementById('flaggedContentList');

    const counts = await getAdminCounts();

    if (activeUsersEl) activeUsersEl.textContent = counts.active;
    if (flaggedUsersEl) flaggedUsersEl.textContent = counts.flagged;
    if (bannedUsersEl) bannedUsersEl.textContent = counts.banned;

    // Render flagged content
    if (flaggedContentList) {
        try {
            const flaggedSnapshot = await getFlaggedUsers();
            console.log('Flagged Snapshot:', flaggedSnapshot);
            flaggedContentList.innerHTML = '';
            if (flaggedSnapshot.empty || flaggedSnapshot.size === 0) {
                flaggedContentList.innerHTML = '<div>There are no flagged users.</div>';
            } else {
                flaggedSnapshot.forEach(doc => {
                    const data = doc.data();
                    const userid = data.userid || 'Unknown User';
                    let dateStr = data.date || '';
                    const report = data.report || 'No reason provided';

                        // Handle Firestore Timestamp or string
                        if (typeof dateStr === 'object' && dateStr !== null && typeof dateStr.toDate === 'function') {
                            // Firestore Timestamp object
                            const d = dateStr.toDate();
                            // Format: "1 Sep 2025, 20:22 UTC+2" (local time)
                            const day = d.getDate();
                            const month = d.toLocaleString('default', { month: 'short' });
                            const year = d.getFullYear();
                            const hours = d.getHours().toString().padStart(2, '0');
                            const minutes = d.getMinutes().toString().padStart(2, '0');
                            // Timezone offset
                            const tzOffset = -d.getTimezoneOffset();
                            const tzSign = tzOffset >= 0 ? '+' : '-';
                            const tzHour = Math.floor(Math.abs(tzOffset) / 60);
                            dateStr = `${day} ${month} ${year}, ${hours}:${minutes} UTC${tzSign}${tzHour}`;
                        } else if (typeof dateStr === 'string') {
                            // Format date string: "1 September 2025 at 20:22:01 UTC+2"
                            let prettyDate = dateStr;
                            try {
                                const dateMatch = dateStr.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4}) at (\d{2}:\d{2})(?::\d{2})? (UTC[+-]\d+)/);
                                if (dateMatch) {
                                    const day = dateMatch[1];
                                    const month = dateMatch[2].slice(0,3); // Short month
                                    const year = dateMatch[3];
                                    const time = dateMatch[4];
                                    const tz = dateMatch[5];
                                    prettyDate = `${day} ${month} ${year}, ${time} ${tz}`;
                                }
                            } catch (e) {
                                console.log('Date formatting error:', e);
                            }
                            dateStr = prettyDate;
                        }

                        const item = document.createElement('div');
                        item.className = 'content-item';
                        item.innerHTML = `
                            <div class="flex-container">
                                <div class="user-info">
                                    <div class="user-details">
                                        <span>${userid}</span>
                                        <span>${dateStr}</span>
                                    </div>
                                    <div>Report: ${report}</div>
                                </div>
                                <button>
                                    <span>Manage user</span>
                                </button>
                            </div>
                        `;
                        flaggedContentList.appendChild(item);
                    });
            }
        } catch (error) {
            flaggedContentList.innerHTML = '<div>Error loading flagged content.</div>';
        }
    }
});