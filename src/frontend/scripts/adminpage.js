import { getActiveUserCount, getFlaggedUserCount, getBannedUserCount } from '../../services/admin.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Get elements
    const activeUsersEl = document.getElementById('activeUsersCount');
    const flaggedUsersEl = document.getElementById('flaggedUsersCount');
    const bannedUsersEl = document.getElementById('bannedUsersCount');

    // Fetch and display counts
    if (activeUsersEl) {
        activeUsersEl.textContent = await getActiveUserCount();
    }
    if (flaggedUsersEl) {
        flaggedUsersEl.textContent = await getFlaggedUserCount();
    }
    if (bannedUsersEl) {
        bannedUsersEl.textContent = await getBannedUserCount();
    }
});