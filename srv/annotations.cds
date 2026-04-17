using InventoryService as service from './service';

// ═══════════════════════════════════════════════════════════════════════
// Categories - 분류 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Categories with @(
  UI.HeaderInfo : {
    TypeName       : '분류',
    TypeNamePlural : '분류 목록',
    Title          : { $Type: 'UI.DataField', Value: code },
    Description    : { $Type: 'UI.DataField', Value: name }
  },

  UI.SelectionFields : [ code, name, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: code,        Label: '분류 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: name,        Label: '분류명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: description, Label: '설명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,    Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ProductsList',
      Label  : '소속 상품',
      Target : 'products/@UI.LineItem'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: code,        Label: '분류 코드' },
      { $Type: 'UI.DataField', Value: name,        Label: '분류명' },
      { $Type: 'UI.DataField', Value: description, Label: '설명' },
      { $Type: 'UI.DataField', Value: isActive,    Label: '활성 여부' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Categories with {
  code        @title: '분류 코드';
  name        @title: '분류명';
  description @title: '설명';
  isActive    @title: '활성 여부';
};

// ═══════════════════════════════════════════════════════════════════════
// Products - 상품 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Products with @(
  UI.HeaderInfo : {
    TypeName       : '상품',
    TypeNamePlural : '상품 목록',
    Title          : { $Type: 'UI.DataField', Value: productCode },
    Description    : { $Type: 'UI.DataField', Value: name }
  },

  UI.SelectionFields : [ productCode, name, category_ID, unit, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: productCode,   Label: '상품 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: name,           Label: '상품명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: category.name,  Label: '분류', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unit,           Label: '단위', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: costPrice,      Label: '원가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: marginRate,     Label: '마진율(%)', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: sellingPrice,   Label: '판매가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: safetyStock,    Label: '안전 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,       Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'PriceInfo',
      Label  : '가격 정보',
      Target : '@UI.FieldGroup#PriceInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BOMList',
      Label  : '소요 자재 (BOM)',
      Target : 'productMaterials/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'StoreProductsList',
      Label  : '점포별 상품 현황',
      Target : 'storeProducts/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'DescriptionInfo',
      Label  : '상세 설명',
      Target : '@UI.FieldGroup#DescriptionInfo'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: productCode, Label: '상품 코드' },
      { $Type: 'UI.DataField', Value: name,         Label: '상품명' },
      { $Type: 'UI.DataField', Value: category_ID,  Label: '분류' },
      { $Type: 'UI.DataField', Value: unit,         Label: '단위' },
      { $Type: 'UI.DataField', Value: safetyStock,  Label: '안전 재고' },
      { $Type: 'UI.DataField', Value: leadTime,     Label: '리드타임(일)' },
      { $Type: 'UI.DataField', Value: isActive,     Label: '활성 여부' }
    ]
  },

  UI.FieldGroup #PriceInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: costPrice,     Label: '원가' },
      { $Type: 'UI.DataField', Value: marginRate,     Label: '마진율(%)' },
      { $Type: 'UI.DataField', Value: sellingPrice,   Label: '판매가 (자동 계산)' }
    ]
  },

  UI.FieldGroup #DescriptionInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: description, Label: '설명' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Products with {
  productCode  @title: '상품 코드';
  name         @title: '상품명';
  unit         @title: '단위';
  costPrice    @title: '원가';
  marginRate   @title: '마진율(%)';
  sellingPrice @title: '판매가' @readonly;
  safetyStock  @title: '안전 재고';
  leadTime     @title: '리드타임(일)';
  isActive     @title: '활성 여부';
  description  @title: '설명';
  category     @(
    title: '분류',
    Common.Text: category.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Categories',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : category_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'code'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Inventories - 재고 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Inventories with @(
  UI.HeaderInfo : {
    TypeName       : '재고',
    TypeNamePlural : '재고 목록',
    Title          : { $Type: 'UI.DataField', Value: product.productCode },
    Description    : { $Type: 'UI.DataField', Value: store.name }
  },

  UI.PresentationVariant : {
    SortOrder      : [
      { Property: store_ID,   Descending: false },
      { Property: product_ID, Descending: false }
    ],
    Visualizations : ['@UI.LineItem']
  },

  UI.SelectionFields : [ product_ID, store_ID, warehouse ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: product.productCode, Label: '상품 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: product.name,        Label: '상품명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: store.name,          Label: '점포', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: warehouse,           Label: '창고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: quantity,            Label: '수량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: reservedQty,         Label: '예약 수량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: availableQty,        Label: '가용 수량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: minStock,            Label: '최소 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: maxStock,            Label: '최대 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: lastUpdated,         Label: '최종 업데이트', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'InventoryInfo',
      Label  : '재고 정보',
      Target : '@UI.FieldGroup#InventoryInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ProductInfo',
      Label  : '상품 정보',
      Target : '@UI.FieldGroup#ProductInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'StoreInfo',
      Label  : '점포 정보',
      Target : '@UI.FieldGroup#StoreInfo'
    }
  ],

  UI.FieldGroup #InventoryInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: warehouse,    Label: '창고' },
      { $Type: 'UI.DataField', Value: quantity,      Label: '수량' },
      { $Type: 'UI.DataField', Value: reservedQty,   Label: '예약 수량' },
      { $Type: 'UI.DataField', Value: availableQty,  Label: '가용 수량' },
      { $Type: 'UI.DataField', Value: minStock,      Label: '최소 재고' },
      { $Type: 'UI.DataField', Value: maxStock,      Label: '최대 재고' },
      { $Type: 'UI.DataField', Value: lastUpdated,   Label: '최종 업데이트' }
    ]
  },

  UI.FieldGroup #ProductInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: product_ID,            Label: '상품' },
      { $Type: 'UI.DataField', Value: product.productCode,   Label: '상품 코드' },
      { $Type: 'UI.DataField', Value: product.name,          Label: '상품명' },
      { $Type: 'UI.DataField', Value: product.safetyStock,   Label: '안전 재고' }
    ]
  },

  UI.FieldGroup #StoreInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: store_ID,        Label: '점포' },
      { $Type: 'UI.DataField', Value: store.storeCode,  Label: '점포 코드' },
      { $Type: 'UI.DataField', Value: store.name,       Label: '점포명' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Inventories with {
  warehouse    @title: '창고';
  quantity     @title: '수량';
  reservedQty  @title: '예약 수량';
  availableQty @title: '가용 수량';
  minStock     @title: '최소 재고';
  maxStock     @title: '최대 재고';
  lastUpdated  @title: '최종 업데이트';
  product      @(
    title: '상품',
    Common.Text: product.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Products',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : product_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'productCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
  store        @(
    title: '점포',
    Common.Text: store.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Stores',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : store_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'storeCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// Stores - 점포 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Stores with @(
  UI.HeaderInfo : {
    TypeName       : '점포',
    TypeNamePlural : '점포 목록',
    Title          : { $Type: 'UI.DataField', Value: storeCode },
    Description    : { $Type: 'UI.DataField', Value: name }
  },

  UI.SelectionFields : [ storeCode, name, storeType, city, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: storeCode,   Label: '점포 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: name,         Label: '점포명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: storeType,    Label: '유형', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: address,      Label: '주소', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: city,         Label: '도시', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: phone,        Label: '연락처', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: manager,      Label: '담당자', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,     Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ContactInfo',
      Label  : '연락처 정보',
      Target : '@UI.FieldGroup#ContactInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'StoreProductsList',
      Label  : '취급 상품',
      Target : 'storeProducts/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'InventoriesList',
      Label  : '재고 현황',
      Target : 'inventories/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'SupplyOrdersList',
      Label  : '공급 주문',
      Target : 'supplyOrders/@UI.LineItem'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: storeCode,   Label: '점포 코드' },
      { $Type: 'UI.DataField', Value: name,         Label: '점포명' },
      { $Type: 'UI.DataField', Value: storeType,    Label: '유형' },
      { $Type: 'UI.DataField', Value: isActive,     Label: '활성 여부' },
      { $Type: 'UI.DataField', Value: description,  Label: '설명' }
    ]
  },

  UI.FieldGroup #ContactInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: address,    Label: '주소' },
      { $Type: 'UI.DataField', Value: city,       Label: '도시' },
      { $Type: 'UI.DataField', Value: postalCode, Label: '우편번호' },
      { $Type: 'UI.DataField', Value: country,    Label: '국가' },
      { $Type: 'UI.DataField', Value: phone,      Label: '연락처' },
      { $Type: 'UI.DataField', Value: email,      Label: '이메일' },
      { $Type: 'UI.DataField', Value: manager,    Label: '담당자' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Stores with {
  storeCode   @title: '점포 코드';
  name        @title: '점포명';
  address     @title: '주소';
  city        @title: '도시';
  postalCode  @title: '우편번호';
  country     @title: '국가';
  phone       @title: '연락처';
  email       @title: '이메일';
  manager     @title: '담당자';
  storeType   @title: '유형';
  isActive    @title: '활성 여부';
  description @title: '설명';
};

// ═══════════════════════════════════════════════════════════════════════
// Suppliers - 공급업체 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Suppliers with @(
  UI.HeaderInfo : {
    TypeName       : '공급업체',
    TypeNamePlural : '공급업체 목록',
    Title          : { $Type: 'UI.DataField', Value: supplierCode },
    Description    : { $Type: 'UI.DataField', Value: name }
  },

  UI.SelectionFields : [ supplierCode, name, city, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: supplierCode,  Label: '공급업체 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: name,           Label: '공급업체명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: contactPerson,  Label: '담당자', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: phone,          Label: '연락처', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: city,           Label: '도시', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: paymentTerms,   Label: '결제 조건', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: leadTime,       Label: '리드타임(일)', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: rating,         Label: '평가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,       Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ContactInfo',
      Label  : '연락처 정보',
      Target : '@UI.FieldGroup#ContactInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'TradeInfo',
      Label  : '거래 정보',
      Target : '@UI.FieldGroup#TradeInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'MaterialsList',
      Label  : '공급 자재',
      Target : 'materials/@UI.LineItem'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'SupplyOrdersList',
      Label  : '공급 주문 내역',
      Target : 'supplyOrders/@UI.LineItem'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: supplierCode,  Label: '공급업체 코드' },
      { $Type: 'UI.DataField', Value: name,           Label: '공급업체명' },
      { $Type: 'UI.DataField', Value: isActive,       Label: '활성 여부' },
      { $Type: 'UI.DataField', Value: description,    Label: '설명' }
    ]
  },

  UI.FieldGroup #ContactInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: contactPerson, Label: '담당자' },
      { $Type: 'UI.DataField', Value: phone,         Label: '연락처' },
      { $Type: 'UI.DataField', Value: email,         Label: '이메일' },
      { $Type: 'UI.DataField', Value: address,       Label: '주소' },
      { $Type: 'UI.DataField', Value: city,          Label: '도시' },
      { $Type: 'UI.DataField', Value: country,       Label: '국가' }
    ]
  },

  UI.FieldGroup #TradeInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: paymentTerms, Label: '결제 조건' },
      { $Type: 'UI.DataField', Value: leadTime,     Label: '리드타임(일)' },
      { $Type: 'UI.DataField', Value: rating,       Label: '평가 등급' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Suppliers with {
  supplierCode  @title: '공급업체 코드';
  name          @title: '공급업체명';
  contactPerson @title: '담당자';
  phone         @title: '연락처';
  email         @title: '이메일';
  address       @title: '주소';
  city          @title: '도시';
  country       @title: '국가';
  paymentTerms  @title: '결제 조건';
  leadTime      @title: '리드타임(일)';
  rating        @title: '평가 등급';
  isActive      @title: '활성 여부';
  description   @title: '설명';
};

// ═══════════════════════════════════════════════════════════════════════
// Materials - 자재 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.Materials with @(
  UI.HeaderInfo : {
    TypeName       : '자재',
    TypeNamePlural : '자재 목록',
    Title          : { $Type: 'UI.DataField', Value: materialCode },
    Description    : { $Type: 'UI.DataField', Value: name }
  },

  UI.SelectionFields : [ materialCode, name, materialType, supplier_ID, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: materialCode,   Label: '자재 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: name,            Label: '자재명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: materialType,    Label: '자재 유형', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unit,            Label: '단위', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unitPrice,       Label: '단가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: supplier.name,   Label: '공급업체', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: currentStock,    Label: '현재 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: safetyStock,     Label: '안전 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,        Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'StockInfo',
      Label  : '재고 정보',
      Target : '@UI.FieldGroup#StockInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ProductMaterialsList',
      Label  : '사용 상품 (BOM)',
      Target : 'productMaterials/@UI.LineItem'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: materialCode,  Label: '자재 코드' },
      { $Type: 'UI.DataField', Value: name,           Label: '자재명' },
      { $Type: 'UI.DataField', Value: materialType,   Label: '자재 유형' },
      { $Type: 'UI.DataField', Value: unit,           Label: '단위' },
      { $Type: 'UI.DataField', Value: unitPrice,      Label: '단가' },
      { $Type: 'UI.DataField', Value: supplier_ID,    Label: '공급업체' },
      { $Type: 'UI.DataField', Value: isActive,       Label: '활성 여부' },
      { $Type: 'UI.DataField', Value: description,    Label: '설명' }
    ]
  },

  UI.FieldGroup #StockInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: currentStock,  Label: '현재 재고' },
      { $Type: 'UI.DataField', Value: safetyStock,   Label: '안전 재고' },
      { $Type: 'UI.DataField', Value: minOrderQty,   Label: '최소 발주량' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.Materials with {
  materialCode @title: '자재 코드';
  name         @title: '자재명';
  materialType @title: '자재 유형';
  unit         @title: '단위';
  unitPrice    @title: '단가';
  minOrderQty  @title: '최소 발주량';
  safetyStock  @title: '안전 재고';
  currentStock @title: '현재 재고';
  isActive     @title: '활성 여부';
  description  @title: '설명';
  supplier     @(
    title: '공급업체',
    Common.Text: supplier.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Suppliers',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : supplier_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'supplierCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// StoreProducts - 점포별 상품 관리 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.StoreProducts with @(
  UI.HeaderInfo : {
    TypeName       : '점포 상품',
    TypeNamePlural : '점포별 상품 목록',
    Title          : { $Type: 'UI.DataField', Value: product.name },
    Description    : { $Type: 'UI.DataField', Value: store.name }
  },

  UI.SelectionFields : [ store_ID, product_ID, isActive ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: store.name,      Label: '점포', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: product.name,     Label: '상품', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: sellingPrice,     Label: '판매가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: costPrice,        Label: '원가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: minStock,         Label: '최소 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: maxStock,         Label: '최대 재고', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: displayOrder,     Label: '진열 순서', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: isActive,         Label: '활성 여부', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: store_ID,      Label: '점포' },
      { $Type: 'UI.DataField', Value: product_ID,    Label: '상품' },
      { $Type: 'UI.DataField', Value: sellingPrice,   Label: '판매가' },
      { $Type: 'UI.DataField', Value: costPrice,      Label: '원가' },
      { $Type: 'UI.DataField', Value: minStock,       Label: '최소 재고' },
      { $Type: 'UI.DataField', Value: maxStock,       Label: '최대 재고' },
      { $Type: 'UI.DataField', Value: displayOrder,   Label: '진열 순서' },
      { $Type: 'UI.DataField', Value: isActive,       Label: '활성 여부' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.StoreProducts with {
  sellingPrice @title: '판매가';
  costPrice    @title: '원가';
  minStock     @title: '최소 재고';
  maxStock     @title: '최대 재고';
  displayOrder @title: '진열 순서';
  isActive     @title: '활성 여부';
  store        @(
    title: '점포',
    Common.Text: store.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Stores',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : store_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'storeCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
  product      @(
    title: '상품',
    Common.Text: product.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Products',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : product_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'productCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// ProductMaterials - 상품-자재 BOM (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.ProductMaterials with @(
  UI.HeaderInfo : {
    TypeName       : '소요 자재',
    TypeNamePlural : '소요 자재 목록',
    Title          : { $Type: 'UI.DataField', Value: material.name },
    Description    : { $Type: 'UI.DataField', Value: product.name }
  },

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: product.name,    Label: '상품', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: material.name,   Label: '자재', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: quantity,         Label: '소요량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unit,            Label: '단위', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'BasicInfo',
      Label  : '기본 정보',
      Target : '@UI.FieldGroup#BasicInfo'
    }
  ],

  UI.FieldGroup #BasicInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: product_ID,  Label: '상품' },
      { $Type: 'UI.DataField', Value: material_ID,  Label: '자재' },
      { $Type: 'UI.DataField', Value: quantity,     Label: '소요량' },
      { $Type: 'UI.DataField', Value: unit,         Label: '단위' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.ProductMaterials with {
  quantity @title: '소요량';
  unit     @title: '단위';
  product  @(
    title: '상품',
    Common.Text: product.name,
    Common.TextArrangement: #TextFirst
  );
  material @(
    title: '자재',
    Common.Text: material.name,
    Common.TextArrangement: #TextFirst
  );
};

// ═══════════════════════════════════════════════════════════════════════
// PurchaseOrders - 발주 마스터 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.PurchaseOrders with @(
  UI.HeaderInfo : {
    TypeName       : '발주',
    TypeNamePlural : '발주 목록',
    Title          : { $Type: 'UI.DataField', Value: poNumber },
    Description    : { $Type: 'UI.DataField', Value: product.name }
  },

  UI.SelectionFields : [ poNumber, product_ID, store_ID, supplier_ID, status, requestedBy ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: poNumber,        Label: '발주 번호', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: product.name,    Label: '상품명', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: store.name,      Label: '점포', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: supplier.name,   Label: '공급업체', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: quantity,         Label: '수량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unitPrice,        Label: '단가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: totalAmount,      Label: '합계 금액', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: status,           Label: '상태', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: requestedBy,      Label: '요청자', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: expectedDate,     Label: '입고 예정일', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'OrderInfo',
      Label  : '발주 정보',
      Target : '@UI.FieldGroup#OrderInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'AmountInfo',
      Label  : '금액 정보',
      Target : '@UI.FieldGroup#AmountInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ApprovalInfo',
      Label  : '승인 정보',
      Target : '@UI.FieldGroup#ApprovalInfo'
    }
  ],

  UI.FieldGroup #OrderInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: poNumber,     Label: '발주 번호' },
      { $Type: 'UI.DataField', Value: product_ID,   Label: '상품' },
      { $Type: 'UI.DataField', Value: store_ID,     Label: '점포' },
      { $Type: 'UI.DataField', Value: supplier_ID,  Label: '공급업체' },
      { $Type: 'UI.DataField', Value: quantity,      Label: '수량' },
      { $Type: 'UI.DataField', Value: expectedDate,  Label: '입고 예정일' },
      { $Type: 'UI.DataField', Value: receivedDate,  Label: '실제 입고일' },
      { $Type: 'UI.DataField', Value: note,          Label: '비고' }
    ]
  },

  UI.FieldGroup #AmountInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: unitPrice,    Label: '단가' },
      { $Type: 'UI.DataField', Value: totalAmount,   Label: '합계 금액' }
    ]
  },

  UI.FieldGroup #ApprovalInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: status,       Label: '상태' },
      { $Type: 'UI.DataField', Value: requestedBy,  Label: '요청자' },
      { $Type: 'UI.DataField', Value: approvedBy,   Label: '승인자' },
      { $Type: 'UI.DataField', Value: approvedAt,   Label: '승인 일시' }
    ]
  },

  // Custom Actions for PO workflow
  UI.Identification : [
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.submitOrder',
      Label  : '승인 요청'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.approveOrder',
      Label  : '승인'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.rejectOrder',
      Label  : '반려'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.receiveOrder',
      Label  : '입고 처리'
    }
  ],

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.PurchaseOrders with {
  poNumber     @title: '발주 번호'  @readonly;
  quantity     @title: '수량';
  unitPrice    @title: '단가';
  totalAmount  @title: '합계 금액'  @readonly;
  status       @title: '상태'      @readonly;
  requestedBy  @title: '요청자';
  approvedBy   @title: '승인자'    @readonly;
  approvedAt   @title: '승인 일시'  @readonly;
  expectedDate @title: '입고 예정일';
  receivedDate @title: '실제 입고일' @readonly;
  note         @title: '비고';
  product      @(
    title: '상품',
    Common.Text: product.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Products',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : product_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'productCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
  store        @(
    title: '점포',
    Common.Text: store.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Stores',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : store_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'storeCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
  supplier     @(
    title: '공급업체',
    Common.Text: supplier.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Suppliers',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : supplier_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'supplierCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SupplyOrders - 공급/입출고 주문 (List Report + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.SupplyOrders with @(
  UI.HeaderInfo : {
    TypeName       : '공급 주문',
    TypeNamePlural : '공급 주문 목록',
    Title          : { $Type: 'UI.DataField', Value: orderNumber },
    Description    : { $Type: 'UI.DataField', Value: store.name }
  },

  UI.SelectionFields : [ orderNumber, store_ID, supplier_ID, orderType, status ],

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: orderNumber,     Label: '주문 번호', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: store.name,      Label: '점포', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: supplier.name,   Label: '공급업체', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: orderType,       Label: '주문 유형', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: status,          Label: '상태', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: orderDate,       Label: '주문일', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: expectedDate,    Label: '예정일', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: totalAmount,     Label: '합계 금액', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: requestedBy,     Label: '요청자', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'OrderInfo',
      Label  : '주문 정보',
      Target : '@UI.FieldGroup#OrderInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'DateInfo',
      Label  : '일정 정보',
      Target : '@UI.FieldGroup#DateInfo'
    },
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ItemsList',
      Label  : '주문 품목',
      Target : 'items/@UI.LineItem'
    }
  ],

  UI.FieldGroup #OrderInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: orderNumber,  Label: '주문 번호' },
      { $Type: 'UI.DataField', Value: store_ID,     Label: '점포' },
      { $Type: 'UI.DataField', Value: supplier_ID,  Label: '공급업체' },
      { $Type: 'UI.DataField', Value: orderType,    Label: '주문 유형' },
      { $Type: 'UI.DataField', Value: status,       Label: '상태' },
      { $Type: 'UI.DataField', Value: totalAmount,  Label: '합계 금액' },
      { $Type: 'UI.DataField', Value: requestedBy,  Label: '요청자' },
      { $Type: 'UI.DataField', Value: note,         Label: '비고' }
    ]
  },

  UI.FieldGroup #DateInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: orderDate,     Label: '주문일' },
      { $Type: 'UI.DataField', Value: expectedDate,   Label: '예정일' },
      { $Type: 'UI.DataField', Value: deliveredDate,   Label: '배송 완료일' }
    ]
  },

  // Custom Actions for SupplyOrder workflow
  UI.Identification : [
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.confirmOrder',
      Label  : '주문 확정'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.shipOrder',
      Label  : '출하'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.deliverOrder',
      Label  : '배송 완료'
    },
    {
      $Type  : 'UI.DataFieldForAction',
      Action : 'InventoryService.cancelOrder',
      Label  : '주문 취소'
    }
  ],

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.SupplyOrders with {
  orderNumber   @title: '주문 번호'   @readonly;
  orderType     @title: '주문 유형';
  status        @title: '상태'       @readonly;
  orderDate     @title: '주문일';
  expectedDate  @title: '예정일';
  deliveredDate @title: '배송 완료일'  @readonly;
  totalAmount   @title: '합계 금액'   @readonly;
  requestedBy   @title: '요청자';
  note          @title: '비고';
  store         @(
    title: '점포',
    Common.Text: store.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Stores',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : store_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'storeCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
  supplier      @(
    title: '공급업체',
    Common.Text: supplier.name,
    Common.TextArrangement: #TextFirst,
    Common.ValueList : {
      $Type          : 'Common.ValueListType',
      CollectionPath : 'Suppliers',
      Parameters     : [
        {
          $Type             : 'Common.ValueListParameterInOut',
          LocalDataProperty : supplier_ID,
          ValueListProperty : 'ID'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'supplierCode'
        },
        {
          $Type             : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty : 'name'
        }
      ]
    }
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SupplyOrderItems - 공급 주문 품목 (List + Object Page)
// ═══════════════════════════════════════════════════════════════════════

annotate service.SupplyOrderItems with @(
  UI.HeaderInfo : {
    TypeName       : '주문 품목',
    TypeNamePlural : '주문 품목 목록',
    Title          : { $Type: 'UI.DataField', Value: product.name }
  },

  UI.LineItem : [
    { $Type: 'UI.DataField', Value: product.name,   Label: '상품', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: material.name,  Label: '자재', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: quantity,        Label: '수량', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: unitPrice,       Label: '단가', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: totalPrice,      Label: '합계', ![@HTML5.CssDefaults]: { width: 'auto' } },
    { $Type: 'UI.DataField', Value: note,            Label: '비고', ![@HTML5.CssDefaults]: { width: 'auto' } }
  ],

  UI.Facets : [
    {
      $Type  : 'UI.ReferenceFacet',
      ID     : 'ItemInfo',
      Label  : '품목 정보',
      Target : '@UI.FieldGroup#ItemInfo'
    }
  ],

  UI.FieldGroup #ItemInfo : {
    $Type : 'UI.FieldGroupType',
    Data  : [
      { $Type: 'UI.DataField', Value: product_ID,   Label: '상품' },
      { $Type: 'UI.DataField', Value: material_ID,  Label: '자재' },
      { $Type: 'UI.DataField', Value: quantity,      Label: '수량' },
      { $Type: 'UI.DataField', Value: unitPrice,     Label: '단가' },
      { $Type: 'UI.DataField', Value: totalPrice,    Label: '합계' },
      { $Type: 'UI.DataField', Value: note,          Label: '비고' }
    ]
  },

  Capabilities : {
    InsertRestrictions : { Insertable: true },
    UpdateRestrictions : { Updatable:  true },
    DeleteRestrictions : { Deletable:  true }
  }
);

annotate service.SupplyOrderItems with {
  quantity   @title: '수량';
  unitPrice  @title: '단가';
  totalPrice @title: '합계'    @readonly;
  note       @title: '비고';
  product    @(
    title: '상품',
    Common.Text: product.name,
    Common.TextArrangement: #TextFirst
  );
  material   @(
    title: '자재',
    Common.Text: material.name,
    Common.TextArrangement: #TextFirst
  );
};