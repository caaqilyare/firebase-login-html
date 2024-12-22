import { initializeComponents } from './js/components.js';
import { login, logout, initializeAuth } from './js/auth.js';
import { 
    selectItemType, 
    addItem, 
    deleteItem, 
    filterItems 
} from './js/items.js';
import { 
    editItem, 
    closeEditModal, 
    saveEdit 
} from './js/modal.js';
import { toggleTheme, initializeTheme } from './js/theme.js';

// Make functions available globally
window.login = login;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.selectItemType = selectItemType;
window.addItem = addItem;
window.deleteItem = deleteItem;
window.filterItems = filterItems;
window.editItem = editItem;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeComponents();
    initializeAuth();
    initializeTheme();
});