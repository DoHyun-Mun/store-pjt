namespace com.inventory;

using {
  cuid,
  managed
} from '@sap/cds/common';

// ═══════════════════════════════════════════════════════════════════════
// Category (분류 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Categories : cuid, managed {
  code        : String(10) @mandatory @assert.unique;
  name        : String(100) @mandatory;
  description : String(500);
  isActive    : Boolean default true;
  products    : Association to many Products on products.category = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// Supplier (공급업체 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Suppliers : cuid, managed {
  supplierCode  : String(20) @mandatory @assert.unique;
  name          : String(200) @mandatory;
  contactPerson : String(100);
  phone         : String(20);
  email         : String(100);
  address       : String(500);
  city          : String(100);
  country       : String(50);
  paymentTerms  : String(50);    // NET30, NET60, COD 등
  leadTime      : Integer default 7;  // 기본 리드타임(일)
  rating        : Decimal(2,1);  // 평가 등급 1.0~5.0
  isActive      : Boolean default true;
  description   : String(1000);
  materials     : Association to many Materials on materials.supplier = $self;
  supplyOrders  : Association to many SupplyOrders on supplyOrders.supplier = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// Material (자재 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Materials : cuid, managed {
  materialCode  : String(20) @mandatory @assert.unique;
  name          : String(200) @mandatory;
  materialType  : String(20);   // RAW(원자재), SUB(부자재), PKG(포장재)
  unit          : String(10);   // EA, KG, L, M 등
  unitPrice     : Decimal(15,2) default 0;
  supplier      : Association to Suppliers;
  minOrderQty   : Integer default 1;
  safetyStock   : Integer default 0;
  currentStock  : Integer default 0;
  isActive      : Boolean default true;
  description   : String(1000);
  productMaterials : Association to many ProductMaterials on productMaterials.material = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// Product (상품 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Products : cuid, managed {
  productCode : String(20) @mandatory @assert.unique;
  name        : String(200) @mandatory;
  category    : Association to Categories;
  unit        : String(10);     // EA, KG, L 등
  costPrice   : Decimal(15,2) default 0;   // 원가
  marginRate  : Decimal(5,2) default 0;    // 마진율 (%)
  sellingPrice: Decimal(15,2) default 0;   // 판매가 (원가 × (1 + 마진율/100))
  safetyStock : Integer default 0;
  leadTime    : Integer default 0;         // 발주 리드타임(일)
  isActive    : Boolean default true;
  description : String(1000);
  inventories     : Association to many Inventories on inventories.product = $self;
  orders          : Association to many PurchaseOrders on orders.product = $self;
  storeProducts   : Association to many StoreProducts on storeProducts.product = $self;
  productMaterials: Association to many ProductMaterials on productMaterials.product = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// ProductMaterial (상품-자재 BOM)
// ═══════════════════════════════════════════════════════════════════════
entity ProductMaterials : cuid, managed {
  product   : Association to Products;
  material  : Association to Materials;
  quantity  : Decimal(10,3) not null default 1;  // 상품 1단위당 필요 자재 수량
  unit      : String(10);
}

// ═══════════════════════════════════════════════════════════════════════
// Store (점포 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Stores : cuid, managed {
  storeCode     : String(20) @mandatory @assert.unique;
  name          : String(200) @mandatory;
  address       : String(500);
  city          : String(100);
  postalCode    : String(10);
  country       : String(50);
  phone         : String(20);
  email         : String(100);
  manager       : String(100);
  storeType     : String(20);   // Store / Warehouse / Online
  isActive      : Boolean default true;
  description   : String(1000);
  inventories   : Association to many Inventories on inventories.store = $self;
  storeProducts : Association to many StoreProducts on storeProducts.store = $self;
  supplyOrders  : Association to many SupplyOrders on supplyOrders.store = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// StoreProduct (점포별 상품 관리)
// ═══════════════════════════════════════════════════════════════════════
entity StoreProducts : cuid, managed {
  store        : Association to Stores;
  product      : Association to Products;
  sellingPrice : Decimal(15,2) default 0;   // 점포별 판매가
  costPrice    : Decimal(15,2) default 0;   // 점포별 원가
  minStock     : Integer default 0;         // 점포 최소 재고
  maxStock     : Integer default 0;         // 점포 최대 재고
  displayOrder : Integer default 0;         // 진열 순서
  isActive     : Boolean default true;
}

// ═══════════════════════════════════════════════════════════════════════
// Inventory (재고 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Inventories : cuid, managed {
  product      : Association to Products;
  store        : Association to Stores;
  warehouse    : String(50);   // 창고 코드
  quantity     : Integer not null default 0 @assert.range: [ 0, ];
  reservedQty  : Integer default 0 @assert.range: [ 0, ];
  availableQty : Integer default 0;  // computed: quantity - reservedQty
  minStock     : Integer default 0;  // 적정 최소 재고
  maxStock     : Integer default 0;  // 적정 최대 재고
  lastUpdated  : Timestamp;
}

// ═══════════════════════════════════════════════════════════════════════
// PurchaseOrder (발주 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity PurchaseOrders : cuid, managed {
  poNumber     : String(20) @assert.unique;  // 자동 채번 PO-YYYYMMDD-XXXX
  product      : Association to Products;
  store        : Association to Stores;      // 발주 대상 점포
  supplier     : Association to Suppliers;   // 발주 대상 공급업체
  quantity     : Integer not null @assert.range: [ 1, ];
  unitPrice    : Decimal(15,2) default 0;
  totalAmount  : Decimal(15,2) default 0;    // computed: quantity * unitPrice
  status       : String(20) default 'Draft'; // Draft / Submitted / Approved / Rejected / Received
  requestedBy  : String(100);
  approvedBy   : String(100);
  approvedAt   : Timestamp;
  expectedDate : Date;
  receivedDate : Date;
  note         : String(500);
}

// ═══════════════════════════════════════════════════════════════════════
// SupplyOrder (공급/입출고 주문)
// ═══════════════════════════════════════════════════════════════════════
entity SupplyOrders : cuid, managed {
  orderNumber   : String(20) @assert.unique;   // 자동 채번 SO-YYYYMMDD-XXXX
  store         : Association to Stores;
  supplier      : Association to Suppliers;
  orderType     : String(20);     // SUPPLY(공급), RETURN(반품), TRANSFER(점포간이동)
  status        : String(20) default 'Draft';  // Draft / Confirmed / Shipped / Delivered / Cancelled
  orderDate     : Date;
  expectedDate  : Date;
  deliveredDate : Date;
  totalAmount   : Decimal(15,2) default 0;
  requestedBy   : String(100);
  note          : String(500);
  items         : Composition of many SupplyOrderItems on items.supplyOrder = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// SupplyOrderItem (공급 주문 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity SupplyOrderItems : cuid, managed {
  supplyOrder  : Association to SupplyOrders;
  product      : Association to Products;
  material     : Association to Materials;
  quantity     : Integer not null default 1 @assert.range: [ 1, ];
  unitPrice    : Decimal(15,2) default 0;
  totalPrice   : Decimal(15,2) default 0;   // computed: quantity * unitPrice
  note         : String(200);
}