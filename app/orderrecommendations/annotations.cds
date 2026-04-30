using InventoryService as service from '../../srv/service';

// ═══════════════════════════════════════════════════════════════════
// OrderRecommendations - 발주 추천 뷰어 (ML 예측 기반)
// ═══════════════════════════════════════════════════════════════════

annotate service.OrderRecommendations with @(
  UI: {
    HeaderInfo: {
      TypeName: '발주 추천',
      TypeNamePlural: '발주 추천 목록',
      Title: { Value: recommendDate },
      Description: { Value: priority }
    },

    SelectionFields: [
      store_ID,
      product_ID,
      priority,
      status,
      recommendDate
    ],

    LineItem: [
      { Value: store_ID,         Label: '점포',            ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: product_ID,       Label: '상품',            ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: supplier_ID,      Label: '공급업체',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: recommendDate,    Label: '추천일',          ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: currentStock,     Label: '현재고',          ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: forecastDemand,   Label: '예측수요(7일)',   ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: safetyStock,      Label: '안전재고',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: recommendedQty,   Label: '추천발주량',      ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' },
        Criticality: priority },
      { Value: estimatedCost,    Label: '예상비용',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: priority,         Label: '우선순위',        ![@HTML5.CssDefaults]: { width: 'auto' },
        Criticality: priority },
      { Value: status,           Label: '상태',            ![@HTML5.CssDefaults]: { width: 'auto' } }
    ],

    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#RecommendedQty' },
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#Priority' }
    ],

    DataPoint#RecommendedQty: {
      Value: recommendedQty,
      Title: '추천 발주량'
    },

    DataPoint#Priority: {
      Value: priority,
      Title: '우선순위',
      Criticality: priority
    },

    Facets: [
      {
        $Type: 'UI.CollectionFacet',
        ID: 'RecommendationDetail',
        Label: '추천 상세',
        Facets: [
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#StockInfo', Label: '재고 현황' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#OrderInfo', Label: '발주 정보' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#StatusInfo', Label: '처리 상태' }
        ]
      }
    ],

    FieldGroup#StockInfo: {
      Data: [
        { Value: store_ID,       Label: '점포' },
        { Value: product_ID,     Label: '상품' },
        { Value: currentStock,   Label: '현재고' },
        { Value: safetyStock,    Label: '안전재고' },
        { Value: forecastDemand, Label: '예측 수요 (7일)' },
        { Value: leadTime,       Label: '리드타임 (일)' }
      ]
    },

    FieldGroup#OrderInfo: {
      Data: [
        { Value: supplier_ID,     Label: '공급업체' },
        { Value: recommendedQty,  Label: '추천 발주량' },
        { Value: estimatedCost,   Label: '예상 비용' },
        { Value: recommendDate,   Label: '추천일' }
      ]
    },

    FieldGroup#StatusInfo: {
      Data: [
        { Value: priority, Label: '우선순위' },
        { Value: status,   Label: '처리 상태' },
        { Value: note,     Label: '비고' }
      ]
    }
  }
);

// 우선순위 Criticality 매핑
annotate service.OrderRecommendations with {
  priority @Common.Text: priority @Common.TextArrangement: #TextOnly;
  status   @Common.Text: status   @Common.TextArrangement: #TextOnly;
};