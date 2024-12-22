import { state } from './config.js';

export function editItem(id) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    state.currentEditId = id;
    firebase.firestore().collection('users').doc(user.uid)
        .collection('items').doc(id).get()
        .then((doc) => {
            if (doc.exists) {
                const item = doc.data();
                populateEditModal(item);
                document.getElementById('editModal').classList.remove('hidden');
            }
        })
        .catch((error) => {
            console.error("Error getting item: ", error);
            alert('Error loading item data');
        });
}

function populateEditModal(item) {
    document.getElementById('edit-title-modal').value = item.title || '';
    
    // Hide all content divs
    document.querySelectorAll('[id^="edit-"][id$="-content"]').forEach(el => el.classList.add('hidden'));
    
    // Show and populate relevant content div
    const contentDiv = document.getElementById(`edit-${item.type}-content`);
    contentDiv.classList.remove('hidden');
    
    switch (item.type) {
        case 'note':
            document.getElementById('edit-note-content-field').value = item.content || '';
            break;
        case 'link':
            document.getElementById('edit-link-url').value = item.url || '';
            document.getElementById('edit-link-description').value = item.description || '';
            break;
        case 'contact':
            document.getElementById('edit-contact-name').value = item.name || '';
            document.getElementById('edit-contact-email').value = item.email || '';
            document.getElementById('edit-contact-phone').value = item.phone || '';
            document.getElementById('edit-contact-address').value = item.address || '';
            break;
        case 'password':
            document.getElementById('edit-password-username').value = item.username || '';
            document.getElementById('edit-password-password').value = item.password || '';
            document.getElementById('edit-password-website').value = item.website || '';
            document.getElementById('edit-password-notes').value = item.notes || '';
            break;
    }
}

export function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    state.currentEditId = null;
}

export function saveEdit() {
    if (!state.currentEditId) return;
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const title = document.getElementById('edit-title-modal').value;
    if (!title) {
        alert('Please enter a title');
        return;
    }
    
    firebase.firestore().collection('users').doc(user.uid)
        .collection('items').doc(state.currentEditId).get()
        .then((doc) => {
            if (doc.exists) {
                const item = doc.data();
                const updatedData = { title };
                
                switch (item.type) {
                    case 'note':
                        updatedData.content = document.getElementById('edit-note-content-field').value;
                        break;
                    case 'link':
                        updatedData.url = document.getElementById('edit-link-url').value;
                        updatedData.description = document.getElementById('edit-link-description').value;
                        break;
                    case 'contact':
                        updatedData.name = document.getElementById('edit-contact-name').value;
                        updatedData.email = document.getElementById('edit-contact-email').value;
                        updatedData.phone = document.getElementById('edit-contact-phone').value;
                        updatedData.address = document.getElementById('edit-contact-address').value;
                        break;
                    case 'password':
                        updatedData.username = document.getElementById('edit-password-username').value;
                        updatedData.password = document.getElementById('edit-password-password').value;
                        updatedData.website = document.getElementById('edit-password-website').value;
                        updatedData.notes = document.getElementById('edit-password-notes').value;
                        break;
                }
                
                return firebase.firestore().collection('users').doc(user.uid)
                    .collection('items').doc(state.currentEditId).update(updatedData);
            }
        })
        .then(() => {
            closeEditModal();
        })
        .catch((error) => {
            console.error("Error updating item: ", error);
            alert('Error updating item');
        });
}
