import {
  getAllPersons,
  getFirstDegreeConnections,
  getSentRequests,
  getReceivedRequests,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getUserNameMap,
  getToken,
  getUserId,
  clearAuthData,
  parseJwt,
} from '../js/api.js';
import { errorToast, successToast, sessionExpired } from '../js/ui.js';

let myUserId = null;

// Relationship state for the current user
let connectedIds = new Set();      // accepted connections
let sentIds = new Set();           // requests I sent (pending)
let receivedMap = new Map();       // userId -> Person who sent me a request
let allPeople = [];
let nameMap = {};                  // userId -> name

async function initConnections() {
  const token = getToken();
  if (!token) {
    window.location.href = '../index.html';
    return;
  }
  const payload = parseJwt(token);
  myUserId = getUserId();
  if (!myUserId && payload && payload.sub) {
    myUserId = parseInt(payload.sub);
  }
  if (!myUserId) {
    sessionExpired('../index.html');
    return;
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuthData();
    window.location.href = '../index.html';
  });

  document.getElementById('peopleSearch').addEventListener('input', (e) => {
    renderPeople(e.target.value.trim());
  });

  await loadAll();
}

async function loadAll() {
  nameMap = await getUserNameMap();
  await loadRelationships();
  await loadPeople();
}

async function loadRelationships() {
  const [connRes, sentRes, receivedRes] = await Promise.all([
    getFirstDegreeConnections(myUserId),
    getSentRequests(),
    getReceivedRequests(),
  ]);

  for (const res of [connRes, sentRes, receivedRes]) {
    if (res && res.status === 401) {
      sessionExpired('../index.html');
      return;
    }
  }

  connectedIds = new Set();
  if (connRes.success && Array.isArray(connRes.data)) {
    connRes.data.forEach((c) => connectedIds.add(Number(c.userId)));
  }

  sentIds = new Set();
  if (sentRes.success && Array.isArray(sentRes.data)) {
    sentRes.data.forEach((c) => sentIds.add(Number(c.userId)));
  }

  receivedMap = new Map();
  if (receivedRes.success && Array.isArray(receivedRes.data)) {
    receivedRes.data.forEach((c) => receivedMap.set(Number(c.userId), c));
  }

  renderReceived();
  renderSent();
}

function renderReceived() {
  const div = document.getElementById('receivedList');
  const countEl = document.getElementById('receivedCount');
  const requests = Array.from(receivedMap.values());
  countEl.textContent = requests.length;

  if (requests.length === 0) {
    div.innerHTML = '<p class="empty-state">No incoming requests.</p>';
    return;
  }

  div.innerHTML = requests
    .map((person) => {
      const uid = Number(person.userId);
      const name = person.name || nameMap[uid] || `User ${uid}`;
      return `
        <div class="person-row">
          <div class="avatar">${initial(name || `U${uid}`)}</div>
          <div class="person-info">
            <div class="person-name">${escapeHtml(name || `User ${uid}`)}</div>
            <div class="person-sub">wants to connect with you</div>
          </div>
          <div class="person-actions">
            <button class="btn-small btn-primary accept-btn" data-user-id="${uid}">Accept</button>
            <button class="btn-small btn-outline reject-btn" data-user-id="${uid}">Reject</button>
          </div>
        </div>
      `;
    })
    .join('');

  div.querySelectorAll('.accept-btn').forEach((b) =>
    b.addEventListener('click', () => handleAccept(parseInt(b.dataset.userId), b))
  );
  div.querySelectorAll('.reject-btn').forEach((b) =>
    b.addEventListener('click', () => handleReject(parseInt(b.dataset.userId), b))
  );
}

function renderSent() {
  const div = document.getElementById('sentList');
  const requests = Array.from(sentIds);

  if (requests.length === 0) {
    div.innerHTML = '<p class="empty-state">No pending sent requests.</p>';
    return;
  }

  div.innerHTML = requests
    .map((uid) => {
      const person = allPeople.find((p) => Number(p.userId) === uid);
      const name = (person && person.name) || nameMap[uid] || `User ${uid}`;
      return `
        <div class="person-row">
          <div class="avatar">${initial(name || `U${uid}`)}</div>
          <div class="person-info">
            <div class="person-name">${escapeHtml(name || `User ${uid}`)}</div>
            <div class="person-sub">Request pending</div>
          </div>
          <div class="person-actions">
            <span class="badge badge-pending">Pending</span>
          </div>
        </div>
      `;
    })
    .join('');
}

async function loadPeople() {
  const div = document.getElementById('peopleList');
  div.innerHTML = '<p class="empty-state">Loading...</p>';

  const res = await getAllPersons();
  if (!res.success) {
    if (res.status === 401) {
      sessionExpired('../index.html');
      return;
    }
    div.innerHTML = '<p class="empty-state">Could not load people.</p>';
    errorToast(res.error || 'Could not load people.');
    return;
  }

  allPeople = (Array.isArray(res.data) ? res.data : []).filter(
    (p) => Number(p.userId) !== Number(myUserId)
  );

  renderPeople('');
}

