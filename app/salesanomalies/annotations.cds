using InventoryService as service from '../../srv/service';

// ═══════════════════════════════════════════════════════════════════
// SalesAnomalies - 매출 이상 탐지
// ═══════════════════════════════════════════════════════════════════

annotate service.SalesAnomalies with @(
  UI: {
    HeaderInfo: {
      TypeName: '매출 이상',
      TypeNamePlural: '매출 이상 탐지 목록',
      Title: { Value: salesDate },
      Description: { Value: anomalyType }
    },

    SelectionFields: [
      store_ID,
      product_ID,
      anomalyType,
      severity,
      salesDate,
      metricName
    ],

    LineItem: [
      { Value: store_ID,       Label: '점포',         ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: product_ID,     Label: '상품',         ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: salesDate,      Label: '매출일',       ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: metricName,     Label: '지표',         ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: actualValue,    Label: '실제값',       ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: expectedValue,  Label: '예상값',       ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: deviation,      Label: '편차',         ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: zScore,         Label: 'Z-Score',      ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: anomalyType,    Label: '이상 유형',    ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: severity,       Label: '심각도',       ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: modelName,      Label: '탐지 모델',    ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: detectedAt,     Label: '탐지일시',     ![@HTML5.CssDefaults]: { width: 'auto' } }
    ],

    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#Deviation' },
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#Severity' }
    ],

    DataPoint#Deviation: {
      Value: deviation,
      Title: '편차 (실제-예상)'
    },

    DataPoint#Severity: {
      Value: severity,
      Title: '심각도'
    },

    Facets: [
      {
        $Type: 'UI.CollectionFacet',
        ID: 'AnomalyDetail',
        Label: '이상 탐지 상세',
        Facets: [
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#SalesInfo', Label: '매출 정보' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#AnomalyInfo', Label: '이상 분석' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#DetectionInfo', Label: '탐지 정보' }
        ]
      }
    ],

    FieldGroup#SalesInfo: {
      Data: [
        { Value: store_ID,      Label: '점포' },
        { Value: product_ID,    Label: '상품' },
        { Value: salesDate,     Label: '매출일' },
        { Value: metricName,    Label: '지표' },
        { Value: actualValue,   Label: '실제값' },
        { Value: expectedValue, Label: '예상값' }
      ]
    },

    FieldGroup#AnomalyInfo: {
      Data: [
        { Value: deviation,    Label: '편차' },
        { Value: zScore,       Label: 'Z-Score' },
        { Value: movingAvg,    Label: '이동 평균' },
        { Value: stdDev,       Label: '표준 편차' },
        { Value: anomalyType,  Label: '이상 유형 (SPIKE/DROP/NORMAL)' },
        { Value: severity,     Label: '심각도 (LOW/MEDIUM/HIGH/CRITICAL)' }
      ]
    },

    FieldGroup#DetectionInfo: {
      Data: [
        { Value: modelName,      Label: '탐지 모델' },
        { Value: modelVersion,   Label: '모델 버전' },
        { Value: detectedAt,     Label: '탐지일시' }
      ]
    }
  }
);