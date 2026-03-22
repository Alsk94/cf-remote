// OAuth and Manual Login Implementation
class ZeroTrustApp {
    constructor() {
        this.accountId = null;
        this.apiToken = null;
        this.policies = [];
        this.filteredPolicies = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
    }

    bindEvents() {
        const cloudflareBtn = document.getElementById('cloudflare-login-btn');
        const manualToggle = document.getElementById('manual-login-toggle');
        const backBtn = document.getElementById('back-to-oauth');
        const manualForm = document.getElementById('manual-login-form');
        
        if (cloudflareBtn) cloudflareBtn.addEventListener('click', () => this.handleCloudflareLogin());
        if (manualToggle) manualToggle.addEventListener('click', () => this.toggleManualLogin());
        if (backBtn) backBtn.addEventListener('click', () => this.toggleManualLogin());
        if (manualForm) manualForm.addEventListener('submit', (e) => this.handleManualLogin(e));
        
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadPolicies());
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('policy-modal').addEventListener('click', (e) => {
            if (e.target.id === 'policy-modal') this.closeModal();
        });
    }

    checkAuth() {
        // Check for OAuth callback
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('code')) {
            this.handleOAuthCallback(urlParams.get('code'));
            return;
        }

        const accountId = localStorage.getItem('cf_account_id');
        const apiToken = localStorage.getItem('cf_api_token');
        
        if (accountId && apiToken) {
            this.accountId = accountId;
            this.apiToken = apiToken;
            this.showScreen('main-screen');
            this.loadPolicies();
        } else {
            this.showScreen('login-screen');
        }
    }

    handleCloudflareLogin() {
        // Note: Replace with your actual OAuth Client ID
        const clientId = 'YOUR_CLOUDFLARE_OAUTH_CLIENT_ID';
        const redirectUri = window.location.origin;
        const scope = 'account:read gateway:read gateway:edit';
        
        const authUrl = `https://dash.cloudflare.com/oauth2/auth?` +
            `response_type=code&` +
            `client_id=${clientId}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scope)}`;
        
        window.location.href = authUrl;
    }

    async handleOAuthCallback(code) {
        this.showToast('Completing login...', 'info');
        
        try {
            const response = await fetch('/api/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            if (!response.ok) {
                throw new Error('OAuth authentication failed');
            }

            const data = await response.json();
            
            localStorage.setItem('cf_account_id', data.account_id);
            localStorage.setItem('cf_api_token', data.access_token);
            
            this.accountId = data.account_id;
            this.apiToken = data.access_token;
            
            window.history.replaceState({}, document.title, window.location.pathname);
            
            this.showScreen('main-screen');
            this.loadPolicies();
            this.showToast('Login successful!', 'success');
        } catch (error) {
            console.error('OAuth error:', error);
            this.showToast('OAuth login failed. Please try manual login.', 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
            this.showScreen('login-screen');
        }
    }

    toggleManualLogin() {
        const oauthForm = document.querySelector('.form:not(#manual-login-form)');
        const manualForm = document.getElementById('manual-login-form');
        
        if (manualForm.style.display === 'none' || !manualForm.style.display) {
            oauthForm.style.display = 'none';
            manualForm.style.display = 'block';
        } else {
            oauthForm.style.display = 'block';
            manualForm.style.display = 'none';
        }
    }

    async handleManualLogin(e) {
        e.preventDefault();
        
        const accountId = document.getElementById('account-id').value.trim();
        const apiToken = document.getElementById('api-token').value.trim();
        
        if (!accountId || !apiToken) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const response = await fetch(`/api/accounts/${accountId}/gateway/rules`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Account-ID': accountId,
                    'X-API-Token': apiToken
                }
            });

            if (!response.ok) {
                throw new Error('Invalid credentials');
            }

            localStorage.setItem('cf_account_id', accountId);
            localStorage.setItem('cf_api_token', apiToken);
            
            this.accountId = accountId;
            this.apiToken = apiToken;
            
            this.showScreen('main-screen');
            this.loadPolicies();
            this.showToast('Login successful!', 'success');
        } catch (error) {
            this.showToast('Login failed. Please check your credentials.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Login with API Token';
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('cf_account_id');
            localStorage.removeItem('cf_api_token');
            this.accountId = null;
            this.apiToken = null;
            this.policies = [];
            this.showScreen('login-screen');
            const manualForm = document.getElementById('manual-login-form');
            if (manualForm) manualForm.reset();
        }
    }

    async loadPolicies() {
        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch(`/api/accounts/${this.accountId}/gateway/rules`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Account-ID': this.accountId,
                    'X-API-Token': this.apiToken
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load policies');
            }

            const data = await response.json();
            this.policies = data.result || [];
            this.filteredPolicies = this.policies;
            this.renderPolicies();
        } catch (error) {
            this.showError('Failed to load policies. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async togglePolicy(policyId) {
        const policy = this.policies.find(p => p.id === policyId);
        if (!policy) return;

        const newEnabled = !policy.enabled;
        
        try {
            const response = await fetch(`/api/accounts/${this.accountId}/gateway/rules/${policyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Account-ID': this.accountId,
                    'X-API-Token': this.apiToken
                },
                body: JSON.stringify({
                    ...policy,
                    enabled: newEnabled
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update policy');
            }

            policy.enabled = newEnabled;
            this.renderPolicies();
            this.showToast(`Policy ${newEnabled ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            this.showToast('Failed to update policy', 'error');
        }
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filteredPolicies = this.policies.filter(policy => 
            policy.name.toLowerCase().includes(query) ||
            (policy.description && policy.description.toLowerCase().includes(query))
        );
        this.renderPolicies();
    }

    renderPolicies() {
        const container = document.getElementById('policies-list');
        
        if (this.filteredPolicies.length === 0) {
            container.innerHTML = '<div class="empty-state">No policies found</div>';
            return;
        }

        container.innerHTML = this.filteredPolicies.map(policy => `
            <div class="policy-card">
                <div class="policy-header">
                    <div>
                        <h3>${this.escapeHtml(policy.name)}</h3>
                        ${policy.description ? `<p>${this.escapeHtml(policy.description)}</p>` : ''}
                    </div>
                    <label class="toggle">
                        <input type="checkbox" ${policy.enabled ? 'checked' : ''} 
                               onchange="app.togglePolicy('${policy.id}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="policy-meta">
                    <span class="badge">${policy.action || 'N/A'}</span>
                    ${policy.precedence ? `<span class="badge">Priority: ${policy.precedence}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showLoading(show) {
        const loader = document.getElementById('loading');
        loader.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        const error = document.getElementById('error-message');
        error.textContent = message;
        error.style.display = 'block';
    }

    hideError() {
        document.getElementById('error-message').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    closeModal() {
        document.getElementById('policy-modal').style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new ZeroTrustApp();
