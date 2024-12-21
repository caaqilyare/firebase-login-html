var config = {
    apiKey: "AIzaSyB30ptiCR7QpX90pzIXZU3OsZEgQp8sW5w",
    authDomain: "fir-login-6605c.firebaseapp.com",
    databaseURL: "https://fir-login-6605c.firebaseio.com",
    projectId: "fir-login-6605c",
    storageBucket: "fir-login-6605c.appspot.com",
    messagingSenderId: "581631828835"
};
firebase.initializeApp(config);

// Configure Firestore settings
const db = firebase.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);

let currentUser = null;
let currentEditingId = null;
let currentEditingType = null;

// Dashboard Stats
let dashboardStats = {
    total: 0,
    notes: 0,
    links: 0,
    passwords: 0,
    contacts: 0,
    lastUpdate: null
};

let itemDistributionChart = null;
let activityTimelineChart = null;

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        currentUser = user;
        document.getElementById("user_div").classList.remove('hidden');
        document.getElementById("login_div").classList.add('hidden');
        
        const email_id = user.email;
        document.getElementById("user_para").innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(email_id)}&background=random" 
                class="w-8 h-8 rounded-full" alt="Profile">
            <span class="text-sm font-semibold">${email_id}</span>
        `;
        
        loadItems();
    } else {
        currentUser = null;
        document.getElementById("user_div").classList.add('hidden');
        document.getElementById("login_div").classList.remove('hidden');
    }
});

function login(){
    const userEmail = document.getElementById("email_field").value;
    const userPass = document.getElementById("password_field").value;

    if (!userEmail || !userPass) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
        .catch(function(error) {
            showNotification(error.message, 'error');
        });
}

function logout(){
    firebase.auth().signOut();
}

// Update Dashboard Stats
function updateDashboardStats(items) {
    try {
        if (!items) {
            console.warn('No items provided to updateDashboardStats');
            return;
        }

        const stats = {
            total: items.length,
            notes: items.filter(item => item.type === 'note').length,
            links: items.filter(item => item.type === 'link').length,
            passwords: items.filter(item => item.type === 'password').length,
            contacts: items.filter(item => item.type === 'contact').length
        };

        // Safely update DOM elements with null checks
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.warn(`Element with id ${id} not found`);
            }
        };

        updateElement('stats-notes', stats.notes);
        updateElement('stats-links', stats.links);
        updateElement('stats-passwords', stats.passwords);
        updateElement('stats-contacts', stats.contacts);

        dashboardStats = stats;

        // Update charts if items exist
        if (items.length > 0) {
            updateCharts(items);
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        showNotification('Error updating dashboard stats', 'error');
    }
}

// Function to update charts
function updateCharts(items) {
    // Update Item Distribution Chart
    const itemTypes = {
        note: items.filter(item => item.type === 'note').length,
        link: items.filter(item => item.type === 'link').length,
        password: items.filter(item => item.type === 'password').length,
        contact: items.filter(item => item.type === 'contact').length
    };

    const ctx1 = document.getElementById('itemDistributionChart')?.getContext('2d');
    if (ctx1) {
        if (window.itemDistributionChart) {
            window.itemDistributionChart.destroy();
        }

        window.itemDistributionChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Notes', 'Links', 'Passwords', 'Contacts'],
                datasets: [{
                    data: [itemTypes.note, itemTypes.link, itemTypes.password, itemTypes.contact],
                    backgroundColor: [
                        'rgba(234, 179, 8, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(34, 197, 94, 0.8)'
                    ],
                    borderColor: [
                        'rgba(234, 179, 8, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                        }
                    }
                }
            }
        });
    }

    // Update Activity Timeline Chart
    const ctx2 = document.getElementById('activityTimelineChart')?.getContext('2d');
    if (ctx2) {
        if (window.activityTimelineChart) {
            window.activityTimelineChart.destroy();
        }

        // Process data for timeline
        const timelineData = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            timelineData[dateStr] = 0;
        }

        items.forEach(item => {
            if (item.createdAt) {
                const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
                const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                if (timelineData.hasOwnProperty(dateStr)) {
                    timelineData[dateStr]++;
                }
            }
        });

        window.activityTimelineChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: Object.keys(timelineData),
                datasets: [{
                    label: 'Items Added',
                    data: Object.values(timelineData),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

// Modal Functions
function openEditModal(itemId, title, content, type, username = '', website = '', phone = '', email = '', address = '', notes = '') {
    try {
        currentEditingId = itemId;
        currentEditingType = type;
        
        // Hide all content divs first
        document.getElementById('edit-note-content').classList.add('hidden');
        document.getElementById('edit-contact-content').classList.add('hidden');
        document.getElementById('edit-link-content').classList.add('hidden');
        document.getElementById('edit-password-content').classList.add('hidden');

        // Set title
        document.getElementById('edit-title-modal').value = title || '';

        // Show and set content based on type
        switch(type) {
            case 'note':
                document.getElementById('edit-note-content').classList.remove('hidden');
                document.getElementById('edit-note-content-input').value = content || '';
                break;
            case 'contact':
                document.getElementById('edit-contact-content').classList.remove('hidden');
                document.getElementById('edit-contact-name').value = content || '';
                document.getElementById('edit-contact-phone').value = phone || '';
                document.getElementById('edit-contact-email').value = email || '';
                document.getElementById('edit-contact-address').value = address || '';
                document.getElementById('edit-contact-notes').value = notes || '';
                break;
            case 'link':
                document.getElementById('edit-link-content').classList.remove('hidden');
                document.getElementById('edit-link-content-input').value = content || '';
                break;
            case 'password':
                document.getElementById('edit-password-content').classList.remove('hidden');
                document.getElementById('edit-password-username').value = username || '';
                document.getElementById('edit-password-content-input').value = content || '';
                document.getElementById('edit-password-website').value = website || '';
                break;
        }

        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showNotification('Error opening edit modal', 'error');
    }
}

function closeEditModal() {
    currentEditingId = null;
    currentEditingType = null;
    document.getElementById('editModal').classList.add('hidden');
}

function toggleEditPassword() {
    const passwordInput = document.getElementById('edit-password-content-input');
    const icon = document.getElementById('edit-password-toggle-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

async function saveEdit() {
    if (!currentEditingId || !currentEditingType) return;

    const title = document.getElementById('edit-title-modal').value;

    if (!title) {
        showNotification('Title is required', 'error');
        return;
    }

    let updateData = { title };

    switch(currentEditingType) {
        case 'note':
            const noteContent = document.getElementById('edit-note-content-input').value;
            if (!noteContent) {
                showNotification('Note content is required', 'error');
                return;
            }
            updateData.content = noteContent;
            break;

        case 'contact':
            const name = document.getElementById('edit-contact-name').value;
            const phone = document.getElementById('edit-contact-phone').value;
            
            if (!name || !phone) {
                showNotification('Name and phone number are required', 'error');
                return;
            }
            
            updateData = {
                ...updateData,
                content: name,
                phone: phone,
                email: document.getElementById('edit-contact-email').value || '',
                address: document.getElementById('edit-contact-address').value || '',
                notes: document.getElementById('edit-contact-notes').value || ''
            };
            break;

        case 'link':
            const url = document.getElementById('edit-link-content-input').value;
            if (!url) {
                showNotification('URL is required', 'error');
                return;
            }
            try {
                new URL(url);
            } catch {
                showNotification('Please enter a valid URL', 'error');
                return;
            }
            updateData.content = url;
            break;

        case 'password':
            const username = document.getElementById('edit-password-username').value;
            const password = document.getElementById('edit-password-content-input').value;
            
            if (!username || !password) {
                showNotification('Username and password are required', 'error');
                return;
            }
            
            updateData = {
                ...updateData,
                content: password,
                username: username,
                website: document.getElementById('edit-password-website').value || ''
            };
            break;
    }

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('items').doc(currentEditingId)
            .update({
                ...updateData,
                type: currentEditingType,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        closeEditModal();
        loadItems();
        showNotification('Item updated successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Helper function to format dates
function formatDate(timestamp) {
    if (!timestamp) return 'Never';
    
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

async function loadItems() {
    if (!currentUser) return;

    const itemsList = document.getElementById("items_list");
    itemsList.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    `;

    try {
        const snapshot = await db.collection('users').doc(currentUser.uid)
            .collection('items')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) {
            itemsList.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="glass-card p-8 inline-block">
                        <i class="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                        <p class="text-gray-400">No items yet. Add your first item above!</p>
                    </div>
                </div>
            `;
            updateDashboardStats([]);
            return;
        }

        const items = [];
        itemsList.innerHTML = '';
        
        snapshot.forEach((doc) => {
            const item = doc.data();
            items.push(item);
            
            let icon, color, bgColor;
            switch(item.type) {
                case 'note':
                    icon = 'fa-sticky-note';
                    color = 'yellow';
                    bgColor = 'yellow';
                    break;
                case 'contact':
                    icon = 'fa-address-book';
                    color = 'green';
                    bgColor = 'green';
                    break;
                case 'link':
                    icon = 'fa-link';
                    color = 'blue';
                    bgColor = 'blue';
                    break;
                case 'password':
                    icon = 'fa-key';
                    color = 'purple';
                    bgColor = 'purple';
                    break;
                default:
                    icon = 'fa-file';
                    color = 'gray';
                    bgColor = 'gray';
            }
            
            let dateStr = formatDate(item.createdAt);
            
            let contentHtml = '';
            switch(item.type) {
                case 'note':
                    contentHtml = `
                        <div class="relative">
                            <div class="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-3xl"></div>
                            <div class="relative bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 rounded-xl p-4 border border-yellow-500/20">
                                <div class="flex items-start space-x-4">
                                    <div class="bg-yellow-500/20 p-3 rounded-xl">
                                        <i class="fas fa-sticky-note text-yellow-500 text-xl"></i>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-gray-900 dark:text-gray-300 whitespace-pre-wrap">${item.content}</p>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    break;
                case 'link':
                    contentHtml = `
                        <div class="relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                            <div class="relative bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-xl p-4 border border-blue-500/20">
                                <div class="flex items-center space-x-4">
                                    <div class="bg-blue-500/20 p-3 rounded-xl">
                                        <i class="fas fa-link text-blue-500 text-xl"></i>
                                    </div>
                                    <div class="flex-1">
                                        <a href="${item.content}" target="_blank" 
                                            class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all flex items-center group">
                                            <span class="flex-1">${item.content}</span>
                                            <i class="fas fa-external-link-alt ml-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    break;
                case 'password':
                    contentHtml = `
                        <div class="relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 transform rotate-45"></div>
                            <div class="relative bg-gradient-to-br from-purple-500/5 to-purple-600/10 rounded-xl p-4 border border-purple-500/20">
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-4">
                                        <div class="bg-purple-500/20 p-3 rounded-xl">
                                            <i class="fas fa-user text-purple-500"></i>
                                        </div>
                                        <span class="text-gray-900 dark:text-gray-300">${item.username}</span>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <div class="bg-purple-500/20 p-3 rounded-xl">
                                            <i class="fas fa-key text-purple-500"></i>
                                        </div>
                                        <div class="flex items-center">
                                            <span class="text-gray-900 dark:text-gray-300">••••••••</span>
                                            <button onclick="togglePassword(this, '${item.content}')" 
                                                class="ml-3 bg-purple-500/20 p-2 rounded-lg hover:bg-purple-500/30 transition-colors">
                                                <i class="fas fa-eye text-purple-500"></i>
                                            </button>
                                        </div>
                                    </div>
                                    ${item.website ? `
                                        <div class="flex items-center space-x-4">
                                            <div class="bg-purple-500/20 p-3 rounded-xl">
                                                <i class="fas fa-globe text-purple-500"></i>
                                            </div>
                                            <a href="${item.website}" target="_blank" 
                                                class="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 group">
                                                <span>${item.website}</span>
                                                <i class="fas fa-external-link-alt ml-2 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                            </a>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>`;
                    break;
                case 'contact':
                    contentHtml = `
                        <div class="relative overflow-hidden">
                            <div class="absolute top-0 right-0 w-28 h-28 bg-green-500/10 rounded-full transform translate-x-8 -translate-y-8"></div>
                            <div class="relative bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-xl p-4 border border-green-500/20">
                                <div class="space-y-3">
                                    <div class="flex items-center space-x-4">
                                        <div class="bg-green-500/20 p-3 rounded-xl">
                                            <i class="fas fa-user text-green-500"></i>
                                        </div>
                                        <span class="text-gray-900 dark:text-gray-300">${item.content}</span>
                                    </div>
                                    ${item.phone ? `
                                        <div class="flex items-center space-x-4">
                                            <div class="bg-green-500/20 p-3 rounded-xl">
                                                <i class="fas fa-phone text-green-500"></i>
                                            </div>
                                            <a href="tel:${item.phone}" class="text-gray-900 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                                ${item.phone}
                                            </a>
                                        </div>
                                    ` : ''}
                                    ${item.email ? `
                                        <div class="flex items-center space-x-4">
                                            <div class="bg-green-500/20 p-3 rounded-xl">
                                                <i class="fas fa-envelope text-green-500"></i>
                                            </div>
                                            <a href="mailto:${item.email}" class="text-gray-900 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                                                ${item.email}
                                            </a>
                                        </div>
                                    ` : ''}
                                    ${item.address ? `
                                        <div class="flex items-center space-x-4">
                                            <div class="bg-green-500/20 p-3 rounded-xl">
                                                <i class="fas fa-map-marker-alt text-green-500"></i>
                                            </div>
                                            <span class="text-gray-900 dark:text-gray-300">${item.address}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>`;
                    break;
            }
            
            const itemHtml = `
                <div class="glass-effect p-6 rounded-xl hover:scale-[1.02] transition-transform duration-300">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="text-lg font-semibold text-white flex items-center">
                            ${item.title}
                        </h4>
                        <div class="flex space-x-2">
                            <button onclick="openEditModal('${doc.id}', '${item.title.replace(/'/g, "\\'")}', '${(item.content || '').replace(/'/g, "\\'")}', '${item.type}', '${(item.username || '').replace(/'/g, "\\'")}', '${(item.website || '').replace(/'/g, "\\'")}', '${(item.phone || '').replace(/'/g, "\\'")}', '${(item.email || '').replace(/'/g, "\\'")}', '${(item.address || '').replace(/'/g, "\\'")}', '${(item.notes || '').replace(/'/g, "\\'")}')" 
                                class="bg-blue-500/20 p-2 rounded-lg hover:bg-blue-500/30 transition-colors">
                                <i class="fas fa-edit text-blue-400"></i>
                            </button>
                            <button onclick="deleteItem('${doc.id}')" 
                                class="bg-red-500/20 p-2 rounded-lg hover:bg-red-500/30 transition-colors">
                                <i class="fas fa-trash text-red-400"></i>
                            </button>
                        </div>
                    </div>
                    ${contentHtml}
                    <div class="mt-4 text-sm text-gray-400 flex items-center">
                        <i class="far fa-clock mr-2"></i>
                        ${dateStr}
                    </div>
                </div>
            `;
            itemsList.innerHTML += itemHtml;
        });

        updateDashboardStats(items);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteItem(itemId) {
    if (!currentUser) return;

    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
        await db.collection('users').doc(currentUser.uid)
            .collection('items').doc(itemId)
            .delete();

        showNotification('Item deleted successfully!', 'success');
        loadItems();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Theme Management
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }

    // Refresh charts with new theme colors
    const items = Array.from(document.getElementById('items_list').children)
        .map(item => ({
            type: item.querySelector('.fas').classList.contains('fa-sticky-note') ? 'note' :
                  item.querySelector('.fas').classList.contains('fa-address-book') ? 'contact' :
                  item.querySelector('.fas').classList.contains('fa-link') ? 'link' : 'password',
            createdAt: { toDate: () => new Date(item.querySelector('.text-gray-500').textContent) }
        }));
    updateDashboardStats(items);
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
});

// Utility Functions
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-y-0 opacity-100 z-50`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.replace('translate-y-0', '-translate-y-full');
        notification.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function togglePassword(button, password) {
    const span = button.parentElement.querySelector('span');
    const icon = button.querySelector('i');
    
    if (span.textContent === '••••••••') {
        span.textContent = password;
        icon.className = 'fas fa-eye-slash';
    } else {
        span.textContent = '••••••••';
        icon.className = 'fas fa-eye';
    }
}

