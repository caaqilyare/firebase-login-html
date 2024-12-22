// Component loading functionality
export async function loadComponent(name) {
    try {
        const response = await fetch(`components/${name}.html`);
        const html = await response.text();
        return html;
    } catch (error) {
        console.error(`Error loading component ${name}:`, error);
        return '';
    }
}

export async function initializeComponents() {
    const container = document.getElementById('components-container');
    
    // Load all components
    const loginHtml = await loadComponent('login');
    const dashboardHtml = await loadComponent('dashboard');
    const modalHtml = await loadComponent('modal');
    
    // Add components to the container
    container.innerHTML = loginHtml + dashboardHtml + modalHtml;
}
