import { getActiveUserCount, getFlaggedUserCount, getBannedUserCount } from '../../services/admin.js';

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

    const counts = await getAdminCounts();

    if (activeUsersEl) activeUsersEl.textContent = counts.active;
    if (flaggedUsersEl) flaggedUsersEl.textContent = counts.flagged;
    if (bannedUsersEl) bannedUsersEl.textContent = counts.banned;
});