// Item Type Management
let currentItemType = 'note';

function selectItemType(type) {
    currentItemType = type;
    
    // Remove active class from all buttons
    document.querySelectorAll('.item-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected button
    document.getElementById(`${type}TypeBtn`).classList.add('active');
    
    // Hide all fields first
    document.getElementById('noteFields').classList.add('hidden');
    document.getElementById('contactFields').classList.add('hidden');
    document.getElementById('linkFields').classList.add('hidden');
    document.getElementById('passwordFields').classList.add('hidden');
    
    // Show fields based on type
    document.getElementById(`${type}Fields`).classList.remove('hidden');
    
    // Clear all fields
    document.getElementById('item_title').value = '';
    document.getElementById('item_content').value = '';
    if (document.getElementById('item_phone')) {
        document.getElementById('item_phone').value = '';
    }
    
    // Clear type-specific fields
    switch(type) {
        case 'password':
            document.getElementById('item_username').value = '';
            document.getElementById('item_website').value = '';
            break;
        case 'contact':
            document.getElementById('item_contact_name').value = '';
            document.getElementById('item_email').value = '';
            document.getElementById('item_address').value = '';
            document.getElementById('item_notes').value = '';
            break;
    }
}

async function addItem() {
    if (!currentUser) return;

    let title = '';
    let content = '';
    let username = '';
    let website = '';
    let phone = '';
    let email = '';
    let address = '';
    let notes = '';

    // Get values based on current item type
    switch (currentItemType) {
        case 'note':
            title = document.getElementById('item_note_title').value.trim();
            content = document.getElementById('item_note_content').value.trim();
            if (!title || !content) {
                showNotification('Please fill in both title and note content', 'error');
                return;
            }
            break;
        case 'link':
            title = document.getElementById('item_link_title').value.trim();
            content = document.getElementById('item_link_url').value.trim();
            if (!title || !content) {
                showNotification('Please fill in both title and URL', 'error');
                return;
            }
            // Validate URL
            try {
                new URL(content);
            } catch {
                showNotification('Please enter a valid URL', 'error');
                return;
            }
            break;
        case 'password':
            title = document.getElementById('item_password_title').value.trim();
            username = document.getElementById('item_password_username').value.trim();
            content = document.getElementById('item_password_password').value.trim();
            website = document.getElementById('item_password_website').value.trim();
            if (!title || !username || !content) {
                showNotification('Please fill in title, username, and password', 'error');
                return;
            }
            break;
        case 'contact':
            title = document.getElementById('item_contact_title').value.trim();
            content = document.getElementById('item_contact_name').value.trim();
            phone = document.getElementById('item_contact_phone').value.trim();
            email = document.getElementById('item_contact_email').value.trim();
            address = document.getElementById('item_contact_address').value.trim();
            notes = document.getElementById('item_contact_notes').value.trim();
            if (!title || !content) {
                showNotification('Please fill in both title and name', 'error');
                return;
            }
            break;
    }

    // Create the item object
    const item = {
        type: currentItemType,
        title: title,
        content: content,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    // Add additional fields based on type
    if (currentItemType === 'password') {
        item.username = username;
        item.website = website;
    } else if (currentItemType === 'contact') {
        item.phone = phone;
        item.email = email;
        item.address = address;
        item.notes = notes;
    }

    // Add to Firestore
    db.collection('users').doc(currentUser.uid)
        .collection('items')
        .add(item)
        .then(() => {
            // Clear form
            clearForm();
            showNotification('Item added successfully!', 'success');
            loadItems();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
}

function clearForm() {
    // Clear all possible fields
    const fields = [
        'item_note_title', 'item_note_content',
        'item_link_title', 'item_link_url',
        'item_password_title', 'item_password_username', 'item_password_password', 'item_password_website',
        'item_contact_title', 'item_contact_name', 'item_contact_phone', 'item_contact_email', 
        'item_contact_address', 'item_contact_notes'
    ];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.value = '';
    });
}
