// List of avatar image filenames in the avatars folder
const avatarFilenames = [
    'woman.svg',
    'girl.svg',
    'boy.svg',
    'man.svg'
];

const avatarOptions = avatarFilenames.map(filename => {
    const id = filename.replace('.svg', '');
    const name = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return {
        id,
        name,
        img: `../src/frontend/assets/${filename}`
    };
});

// Default SVG avatar (inline)
const defaultAvatarSVG = `
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="40" fill="#E0E0E0"/>
        <circle cx="40" cy="32" r="16" fill="#BDBDBD"/>
        <ellipse cx="40" cy="60" rx="22" ry="12" fill="#BDBDBD"/>
    </svg>
`;

class ProfilePictureSelector {
    constructor() {
        this.currentAvatar = this.loadSavedAvatar();
        this.init();
    }

    init() {
        this.createModal();
        this.attachEventListeners();
        this.updateProfilePicture();
    }

    loadSavedAvatar() {
        const saved = localStorage.getItem('globetalk-avatar');
        if (saved) {
            const avatar = avatarOptions.find(a => a.id === saved);
            return avatar || null;
        }
        return null;
    }

    saveAvatar(avatarId) {
        localStorage.setItem('globetalk-avatar', avatarId);
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'avatar-modal';
        modal.innerHTML = `
            <div class="avatar-modal-content">
                <div class="avatar-modal-header">
                    <h3>Choose Your Avatar</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="avatar-grid">
                    ${avatarOptions.map(avatar => `
                        <div class="avatar-option" data-avatar-id="${avatar.id}">
                            <div class="avatar-preview">
                                <img src="${avatar.img}" alt="${avatar.name}" />
                            </div>
                            <span class="avatar-name">${avatar.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles
        this.addModalStyles();
    }

    addModalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .avatar-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            .avatar-modal-content {
                background-color: #fff;
                margin: 5% auto;
                padding: 0;
                border-radius: 20px;
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            .avatar-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid #eee;
                background-color: #f8f9fa;
                border-radius: 20px 20px 0 0;
            }
            .avatar-modal-header h3 {
                margin: 0;
                font-family: 'Poppins', sans-serif;
                font-size: 24px;
                font-weight: 500;
                color: #333;
            }
            .close-modal {
                background: none;
                border: none;
                font-size: 32px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .close-modal:hover {
                background-color: #f0f0f0;
                color: #333;
            }
            .avatar-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 16px;
                padding: 24px;
            }
            .avatar-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 16px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }
            .avatar-option:hover {
                background-color: #f8f9fa;
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            .avatar-option.selected {
                border-color: #1976D2;
                background-color: #e3f2fd;
            }
            .avatar-preview {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background-color: #f0f0f0;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                transition: all 0.3s ease;
                overflow: hidden;
            }
            .avatar-preview img {
                width: 48px;
                height: 48px;
                object-fit: contain;
                border-radius: 50%;
            }
            .avatar-option.selected .avatar-preview {
                background-color: #1976D2;
            }
            .avatar-name {
                font-family: 'Inter', sans-serif;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
            .avatar-option.selected .avatar-name {
                color: #1976D2;
                font-weight: 500;
            }
            .profile-pic {
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .profile-pic:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            @media (max-width: 768px) {
                .avatar-modal-content {
                    width: 95%;
                    margin: 10% auto;
                }
                .avatar-grid {
                    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                    gap: 12px;
                    padding: 16px;
                }
                .avatar-option {
                    padding: 12px;
                }
                .avatar-preview {
                    width: 50px;
                    height: 50px;
                }
                .avatar-preview img {
                    width: 36px;
                    height: 36px;
                }
                .avatar-modal-header h3 {
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    attachEventListeners() {
        const profilePic = document.querySelector('.profile-pic');
        const modal = document.querySelector('.avatar-modal');
        const closeBtn = document.querySelector('.close-modal');

        // Open modal when clicking profile picture
        profilePic.addEventListener('click', () => {
            this.showModal();
        });

        // Close modal when clicking close button
        closeBtn.addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideModal();
            }
        });

        // Handle avatar selection
        modal.addEventListener('click', (e) => {
            const avatarOption = e.target.closest('.avatar-option');
            if (avatarOption) {
                const avatarId = avatarOption.dataset.avatarId;
                this.selectAvatar(avatarId);
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                this.hideModal();
            }
        });
    }

    showModal() {
        const modal = document.querySelector('.avatar-modal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Highlight current selection
        this.highlightCurrentSelection();
    }

    hideModal() {
        const modal = document.querySelector('.avatar-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    highlightCurrentSelection() {
        const options = document.querySelectorAll('.avatar-option');
        options.forEach(option => {
            option.classList.remove('selected');
            if (this.currentAvatar && option.dataset.avatarId === this.currentAvatar.id) {
                option.classList.add('selected');
            }
        });
    }

    selectAvatar(avatarId) {
        const avatar = avatarOptions.find(a => a.id === avatarId);
        if (avatar) {
            this.currentAvatar = avatar;
            this.saveAvatar(avatarId);
            this.updateProfilePicture();
            this.hideModal();
        }
    }

    updateProfilePicture() {
        const profilePic = document.querySelector('.profile-pic');
        if (this.currentAvatar) {
            profilePic.innerHTML = `<img src="${this.currentAvatar.img}" alt="${this.currentAvatar.name}" style="width:100%;height:100%;object-fit:contain;border-radius:50%;">`;
        } else {
            profilePic.innerHTML = defaultAvatarSVG;
        }
    }
}

// Initialize the profile picture selector when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePictureSelector();
});