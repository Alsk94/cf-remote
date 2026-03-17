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
        document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('refresh-btn').addEventListener('click', () => this.loadPolicies());
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('policy-modal').addEventListener('click', (e) => {
            if (e.target.id === 'policy-modal') this.closeModal();
        });
    }

    checkAuth() {
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

    async handleLogin(e) {
        e.preventDefault();
        
        const accountId = document.getElementById('account-id').value.trim();
        const apiToken = document.getElementById('api-token').value.trim();
        
        if (!accountId || !apiToken) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const btn = e.target.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'Logging in...';

        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/gateway/rules`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
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
            btn.textContent = 'Login';
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
            document.getElementById('login-form').reset();
        }
    }

    async loadPolicies() {
        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/gateway/rules`, {
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load policies');
            }

            const data = await response.json();
            this.policies = data.result || [];
            this.filteredPolicies = [...this.policies];
            this.renderPolicies();
            this.showToast('Policies refreshed', 'success');
        } catch (error) {
            this.showError('Failed to load policies. Please try again.');
            console.error('Error loading policies:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async togglePolicy(policyId, currentState) {
        const policy = this.policies.find(p => p.id === policyId);
        if (!policy) return;

        const newState = !currentState;

        try {
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/gateway/rules/${policyId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...policy,
                    enabled: newState
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update policy');
            }

            policy.enabled = newState;
            this.renderPolicies();
            this.showToast(`Policy ${newState ? 'enabled' : 'disabled'}`, 'success');
        } catch (error) {
            this.showToast('Failed to update policy', 'error');
            console.error('Error updating policy:', error);
        }
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            this.filteredPolicies = [...this.policies];
        } else {
            this.filteredPolicies = this.policies.filter(policy => 
                policy.name.toLowerCase().includes(query) ||
                (policy.description && policy.description.toLowerCase().includes(query))
            );
        }
        
        this.renderPolicies();
    }

    renderPolicies() {
        const container = document.getElementById('policies-list');
        const emptyState = document.getElementById('empty-state');

        if (this.filteredPolicies.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        
        container.innerHTML = this.filteredPolicies.map(policy => `
            <div class="policy-card" data-policy-id="${policy.id}">
                <div class="policy-header">
                    <div class="policy-info">
                        <div class="policy-name">${this.escapeHtml(policy.name)}</div>
                        <div class="policy-description">${this.escapeHtml(policy.description || 'No description')}</div>
                    </div>
                    <div class="policy-toggle" onclick="event.stopPropagation()">
                        <div class="toggle ${policy.enabled ? 'active' : ''}" onclick="app.togglePolicy('${policy.id}', ${policy.enabled})">
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
                <div class="policy-meta">
                    <span class="policy-badge badge-action">${this.escapeHtml(policy.action || 'N/A')}</span>
                    ${policy.precedence ? `<span class="policy-badge badge-priority">Priority: ${policy.precedence}</span>` : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.policy-card').forEach(card => {
            card.addEventListener('click', () => {
                const policyId = card.dataset.policyId;
                this.showPolicyDetails(policyId);
            });
        });
    }

    showPolicyDetails(policyId) {
        const policy = this.policies.find(p => p.id === policyId);
        if (!policy) return;

        document.getElementById('modal-title').textContent = policy.name;
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Status</div>
                <div class="detail-value">${policy.enabled ? '✅ Enabled' : '❌ Disabled'}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${this.escapeHtml(policy.description || 'No description')}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Action</div>
                <div class="detail-value">${this.escapeHtml(policy.action || 'N/A')}</div>
            </div>
            
            ${policy.precedence ? `
            <div class="detail-row">
                <div class="detail-label">Priority</div>
                <div class="detail-value">${policy.precedence}</div>
            </div>
            ` : ''}
            
            ${policy.filters && policy.filters.length > 0 ? `
            <div class="detail-row">
                <div class="detail-label">Filters</div>
                <div class="detail-list">
                    ${policy.filters.map(filter => `
                        <div class="detail-list-item">${this.escapeHtml(JSON.stringify(filter, null, 2))}</div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="detail-row">
                <div class="detail-label">Policy ID</div>
                <div class="detail-value" style="font-family: monospace; font-size: 0.75rem;">${policy.id}</div>
            </div>
            
            ${policy.created_at ? `
            <div class="detail-row">
                <div class="detail-label">Created</div>
                <div class="detail-value">${new Date(policy.created_at).toLocaleString()}</div>
            </div>
            ` : ''}
            
            ${policy.updated_at ? `
            <div class="detail-row">
                <div class="detail-label">Last Updated</div>
                <div class="detail-value">${new Date(policy.updated_at).toLocaleString()}</div>
            </div>
            ` : ''}
        `;

        document.getElementById('policy-modal').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('policy-modal').classList.add('hidden');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const app = new ZeroTrustApp();
