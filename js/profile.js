import { getAllPostsByUser, getFirstDegreeConnections, removeConnection, getToken, getUserId, getUserEmail, clearAuthData, parseJwt } from '../js/api.js';
import { errorToast, successToast, sessionExpired, formatTime, escapeHtml, openLightbox } from '../js/ui.js';

let myUserId = null;

async function initProfile() {
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

  document.getElementById('profileUserId').textContent = myUserId;
  document.getElementById('profileEmail').textContent = getUserEmail() || (payload && payload.email) || '';

  await loadProfileData();
}

async function loadProfileData() {
  const myPostsDiv = document.getElementById('myPosts');
  const myConnectionsDiv = document.getElementById('myConnections');

  // Load posts
  try {
    const res = await getAllPostsByUser(myUserId);
    if (!res.success) {
      if (res.status === 401) {
        sessionExpired('../index.html');
        return;
      }
      myPostsDiv.innerHTML = '<p class="empty-state">Could not load your posts.</p>';
      errorToast(res.error || 'Could not load your posts.');
    } else if (Array.isArray(res.data) && res.data.length > 0) {
      const posts = res.data.sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      });
      myPostsDiv.innerHTML = posts
        .map((post) => {
          const time = post.createdAt ? formatTime(post.createdAt) : '';
          return `
            <div class="post">
              <div class="post-header">
                <div class="post-author">Me</div>
                <div class="post-time">${escapeHtml(time)}</div>
              </div>
              <div class="post-content">${escapeHtml(post.content || '')}</div>
              ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="Post image" class="post-image" loading="lazy" onerror="this.style.display='none'">` : ''}
            </div>
          `;
        })
        .join('');

      myPostsDiv.querySelectorAll('.post-image').forEach((img) => {
        img.addEventListener('click', () => openLightbox(img.getAttribute('src')));
      });
    } else {
      myPostsDiv.innerHTML = '<p class="empty-state">No posts yet.</p>';
    }
  } catch (e) {
    myPostsDiv.innerHTML = '<p class="empty-state">Something went wrong while loading posts.</p>';
    errorToast(e.message || 'Failed to load posts.');
  }

  // Load connections
  try {
    const res = await getFirstDegreeConnections(myUserId);
    if (!res.success) {
      if (res.status === 401) {
        sessionExpired('../index.html');
        return;
      }
      myConnectionsDiv.innerHTML = '<p class="empty-state">Could not load connections.</p>';
    } else if (Array.isArray(res.data) && res.data.length > 0) {
      myConnectionsDiv.innerHTML = res.data
        .map((conn) => {
          const uid = Number(conn.userId);
          const name = conn.name || `User ${uid}`;
          return `
            <div class="connection-item">
              <div class="connection-info">
                <div class="connection-name">${escapeHtml(name)}</div>
                <div class="connection-id">User ID: ${uid}</div>
              </div>
              <div class="connection-actions">
                <button class="btn-small btn-danger remove-btn" data-user-id="${uid}">Remove</button>
              </div>
            </div>
          `;
        })
        .join('');

      myConnectionsDiv.querySelectorAll('.remove-btn').forEach((b) =>
        b.addEventListener('click', () => handleRemoveConnection(parseInt(b.dataset.userId), b))
      );
    } else {
      myConnectionsDiv.innerHTML = '<p class="empty-state">No connections yet.</p>';
    }
  } catch (e) {
    myConnectionsDiv.innerHTML = '<p class="empty-state">Something went wrong while loading connections.</p>';
  }
}

async function handleRemoveConnection(uid, btn) {
  const confirmed = window.confirm('Remove this connection? You will no longer be connected.');
  if (!confirmed) return;

  btn.disabled = true;
  btn.textContent = 'Removing...';
  try {
    const res = await removeConnection(uid);
    if (res.success) {
      successToast('Connection removed.');
      await loadProfileData();
    } else if (res.status === 401) {
      sessionExpired('../index.html');
    } else {
      errorToast(res.error || 'Failed to remove connection');
      btn.disabled = false;
      btn.textContent = 'Remove';
    }
  } catch (e) {
    errorToast(e.message || 'Failed to remove connection');
    btn.disabled = false;
    btn.textContent = 'Remove';
  }
}

document.addEventListener('DOMContentLoaded', initProfile);