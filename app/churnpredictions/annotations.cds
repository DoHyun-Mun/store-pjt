using InventoryService as service from '../../srv/service';

// ═══════════════════════════════════════════════════════════════════
// ChurnPredictions - 고객 이탈 예측
// ═══════════════════════════════════════════════════════════════════

annotate service.ChurnPredictions with @(
  UI: {
    HeaderInfo: {
      TypeName: '이탈 예측',
      TypeNamePlural: '고객 이탈 예측 목록',
      Title: { Value: customer_ID },
      Description: { Value: churnRisk }
    },

    SelectionFields: [
      customer_ID,
      churnRisk,
      modelName
    ],

    LineItem: [
      { Value: customer_ID,          Label: '고객',             ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: churnScore,           Label: '이탈 확률',        ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: churnRisk,            Label: '이탈 위험도',      ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: recencyDays,          Label: '최근 방문(일)',    ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: frequency,            Label: '구매 빈도',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: monetary,             Label: '총 구매액',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: avgPurchaseAmount,    Label: '평균 구매액',      ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: modelName,            Label: '모델명',           ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: accuracy,             Label: '모델 정확도(%)',   ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: predictedAt,          Label: '예측일시',         ![@HTML5.CssDefaults]: { width: 'auto' } }
    ],

    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#ChurnScore' },
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#ChurnRisk' }
    ],

    DataPoint#ChurnScore: {
      Value: churnScore,
      Title: '이탈 확률'
    },

    DataPoint#ChurnRisk: {
      Value: churnRisk,
      Title: '위험도'
    },

    Facets: [
      {
        $Type: 'UI.CollectionFacet',
        ID: 'ChurnDetail',
        Label: '이탈 예측 상세',
        Facets: [
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#RFMInfo', Label: 'RFM 지표' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#ModelInfo', Label: '모델 정보' }
        ]
      }
    ],

    FieldGroup#RFMInfo: {
      Data: [
        { Value: customer_ID,       Label: '고객' },
        { Value: recencyDays,       Label: '최근 방문 (일)' },
        { Value: frequency,         Label: '구매 빈도' },
        { Value: monetary,          Label: '총 구매액' },
        { Value: avgPurchaseAmount, Label: '평균 구매액' },
        { Value: daysSinceRegistered, Label: '가입 후 경과일' }
      ]
    },

    FieldGroup#ModelInfo: {
      Data: [
        { Value: churnScore,    Label: '이탈 확률' },
        { Value: churnRisk,     Label: '이탈 위험도' },
        { Value: modelName,     Label: '모델명' },
        { Value: modelVersion,  Label: '모델 버전' },
        { Value: accuracy,      Label: '모델 정확도 (%)' },
        { Value: predictedAt,   Label: '예측일시' }
      ]
    }
  }
);