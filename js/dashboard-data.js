/**
 * DASHBOARD DATA SERVICE - PERFECT MATCH VERSION
 * Exactly matches your database schema from migration
 */

// Get dashboard statistics
async function getDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');
        
        // Get total products count
        const { count: totalProducts, error: prodError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });
        
        if (prodError) {
            console.error('Error counting products:', prodError);
        }
        
        // Get products for low stock calculation
        // Using 'reorder_level' column (not min_stock_level)
        const { data: allProducts, error: lowStockError } = await supabase
            .from('products')
            .select('id, reorder_level');
        
        if (lowStockError) {
            console.error('Error getting products:', lowStockError);
        }
        
        // Get inventory quantities
        const { data: inventoryData, error: invError } = await supabase
            .from('inventory')
            .select('product_id, quantity');
        
        if (invError) {
            console.error('Error getting inventory:', invError);
        }
        
        // Create map of product quantities from inventory
        const productQuantities = {};
        inventoryData?.forEach(inv => {
            productQuantities[inv.product_id] = (productQuantities[inv.product_id] || 0) + (inv.quantity || 0);
        });
        
        // Count low stock and out of stock items
        let lowStockCount = 0;
        let outOfStockCount = 0;

        allProducts?.forEach(product => {
            const qty = productQuantities[product.id] || 0;
            const reorderLevel = product.reorder_level || 0;
    
        if (qty === 0) {
            outOfStockCount++;  // ← ADD THIS
        } else if (qty < reorderLevel && reorderLevel > 0) {
            lowStockCount++;
        }
    });
        
        // Calculate total stock
        const totalStock = inventoryData?.reduce((sum, item) => 
            sum + (item.quantity || 0), 0
        ) || 0;
        
        // Get active locations count
        const { count: totalLocations, error: locError } = await supabase
            .from('locations')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        
        if (locError) {
            console.error('Error counting locations:', locError);
        }
        
        // Get pending purchase orders (status = 'submitted' or 'approved')
        const { count: pendingOrders, error: poError } = await supabase
            .from('purchase_orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['submitted', 'approved']);
        
        if (poError) {
            console.error('Error counting pending orders:', poError);
        }
        
        const stats = {
            totalProducts: totalProducts || 0,
            lowStockCount: lowStockCount,
            outOfStockCount: outOfStockCount,
            totalStock: totalStock,
            totalLocations: totalLocations || 0,
            pendingOrders: pendingOrders || 0
        };
        
        console.log('Stats fetched:', stats);
        return stats;
        
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        return {
            totalProducts: 0,
            lowStockCount: 0,
            totalStock: 0,
            totalLocations: 0,
            pendingOrders: 0
        };
    }
}

// Get recent transactions
async function getRecentTransactions(limit = 10) {
    try {
        console.log('Fetching recent transactions...');
        
        // Get transactions (uses 'created_at' for date)
        const { data, error } = await supabase
            .from('inventory_transactions')
            .select('id, transaction_type, quantity, created_at, product_id, location_id')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
        
        if (!data || data.length === 0) {
            console.log('No transactions found');
            return [];
        }
        
        // Get unique product IDs
        const productIds = [...new Set(data.map(t => t.product_id).filter(id => id))];
        
        let productMap = {};
        if (productIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, name, sku')
                .in('id', productIds);
            
            products?.forEach(p => {
                productMap[p.id] = {
                    product_name: p.name,
                    sku: p.sku
                };
            });
        }
        
        // Get unique location IDs
        const locationIds = [...new Set(data.map(t => t.location_id).filter(id => id))];
        
        let locationMap = {};
        if (locationIds.length > 0) {
            const { data: locations } = await supabase
                .from('locations')
                .select('id, name')
                .in('id', locationIds);
            
            locations?.forEach(l => {
                locationMap[l.id] = {
                    location_name: l.name
                };
            });
        }
        
        // Add product and location info to transactions
        data.forEach(t => {
            t.products = productMap[t.product_id] || null;
            t.locations = locationMap[t.location_id] || null;
            t.transaction_date = t.created_at; // Add for compatibility
            t.transaction_id = t.id; // Add for compatibility
        });
        
        console.log('Transactions fetched:', data.length);
        return data;
        
    } catch (error) {
        console.error('Error in getRecentTransactions:', error);
        return [];
    }
}

