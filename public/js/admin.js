// Admin Panel Module for MEP Flow Designer
// Provides role management UI (list users, set role) - visible only to admins

import { auth, functions } from './firebase-config.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-functions.js';

class AdminPanel {
  constructor() {
    this.listUsersFn = httpsCallable(functions, 'listUsersProfiles');
    this.setUserRoleFn = httpsCallable(functions, 'setUserRole');
    this.cache = { users: [] };
    this.init();
  }

  init() {
    const refreshBtn = document.getElementById('refresh-users-btn');
    const setRoleBtn = document.getElementById('set-role-btn');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadUsers());
    }
    if (setRoleBtn) {
      setRoleBtn.addEventListener('click', () => this.handleSetRole());
    }
  }

  async loadUsers() {
    const msgEl = document.getElementById('admin-action-msg');
    if (msgEl) msgEl.textContent = 'Loading users...';
    try {
      const res = await this.listUsersFn();
      if (!res.data?.success) throw new Error('Failed to load users');
      this.cache.users = res.data.users || [];
      this.renderUsers();
      if (msgEl) msgEl.textContent = `Loaded ${this.cache.users.length} users`;
    } catch (e) {
      console.error('loadUsers error', e);
      if (msgEl) msgEl.textContent = 'Error loading users';
    }
  }

  renderUsers() {
    const container = document.getElementById('users-list');
    if (!container) return;
    container.innerHTML = '';
    this.cache.users.forEach(user => {
      const div = document.createElement('div');
      div.className = 'user-row';
      div.style.display = 'grid';
      div.style.gridTemplateColumns = '1fr auto auto';
      div.style.alignItems = 'center';
      div.style.gap = '0.5rem';
      div.innerHTML = `
        <span title="${user.id}">${user.name || user.email || user.id} <small style="opacity:0.6">(${user.role})</small></span>
        <button class="btn btn-small" data-uid="${user.id}" data-role="${user.role}" data-action="promote">Promote</button>
        <button class="btn btn-small" data-uid="${user.id}" data-role="${user.role}" data-action="demote">Demote</button>
      `;
      container.appendChild(div);
    });
    container.querySelectorAll('button[data-action]')?.forEach(btn => {
      btn.addEventListener('click', (e) => this.quickAdjustRole(e));
    });
  }

  rolePromotionOrder() {
    return ['reviewer', 'designer', 'engineer', 'admin'];
  }

  quickAdjustRole(e) {
    const btn = e.currentTarget;
    const uid = btn.getAttribute('data-uid');
    const currentRole = btn.getAttribute('data-role');
    const action = btn.getAttribute('data-action');
    const order = this.rolePromotionOrder();
    const idx = order.indexOf(currentRole);
    let newRole = currentRole;
    if (action === 'promote' && idx < order.length - 1) newRole = order[idx + 1];
    if (action === 'demote' && idx > 0) newRole = order[idx - 1];
    if (newRole === currentRole) return;
    this.applyRoleChange(uid, newRole);
  }

  async handleSetRole() {
    const uidInput = document.getElementById('target-uid');
    const roleSelect = document.getElementById('target-role');
    const msgEl = document.getElementById('admin-action-msg');
    const uid = uidInput.value.trim();
    const role = roleSelect.value;
    if (!uid) {
      msgEl.textContent = 'Provide a UID';
      return;
    }
    await this.applyRoleChange(uid, role);
  }

  async applyRoleChange(uid, role) {
    const msgEl = document.getElementById('admin-action-msg');
    if (msgEl) msgEl.textContent = `Setting role to ${role}...`;
    try {
      const res = await this.setUserRoleFn({ uid, role });
      if (!res.data?.success) throw new Error('Role update failed');
      if (msgEl) msgEl.textContent = 'Role updated';
      // Refresh list quietly
      setTimeout(() => this.loadUsers(), 500);
    } catch (e) {
      console.error('applyRoleChange error', e);
      if (msgEl) msgEl.textContent = 'Error updating role';
    }
  }
}

// Instantiate only if admin panel exists (prevents unnecessary callable init on non-admin screens)
if (document.getElementById('admin-panel')) {
  window.mepAdminPanel = new AdminPanel();
}
