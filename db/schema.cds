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
  customers     : Association to many Customers on customers.preferredStore = $self;
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
  quantity     : Integer not null default 0;
  reservedQty  : Integer default 0;
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
  quantity     : Integer not null;
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
  quantity     : Integer not null default 1;
  unitPrice    : Decimal(15,2) default 0;
  totalPrice   : Decimal(15,2) default 0;   // computed: quantity * unitPrice
  note         : String(200);
}

// ═══════════════════════════════════════════════════════════════════════
// Customer (고객 마스터)
// ═══════════════════════════════════════════════════════════════════════
entity Customers : cuid, managed {
  customerCode        : String(20) @mandatory @assert.unique;
  name                : String(200) @mandatory;
  phone               : String(20);
  email               : String(100);
  gender              : String(10);          // M / F / Other
  birthDate           : Date;
  ageGroup            : String(10);          // 10대/20대/.../60대+
  address             : String(500);
  city                : String(100);
  postalCode          : String(10);
  membershipType      : String(20) default 'REGULAR';  // REGULAR / SILVER / GOLD / VIP
  registeredAt        : Date;
  preferredStore      : Association to Stores;
  isActive            : Boolean default true;
  totalPurchaseAmount : Decimal(15,2) default 0;
  visitCount          : Integer default 0;
  lastVisitDate       : Date;
  purchases           : Association to many CustomerPurchases on purchases.customer = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// CustomerPurchase (고객 구매 이력)
// ═══════════════════════════════════════════════════════════════════════
entity CustomerPurchases : cuid, managed {
  purchaseNumber : String(20) @assert.unique;  // 자동 채번 CP-YYYYMMDD-XXXX
  customer       : Association to Customers;
  store          : Association to Stores;
  purchaseDate   : DateTime;
  totalAmount    : Decimal(15,2) default 0;
  paymentMethod  : String(20);    // CASH / CARD / MOBILE / POINTS
  note           : String(500);
  items          : Composition of many CustomerPurchaseItems on items.purchase = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// CustomerPurchaseItem (구매 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity CustomerPurchaseItems : cuid, managed {
  purchase   : Association to CustomerPurchases;
  product    : Association to Products;
  quantity   : Integer not null default 1;
  unitPrice  : Decimal(15,2) default 0;
  totalPrice : Decimal(15,2) default 0;   // quantity × unitPrice
  discount   : Decimal(15,2) default 0;
}

// ═══════════════════════════════════════════════════════════════════════
// DailySales (일별 매출 집계 - ML 수요 예측 입력)
// ═══════════════════════════════════════════════════════════════════════
entity DailySales : cuid, managed {
  store         : Association to Stores;
  product       : Association to Products;
  salesDate     : Date;
  quantity      : Integer default 0;
  revenue       : Decimal(15,2) default 0;
  costAmount    : Decimal(15,2) default 0;
  profit        : Decimal(15,2) default 0;   // revenue - costAmount
  customerCount : Integer default 0;
}

// ═══════════════════════════════════════════════════════════════════════
// InventorySnapshot (재고 스냅샷 이력 - ML 재고 최적화 입력)
// ═══════════════════════════════════════════════════════════════════════
entity InventorySnapshots : cuid, managed {
  store         : Association to Stores;
  product       : Association to Products;
  snapshotDate  : Date;
  quantity      : Integer default 0;
  reservedQty   : Integer default 0;
  availableQty  : Integer default 0;
  daysOfSupply  : Decimal(5,1) default 0;   // 재고일수
  stockStatus   : String(20);               // NORMAL / LOW / OUT / OVERSTOCK
}

// ═══════════════════════════════════════════════════════════════════════
// DemandForecast (수요 예측 결과 - ML 출력 저장)
// ═══════════════════════════════════════════════════════════════════════
entity DemandForecasts : cuid, managed {
  store          : Association to Stores;
  product        : Association to Products;
  forecastDate   : Date;
  forecastQty    : Decimal(10,1) default 0;
  confidenceLow  : Decimal(10,1) default 0;
  confidenceHigh : Decimal(10,1) default 0;
  modelName      : String(50);    // Prophet, LSTM 등
  modelVersion   : String(20);
  accuracy       : Decimal(5,2);  // MAPE 등
  generatedAt    : Timestamp;
}

// ═══════════════════════════════════════════════════════════════════════
// MenuItems (메뉴 관리 - 3계층 트리 구조)
// ═══════════════════════════════════════════════════════════════════════
entity MenuItems : cuid, managed {
  code        : String(30) @mandatory @assert.unique;
  title       : String(200) @mandatory;
  icon        : String(50);              // 이모지 또는 SAP Icon
  level       : Integer default 1;       // 1=대메뉴, 2=중메뉴, 3=소메뉴
  url         : String(500);             // 이동할 URL (소메뉴만)
  parent      : Association to MenuItems;
  children    : Composition of many MenuItems on children.parent = $self;
  sortOrder   : Integer default 0;
  isActive    : Boolean default true;
  description : String(500);
}

// ═══════════════════════════════════════════════════════════════════════
// OrderRecommendation (발주 추천 - ML 예측 기반)
// ═══════════════════════════════════════════════════════════════════════
entity OrderRecommendations : cuid, managed {
  store           : Association to Stores;
  product         : Association to Products;
  supplier        : Association to Suppliers;
  recommendDate   : Date;
  recommendedQty  : Integer default 0;
  currentStock    : Integer default 0;
  forecastDemand  : Decimal(10,1) default 0;   // 예측 수요 (7일)
  safetyStock     : Integer default 0;
  leadTime        : Integer default 0;
  estimatedCost   : Decimal(15,2) default 0;
  priority        : String(10);                // HIGH / MEDIUM / LOW
  status          : String(20) default 'Pending'; // Pending / Accepted / Rejected / Ordered
  note            : String(500);
}

// ═══════════════════════════════════════════════════════════════════════
// ChurnPrediction (고객 이탈 예측 결과 - Python ML 출력)
// ═══════════════════════════════════════════════════════════════════════
entity ChurnPredictions : cuid, managed {
  customer        : Association to Customers;
  churnScore      : Decimal(5,4) default 0;    // 이탈 확률 0.0000~1.0000
  churnRisk       : String(10);                // HIGH / MEDIUM / LOW
  recencyDays     : Integer default 0;         // 마지막 방문 이후 일수
  frequency       : Integer default 0;         // 방문 횟수
  monetary        : Decimal(15,2) default 0;   // 총 구매 금액
  avgPurchaseAmount : Decimal(15,2) default 0; // 평균 구매 금액
  daysSinceRegistered : Integer default 0;     // 가입 이후 일수
  modelName       : String(50);                // XGBoost, RandomForest 등
  modelVersion    : String(20);
  accuracy        : Decimal(5,2);              // 모델 정확도 (%)
  predictedAt     : Timestamp;
}

// ═══════════════════════════════════════════════════════════════════════
// CustomerSegment (고객 세분화 결과 - Python ML 출력)
// ═══════════════════════════════════════════════════════════════════════
entity CustomerSegments : cuid, managed {
  customer         : Association to Customers;
  segmentName      : String(50);               // Champions, Loyal, AtRisk, Lost 등
  segmentCode      : String(20);               // CHAMP, LOYAL, ATRISK, LOST 등
  rfmScore         : Integer default 0;        // 종합 RFM 점수 (3~15)
  recencyScore     : Integer default 0;        // R 점수 (1~5)
  frequencyScore   : Integer default 0;        // F 점수 (1~5)
  monetaryScore    : Integer default 0;        // M 점수 (1~5)
  clusterLabel     : Integer default 0;        // K-Means 클러스터 번호
  description      : String(500);              // 세그먼트 설명
  modelName        : String(50);               // KMeans, RFM 등
  modelVersion     : String(20);
  analyzedAt       : Timestamp;
}

// ═══════════════════════════════════════════════════════════════════════
// SalesAnomaly (매출 이상 탐지 결과 - Python ML 출력)
// ═══════════════════════════════════════════════════════════════════════
entity SalesAnomalies : cuid, managed {
  store            : Association to Stores;
  product          : Association to Products;
  salesDate        : Date;
  metricName       : String(50);               // revenue, quantity, customerCount, profit
  actualValue      : Decimal(15,2) default 0;  // 실제 값
  expectedValue    : Decimal(15,2) default 0;  // 예측/기대 값
  deviation        : Decimal(15,2) default 0;  // 편차 (actual - expected)
  zScore           : Decimal(8,4) default 0;   // Z-Score
  anomalyType      : String(20);               // SPIKE(급증) / DROP(급감) / NORMAL
  severity         : String(10);               // HIGH / MEDIUM / LOW
  movingAvg        : Decimal(15,2) default 0;  // 이동평균값
  stdDev           : Decimal(15,2) default 0;  // 표준편차
  modelName        : String(50);               // IsolationForest, ZScore 등
  modelVersion     : String(20);
  detectedAt       : Timestamp;
}