// Get products by category (for chart)
async function getProductsByCategory() {
    try {
        console.log('Fetching products by category...');
        
        // Get all products with category_id
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, category_id');
        
        if (prodError) {
            console.error('Error getting products:', prodError);
            return {};
        }
        
        // Get all categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('id, name');
        
        if (catError) {
            console.error('Error getting categories:', catError);
            return {};
        }
        
        // Create category map
        const categoryMap = {};
        categories?.forEach(c => {
            categoryMap[c.id] = c.name;
        });
        
        // Count products per category
        const categoryCounts = {};
        products?.forEach(product => {
            const categoryName = categoryMap[product.category_id] || 'Uncategorized';
            categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
        });
        
        console.log('Products by category:', categoryCounts);
        return categoryCounts;
        
    } catch (error) {
        console.error('Error in getProductsByCategory:', error);
        return {};
    }
}

// Get low stock products
async function getLowStockProducts(limit = 5) {
    try {
        console.log('Fetching low stock products...');
        
        // Get all products with reorder_level
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name, sku, reorder_level');
        
        if (prodError) {
            console.error('Error fetching products:', prodError);
            return [];
        }
        
        // Get inventory quantities
        const { data: inventory, error: invError } = await supabase
            .from('inventory')
            .select('product_id, quantity');
        
        if (invError) {
            console.error('Error fetching inventory:', invError);
            return [];
        }
        
        // Sum quantities per product
        const productQuantities = {};
        inventory?.forEach(inv => {
            productQuantities[inv.product_id] = (productQuantities[inv.product_id] || 0) + (inv.quantity || 0);
        });
        
        // Find low stock items
        const lowStockItems = [];
        products?.forEach(product => {
            const qty = productQuantities[product.id] || 0;
            const reorderLevel = product.reorder_level || 0;
            
            if (qty < reorderLevel && reorderLevel > 0) {
                lowStockItems.push({
                    product_id: product.id,
                    product_name: product.name,
                    sku: product.sku,
                    quantity: qty,
                    reorder_level: reorderLevel
                });
            }
        });
        
        // Sort by quantity (lowest first) and limit
        lowStockItems.sort((a, b) => a.quantity - b.quantity);
        const result = lowStockItems.slice(0, limit);
        
        console.log('Low stock products fetched:', result.length);
        return result;
        
    } catch (error) {
        console.error('Error in getLowStockProducts:', error);
        return [];
    }
}

// Get pending purchase orders
async function getPendingPurchaseOrders(limit = 5) {
    try {
        console.log('Fetching pending purchase orders...');
        
        // Get orders with status 'submitted' or 'approved'
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('id, po_number, order_date, expected_date, status, supplier_id')
            .in('status', ['submitted', 'approved'])
            .order('order_date', { ascending: false })
            .limit(limit);
        
        if (error) {
            console.error('Error fetching purchase orders:', error);
            return [];
        }
        
        if (!data || data.length === 0) {
            console.log('No pending orders found');
            return [];
        }
        
        // Get supplier names
        const supplierIds = [...new Set(data.map(o => o.supplier_id).filter(id => id))];
        
        let supplierMap = {};
        if (supplierIds.length > 0) {
            const { data: suppliers } = await supabase
                .from('suppliers')
                .select('id, name')
                .in('id', supplierIds);
            
            suppliers?.forEach(s => {
                supplierMap[s.id] = {
                    supplier_name: s.name
                };
            });
        }
        
        // Add supplier info and calculate total (you don't have total_amount in schema)
        data.forEach(o => {
            o.suppliers = supplierMap[o.supplier_id] || null;
            o.po_date = o.order_date; // Add for compatibility
            o.po_id = o.id; // Add for compatibility
            o.total_amount = 0; // Placeholder since not in schema
        });
        
        console.log('Pending orders fetched:', data.length);
        return data;
        
    } catch (error) {
        console.error('Error in getPendingPurchaseOrders:', error);
        return [];
    }
}

console.log('✅ Dashboard data functions loaded (PERFECT MATCH - migration schema)');