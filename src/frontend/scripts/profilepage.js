import { auth} from '/src/services/firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from '/src/services/profile.js';

// Set the profile picture to default and make it unclickable
document.addEventListener('DOMContentLoaded', () => {
    const profilePic = document.querySelector('.profile-pic');
    if (profilePic) {
        profilePic.innerHTML = `
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="#E0E0E0"/>
                <circle cx="40" cy="32" r="16" fill="#BDBDBD"/>
                <ellipse cx="40" cy="60" rx="22" ry="12" fill="#BDBDBD"/>
            </svg>
        `;
        profilePic.style.pointerEvents = 'none';
        profilePic.style.cursor = 'default';
    }
});


       // Utility to render hobbies as icons/text (simple version)
        function renderHobbies(hobbies) {
            if (!Array.isArray(hobbies)) return '';
            return hobbies.map(hobby => `
                <div class="hobby-item">
                    <span class="hobby-text">${hobby}</span>
                </div>
            `).join('');
        }

        // Default SVG avatar (inline)
        const defaultAvatarSVG = `
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="40" fill="#E0E0E0"/>
                <circle cx="40" cy="32" r="16" fill="#BDBDBD"/>
                <ellipse cx="40" cy="60" rx="22" ry="12" fill="#BDBDBD"/>
            </svg>
        `;

    document.addEventListener('DOMContentLoaded', () => {
            // Helper to get query param
            function getQueryParam(param) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(param);
            }
            // Add click event to Start a Chat button
            const chatBtn = document.querySelector('.start-chat-btn');
            if (chatBtn) {
                chatBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'findPal.html';
                });
            }

            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    window.location.href = 'login.html';
                    return;
                }
                // Require userId from query param
                const userId = getQueryParam('userId');
                if (!userId) {
                    document.querySelector('.main-container').innerHTML = '<div style="color:red;font-size:1.2rem;padding:2rem;">Error: No userId provided in the URL.</div>';
                    return;
                }
                // Fetch user profile from Firestore
                console.log("Fetching profile for userId:", userId);
                
                try {
                    const data = await getUserProfile(userId);
                    console.log("Profile data:", data);
                    if (data) {

                        document.getElementById('username').textContent = data.username || 'Unknown User';
                        document.getElementById('userDescription').textContent = data.bio ||  'No bio provided.';
                        document.getElementById('ageDetail').textContent = `Age: ${data.ageRange || ''}`;
                        document.getElementById('genderDetail').textContent = `Gender: ${data.gender || ''}`;
                        document.getElementById('regionDetail').textContent = `Region: ${data.region || ''}`;
                        document.getElementById('languagesDetail').textContent = `Languages: ${(Array.isArray(data.languages) ? data.languages.join(', ') : (data.languages || ''))}`;
                        document.getElementById('hobbiesList').innerHTML = renderHobbies(data.hobbies || []);
                        // Always show default avatar
                        document.getElementById('profilePic').innerHTML = defaultAvatarSVG;
                    } else {
                        document.querySelector('.profile-card').innerHTML = '<p>No profile found.</p>';
                    }
                } catch (e) {
                    document.querySelector('.profile-card').innerHTML = '<p>Error loading profile.</p>';
                }
            });
        });