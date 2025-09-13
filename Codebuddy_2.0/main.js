/**
 * CodeBuddy Platform - Main JavaScript
 * Dark mode only - No theme switching
 */

class CodeBuddy {
    constructor() {
        this.user = null;
        this.socket = null;
        this.currentRoom = null;
        this.isOwner = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.initializeComponents();

        console.log('🚀 CodeBuddy Platform Initialized');
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));

        // Form submissions
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });

        // File uploads
        document.querySelectorAll('.file-upload').forEach(upload => {
            this.setupFileUpload(upload);
        });
    }

    loadUserData() {
        const userData = document.querySelector('#user-data');
        if (userData) {
            try {
                this.user = JSON.parse(userData.textContent);
                this.isOwner = this.user.role === 'owner' || this.user.is_superuser;

                if (this.isOwner) {
                    this.initializeOwnerFeatures();
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }

    initializeOwnerFeatures() {
        console.log('👑 Owner features initialized');

        // Add owner badges
        document.querySelectorAll('.user-avatar, .message-author').forEach(element => {
            if (element.dataset.userId === this.user.id) {
                element.classList.add('owner');
            }
        });

        // Show owner controls
        document.querySelectorAll('.owner-only').forEach(element => {
            element.style.display = 'block';
        });
    }

    initializeComponents() {
        // Initialize tooltips
        this.initializeTooltips();

        // Initialize modals
        this.initializeModals();

        // Initialize dropdowns
        this.initializeDropdowns();

        // Initialize WebSocket if on room pages
        if (document.querySelector('.room-chat')) {
            this.initializeWebSocket();
        }
    }

    initializeTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip.bind(this));
            element.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    initializeModals() {
        // Modal triggers
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(trigger.dataset.modal);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', this.closeModal.bind(this));
        });

        // Close modal on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });
    }

    initializeDropdowns() {
        document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(trigger.nextElementSibling);
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        });
    }

    initializeWebSocket() {
        const roomId = document.querySelector('.room-chat').dataset.roomId;
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/room/${roomId}/`;

        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket connected');
        };

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.socket.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                this.initializeWebSocket();
            }, 3000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'message':
                this.displayMessage(data);
                break;
            case 'typing':
                this.handleTypingIndicator(data);
                break;
            case 'user_joined':
                this.handleUserJoined(data);
                break;
            case 'user_left':
                this.handleUserLeft(data);
                break;
            case 'error':
                this.showNotification(data.message, 'error');
                break;
        }
    }

    displayMessage(messageData) {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;

        const messageElement = this.createMessageElement(messageData);
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate new message
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }

    createMessageElement(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${data.author.is_owner ? 'owner-message' : ''}`;

        messageDiv.innerHTML = `
            <div class="message-avatar ${data.author.is_owner ? 'owner' : ''}">
                ${data.author.avatar || data.author.username.charAt(0).toUpperCase()}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author ${data.author.is_owner ? 'owner' : ''}">
                        ${data.author.username}
                        ${data.author.is_owner ? '<span class="owner-badge">👑 Owner</span>' : ''}
                    </span>
                    <span class="message-timestamp">${this.formatTimestamp(data.created_at)}</span>
                </div>
                <div class="message-text">${this.formatMessageContent(data.content)}</div>
                ${data.attachments ? this.renderAttachments(data.attachments) : ''}
            </div>
        `;

        return messageDiv;
    }

    formatMessageContent(content) {
        // Basic message formatting
        return content
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

        return date.toLocaleDateString();
    }

    sendMessage() {
        const messageInput = document.querySelector('.message-input');
        if (!messageInput || !this.socket) return;

        const content = messageInput.value.trim();
        if (!content) return;

        this.socket.send(JSON.stringify({
            type: 'message',
            content: content,
            room_id: this.currentRoom
        }));

        messageInput.value = '';
    }

    setupFileUpload(uploadElement) {
        const input = uploadElement.querySelector('input[type="file"]');
        const dropZone = uploadElement.querySelector('.drop-zone');

        if (!input || !dropZone) return;

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');

            const files = Array.from(e.dataTransfer.files);
            this.handleFileSelection(files, uploadElement);
        });

        // File input change
        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFileSelection(files, uploadElement);
        });
    }

    handleFileSelection(files, uploadElement) {
        files.forEach(file => {
            if (this.validateFile(file)) {
                this.uploadFile(file, uploadElement);
            }
        });
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['pdf', 'doc', 'docx', 'txt', 'md', 'py', 'js', 'html', 'css', 'json', 'jpg', 'jpeg', 'png', 'gif'];

        if (file.size > maxSize) {
            this.showNotification(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error');
            return false;
        }

        const extension = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(extension)) {
            this.showNotification(`File type ".${extension}" is not allowed.`, 'error');
            return false;
        }

        return true;
    }

    async uploadFile(file, uploadElement) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                }
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification(`File "${file.name}" uploaded successfully!`, 'success');

                // Send file message via WebSocket
                if (this.socket) {
                    this.socket.send(JSON.stringify({
                        type: 'file_message',
                        file_data: result,
                        room_id: this.currentRoom
                    }));
                }
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            this.showNotification(`Failed to upload "${file.name}".`, 'error');
        }
    }

    // Utility methods
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.classList.add('modal-open');
        }
    }

    closeModal() {
        document.querySelectorAll('.modal.open').forEach(modal => {
            modal.classList.remove('open');
        });
        document.body.classList.remove('modal-open');
    }

    toggleDropdown(dropdown) {
        if (dropdown) {
            dropdown.classList.toggle('open');
        }
    }

    showTooltip(event) {
        const element = event.target;
        const text = element.dataset.tooltip;

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        element._tooltip = tooltip;
    }

    hideTooltip(event) {
        const element = event.target;
        if (element._tooltip) {
            element._tooltip.remove();
            delete element._tooltip;
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name=csrf-token]')?.content || '';
    }

    handleGlobalClick(event) {
        // Handle global click events
        if (event.target.matches('.btn[data-action]')) {
            this.handleButtonAction(event.target);
        }
    }

    handleGlobalKeydown(event) {
        // Handle global keyboard shortcuts
        if (event.key === 'Escape') {
            this.closeModal();
        }

        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    // Open search modal
                    break;
                case 'Enter':
                    if (document.activeElement.matches('.message-input')) {
                        event.preventDefault();
                        this.sendMessage();
                    }
                    break;
            }
        }
    }

    handleButtonAction(button) {
        const action = button.dataset.action;

        switch (action) {
            case 'send-message':
                this.sendMessage();
                break;
            case 'upload-file':
                document.querySelector('.file-input').click();
                break;
            case 'toggle-owner-controls':
                this.toggleOwnerControls();
                break;
        }
    }

    toggleOwnerControls() {
        const ownerPanel = document.querySelector('.owner-controls-panel');
        if (ownerPanel) {
            ownerPanel.classList.toggle('open');
        }
    }

    handleFormSubmit(event) {
        const form = event.target;
        const submitBtn = form.querySelector('[type="submit"]');

        if (submitBtn && !submitBtn.disabled) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Processing...';

            // Re-enable after 5 seconds as fallback
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
            }, 5000);
        }
    }
}

// Initialize CodeBuddy when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.codebuddy = new CodeBuddy();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeBuddy;
}