function renderPeople(query) {
  const div = document.getElementById('peopleList');
  const q = (query || '').toLowerCase();

  const filtered = allPeople.filter((p) => {
    if (!q) return true;
    const name = (p.name || '').toLowerCase();
    const uid = String(p.userId);
    return name.includes(q) || uid.includes(q);
  });

  // Sort: actionable (can connect) first, then name
  filtered.sort((a, b) => {
    const ra = relationshipRank(Number(a.userId));
    const rb = relationshipRank(Number(b.userId));
    if (ra !== rb) return ra - rb;
    return (a.name || '').localeCompare(b.name || '');
  });

  if (filtered.length === 0) {
    div.innerHTML = '<p class="empty-state">No people found.</p>';
    return;
  }

  div.innerHTML = filtered
    .map((person) => {
      const uid = Number(person.userId);
      const name = person.name || `User ${uid}`;
      let action;

      if (connectedIds.has(uid)) {
        action = `
          <span class="badge badge-success">Connected</span>
          <button class="btn-small btn-danger disconnect-btn" data-user-id="${uid}">Disconnect</button>`;
      } else if (receivedMap.has(uid)) {
        action = `
          <button class="btn-small btn-primary accept-btn" data-user-id="${uid}">Accept</button>
          <button class="btn-small btn-outline reject-btn" data-user-id="${uid}">Reject</button>`;
      } else if (sentIds.has(uid)) {
        action = '<span class="badge badge-pending">Request Sent</span>';
      } else {
        action = `<button class="btn-small btn-primary send-btn" data-user-id="${uid}">Connect</button>`;
      }

      return `
        <div class="person-row">
          <div class="avatar">${initial(name)}</div>
          <div class="person-info">
            <div class="person-name">${escapeHtml(name)}</div>
            <div class="person-sub">User ID: ${uid}</div>
          </div>
          <div class="person-actions">${action}</div>
        </div>
      `;
    })
    .join('');

  div.querySelectorAll('.send-btn').forEach((b) =>
    b.addEventListener('click', () => handleSend(parseInt(b.dataset.userId), b))
  );
  div.querySelectorAll('.accept-btn').forEach((b) =>
    b.addEventListener('click', () => handleAccept(parseInt(b.dataset.userId), b))
  );
  div.querySelectorAll('.reject-btn').forEach((b) =>
    b.addEventListener('click', () => handleReject(parseInt(b.dataset.userId), b))
  );
  div.querySelectorAll('.disconnect-btn').forEach((b) =>
    b.addEventListener('click', () => handleDisconnect(parseInt(b.dataset.userId), b))
  );
}

function relationshipRank(uid) {
  if (receivedMap.has(uid)) return 0;   // needs my action
  if (connectedIds.has(uid)) return 2;  // done
  if (sentIds.has(uid)) return 3;       // waiting
  return 1;                             // can connect
}

async function handleSend(uid, btn) {
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  try {
    const res = await sendConnectionRequest(uid);
    if (res.success) {
      sentIds.add(uid);
      successToast('Connection request sent.');
      refreshViews();
    } else if (res.status === 401) {
      sessionExpired('../index.html');
    } else {
      errorToast(res.error || 'Failed to send request');
      btn.disabled = false;
      btn.textContent = original;
    }
  } catch (e) {
    errorToast(e.message || 'Failed to send request');
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function handleAccept(uid, btn) {
  btn.disabled = true;
  btn.textContent = 'Accepting...';
  try {
    const res = await acceptConnectionRequest(uid);
    if (res.success) {
      connectedIds.add(uid);
      receivedMap.delete(uid);
      sentIds.delete(uid);
      successToast('Connection accepted.');
      refreshViews();
    } else if (res.status === 401) {
      sessionExpired('../index.html');
    } else {
      errorToast(res.error || 'Failed to accept request');
      btn.disabled = false;
      btn.textContent = 'Accept';
    }
  } catch (e) {
    errorToast(e.message || 'Failed to accept request');
    btn.disabled = false;
    btn.textContent = 'Accept';
  }
}

async function handleReject(uid, btn) {
  btn.disabled = true;
  btn.textContent = 'Rejecting...';
  try {
    const res = await rejectConnectionRequest(uid);
    if (res.success) {
      receivedMap.delete(uid);
      successToast('Connection request rejected.');
      refreshViews();
    } else if (res.status === 401) {
      sessionExpired('../index.html');
    } else {
      errorToast(res.error || 'Failed to reject request');
      btn.disabled = false;
      btn.textContent = 'Reject';
    }
  } catch (e) {
    errorToast(e.message || 'Failed to reject request');
    btn.disabled = false;
    btn.textContent = 'Reject';
  }
}

async function handleDisconnect(uid, btn) {
  const person = allPeople.find((p) => Number(p.userId) === uid);
  const name = person ? person.name : `User ${uid}`;
  const confirmed = window.confirm(
    `Remove your connection with ${name}?\n\nYou will no longer be connected.`
  );
  if (!confirmed) return;

  btn.disabled = true;
  btn.textContent = 'Removing...';
  try {
    const res = await removeConnection(uid);
    if (res.success) {
      connectedIds.delete(uid);
      successToast('Connection removed.');
      refreshViews();
    } else if (res.status === 401) {
      sessionExpired('../index.html');
    } else {
      errorToast(res.error || 'Failed to remove connection');
      btn.disabled = false;
      btn.textContent = 'Disconnect';
    }
  } catch (e) {
    errorToast(e.message || 'Failed to remove connection');
    btn.disabled = false;
    btn.textContent = 'Disconnect';
  }
}

function refreshViews() {
  renderReceived();
  renderSent();
  const search = document.getElementById('peopleSearch').value.trim();
  renderPeople(search);
}

function initial(name) {
  return (name || '?').trim().charAt(0).toUpperCase();
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initConnections);