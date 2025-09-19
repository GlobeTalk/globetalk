import { getActiveUserCount, getFlaggedUserCount, getBannedUserCount, getFlaggedUsers, banUser } from '../../services/admin.js';

// Import auth functions
import { auth } from '../../services/firebase-temp.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";


export async function getAdminCounts() {
    return {
        active: await getActiveUserCount(),
        flagged: await getFlaggedUserCount(),
        banned: await getBannedUserCount()
    };
}

// Keep your DOMContentLoaded code for the actual page
document.addEventListener('DOMContentLoaded', async () => {

    
      onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = '../pages/login.html';
        }
    });
    const activeUsersEl = document.getElementById('activeUsersCount');
    const flaggedUsersEl = document.getElementById('flaggedUsersCount');
    const bannedUsersEl = document.getElementById('bannedUsersCount');
    const flaggedContentList = document.getElementById('flaggedContentList');
    // Restore counts
    const counts = await getAdminCounts();
    if (activeUsersEl) activeUsersEl.textContent = counts.active;
    if (flaggedUsersEl) flaggedUsersEl.textContent = counts.flagged;
    if (bannedUsersEl) bannedUsersEl.textContent = counts.banned;
    // Modal HTML
    function createUserModal({ userid, dateStr, report }, onBan) {
        // Remove any existing modal
        const oldModal = document.getElementById('manageUserModal');
        if (oldModal) oldModal.remove();
        const modal = document.createElement('div');
        modal.id = 'manageUserModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        modal.innerHTML = `
            <div style="background:#fff;padding:2.5rem 2rem;border-radius:20px;min-width:320px;max-width:90vw;box-shadow:0 10px 30px rgba(0,0,0,0.2);">
                <h2 style="margin-bottom:1.5rem;font-size:2rem;">Manage User</h2>
                <div style="margin-bottom:1rem;font-size:1.25rem;"><strong>Username:</strong> ${userid}</div>
                <div style="margin-bottom:1rem;font-size:1.25rem;"><strong>Date:</strong> ${dateStr}</div>
                <div style="margin-bottom:2rem;font-size:1.25rem;"><strong>Report:</strong> ${report}</div>
                <button id="banUserBtn" style="background:#d32f2f;color:#fff;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.25rem;cursor:pointer;">Ban user</button>
                <button id="closeModalBtn" style="margin-left:1rem;background:#eee;color:#333;border:none;padding:1rem 2rem;border-radius:12px;font-size:1.1rem;cursor:pointer;">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('closeModalBtn').onclick = () => modal.remove();
        document.getElementById('banUserBtn').onclick = async () => {
            await onBan();
            modal.remove();
        };
        // Close modal on outside click
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    }

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
                    console.log('report:', doc.id,  data);
                    const userid = data.reportedUid || 'Unknown User';
                    let dateStr = data.timestamp || '';
                    const report = data.reason || 'No reason provided';

                    // Handle Firestore Timestamp or string
                    if (typeof dateStr === 'object' && dateStr !== null && typeof dateStr.toDate === 'function') {
                        const d = dateStr.toDate();
                        const day = d.getDate();
                        const month = d.toLocaleString('default', { month: 'short' });
                        const year = d.getFullYear();
                        const hours = d.getHours().toString().padStart(2, '0');
                        const minutes = d.getMinutes().toString().padStart(2, '0');
                        const tzOffset = -d.getTimezoneOffset();
                        const tzSign = tzOffset >= 0 ? '+' : '-';
                        const tzHour = Math.floor(Math.abs(tzOffset) / 60);
                        dateStr = `${day} ${month} ${year}, ${hours}:${minutes} UTC${tzSign}${tzHour}`;
                    } else if (typeof dateStr === 'string') {
                        let prettyDate = dateStr;
                        try {
                            const dateMatch = dateStr.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4}) at (\d{2}:\d{2})(?::\d{2})? (UTC[+-]\d+)/);
                            if (dateMatch) {
                                const day = dateMatch[1];
                                const month = dateMatch[2].slice(0,3);
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
                            <button class="manage-user-btn">
                                <span>Manage user</span>
                            </button>
                        </div>
                    `;
                    // Add event listener for modal
                    item.querySelector('.manage-user-btn').onclick = () => {
                        createUserModal({ userid, dateStr, report }, async () => {
                            try {
                                await banUser(userid);
                                alert(`User ${userid} has been banned.`);
                            } catch (e) {
                                alert('Failed to ban user.');
                            }
                        });
                    };
                    flaggedContentList.appendChild(item);
                });
            }
        } catch (error) {
            flaggedContentList.innerHTML = '<div>Error loading flagged content.</div>';
        }
    }
});

