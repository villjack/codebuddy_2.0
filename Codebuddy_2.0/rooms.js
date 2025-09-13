/**
 * CodeBuddy Rooms - Enhanced Room Interface (Dark Mode Only)
 * Improved subroom visibility and owner features
 */

class RoomInterface {
    constructor() {
        this.currentRoom = null;
        this.currentSubroom = null;
        this.socket = null;
        this.selectedFiles = [];
        this.typingTimeout = null;
        this.isOwner = false;

        this.init();
    }

    init() {
        this.loadRoomData();
        this.setupEventListeners();
        this.initializeSocket();

        console.log('🏠 Room Interface Initialized');
    }

    loadRoomData() {
        const roomData = document.querySelector('#room-data');
        if (roomData) {
            try {
                this.roomData = JSON.parse(roomData.textContent);
                this.renderRoomStructure();
            } catch (e) {
                console.error('Failed to parse room data:', e);
            }
        }
    }

    renderRoomStructure() {
        const sidebar = document.querySelector('.room-sidebar');
        if (!sidebar || !this.roomData) return;

        const categoriesHTML = this.roomData.categories.map(category => `
            <div class="room-category">
                <div class="category-header" data-category="${category.slug}">
                    <i class="${category.icon}" style="color: ${category.color}"></i>
                    <span>${category.name}</span>
                    <i class="fas fa-chevron-down category-toggle"></i>
                </div>
                <div class="room-list">
                    ${category.rooms.map(room => this.renderRoom(room)).join('')}
                </div>
            </div>
        `).join('');

        sidebar.innerHTML = categoriesHTML;
    }

    renderRoom(room) {
        const subroomsHTML = room.subrooms && room.subrooms.length > 0 
            ? `<div class="subroom-list" style="display: none;">
                ${room.subrooms.map(subroom => `
                    <div class="subroom-item" 
                         data-room-id="${room.id}" 
                         data-subroom-id="${subroom.id}"
                         data-parent-color="${room.color}">
                        <span class="subroom-hash">#</span>
                        <span class="subroom-name">${subroom.name}</span>
                        <button class="room-info-btn" title="Room Info">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                `).join('')}
               </div>`
            : '';

        return `
            <div class="room-item" 
                 data-room-id="${room.id}" 
                 data-room-color="${room.color}">
                <i class="${room.icon}" style="color: ${room.color}"></i>
                <span class="room-name">${room.name}</span>
                <span class="member-count">${room.memberCount || 0}</span>
                <button class="room-info-btn" title="Room Info">
                    <i class="fas fa-info-circle"></i>
                </button>
            </div>
            ${subroomsHTML}
        `;
    }

