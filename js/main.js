/**
 * INVENTORY MANAGEMENT SYSTEM - MAIN JAVASCRIPT
 * Core functionality and utilities
 */

// ==================== GLOBAL VARIABLES ====================
const APP_NAME = 'Inventory Management System';
const API_BASE_URL = 'http://localhost:3000/api'; // Change to your API URL

// Supabase Configuration
const SUPABASE_URL = 'https://pxfhvplulihsmgtfrqpm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4Zmh2cGx1bGloc21ndGZycXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MzQ2OTYsImV4cCI6MjA3NTExMDY5Nn0._5DKvRk03DGrWF8SBrm_vMkqcfelbd-xN1-OBv9Z_XI';
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: window.sessionStorage, // Use sessionStorage instead of localStorage
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
}) : null;

let currentUser = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log(`${APP_NAME} initialized`);
    
    // Check authentication
    checkAuthentication();
    
    // Initialize sidebar
    initSidebar();
    
    // Initialize tooltips
    initTooltips();
    
    // Initialize date pickers
    initDatePickers();
    
    // Initialize search
    initGlobalSearch();
    
    // Set current date
    updateCurrentDate();
}

// ==================== AUTHENTICATION ====================
async function checkAuthentication() {
    // Skip auth check for login page
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname === '/' || 
        window.location.pathname.endsWith('/')) {
        return;
    }
    
    // Check if Supabase is loaded
    if (!supabase) {
        console.error('Supabase not initialized');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
            console.log('No active session, redirecting to login');
            window.location.href = 'index.html';
            return;
        }
        
        // Set current user with organization data
        currentUser = {
            id: session.user.id,
            email: session.user.email,
            organization_id: session.user.user_metadata?.organization_id,
            full_name: session.user.user_metadata?.full_name || session.user.email
        };
        
        console.log('User authenticated:', currentUser);
        
        // Update UI with user info if elements exist
        updateUserInfo();
        
    } catch (error) {
        console.error('Auth error:', error);
        window.location.href = 'index.html';
    }
}

async function logout() {
    if (!supabase) {
        console.error('Supabase not initialized');
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.clear();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

function updateUserInfo() {
    if (!currentUser) return;
    
    // Update user email display if element exists
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => {
        el.textContent = currentUser.email;
    });
    
    // Update user name display if element exists
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = currentUser.full_name;
    });
}

// ==================== SIDEBAR FUNCTIONALITY ====================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    
    // Desktop sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            // Save state
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
        });
    }
    
    // Mobile sidebar toggle
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            if (sidebar && !sidebar.contains(event.target) && 
                mobileSidebarToggle && !mobileSidebarToggle.contains(event.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
    
    // Restore sidebar state
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
        if (mainContent) {
            mainContent.classList.add('expanded');
        }
    }
    
    // Highlight active menu item
    highlightActiveMenu();
}

function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ==================== TOOLTIPS ====================
function initTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ==================== DATE PICKERS ====================
function initDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = getCurrentDate();
        }
    });
}

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateCurrentDate() {
    const dateElements = document.querySelectorAll('.current-date');
    const formattedDate = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    dateElements.forEach(el => {
        el.textContent = formattedDate;
    });
}

// ==================== SEARCH FUNCTIONALITY ====================
function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            performSearch(searchTerm);
        }, 300));
    }
}

function performSearch(term) {
    if (term.length < 2) return;
    
    console.log('Searching for:', term);
    // Implement your search logic here
    // This could call an API endpoint
    
    // Example:
    // fetch(`${API_BASE_URL}/search?q=${term}`)
    //     .then(response => response.json())
    //     .then(data => displaySearchResults(data))
    //     .catch(error => console.error('Search error:', error));
}

// ==================== UTILITY FUNCTIONS ====================

// Debounce function for search and other inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format currency
function formatCurrency(amount, currency = 'ZAR') {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }).format(amount);
}

// Format number
function formatNumber(number) {
    return new Intl.NumberFormat('en-ZA').format(number);
}

// Format date
function formatDate(dateString, format = 'short') {
    const date = new Date(dateString);
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        datetime: { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    };
    
    return date.toLocaleDateString('en-ZA', options[format] || options.short);
}

