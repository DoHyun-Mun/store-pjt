using com.inventory as db from '../db/schema';

/**
 * InventoryService - 점포 상품별 재고 발주 관리 서비스
 * OData V4 기반, Fiori Elements 연동
 */
service InventoryService @(path: '/inventory') {

  /**
   * Categories - 분류 마스터
   */
  @odata.draft.enabled
  entity Categories as projection on db.Categories;

  /**
   * Products - 상품 마스터
   */
  @odata.draft.enabled
  entity Products as projection on db.Products;

  /**
   * Inventories - 재고 마스터
   */
  @odata.draft.enabled
  entity Inventories as projection on db.Inventories;

  /**
   * Stores - 점포 마스터
   */
  @odata.draft.enabled
  entity Stores as projection on db.Stores;

  /**
   * Suppliers - 공급업체 마스터
   */
  @odata.draft.enabled
  entity Suppliers as projection on db.Suppliers;

  /**
   * Materials - 자재 마스터
   */
  @odata.draft.enabled
  entity Materials as projection on db.Materials;

  /**
   * StoreProducts - 점포별 상품 관리
   */
  @odata.draft.enabled
  entity StoreProducts as projection on db.StoreProducts;

  /**
   * ProductMaterials - 상품-자재 BOM
   */
  @odata.draft.enabled
  entity ProductMaterials as projection on db.ProductMaterials;

  /**
   * PurchaseOrders - 발주 마스터
   */
  @odata.draft.enabled
  entity PurchaseOrders as projection on db.PurchaseOrders
  actions {
    /** 승인 요청: Draft → Submitted */
    action submitOrder() returns PurchaseOrders;
    /** 승인: Submitted → Approved */
    action approveOrder() returns PurchaseOrders;
    /** 반려: Submitted → Rejected */
    action rejectOrder(reason : String) returns PurchaseOrders;
    /** 입고 처리: Approved → Received (재고 반영) */
    action receiveOrder(warehouse : String(50)) returns PurchaseOrders;
  };

  /**
   * SupplyOrders - 공급/입출고 주문
   */
  @odata.draft.enabled
  entity SupplyOrders as projection on db.SupplyOrders
  actions {
    /** 주문 확정: Draft → Confirmed */
    action confirmOrder() returns SupplyOrders;
    /** 출하: Confirmed → Shipped */
    action shipOrder() returns SupplyOrders;
    /** 배송 완료: Shipped → Delivered (재고 반영) */
    action deliverOrder() returns SupplyOrders;
    /** 주문 취소: Draft/Confirmed → Cancelled */
    action cancelOrder(reason : String) returns SupplyOrders;
  };

  /**
   * SupplyOrderItems - 공급 주문 상세 품목
   */
  entity SupplyOrderItems as projection on db.SupplyOrderItems;

  /**
   * Customers - 고객 마스터
   */
  @odata.draft.enabled
  entity Customers as projection on db.Customers;

  /**
   * CustomerPurchases - 고객 구매 이력
   */
  @odata.draft.enabled
  entity CustomerPurchases as projection on db.CustomerPurchases;

  /**
   * CustomerPurchaseItems - 구매 상세 품목
   */
  entity CustomerPurchaseItems as projection on db.CustomerPurchaseItems;

  /**
   * DailySales - 일별 매출 집계 (ML 수요 예측 입력)
   */
  @odata.draft.enabled
  entity DailySales as projection on db.DailySales;

  /**
   * InventorySnapshots - 재고 스냅샷 이력 (ML 재고 최적화 입력)
   */
  @odata.draft.enabled
  entity InventorySnapshots as projection on db.InventorySnapshots;

  /**
   * DemandForecasts - 수요 예측 결과 (ML 출력)
   */
  @odata.draft.enabled
  entity DemandForecasts as projection on db.DemandForecasts;

  /**
   * OrderRecommendations - 발주 추천 (ML 예측 기반)
   */
  @odata.draft.enabled
  entity OrderRecommendations as projection on db.OrderRecommendations;

  /**
   * MenuItems - 메뉴 관리 (3계층 트리 구조)
   */
  @odata.draft.enabled
  entity MenuItems as projection on db.MenuItems;

  /**
   * Search 지원 필드 지정
   */
  annotate Products with {
    productCode @Search.defaultSearchElement;
    name        @Search.defaultSearchElement;
  };

  annotate Categories with {
    code @Search.defaultSearchElement;
    name @Search.defaultSearchElement;
  };

  annotate PurchaseOrders with {
    poNumber @Search.defaultSearchElement;
  };

  annotate Stores with {
    storeCode @Search.defaultSearchElement;
    name      @Search.defaultSearchElement;
    city      @Search.defaultSearchElement;
    manager   @Search.defaultSearchElement;
  };

  annotate Suppliers with {
    supplierCode  @Search.defaultSearchElement;
    name          @Search.defaultSearchElement;
    contactPerson @Search.defaultSearchElement;
    city          @Search.defaultSearchElement;
  };

  annotate Materials with {
    materialCode @Search.defaultSearchElement;
    name         @Search.defaultSearchElement;
  };

  annotate SupplyOrders with {
    orderNumber @Search.defaultSearchElement;
  };

  annotate Customers with {
    customerCode   @Search.defaultSearchElement;
    name           @Search.defaultSearchElement;
    city           @Search.defaultSearchElement;
  };

  annotate CustomerPurchases with {
    purchaseNumber @Search.defaultSearchElement;
  };

  annotate MenuItems with {
    code  @Search.defaultSearchElement;
    title @Search.defaultSearchElement;
  };
}
