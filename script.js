// Application state
let designers = [];
let currentView = 'list';
let showShortlistedOnly = false;
let sortOrder = 'name';

// DOM elements
const listView = document.getElementById('list-view');
const galleryView = document.getElementById('gallery-view');
const mapView = document.getElementById('map-view');
const designersList = document.getElementById('designers-list');
const galleryGrid = document.getElementById('gallery-grid');
const emptyShortlisted = document.getElementById('empty-shortlisted');
const emptyAllHidden = document.getElementById('empty-all-hidden');

// Navigation buttons
const contactsBtn = document.getElementById('contacts-btn');
const galleryBtn = document.getElementById('gallery-btn');
const mapBtn = document.getElementById('map-btn');
const shortlistedBtn = document.getElementById('shortlisted-btn');
const sortBtn = document.getElementById('sort-btn');

// Toast functionality
function showToast(title, description, variant = 'default') {
  const toastContainer = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${variant}`;
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-description">${description}</div>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Star rating component
function createStars(rating, size = 'normal') {
  const starClass = size === 'small' ? 'gallery-star' : 'star';
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push(`<svg class="${starClass} filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`);
  }

  if (hasHalfStar) {
    stars.push(`<div style="position: relative; width: 1rem; height: 1rem;">
      <svg class="${starClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="position: absolute;">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
      <div style="position: absolute; width: 50%; height: 100%; overflow: hidden;">
        <svg class="${starClass} filled" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </div>
    </div>`);
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(`<svg class="${starClass}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>`);
  }

  return stars.join('');
}

// Designer cards
function createDesignerCard(designer) {
  return `
    <article class="designer-card" data-id="${designer.id}">
      <header class="card-header">
        <h3 class="designer-name">${designer.name}</h3>
        <button class="details-btn" onclick="showDetails(${designer.id})">Details</button>
      </header>
      <div class="rating">${createStars(designer.rating)}</div>
      <p class="description">${designer.description}</p>
      <div class="stats">
        <div class="stat"><div class="stat-value">${designer.projects}</div><div class="stat-label">Projects</div></div>
        <div class="stat"><div class="stat-value">${designer.years}</div><div class="stat-label">Years</div></div>
        <div class="stat"><div class="stat-value">${designer.price}</div><div class="stat-label">Price</div></div>
        <div class="shortlist-section">
          <button class="shortlist-btn" onclick="toggleShortlist(${designer.id})">
            <svg class="shortlist-icon ${designer.isShortlisted ? 'active' : ''}" viewBox="0 0 24 24" fill="${designer.isShortlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="m19 14 1.5-1.5c.55-.55.55-1.45 0-2L18 8l-4-4-2.5 2.5c-.55.55-.55 1.45 0 2L13 10l-1 1-8.5 8.5c-.4.4-.4 1 0 1.4l3.6 3.6c.4.4 1 .4 1.4 0L17 15l2-2Z"/>
            </svg>
          </button>
          <div class="shortlist-label">Shortlist</div>
        </div>
      </div>
      <section class="contacts">
        <div class="contact-row">
          <span class="contact-number">${designer.phone1}</span>
          <button class="call-btn" onclick="callDesigner('${designer.phone1}')">📞</button>
        </div>
        <div class="contact-row">
          <span class="contact-number">${designer.phone2}</span>
          <button class="call-btn" onclick="callDesigner('${designer.phone2}')">📞</button>
        </div>
      </section>
      <footer class="card-actions">
        <button class="action-btn" onclick="toggleHide(${designer.id})">${designer.isHidden ? 'Show' : 'Hide'}</button>
        <button class="action-btn" onclick="reportDesigner(${designer.id})">Report</button>
      </footer>
    </article>
  `;
}

function createGalleryCard(designer) {
  return `
    <article class="gallery-card" data-id="${designer.id}">
      <header class="gallery-header">
        <h3 class="gallery-name">${designer.name}</h3>
        <button class="gallery-shortlist-btn" onclick="toggleShortlist(${designer.id})">
          <svg class="gallery-shortlist-icon ${designer.isShortlisted ? 'active' : ''}" viewBox="0 0 24 24" fill="${designer.isShortlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="m19 14 1.5-1.5c.55-.55.55-1.45 0-2L18 8l-4-4-2.5 2.5c-.55.55-.55 1.45 0 2L13 10l-1 1-8.5 8.5c-.4.4-.4 1 0 1.4l3.6 3.6c.4.4 1 .4 1.4 0L17 15l2-2Z"/>
          </svg>
        </button>
      </header>
      <div class="gallery-rating">${createStars(designer.rating, 'small')}</div>
      <div class="gallery-stats">${designer.projects} projects • ${designer.years} years</div>
      <div class="gallery-price">${designer.price}</div>
    </article>
  `;
}

