/**
 * DASHBOARD PAGE LOADER
 * Load real data from Supabase
 */

console.log('Dashboard script loaded');

// Load dashboard when page is ready
window.addEventListener('load', async function() {
    console.log('Loading dashboard data from Supabase...');
    
    try {
        // Load all dashboard data
        await loadAllDashboardData();
        
        console.log('✅ Dashboard loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
        alert('Error loading dashboard data. Check console for details.');
    }
});

// Main loading function
async function loadAllDashboardData() {
    // Load statistics
    await loadDashboardStats();
    
    // Load recent transactions
    await loadRecentTransactions();
    
    // Load pending orders  
    await loadPendingOrders();
    
    // Load charts (if charts.js is loaded)
    if (typeof loadCharts !== 'undefined') {
        await loadCharts();
    }
}

// Load statistics cards
async function loadDashboardStats() {
    console.log('Loading stats...');
    
    const stats = await getDashboardStats();
    
    // Update stat cards
    document.getElementById('totalProducts').textContent = stats.totalProducts.toLocaleString();
    document.getElementById('lowStock').textContent = stats.lowStockCount.toLocaleString();
    document.getElementById('outOfStock').textContent = stats.outOfStockCount.toLocaleString();
    
    // Update inventory value if you have that ID
    const inventoryValueEl = document.getElementById('inventoryValue');
    if (inventoryValueEl) {
        inventoryValueEl.textContent = 'R' + (stats.totalStock * 100 / 1000).toFixed(1) + 'K';
    }
    
    console.log('Stats loaded:', stats);
}

// Load recent transactions table
async function loadRecentTransactions() {
    console.log('Loading transactions...');
    
    const transactions = await getRecentTransactions(5);
    const tbody = document.getElementById('recentTransactionsTable');
    
    if (!tbody) {
        console.warn('Transaction table not found');
        return;
    }
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No recent transactions</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(t => `
        <tr>
            <td><strong>#${t.transaction_id || t.id}</strong></td>
            <td>${t.products?.product_name || 'N/A'}</td>
            <td><span class="badge-status badge-info">${t.transaction_type}</span></td>
            <td>${t.quantity > 0 ? '+' : ''}${t.quantity}</td>
            <td>${t.locations?.location_name || 'N/A'}</td>
            <td>${new Date(t.transaction_date || t.created_at).toLocaleDateString()}</td>
            <td><span class="badge-status badge-success">Completed</span></td>
        </tr>
    `).join('');
    
    console.log('Transactions loaded:', transactions.length);
}

// Load pending purchase orders
async function loadPendingOrders() {
    console.log('Loading pending orders...');
    
    const orders = await getPendingPurchaseOrders(5);
    const tbody = document.getElementById('pendingOrdersTable');
    
    if (!tbody) {
        console.warn('Pending orders table not found');
        return;
    }
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No pending orders</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.po_number || 'N/A'}</strong></td>
            <td>${o.suppliers?.supplier_name || 'N/A'}</td>
            <td>-</td>
            <td>R ${parseFloat(o.total_amount || 0).toLocaleString('en-ZA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${o.expected_date ? new Date(o.expected_date).toLocaleDateString() : 'N/A'}</td>
            <td><span class="badge-status badge-warning">${o.status || 'pending'}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewPurchaseOrder('${o.po_id || o.id}')">View</button>
            </td>
        </tr>
    `).join('');
    
    console.log('Pending orders loaded:', orders.length);
}

// View purchase order details in modal
async function viewPurchaseOrder(poId) {
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('poDetailModal'));
    modal.show();
    
    // Reset modal content
    document.getElementById('poModalBody').innerHTML = `
        <div class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    // Load PO details
    try {
        const { data: po, error } = await supabase
            .from('purchase_orders')
            .select(`
                id,
                po_number,
                status,
                order_date,
                expected_date,
                notes,
                supplier_id,
                location_id,
                created_by
            `)
            .eq('id', poId)
            .single();
        
        if (error) throw error;
        
        // Get supplier name
        const { data: supplier } = await supabase
            .from('suppliers')
            .select('name')
            .eq('id', po.supplier_id)
            .single();
        
        // Get location name
        const { data: location } = await supabase
            .from('locations')
            .select('name')
            .eq('id', po.location_id)
            .single();
        
        // Get PO items - USING CORRECT COLUMN NAME: ordered_quantity
        const { data: items, error: itemsError } = await supabase
            .from('purchase_order_items')
            .select('id, product_id, ordered_quantity, received_quantity, unit_cost')
            .eq('purchase_order_id', poId);
        
        if (itemsError) throw itemsError;
        
        // Get product details for items
        let itemsWithProducts = [];
        if (items && items.length > 0) {
            const productIds = items.map(i => i.product_id);
            const { data: products } = await supabase
                .from('products')
                .select('id, name, sku')
                .in('id', productIds);
            
            const productMap = {};
            products?.forEach(p => {
                productMap[p.id] = p;
            });
            
            itemsWithProducts = items.map(item => ({
                ...item,
                product: productMap[item.product_id]
            }));
        }
        
        // Calculate total - USING unit_cost instead of unit_price
        const total = itemsWithProducts.reduce((sum, item) => {
            return sum + (parseFloat(item.ordered_quantity) * parseFloat(item.unit_cost || 0));
        }, 0);
        
        // Build modal content
        const modalBody = document.getElementById('poModalBody');
        modalBody.innerHTML = `
            <div class="row mb-3">
                <div class="col-md-6">
                    <strong>PO Number:</strong> ${po.po_number}<br>
                    <strong>Status:</strong> <span class="badge bg-warning">${po.status}</span><br>
                    <strong>Supplier:</strong> ${supplier?.name || 'N/A'}
                </div>
                <div class="col-md-6">
                    <strong>Order Date:</strong> ${new Date(po.order_date).toLocaleDateString()}<br>
                    <strong>Expected Date:</strong> ${po.expected_date ? new Date(po.expected_date).toLocaleDateString() : 'N/A'}<br>
                    <strong>Location:</strong> ${location?.name || 'N/A'}
                </div>
            </div>
            
            <h6 class="mt-4">Order Items:</h6>
            ${itemsWithProducts.length > 0 ? `
                <table class="table table-sm table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Ordered Qty</th>
                            <th>Received Qty</th>
                            <th>Unit Cost</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsWithProducts.map(item => `
                            <tr>
                                <td>${item.product?.name || 'N/A'}</td>
                                <td>${item.product?.sku || 'N/A'}</td>
                                <td>${item.ordered_quantity}</td>
                                <td>${item.received_quantity || 0}</td>
                                <td>R ${parseFloat(item.unit_cost || 0).toFixed(2)}</td>
                                <td>R ${(parseFloat(item.ordered_quantity) * parseFloat(item.unit_cost || 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        <tr class="table-light">
                            <td colspan="5" class="text-end"><strong>Total:</strong></td>
                            <td><strong>R ${total.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>
            ` : '<p class="text-muted">No items found for this purchase order.</p>'}
            
            ${po.notes ? `<div class="mt-3"><strong>Notes:</strong><br>${po.notes}</div>` : ''}
        `;
        
    } catch (error) {
        console.error('Error loading PO details:', error);
        document.getElementById('poModalBody').innerHTML = `
            <div class="alert alert-danger">Error loading purchase order details. ${error.message}</div>
        `;
    }
}