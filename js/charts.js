/**
 * CHARTS - Real-time data from Supabase
 */

// Initialize chart variables
let inventoryChart = null;
let categoryChart = null;

// Initialize charts when page loads
function initializeCharts() {
    console.log('Initializing charts...');
    
    // Create empty inventory trend chart
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    inventoryChart = new Chart(inventoryCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Stock Quantity',
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f39c12',
                    '#27ae60',
                    '#e74c3c',
                    '#3498db'
                     ],
                borderColor: [
                     '#5568d3',
                     '#653a8a',
                     '#d68910',
                     '#229954',
                     '#cb4335',
                     '#2980b9'
                     ],
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Create empty category chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f39c12',
                    '#27ae60',
                    '#e74c3c',
                    '#3498db',
                    '#9b59b6',
                    '#e67e22'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    console.log('Charts initialized');
}

// Update inventory chart - Stock by Location
async function updateInventoryTrendChart() {
    try {
        console.log('Updating inventory chart...');
        
        // Get inventory grouped by location
        const { data: inventory, error: invError } = await supabase
            .from('inventory')
            .select('location_id, quantity');
        
        if (invError) {
            console.error('Error fetching inventory:', invError);
            return;
        }
        
        // Get locations
        const { data: locations, error: locError } = await supabase
            .from('locations')
            .select('id, name');
        
        if (locError) {
            console.error('Error fetching locations:', locError);
            return;
        }
        
        // Create location map
        const locationMap = {};
        locations?.forEach(l => {
            locationMap[l.id] = l.name;
        });
        
        // Group inventory by location
        const locationStock = {};
        inventory?.forEach(item => {
            const locName = locationMap[item.location_id] || 'Unknown';
            locationStock[locName] = (locationStock[locName] || 0) + (item.quantity || 0);
        });
        
        // Extract labels and data
        const labels = Object.keys(locationStock);
        const data = Object.values(locationStock);
        
        // Update chart
        inventoryChart.data.labels = labels;
        inventoryChart.data.datasets[0].data = data;
        inventoryChart.data.datasets[0].label = 'Stock Quantity';
        inventoryChart.update();
        
        console.log('Inventory chart updated:', locationStock);
        
    } catch (error) {
        console.error('Error updating inventory chart:', error);
    }
}

// Update category chart with real data
async function updateCategoryChart() {
    try {
        console.log('Updating category chart...');
        
        // Get products by category
        const categoryCounts = await getProductsByCategory();
        
        if (!categoryCounts || Object.keys(categoryCounts).length === 0) {
            console.log('No category data available');
            return;
        }
        
        // Extract labels and data
        const labels = Object.keys(categoryCounts);
        const data = Object.values(categoryCounts);
        
        // Update chart
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = data;
        categoryChart.update();
        
        console.log('Category chart updated:', categoryCounts);
        
    } catch (error) {
        console.error('Error updating category chart:', error);
    }
}

// Load all charts
async function loadCharts() {
    initializeCharts();
    await updateInventoryTrendChart();
    await updateCategoryChart();
}

console.log('✅ Charts.js loaded');