// Utility
function getSortedDesigners(list) {
  return [...list].sort((a, b) => {
    switch (sortOrder) {
      case 'name': return a.name.localeCompare(b.name);
      case 'rating': return b.rating - a.rating;
      case 'projects': return b.projects - a.projects;
      case 'years': return b.years - a.years;
      default: return 0;
    }
  });
}

function getFilteredDesigners() {
  return getSortedDesigners(
    designers.filter(d => !d.isHidden && (!showShortlistedOnly || d.isShortlisted))
  );
}

// Render
function renderListView() {
  const filtered = getFilteredDesigners();
  if (filtered.length === 0) {
    designersList.innerHTML = '';
    emptyShortlisted.style.display = showShortlistedOnly ? 'flex' : 'none';
    emptyAllHidden.style.display = !showShortlistedOnly ? 'flex' : 'none';
  } else {
    emptyShortlisted.style.display = 'none';
    emptyAllHidden.style.display = 'none';
    designersList.innerHTML = filtered.map(createDesignerCard).join('');
  }
}

function renderGalleryView() {
  const filtered = getFilteredDesigners();
  galleryGrid.innerHTML = filtered.map(createGalleryCard).join('');
}

function renderCurrentView() {
  switch (currentView) {
    case 'list': renderListView(); break;
    case 'gallery': renderGalleryView(); break;
  }
}

// Navigation & Actions
function switchView(view) {
  currentView = view;
  listView.style.display = 'none';
  galleryView.style.display = 'none';
  mapView.style.display = 'none';
  document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));

  if (view === 'list') { listView.style.display = 'block'; contactsBtn.classList.add('active'); }
  if (view === 'gallery') { galleryView.style.display = 'block'; galleryBtn.classList.add('active'); }
  if (view === 'map') { mapView.style.display = 'block'; mapBtn.classList.add('active'); }

  renderCurrentView();
}

function toggleShortlist(id) {
  const d = designers.find(d => d.id === id);
  if (d) { d.isShortlisted = !d.isShortlisted; renderCurrentView(); }
}

function toggleHide(id) {
  const d = designers.find(d => d.id === id);
  if (d) {
    d.isHidden = !d.isHidden;
    showToast("Designer visibility updated", "Designer has been hidden/shown successfully.");
    renderCurrentView();
  }
}

function showDetails(id) {
  const d = designers.find(d => d.id === id);
  if (d) showToast(`${d.name} Details`, `${d.projects} projects • ${d.years} years • ${d.price} pricing`);
}

function reportDesigner(id) {
  showToast("Report submitted", "Thank you for reporting. We'll review this designer.", "destructive");
}

function callDesigner(phone) {
  showToast("Calling designer", `Initiating call to ${phone}`);
}

function toggleShortlistedFilter() {
  showShortlistedOnly = !showShortlistedOnly;
  shortlistedBtn.classList.toggle('active', showShortlistedOnly);
  renderCurrentView();
}

function toggleSort() {
  const options = ['name', 'rating', 'projects', 'years'];
  const index = options.indexOf(sortOrder);
  sortOrder = options[(index + 1) % options.length];
  showToast("Sort order changed", `Sorting by ${sortOrder}`);
  renderCurrentView();
}

// Event listeners
contactsBtn.addEventListener('click', () => switchView('list'));
galleryBtn.addEventListener('click', () => switchView('gallery'));
mapBtn.addEventListener('click', () => switchView('map'));
shortlistedBtn.addEventListener('click', toggleShortlistedFilter);
sortBtn.addEventListener('click', toggleSort);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/listings')
    .then(res => res.json())
    .then(data => {
      designers = data;
      switchView('list');
    })
    .catch(err => console.error('Error loading listings:', err));
});


document.getElementById('add-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const newDesigner = {
      name: document.getElementById('name').value,
      rating: parseFloat(document.getElementById('rating').value),
      description: document.getElementById('description').value,
      projects: parseInt(document.getElementById('projects').value),
      years: parseInt(document.getElementById('years').value),
      price: document.getElementById('price').value,
      phone1: document.getElementById('phone1').value,
      phone2: document.getElementById('phone2').value,
      isShortlisted: false,
      isHidden: false
    };
  
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDesigner)
    })
      .then(res => res.json())
      .then(data => {
        showToast("Designer added", data.designer.name);
        designers.push(data.designer);
        renderCurrentView();
        this.reset();
      })
      .catch(err => {
        console.error('Error adding designer:', err);
        showToast("Error", "Could not add designer", "destructive");
      });
  });
  
