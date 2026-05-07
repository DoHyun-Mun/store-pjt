using InventoryService as service from '../../srv/service';

// ═══════════════════════════════════════════════════════════════════
// DemandForecasts - 수요 예측 결과 뷰어
// ═══════════════════════════════════════════════════════════════════

annotate service.DemandForecasts with @(
  UI: {
    HeaderInfo: {
      TypeName: '수요 예측',
      TypeNamePlural: '수요 예측 목록',
      Title: { Value: forecastDate },
      Description: { Value: modelName }
    },

    SelectionFields: [
      store_ID,
      product_ID,
      forecastDate,
      modelName
    ],

    LineItem: [
      { Value: store.name,       Label: '점포',            ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: product.name,     Label: '상품',            ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: forecastDate,     Label: '예측 일자',       ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: forecastQty,      Label: '예측 수량',       ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: confidenceLow,    Label: '하한(95%CI)',     ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: confidenceHigh,   Label: '상한(95%CI)',     ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: modelName,        Label: '모델명',          ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: accuracy,         Label: '정확도(MAPE%)',   ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: generatedAt,      Label: '생성일시',        ![@HTML5.CssDefaults]: { width: 'auto' } }
    ],

    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#ForecastQty' },
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#Accuracy' }
    ],

    DataPoint#ForecastQty: {
      Value: forecastQty,
      Title: '예측 수량'
    },

    DataPoint#Accuracy: {
      Value: accuracy,
      Title: '모델 정확도 (MAPE%)'
    },

    Facets: [
      {
        $Type: 'UI.CollectionFacet',
        ID: 'ForecastDetail',
        Label: '예측 상세',
        Facets: [
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#ForecastBasis', Label: '📊 예측 근거' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#ConfidenceInterval', Label: '📈 신뢰 구간' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#ModelInfo', Label: '🤖 모델 정보' }
        ]
      }
    ],

    FieldGroup#ForecastBasis: {
      Data: [
        { Value: store.name,     Label: '점포' },
        { Value: product.name,   Label: '상품' },
        { Value: forecastDate,   Label: '예측 기준일' },
        { Value: forecastQty,    Label: '예측 수량 (일 평균)' }
      ]
    },

    FieldGroup#ConfidenceInterval: {
      Data: [
        { Value: forecastQty,    Label: '① 예측값 (중앙)' },
        { Value: confidenceLow,  Label: '② 하한 (95% 신뢰구간)' },
        { Value: confidenceHigh, Label: '③ 상한 (95% 신뢰구간)' }
      ]
    },

    FieldGroup#ModelInfo: {
      Data: [
        { Value: modelName,      Label: '예측 모델' },
        { Value: modelVersion,   Label: '모델 버전' },
        { Value: accuracy,       Label: '정확도 (MAPE%)' },
        { Value: generatedAt,    Label: '예측 생성일시' }
      ]
    }
  }
);