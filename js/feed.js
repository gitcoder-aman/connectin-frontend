import { createPost, getAllPostsByUser, getFirstDegreeConnections, getUserNameMap, likePost, unlikePost, getToken, getUserId, clearAuthData, parseJwt } from '../js/api.js';
import { showMessage, clearMessage, errorToast, successToast, sessionExpired, openLightbox } from '../js/ui.js';

let myUserId = null;
let currentLikedPosts = new Set();
let nameMap = {};

async function initFeed() {
  // Check auth
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

  document.getElementById('createPostBtn').addEventListener('click', handleCreatePost);

  nameMap = await getUserNameMap();

  await loadFeed();
}

async function handleCreatePost() {
  const content = document.getElementById('postContent').value.trim();
  const fileInput = document.getElementById('postImage');
  const file = fileInput.files[0];
  const messageEl = document.getElementById('postMessage');
  clearMessage(messageEl);

  if (!content && !file) {
    showMessage(messageEl, 'Please write something or attach an image.', 'error');
    return;
  }

  const btn = document.getElementById('createPostBtn');
  btn.disabled = true;
  btn.textContent = 'Posting...';

  try {
    const res = await createPost(content, file);
    if (res.success) {
      showMessage(messageEl, 'Post created successfully!', 'success');
      successToast('Your post was published.');
      document.getElementById('postContent').value = '';
      fileInput.value = '';
      setTimeout(() => {
        clearMessage(messageEl);
        loadFeed();
      }, 1000);
    } else {
      showMessage(messageEl, res.error || 'Failed to create post', 'error');
      errorToast(res.error || 'Failed to create post');
    }
  } catch (e) {
    showMessage(messageEl, e.message || 'Failed to create post', 'error');
    errorToast(e.message || 'Failed to create post');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post';
  }
}

async function loadFeed() {
  const feedDiv = document.getElementById('feedPosts');
  feedDiv.innerHTML = '<p class="empty-state">Loading...</p>';

  try {
    // Get my posts
    const myPostsRes = await getAllPostsByUser(myUserId);
    if (!myPostsRes.success && myPostsRes.status === 401) {
      sessionExpired('../index.html');
      return;
    }
    let posts = [];
    if (myPostsRes.success && Array.isArray(myPostsRes.data)) {
      posts = posts.concat(myPostsRes.data);
    } else if (!myPostsRes.success) {
      errorToast(myPostsRes.error || 'Could not load your posts.');
    }

    // Get first-degree connections
    const connectionsRes = await getFirstDegreeConnections(myUserId);
    if (connectionsRes.success && Array.isArray(connectionsRes.data)) {
      for (const conn of connectionsRes.data) {
        const connPostsRes = await getAllPostsByUser(conn.userId);
        if (connPostsRes.success && Array.isArray(connPostsRes.data)) {
          posts = posts.concat(connPostsRes.data);
        }
      }
    } else if (!connectionsRes.success && connectionsRes.status !== 401) {
      errorToast(connectionsRes.error || 'Could not load connections.');
    }

    // Sort by createdAt descending if available
    posts.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

    renderFeed(posts);
  } catch (e) {
    feedDiv.innerHTML = '<p class="empty-state">Something went wrong while loading the feed.</p>';
    errorToast(e.message || 'Failed to load feed.');
  }
}

function renderFeed(posts) {
  const feedDiv = document.getElementById('feedPosts');
  if (!posts || posts.length === 0) {
    feedDiv.innerHTML = '<p class="empty-state">No posts yet. Start by creating a post!</p>';
    return;
  }

  feedDiv.innerHTML = posts
    .map((post) => {
      const time = post.createdAt ? formatTime(post.createdAt) : '';
      const isLiked = currentLikedPosts.has(post.id);
      const uid = Number(post.userId);
      const displayName = nameMap[uid] || `User ${uid}`;
      const isMe = uid === Number(myUserId);
      return `
        <div class="post">
          <div class="post-header">
            <div class="post-byline">
              <div class="avatar avatar-sm">${escapeHtml((displayName || '?').trim().charAt(0).toUpperCase())}</div>
              <div>
                <div class="post-author">${escapeHtml(displayName)}${isMe ? ' <span class="you-tag">You</span>' : ''}</div>
                <div class="post-time">${escapeHtml(time)}</div>
              </div>
            </div>
          </div>
          <div class="post-content">${escapeHtml(post.content || '')}</div>
          ${post.imageUrl ? `<img src="${escapeHtml(post.imageUrl)}" alt="Post image" class="post-image" loading="lazy" onerror="this.style.display='none'">` : ''}
          <div class="post-actions">
            <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
              ${isLiked ? '&#10084; Liked' : '&#9825; Like'}
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  // Click a photo to view full-size
  feedDiv.querySelectorAll('.post-image').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.getAttribute('src')));
  });

  // Add event listeners for like buttons
  feedDiv.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const postId = parseInt(btn.getAttribute('data-post-id'));
      const isLiked = btn.classList.contains('liked');
      btn.disabled = true;
      try {
        const res = isLiked ? await unlikePost(postId) : await likePost(postId);
        if (!res.success) {
          if (res.status === 401) {
            sessionExpired('../index.html');
            return;
          }
          errorToast(res.error || (isLiked ? 'Could not unlike post.' : 'Could not like post.'));
          btn.disabled = false;
          return;
        }
        if (isLiked) {
          currentLikedPosts.delete(postId);
          btn.classList.remove('liked');
          btn.innerHTML = '&#9825; Like';
        } else {
          currentLikedPosts.add(postId);
          btn.classList.add('liked');
          btn.innerHTML = '&#10084; Liked';
        }
      } catch (e) {
        errorToast(e.message || 'Like/unlike failed.');
      } finally {
        btn.disabled = false;
      }
    });
  });
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return timestamp;
    return date.toLocaleString();
  } catch (e) {
    return timestamp;
  }
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', initFeed);