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
  dc            : Association to DistributionCenters; // 배송 담당 물류센터
  inventories   : Association to many Inventories on inventories.store = $self;
  storeProducts : Association to many StoreProducts on storeProducts.store = $self;
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
  store        : Association to Stores;      // 발주 대상 점포 (점포 직납)
  dc           : Association to DistributionCenters; // 입고 물류센터 (물류 발주)
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

// ═══════════════════════════════════════════════════════════════════════
// DistributionCenter (물류센터/DC)
// ═══════════════════════════════════════════════════════════════════════
entity DistributionCenters : cuid, managed {
  dcCode        : String(20) @mandatory @assert.unique;
  name          : String(200) @mandatory;
  address       : String(500);
  city          : String(100);
  postalCode    : String(10);
  country       : String(50) default '대한민국';
  phone         : String(20);
  email         : String(100);
  manager       : String(100);
  capacity      : Integer default 0;        // 최대 보관 수량(팔레트)
  currentStock  : Integer default 0;        // 현재 보관량
  dcType        : String(20);               // CENTRAL(중앙), REGIONAL(권역), COLD(저온)
  isActive      : Boolean default true;
  description   : String(1000);
  goodsReceipts   : Association to many GoodsReceipts on goodsReceipts.dc = $self;
  transferOrders  : Association to many TransferOrders on transferOrders.dc = $self;
}



// ═══════════════════════════════════════════════════════════════════════
// GoodsReceipt (입고검수: 물류센터에서 수량/품질 확인)
// ═══════════════════════════════════════════════════════════════════════
entity GoodsReceipts : cuid, managed {
  grNumber      : String(20) @assert.unique;   // GR-YYYYMMDD-XXXX
  purchaseOrder : Association to PurchaseOrders;
  dc            : Association to DistributionCenters;
  store         : Association to Stores;             // 점포 직납 GR용
  status        : String(20) default 'Inspecting';  // Inspecting / Passed / PartialReject / Rejected
  inspectedBy   : String(100);
  inspectedAt   : Timestamp;
  totalPassedQty  : Integer default 0;
  totalRejectedQty: Integer default 0;
  rejectReason  : String(500);
  note          : String(500);
  items         : Composition of many GoodsReceiptItems on items.goodsReceipt = $self;
  invoice       : Association to Invoices;
}

// ═══════════════════════════════════════════════════════════════════════
// GoodsReceiptItem (입고검수 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity GoodsReceiptItems : cuid, managed {
  goodsReceipt  : Association to GoodsReceipts;
  product       : Association to Products;
  orderedQty    : Integer default 0;
  passedQty     : Integer default 0;
  rejectedQty   : Integer default 0;
  inspectionNote: String(200);
}

// ═══════════════════════════════════════════════════════════════════════
// Invoice (인보이스/세금계산서)
// ═══════════════════════════════════════════════════════════════════════
entity Invoices : cuid, managed {
  invoiceNumber : String(20) @assert.unique;   // IV-YYYYMMDD-XXXX
  supplier      : Association to Suppliers;
  goodsReceipt  : Association to GoodsReceipts;
  purchaseOrder : Association to PurchaseOrders;
  status        : String(20) default 'Draft';  // Draft / Submitted / Approved / Paid / Cancelled
  invoiceDate   : Date;
  dueDate       : Date;
  paidDate      : Date;
  subtotal      : Decimal(15,2) default 0;
  taxRate       : Decimal(5,2) default 10;     // 부가세율 (%)
  taxAmount     : Decimal(15,2) default 0;
  totalAmount   : Decimal(15,2) default 0;
  paymentMethod : String(20);                  // BANK_TRANSFER / CHECK / CREDIT
  paymentRef    : String(50);                  // 결제 참조번호
  note          : String(500);
  items         : Composition of many InvoiceItems on items.invoice = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// InvoiceItem (인보이스 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity InvoiceItems : cuid, managed {
  invoice       : Association to Invoices;
  product       : Association to Products;
  quantity      : Integer not null default 1;
  unitPrice     : Decimal(15,2) default 0;
  amount        : Decimal(15,2) default 0;     // quantity * unitPrice
  taxAmount     : Decimal(15,2) default 0;
  note          : String(200);
}

// ═══════════════════════════════════════════════════════════════════════
// TransferOrder (배송지시: 물류센터 → 점포)
// ═══════════════════════════════════════════════════════════════════════
entity TransferOrders : cuid, managed {
  toNumber      : String(20) @assert.unique;   // TO-YYYYMMDD-XXXX
  dc            : Association to DistributionCenters;
  store         : Association to Stores;
  status        : String(20) default 'Created';  // Created / Picking / Packed / Shipped / Delivered / Cancelled
  priority      : String(10) default 'NORMAL';   // URGENT / HIGH / NORMAL / LOW
  createdDate   : Date;
  pickedDate    : Date;
  shippedDate   : Date;
  deliveredDate : Date;
  totalQty      : Integer default 0;
  carrier       : String(100);                 // 운송업체
  trackingNo    : String(50);                  // 운송장번호
  note          : String(500);
  items         : Composition of many TransferOrderItems on items.transferOrder = $self;
  goodsReceipt  : Association to GoodsReceipts;   // 입고검수 참조 (GR→TO 추적)
  storeReceipt  : Association to StoreReceipts;
}

// ═══════════════════════════════════════════════════════════════════════
// TransferOrderItem (배송지시 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity TransferOrderItems : cuid, managed {
  transferOrder : Association to TransferOrders;
  product       : Association to Products;
  requestedQty  : Integer not null default 1;
  pickedQty     : Integer default 0;
  shippedQty    : Integer default 0;
  note          : String(200);
}

// ═══════════════════════════════════════════════════════════════════════
// StoreReceipt (점포입고: 점포에서 배송 수령 확인)
// ═══════════════════════════════════════════════════════════════════════
entity StoreReceipts : cuid, managed {
  srNumber      : String(20) @assert.unique;   // SR-YYYYMMDD-XXXX
  transferOrder : Association to TransferOrders;
  store         : Association to Stores;
  status        : String(20) default 'Pending';  // Pending / Received / PartialReceived / Rejected
  receivedBy    : String(100);
  receivedAt    : Timestamp;
  totalReceivedQty : Integer default 0;
  totalDamagedQty  : Integer default 0;
  note          : String(500);
  items         : Composition of many StoreReceiptItems on items.storeReceipt = $self;
}

// ═══════════════════════════════════════════════════════════════════════
// StoreReceiptItem (점포입고 상세 품목)
// ═══════════════════════════════════════════════════════════════════════
entity StoreReceiptItems : cuid, managed {
  storeReceipt  : Association to StoreReceipts;
  product       : Association to Products;
  expectedQty   : Integer default 0;
  receivedQty   : Integer default 0;
  damagedQty    : Integer default 0;
  note          : String(200);
}
