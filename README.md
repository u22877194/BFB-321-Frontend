# Inventory Management System

A comprehensive web-based inventory management system built with HTML5, CSS3, Bootstrap 5, and JavaScript.

---
## Group 3 Members
- u22877194 - Van Wyk Grotius
- u22522281 - Marin Smit

---
## Features

### Core Modules
- **Product Management** - Complete CRUD operations for products
- **Inventory Tracking** - Real-time inventory overview and stock levels
- **Purchase Orders** - Create, approve, and manage purchase orders
- **Transfer Orders** - Transfer stock between locations
- **Location Management** - Manage warehouses and branches
- **Supplier Management** - Maintain supplier database
- **Category Management** - Organize products with categories and sub-categories
- **User & Role Management** - Control access with role-based permissions

---

## Project Structure

```
inventory-management-system/
│
├── index.html                          # Login page
├── dashboard.html                      # Main dashboard
├── README.md                          # Project documentation
│
├── css/
│   ├── style.css                      # Custom styles
│   └── responsive.css                 # Responsive breakpoints
│
├── js/
│   ├── main.js                        # Core JavaScript functions
│   └── charts.js                      # Chart configurations
│
├── assets/
│   ├── images/                        # Image assets
│   └── icons/                         # Icon files
│
├── pages/
│   ├── products/
│   │   ├── products-list.html         # Products listing
│   │   ├── add-product.html           # Add new product
│   │   └── edit-product.html          # Edit product
│   │
│   ├── inventory/
│   │   ├── inventory-overview.html    # Inventory dashboard
│   │   └── inventory-transactions.html # Transaction history
│   │
│   ├── purchase-orders/
│   │   ├── po-list.html               # PO listing
│   │   ├── create-po.html             # Create PO
│   │   └── po-details.html            # PO details
│   │
│   ├── transfer-orders/
│   │   ├── transfer-list.html         # Transfer listing
│   │   ├── create-transfer.html       # Create transfer
│   │   └── transfer-details.html      # Transfer details
│   │
│   ├── locations/
│   │   └── locations.html             # Location management
│   │
│   ├── suppliers/
│   │   └── suppliers.html             # Supplier management
│   │
│   ├── categories/
│   │   └── categories.html            # Category management
│   │
│   └── users/
│       └── users.html                 # User & role management
│
└── components/
    ├── sidebar.html                   # Sidebar component (reference)
    ├── navbar.html                    # Navbar component (reference)
    └── footer.html                    # Footer component (reference)
```

