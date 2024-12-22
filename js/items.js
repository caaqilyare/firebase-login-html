import { state } from './config.js';

// Item Management Functions
export function selectItemType(type) {
    state.currentItemType = type;
    
    // Hide all field sets
    document.querySelectorAll('[id$="Fields"]').forEach(el => el.classList.add('hidden'));
    
    // Show selected field set
    document.getElementById(`${type}Fields`).classList.remove('hidden');
    
    // Update button states
    document.querySelectorAll('.item-type-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${type}TypeBtn`).classList.add('active');
}

export function addItem() {
    const title = document.getElementById('item_title').value;
    if (!title) {
        showToast('Missing Fields', 'Please enter a title', 'error');
        return;
    }
    
    const data = {
        type: state.currentItemType,
        title: title,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add type-specific fields
    switch (state.currentItemType) {
        case 'note':
            data.content = document.getElementById('item_note_content').value;
            break;
        case 'link':
            data.url = document.getElementById('item_link_url').value;
            data.description = document.getElementById('item_link_description').value;
            break;
        case 'contact':
            data.name = document.getElementById('item_contact_name').value;
            data.email = document.getElementById('item_contact_email').value;
            data.phone = document.getElementById('item_contact_phone').value;
            data.address = document.getElementById('item_contact_address').value;
            break;
        case 'password':
            data.username = document.getElementById('item_password_username').value;
            data.password = document.getElementById('item_password_password').value;
            data.website = document.getElementById('item_password_website').value;
            data.notes = document.getElementById('item_password_notes').value;
            break;
    }
    
    const user = firebase.auth().currentUser;
    if (user) {
        firebase.firestore().collection('users').doc(user.uid)
            .collection('items').add(data)
            .then(() => {
                clearForm();
                loadUserData();
                showToast('Added!', 'Item created successfully', 'success');
            })
            .catch((error) => {
                console.error("Error adding item: ", error);
                showToast('Failed', 'Could not create item', 'error');
            });
    }
}

export function clearForm() {
    document.getElementById('item_title').value = '';
    document.querySelectorAll('input, textarea').forEach(el => {
        if (el.id.startsWith('item_')) {
            el.value = '';
        }
    });
}

export function loadUserData() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    firebase.firestore().collection('users').doc(user.uid)
        .collection('items').orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) => {
            const items = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            updateItemsDisplay(items);
            updateCounts(items);
        });
}

function updateCounts(items) {
    const counts = {
        note: 0,
        link: 0,
        contact: 0,
        password: 0
    };
    
    items.forEach(item => counts[item.type]++);
    
    Object.keys(counts).forEach(type => {
        const countElement = document.getElementById(`${type}s-count`);
        if (countElement) {
            countElement.textContent = counts[type];
        }
    });
}

function updateItemsDisplay(items) {
    const container = document.getElementById('items_list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (items.length === 0) {
        const emptyTemplate = document.getElementById('empty-state-template');
        if (emptyTemplate) {
            container.innerHTML = emptyTemplate.innerHTML;
        }
        return;
    }
    
    items.forEach(item => {
        const itemEl = createItemElement(item);
        container.appendChild(itemEl);
    });
}

function createItemElement(item) {
    const template = document.getElementById(`${item.type}-template`);
    if (!template) return document.createElement('div');
    
    const clone = template.content.cloneNode(true);
    const itemEl = clone.querySelector('.transform');
    
    // Set common elements
    const timestamp = itemEl.querySelector('.timestamp');
    if (timestamp) {
        timestamp.appendChild(document.createTextNode(formatDate(item.timestamp)));
    }

    // Set type-specific content
    switch(item.type) {
        case 'note':
            itemEl.querySelector('.note-title').textContent = item.title || '';
            itemEl.querySelector('.note-content').textContent = item.content || '';
            break;
            
        case 'link':
            itemEl.querySelector('.link-title').textContent = item.title || '';
            const linkUrl = itemEl.querySelector('.link-url');
            linkUrl.textContent = item.url || '';
            linkUrl.href = item.url || '#';
            itemEl.querySelector('.link-description').textContent = item.description || '';
            break;
            
        case 'password':
            itemEl.querySelector('.password-title').textContent = item.title || '';
            itemEl.querySelector('.password-username').textContent = item.username || '';
            itemEl.querySelector('.password-website').textContent = item.website || '';
            
            const toggleBtn = itemEl.querySelector('.toggle-password');
            const passwordValue = itemEl.querySelector('.password-value');
            if (toggleBtn && passwordValue) {
                toggleBtn.onclick = () => {
                    if (passwordValue.textContent === '••••••••') {
                        passwordValue.textContent = item.password || '';
                        toggleBtn.querySelector('i').className = 'fas fa-eye-slash';
                    } else {
                        passwordValue.textContent = '••••••••';
                        toggleBtn.querySelector('i').className = 'fas fa-eye';
                    }
                };
            }
            break;
            
        case 'contact':
            itemEl.querySelector('.contact-name').textContent = item.name || '';
            itemEl.querySelector('.contact-email').textContent = item.email || '';
            itemEl.querySelector('.contact-phone').textContent = item.phone || '';
            itemEl.querySelector('.contact-address').textContent = item.address || '';
            break;
    }
    
    // Set up buttons
    const editBtn = itemEl.querySelector('.edit-btn');
    const deleteBtn = itemEl.querySelector('.delete-btn');
    
    if (editBtn) editBtn.onclick = () => editItem(item.id);
    if (deleteBtn) deleteBtn.onclick = () => deleteItem(item.id);
    
    return itemEl;
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

export function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const user = firebase.auth().currentUser;
    if (!user) {
        showToast('Auth Error', 'Please sign in first', 'error');
        return;
    }
    
    firebase.firestore().collection('users').doc(user.uid)
        .collection('items').doc(id).delete()
        .then(() => {
            loadUserData();
            showToast('Deleted!', 'Item removed successfully', 'success');
        })
        .catch(error => {
            console.error("Error deleting item: ", error);
            showToast('Failed', 'Could not delete item', 'error');
        });
}

export function filterItems(type) {
    state.currentFilter = type;
    
    // Update active state of filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });
    
    // Reload items
    loadUserData();
}

// Toast function
function showToast(title, message, type = 'info') {
    const template = document.getElementById('toast-template');
    const container = document.getElementById('toast-container');
    
    if (!template || !container) {
        console.error('Toast elements not found');
        return;
    }
    
    const toast = template.content.cloneNode(true).querySelector('div');
    const toastEl = toast.querySelector('.relative');
    const icon = toast.querySelector('.fas');
    
    // Set content
    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;
    
    // Set type-specific styles
    toastEl.classList.add(`toast-${type}`);
    toastEl.classList.add('text-white');
    
    // Set icon based on type
    switch(type) {
        case 'success':
            icon.classList.add('fa-check-circle');
            break;
        case 'error':
            icon.classList.add('fa-exclamation-circle');
            break;
        default:
            icon.classList.add('fa-info-circle');
    }
    
    // Add to container
    container.appendChild(toast);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-x-full');
        toast.classList.add('slide-in');
    });
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('slide-in');
        toast.classList.add('slide-out');
        setTimeout(() => {
            toast.remove();
        }, 200);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
    }
`;
document.head.appendChild(style);
