/**
 * MYSHOP Admin Dashboard Centralized Architecture
 * Unifies Security Guards, Shared Utilities, UI Notifications & Modals
 */

const AdminAuth = {
    getHeaders(isJson = true) {
        const headers = {};
        if (isJson) {
            headers['Content-Type'] = 'application/json';
        }
        return headers;
    },

    async verifyAdmin() {
        try {
            const res = await fetch('/api/user/profile', {
                credentials: 'include',
                headers: this.getHeaders(false)
            });

            if (!res.ok) {
                throw new Error('Unauthorized');
            }

            const user = await res.json();
            if (!user || user.role !== 'admin') {
                this.clearAuth();
                window.location.href = '../index.html';
                return null;
            }

            const userTag = document.getElementById('adminUserTag');
            if (userTag) {
                userTag.textContent = user.username || 'مدير النظام';
            }

            return user;
        } catch (e) {
            this.clearAuth();
            window.location.href = '../account.html';
            return null;
        }
    },

    clearAuth() {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
    },

    async logout() {
        const confirmed = await AdminUI.confirm('هل ترغب في تسجيل الخروج من لوحة الإدارة؟', 'تسجيل الخروج');
        if (!confirmed) return;

        try {
            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: this.getHeaders(true)
            }).catch(() => {});
        } catch (e) {}

        this.clearAuth();
        window.location.href = '../account.html';
    }
};

const AdminUI = {
    init() {
        this.initTheme();
        this.initMobileNav();
        this.initLogoutHandler();
    },

    initTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
    },

    initMobileNav() {
        const sidebar = document.querySelector('.sidebar');
        const header = document.querySelector('header .container');
        if (!sidebar || !header) return;

        // Add toggle button if not exists
        let toggleBtn = document.getElementById('adminSidebarToggle');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'adminSidebarToggle';
            toggleBtn.className = 'admin-menu-toggle';
            toggleBtn.setAttribute('aria-label', 'فتح القائمة الجانبية');
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            header.insertBefore(toggleBtn, header.firstChild);
        }

        // Overlay
        let overlay = document.getElementById('adminSidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'adminSidebarOverlay';
            overlay.className = 'admin-sidebar-overlay';
            document.body.appendChild(overlay);
        }

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('sidebar-open');
        };

        toggleBtn.addEventListener('click', () => {
            const isOpen = sidebar.classList.toggle('open');
            overlay.classList.toggle('active', isOpen);
            document.body.classList.toggle('sidebar-open', isOpen);
        });

        overlay.addEventListener('click', closeSidebar);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });
    },

    initLogoutHandler() {
        const logoutBtn = document.getElementById('adminLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AdminAuth.logout();
            });
        }
    },

    showToast(message, type = 'info', duration = 3500) {
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.className = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `admin-toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
            <span>${AdminTable.escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    confirm(message, title = 'تأكيد الإجراء') {
        return new Promise((resolve) => {
            let modal = document.getElementById('adminConfirmModal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'adminConfirmModal';
                modal.className = 'admin-modal-backdrop';
                modal.innerHTML = `
                    <div class="admin-confirm-card">
                        <h3 id="adminConfirmTitle"></h3>
                        <p id="adminConfirmMessage"></p>
                        <div class="admin-confirm-actions">
                            <button id="adminConfirmCancel" class="btn-secondary">إلغاء</button>
                            <button id="adminConfirmOk" class="btn-primary">تأكيد</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const titleEl = document.getElementById('adminConfirmTitle');
            const msgEl = document.getElementById('adminConfirmMessage');
            const okBtn = document.getElementById('adminConfirmOk');
            const cancelBtn = document.getElementById('adminConfirmCancel');

            titleEl.textContent = title;
            msgEl.textContent = message;
            modal.style.display = 'flex';

            const cleanup = (result) => {
                modal.style.display = 'none';
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                resolve(result);
            };

            okBtn.onclick = () => cleanup(true);
            cancelBtn.onclick = () => cleanup(false);
        });
    }
};

const AdminTable = {
    escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    debounce(fn, delay = 300) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    renderPagination({ containerId, current, total, onPageClickName }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (total <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= total; i++) {
            if (i === current) {
                html += `<button class="page-btn active" style="padding: 6px 12px; background: var(--primary-color, #2563eb); color: #fff; border: 1px solid var(--primary-color, #2563eb); border-radius: 6px; font-weight: bold;">${i}</button>`;
            } else if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                html += `<button class="page-btn" onclick="${onPageClickName}(${i})" style="padding: 6px 12px; background: var(--card-bg, #fff); color: var(--text-color, #334155); border: 1px solid var(--border-color, #cbd5e1); border-radius: 6px; cursor: pointer;">${i}</button>`;
            } else if (i === current - 2 || i === current + 2) {
                html += `<span style="padding: 6px 4px; color: var(--light-text, #64748b);">...</span>`;
            }
        }
        container.innerHTML = html;
    }
};

// Global Exposure
window.AdminAuth = AdminAuth;
window.AdminUI = AdminUI;
window.AdminTable = AdminTable;

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    AdminUI.init();
});