---

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code recommended)
- Live Server extension (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/u22877194/BFB-321-Inventory-Management-Group3.git
   cd BFB-321-Inventory-Management-Group3
   ```

2. **Open in VS Code**
   
   **Using VS Code GUI:**
   - Open VS Code
   - Click `File → Open Folder`
   - Select the `inventory-management-system` folder
   - Click `Open`


3. **Install Live Server Extension**
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install by Ritwick Dey

4. **Run the Application**
   - Right-click `index.html`
   - Select "Open with Live Server"
   - Application opens at `http://localhost:5500`

### Demo Login Credentials
```
Email: admin@example.com
Password: admin123
```

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure and markup |
| **CSS3** | Styling and animations |
| **Bootstrap 5.3** | Responsive framework |
| **Bootstrap Icons** | Icon library |
| **JavaScript (ES6+)** | Interactivity and logic |
| **Chart.js** | Data visualization |


---


## Database Schema

The system uses a fully normalized (3NF) relational database with 19 core tables.

### Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    addresses {
        INT address_id PK
        TEXT street_address
        VARCHAR city
        VARCHAR state_province
        VARCHAR country
        VARCHAR postal_code
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    organizations {
        INT organization_id PK
        VARCHAR organization_name
        VARCHAR organization_code UK
        INT address_id FK
        VARCHAR phone
        VARCHAR email
        VARCHAR website
        VARCHAR tax_number
        VARCHAR currency_code
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    permissions {
        INT permission_id PK
        VARCHAR permission_name UK
        VARCHAR permission_code UK
        VARCHAR permission_category
        TEXT description
        BOOLEAN is_active
        TIMESTAMP created_at
    }
    
    roles {
        INT role_id PK
        VARCHAR role_name
        TEXT role_description
        INT organization_id FK
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    role_permissions {
        INT role_permission_id PK
        INT role_id FK
        INT permission_id FK
        TIMESTAMP granted_date
    }
    
    users {
        INT user_id PK
        INT organization_id FK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR phone
        BOOLEAN is_active
        TIMESTAMP last_login
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    user_roles {
        INT user_role_id PK
        INT user_id FK
        INT role_id FK
        TIMESTAMP assigned_date
    }
    
    locations {
        INT location_id PK
        INT organization_id FK
        VARCHAR location_name
        VARCHAR location_code UK
        VARCHAR location_type
        INT address_id FK
        VARCHAR phone
        VARCHAR email
        INT manager_user_id FK
        DECIMAL capacity_limit
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    sub_locations {
        INT sub_location_id PK
        INT location_id FK
        VARCHAR sub_location_name
        VARCHAR sub_location_code
        TEXT description
        VARCHAR aisle
        VARCHAR rack
        VARCHAR shelf
        VARCHAR bin
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    categories {
        INT category_id PK
        INT organization_id FK
        VARCHAR category_name
        VARCHAR category_code
        TEXT description
        INT parent_category_id FK
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    sub_categories {
        INT sub_category_id PK
        INT category_id FK
        VARCHAR sub_category_name
        VARCHAR sub_category_code
        TEXT description
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    suppliers {
        INT supplier_id PK
        INT organization_id FK
        VARCHAR supplier_name
        VARCHAR supplier_code UK
        VARCHAR contact_person
        INT address_id FK
        VARCHAR phone
        VARCHAR email
        VARCHAR website
        VARCHAR tax_number
        VARCHAR payment_terms
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    products {
        INT product_id PK
        INT organization_id FK
        VARCHAR product_name
        VARCHAR sku UK
        VARCHAR barcode UK
        TEXT description
        INT category_id FK
        INT sub_category_id FK
        INT supplier_id FK
        VARCHAR unit_of_measure
        DECIMAL unit_price
        DECIMAL cost_price
        INT reorder_level
        INT reorder_quantity
        BOOLEAN is_active
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    inventory {
        INT inventory_id PK
        INT product_id FK
        INT location_id FK
        INT sub_location_id FK
        INT quantity_on_hand
        INT quantity_reserved
        INT quantity_available "COMPUTED"
        TIMESTAMP last_stock_date
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    purchase_orders {
        INT po_id PK
        INT organization_id FK
        VARCHAR po_number UK
        INT supplier_id FK
        INT destination_location_id FK
        DATE po_date
        DATE expected_delivery_date
        VARCHAR status
        DECIMAL subtotal
        DECIMAL tax_rate
        DECIMAL tax_amount "COMPUTED"
        DECIMAL shipping_cost
        DECIMAL total_amount "COMPUTED"
        TEXT notes
        INT created_by FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    purchase_order_items {
        INT po_item_id PK
        INT po_id FK
        INT product_id FK
        INT quantity_ordered
        INT quantity_received
        DECIMAL unit_price
        DECIMAL line_total "COMPUTED"
        TIMESTAMP created_at
    }
    
    transfer_orders {
        INT transfer_id PK
        INT organization_id FK
        VARCHAR transfer_number UK
        INT from_location_id FK
        INT to_location_id FK
        DATE transfer_date
        DATE expected_arrival_date
        VARCHAR status
        TEXT notes
        INT created_by FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }
    
    transfer_order_items {
        INT transfer_item_id PK
        INT transfer_id FK
        INT product_id FK
        INT quantity_to_transfer
        INT quantity_received
        TIMESTAMP created_at
    }
    
    inventory_transactions {
        INT transaction_id PK
        INT organization_id FK
        VARCHAR transaction_number UK
        INT product_id FK
        INT location_id FK
        INT sub_location_id FK
        VARCHAR transaction_type
        INT quantity
        DECIMAL unit_price
        DECIMAL total_value "COMPUTED"
        VARCHAR reference_number
        TEXT notes
        INT performed_by FK
        TIMESTAMP transaction_date
    }

    %% Relationships
    
    %% Address relationships
    addresses ||--o{ organizations : "located at"
    addresses ||--o{ locations : "located at"
    addresses ||--o{ suppliers : "located at"
    
    %% Organization relationships
    organizations ||--o{ users : "employs"
    organizations ||--o{ roles : "defines"
    organizations ||--o{ locations : "owns"
    organizations ||--o{ categories : "uses"
    organizations ||--o{ suppliers : "works with"
    organizations ||--o{ products : "manages"
    organizations ||--o{ purchase_orders : "creates"
    organizations ||--o{ transfer_orders : "creates"
    organizations ||--o{ inventory_transactions : "records"
    
    %% Permission relationships
    permissions ||--o{ role_permissions : "granted to"
    roles ||--o{ role_permissions : "has"
    roles ||--o{ user_roles : "assigned to"
    users ||--o{ user_roles : "has"
    
    %% Location relationships
    locations ||--o{ sub_locations : "contains"
    locations ||--o{ inventory : "stores"
    locations ||--o{ purchase_orders : "receives"
    locations ||--o{ transfer_orders : "sends from"
    locations ||--o{ transfer_orders : "receives at"
    locations ||--o{ inventory_transactions : "occurs at"
    users ||--o{ locations : "manages"
    
    %% Category relationships
    categories ||--o{ sub_categories : "contains"
    categories ||--o{ products : "categorizes"
    categories ||--o{ categories : "parent of"
    sub_categories ||--o{ products : "subcategorizes"
    
    %% Product relationships
    suppliers ||--o{ products : "supplies"
    products ||--o{ inventory : "stored as"
    products ||--o{ purchase_order_items : "ordered in"
    products ||--o{ transfer_order_items : "transferred in"
    products ||--o{ inventory_transactions : "involved in"
    
    %% Order relationships
    purchase_orders ||--o{ purchase_order_items : "contains"
    suppliers ||--o{ purchase_orders : "fulfills"
    users ||--o{ purchase_orders : "creates"
    
    transfer_orders ||--o{ transfer_order_items : "contains"
    users ||--o{ transfer_orders : "creates"
    
    %% Inventory relationships
    sub_locations ||--o{ inventory : "stores"
    sub_locations ||--o{ inventory_transactions : "occurs at"
    users ||--o{ inventory_transactions : "performs"
```

### Database Overview

### Core Tables

**Organization & Users**
1. **addresses** - Centralized address storage (eliminates redundancy)
2. **organizations** - Company information
3. **permissions** - System permissions
4. **roles** - User roles
5. **role_permissions** - Role-permission mapping (Many-to-Many)
6. **users** - User accounts
7. **user_roles** - User-role mapping (Many-to-Many)

**Locations & Products**
8. **locations** - Warehouses and stores
9. **sub_locations** - Location subdivisions (aisles, racks, shelves)
10. **categories** - Product categories (hierarchical)
11. **sub_categories** - Product subcategories
12. **suppliers** - Vendor information
13. **products** - Product master data

**Inventory & Transactions**
14. **inventory** - Current stock levels by location
15. **inventory_transactions** - Stock movement history
16. **purchase_orders** - Purchase order headers
17. **purchase_order_items** - PO line items
18. **transfer_orders** - Stock transfers between locations
19. **transfer_order_items** - Transfer line items

### Key Relationships

- **One-to-Many**: 
  - organizations → users, locations, products
  - locations → sub_locations, inventory
  - products → inventory, order items
  
- **Many-to-Many**: 
  - users ↔ roles (via user_roles)
  - roles ↔ permissions (via role_permissions)
  
- **Self-Referencing**: 
  - categories → parent_category (hierarchical structure)

---

---

## Known Issues & Limitations

### Current Limitations
- **No Backend**: Frontend only - requires API integration
- **Demo Data**: Uses sample/mock data
- **No Authentication**: Login is simulated
- **No Database**: No persistent data storage
- **localStorage Only**: Data stored in browser (not permanent)

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Internet Explorer (not supported)


**Note**: This is a frontend-only application. For production use, you would need to add backend functionality for database connectivity, authentication, and API integration.