// Show loading state
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="text-center py-5"><div class="spinner-custom"></div><p class="mt-3">Loading...</p></div>';
    }
}

// Hide loading state
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

// Show notification
function showNotification(message, type = 'info', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto dismiss
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 300);
    }, duration);
}

// Show confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel) {
    const confirmed = confirm(message);
    if (confirmed && typeof onConfirm === 'function') {
        onConfirm();
    } else if (!confirmed && typeof onCancel === 'function') {
        onCancel();
    }
}

// Validate form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Clear form
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Remove validation classes
        const inputs = form.querySelectorAll('.is-invalid, .is-valid');
        inputs.forEach(input => {
            input.classList.remove('is-invalid', 'is-valid');
        });
    }
}

// ==================== API CALLS ====================

// Generic API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    // Add auth token if available
    const token = localStorage.getItem('userToken');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add body for POST, PUT, PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        showNotification('An error occurred. Please try again.', 'danger');
        throw error;
    }
}

// Fetch products
async function fetchProducts(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await apiCall(`/products?${queryString}`);
}

// Fetch inventory
async function fetchInventory(locationId = null) {
    const endpoint = locationId ? `/inventory?location=${locationId}` : '/inventory';
    return await apiCall(endpoint);
}

// Create purchase order
async function createPurchaseOrder(orderData) {
    return await apiCall('/purchase-orders', 'POST', orderData);
}

// Update inventory
async function updateInventory(inventoryId, data) {
    return await apiCall(`/inventory/${inventoryId}`, 'PUT', data);
}

// ==================== TABLE FUNCTIONS ====================

// Sort table
function sortTable(table, column, ascending = true) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.querySelectorAll('td')[column].textContent.trim();
        const bValue = b.querySelectorAll('td')[column].textContent.trim();
        
        if (ascending) {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Filter table
function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    const rows = table.querySelectorAll('tbody tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Export table to CSV
function exportTableToCSV(tableId, filename = 'export.csv') {
    const table = document.getElementById(tableId);
    if (!table) return;
    
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const csvRow = [];
        cols.forEach(col => {
            csvRow.push('"' + col.textContent.trim().replace(/"/g, '""') + '"');
        });
        csv.push(csvRow.join(','));
    });
    
    const csvContent = csv.join('\n');
    downloadCSV(csvContent, filename);
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==================== PAGINATION ====================

function createPagination(totalItems, itemsPerPage, currentPage, containerId, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let html = '<nav><ul class="pagination pagination-custom justify-content-center">';
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;
    
    html += '</ul></nav>';
    container.innerHTML = html;
    
    // Add click handlers
    container.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            if (page && page >= 1 && page <= totalPages) {
                onPageChange(page);
            }
        });
    });
}

// ==================== LOCAL STORAGE HELPERS ====================

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// ==================== FORM VALIDATION ====================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone);
}

function validateRequired(value) {
    return value && value.trim() !== '';
}

function validateNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
}

// ==================== PRINT FUNCTIONS ====================

function printPage() {
    window.print();
}

function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
    printWindow.document.write('<link rel="stylesheet" href="css/style.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// ==================== EVENT LISTENERS ====================

// Handle all logout links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href="index.html"]')) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    }
});

// Handle form submissions with loading states
document.addEventListener('submit', function(e) {
    if (e.target.matches('form[data-ajax="true"]')) {
        e.preventDefault();
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
        }
    }
});

// ==================== EXPORT FUNCTIONS ====================

// Make functions globally available
window.InventoryMS = {
    // Authentication
    logout,
    checkAuthentication,
    
    // UI Functions
    showNotification,
    showConfirmDialog,
    showLoading,
    hideLoading,
    
    // Form Functions
    validateForm,
    clearForm,
    validateEmail,
    validatePhone,
    validateRequired,
    validateNumber,
    
    // Table Functions
    sortTable,
    filterTable,
    exportTableToCSV,
    
    // Pagination
    createPagination,
    
    // Utility Functions
    formatCurrency,
    formatNumber,
    formatDate,
    debounce,
    
    // Storage
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    
    // API
    apiCall,
    fetchProducts,
    fetchInventory,
    createPurchaseOrder,
    updateInventory,
    
    // Print
    printPage,
    printElement
};

console.log('Inventory Management System JS loaded successfully');