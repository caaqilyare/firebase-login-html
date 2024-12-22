// Initialize dashboard functionality
let currentUser = null;
let currentItemType = 'note';

// Initialize dashboard when loaded
function initializeDashboard() {
    currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    // Load items for the current user
    loadUserItems();
    
    // Add event listeners for item type buttons
    document.querySelectorAll('.item-type-btn').forEach(btn => {
        btn.addEventListener('click', () => selectItemType(btn.getAttribute('data-type')));
    });

    // Add event listener for adding new items
    const addItemForm = document.getElementById('add-item-form');
    if (addItemForm) {
        addItemForm.addEventListener('submit', handleAddItem);
    }
}

// Load user's items from Firestore
function loadUserItems() {
    const itemsList = document.getElementById('items_list');
    if (!itemsList) return;

    // Show loading state
    itemsList.innerHTML = `
        <div class="col-span-full flex justify-center items-center py-8">
            <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p class="text-gray-600 dark:text-gray-400">Loading your items...</p>
            </div>
        </div>
    `;

    // Get items from Firestore
    firebase.firestore().collection('items')
        .where('userId', '==', currentUser.uid)
        .where('type', '==', currentItemType)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                itemsList.innerHTML = `
                    <div class="col-span-full text-center py-8">
                        <div class="text-gray-500 dark:text-gray-400">
                            <i class="fas fa-inbox text-4xl mb-4"></i>
                            <p>No items found. Add your first one!</p>
                        </div>
                    </div>
                `;
                return;
            }

            // Clear loading state
            itemsList.innerHTML = '';
            
            // Add items to the list
            querySnapshot.forEach((doc) => {
                const item = doc.data();
                const template = document.getElementById(`${item.type}-template`);
                if (!template) return;

                const clone = template.content.cloneNode(true);
                
                // Fill in the template with item data
                clone.querySelector('.item-title').textContent = item.title;
                clone.querySelector('.item-content').textContent = item.content;
                
                // Add edit and delete buttons
                const actionsDiv = clone.querySelector('.item-actions');
                if (actionsDiv) {
                    actionsDiv.innerHTML = `
                        <button onclick="editItem('${doc.id}')" class="text-blue-500 hover:text-blue-600">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteItem('${doc.id}')" class="text-red-500 hover:text-red-600 ml-2">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `;
                }

                itemsList.appendChild(clone);
            });
        })
        .catch((error) => {
            console.error('Error loading items:', error);
            itemsList.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-red-500">
                        <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                        <p>Error loading items. Please try again.</p>
                    </div>
                </div>
            `;
        });
}

// Handle adding new items
function handleAddItem(e) {
    e.preventDefault();
    
    const title = document.getElementById('item_title').value;
    const content = document.getElementById('item_content').value;
    
    if (!title || !content) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const newItem = {
        userId: currentUser.uid,
        type: currentItemType,
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    firebase.firestore().collection('items')
        .add(newItem)
        .then(() => {
            showToast('Item added successfully!', 'success');
            document.getElementById('add-item-form').reset();
            loadUserItems(); // Reload the list
        })
        .catch((error) => {
            console.error('Error adding item:', error);
            showToast('Error adding item. Please try again.', 'error');
        });
}

// Show toast message
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `animate-fade-in-down p-4 mb-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    }`;
    toast.textContent = message;

    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }
}

// Switch between item types
function selectItemType(type) {
    currentItemType = type;
    
    // Update active button
    document.querySelectorAll('.item-type-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-type') === type);
    });

    // Show/hide relevant fields
    const passwordFields = document.getElementById('passwordFields');
    if (passwordFields) {
        passwordFields.classList.toggle('hidden', type !== 'password');
    }

    // Reload items
    loadUserItems();
}

// Delete an item
function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    firebase.firestore().collection('items')
        .doc(itemId)
        .delete()
        .then(() => {
            showToast('Item deleted successfully!', 'success');
            loadUserItems(); // Reload the list
        })
        .catch((error) => {
            console.error('Error deleting item:', error);
            showToast('Error deleting item. Please try again.', 'error');
        });
}

// Edit an item
function editItem(itemId) {
    // Get the item data
    firebase.firestore().collection('items')
        .doc(itemId)
        .get()
        .then((doc) => {
            if (doc.exists) {
                const item = doc.data();
                // Fill the form with item data
                document.getElementById('item_title').value = item.title;
                document.getElementById('item_content').value = item.content;
                // Scroll to form
                document.getElementById('add-item-form').scrollIntoView({ behavior: 'smooth' });
            }
        })
        .catch((error) => {
            console.error('Error loading item for edit:', error);
            showToast('Error loading item. Please try again.', 'error');
        });
}