    setupEventListeners() {
        // Room navigation
        document.addEventListener('click', (e) => {
            const roomItem = e.target.closest('.room-item');
            const subroomItem = e.target.closest('.subroom-item');
            const categoryHeader = e.target.closest('.category-header');
            const roomInfoBtn = e.target.closest('.room-info-btn');

            if (roomInfoBtn) {
                e.stopPropagation();
                this.showRoomInfo(roomInfoBtn);
            } else if (subroomItem) {
                this.selectSubroom(subroomItem);
            } else if (roomItem) {
                this.selectRoom(roomItem);
            } else if (categoryHeader) {
                this.toggleCategory(categoryHeader);
            }
        });

        // Message input
        const messageInput = document.querySelector('.message-input');
        if (messageInput) {
            messageInput.addEventListener('input', () => this.handleTyping());
            messageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // File upload
        const fileUploadBtn = document.querySelector('.file-upload-btn');
        if (fileUploadBtn) {
            fileUploadBtn.addEventListener('click', () => this.openFileUpload());
        }

        // Owner controls
        const ownerControlsBtn = document.querySelector('.owner-controls-btn');
        if (ownerControlsBtn) {
            ownerControlsBtn.addEventListener('click', () => this.toggleOwnerControls());
        }
    }

    selectRoom(roomElement) {
        // Remove active state from all items
        document.querySelectorAll('.room-item, .subroom-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active state to selected room
        roomElement.classList.add('active');

        // Show/hide subrooms with improved styling
        const subroomList = roomElement.parentElement.querySelector('.subroom-list');
        if (subroomList) {
            const isVisible = subroomList.style.display === 'block';
            subroomList.style.display = isVisible ? 'none' : 'block';

            // Apply parent room color to subrooms
            const roomColor = roomElement.dataset.roomColor;
            subroomList.querySelectorAll('.subroom-item').forEach(subroom => {
                subroom.style.setProperty('--parent-color', roomColor);
                subroom.classList.add('inherit-parent-color');
            });
        }

        // Update current room
        this.currentRoom = roomElement.dataset.roomId;
        this.currentSubroom = null;

        // Update chat header
        this.updateChatHeader(roomElement.querySelector('.room-name').textContent);

        // Connect to room
        this.connectToRoom(this.currentRoom);
    }

    selectSubroom(subroomElement) {
        // Remove active state
        document.querySelectorAll('.room-item, .subroom-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active state with parent color
        subroomElement.classList.add('active');

        // Update current selection
        this.currentRoom = subroomElement.dataset.roomId;
        this.currentSubroom = subroomElement.dataset.subroomId;

        // Update chat header
        const subroomName = subroomElement.querySelector('.subroom-name').textContent;
        this.updateChatHeader(subroomName);

        // Connect to subroom
        this.connectToSubroom(this.currentRoom, this.currentSubroom);
    }

    toggleCategory(categoryHeader) {
        const toggle = categoryHeader.querySelector('.category-toggle');
        const roomList = categoryHeader.parentElement.querySelector('.room-list');

        const isCollapsed = roomList.classList.contains('collapsed');

        if (isCollapsed) {
            roomList.classList.remove('collapsed');
            toggle.style.transform = 'rotate(0deg)';
        } else {
            roomList.classList.add('collapsed');
            toggle.style.transform = 'rotate(-90deg)';
        }
    }

    updateChatHeader(roomName) {
        const chatHeader = document.querySelector('.chat-header-title');
        if (chatHeader) {
            chatHeader.textContent = roomName;
        }

        // Update room info
        this.updateRoomInfo();
    }

    updateRoomInfo() {
        const roomInfo = this.findRoomData(this.currentRoom, this.currentSubroom);
        const descriptionElement = document.querySelector('.chat-description');

        if (roomInfo && descriptionElement) {
            descriptionElement.textContent = roomInfo.description || '';
        }
    }

    findRoomData(roomId, subroomId = null) {
        for (const category of this.roomData?.categories || []) {
            const room = category.rooms.find(r => r.id === roomId);
            if (room) {
                if (subroomId) {
                    return room.subrooms?.find(s => s.id === subroomId) || room;
                }
                return room;
            }
        }
        return null;
    }

    showRoomInfo(button) {
        const roomData = this.getCurrentRoomData(button);
        if (!roomData) return;

        const modal = document.createElement('div');
        modal.className = 'room-info-modal';
        modal.innerHTML = `
            <div class="room-info-content">
                <div class="room-info-header">
                    <h3>${roomData.name}</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="room-info-body">
                    <div class="room-description">
                        <h4>About</h4>
                        <p>${roomData.description || 'No description available.'}</p>
                    </div>
                    ${roomData.detailedInfo ? `
                        <div class="room-detailed-info">
                            <h4>Details</h4>
                            <p>${roomData.detailedInfo.replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}
                    <div class="room-stats">
                        <h4>Statistics</h4>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-value">${roomData.memberCount || 0}</span>
                                <span class="stat-label">Members</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${roomData.messageCount || 0}</span>
                                <span class="stat-label">Messages</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getCurrentRoomData(button) {
        const roomItem = button.closest('.room-item');
        const subroomItem = button.closest('.subroom-item');

        if (subroomItem) {
            const roomId = subroomItem.dataset.roomId;
            const subroomId = subroomItem.dataset.subroomId;
            return this.findRoomData(roomId, subroomId);
        } else if (roomItem) {
            const roomId = roomItem.dataset.roomId;
            return this.findRoomData(roomId);
        }

        return null;
    }

    // WebSocket methods
    initializeSocket() {
        // Socket initialization will be handled by main app
        console.log('🔌 Room socket ready');
    }

    connectToRoom(roomId) {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/room/${roomId}/`;
        this.initWebSocket(wsUrl);
    }

    connectToSubroom(roomId, subroomId) {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/room/${roomId}/subroom/${subroomId}/`;
        this.initWebSocket(wsUrl);
    }

    initWebSocket(url) {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log('🔗 Connected to room');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            console.log('🔌 Room connection closed');
        };
    }

    handleMessage(data) {
        if (window.codebuddy && window.codebuddy.handleWebSocketMessage) {
            window.codebuddy.handleWebSocketMessage(data);
        }
    }

    sendMessage() {
        if (window.codebuddy && window.codebuddy.sendMessage) {
            window.codebuddy.sendMessage();
        }
    }

    handleTyping() {
        // Typing indicator logic
        clearTimeout(this.typingTimeout);

        if (this.socket) {
            this.socket.send(JSON.stringify({
                type: 'typing',
                is_typing: true
            }));

            this.typingTimeout = setTimeout(() => {
                this.socket.send(JSON.stringify({
                    type: 'typing',
                    is_typing: false
                }));
            }, 2000);
        }
    }

    openFileUpload() {
        // File upload modal logic
        const modal = document.querySelector('.file-upload-modal');
        if (modal) {
            modal.classList.add('open');
        }
    }

    toggleOwnerControls() {
        const ownerPanel = document.querySelector('.owner-controls-panel');
        if (ownerPanel) {
            ownerPanel.classList.toggle('open');
        }
    }
}

// Initialize room interface
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.room-interface')) {
        window.roomInterface = new RoomInterface();
    }
});
