using InventoryService as service from '../../srv/service';

// ═══════════════════════════════════════════════════════════════════
// CustomerSegments - 고객 세분화 결과
// ═══════════════════════════════════════════════════════════════════

annotate service.CustomerSegments with @(
  UI: {
    HeaderInfo: {
      TypeName: '고객 세그먼트',
      TypeNamePlural: '고객 세분화 목록',
      Title: { Value: segmentName },
      Description: { Value: segmentCode }
    },

    SelectionFields: [
      customer_ID,
      segmentName,
      segmentCode,
      clusterLabel
    ],

    LineItem: [
      { Value: customer_ID,      Label: '고객',           ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: segmentName,      Label: '세그먼트',      ![@UI.Importance]: #High, ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: segmentCode,      Label: '세그먼트 코드', ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: rfmScore,         Label: 'RFM 합계',      ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: recencyScore,     Label: 'R 점수',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: frequencyScore,   Label: 'F 점수',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: monetaryScore,    Label: 'M 점수',        ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: clusterLabel,     Label: '클러스터',      ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: description,      Label: '설명',           ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: modelName,        Label: '모델명',         ![@HTML5.CssDefaults]: { width: 'auto' } },
      { Value: analyzedAt,       Label: '분석일시',       ![@HTML5.CssDefaults]: { width: 'auto' } }
    ],

    HeaderFacets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#Segment' },
      { $Type: 'UI.ReferenceFacet', Target: '@UI.DataPoint#RFMScore' }
    ],

    DataPoint#Segment: {
      Value: segmentName,
      Title: '세그먼트'
    },

    DataPoint#RFMScore: {
      Value: rfmScore,
      Title: 'RFM 합계 점수'
    },

    Facets: [
      {
        $Type: 'UI.CollectionFacet',
        ID: 'SegmentDetail',
        Label: '세분화 상세',
        Facets: [
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#SegmentInfo', Label: '세그먼트 정보' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#RFMDetail', Label: 'RFM 상세' },
          { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#ModelInfo', Label: '모델 정보' }
        ]
      }
    ],

    FieldGroup#SegmentInfo: {
      Data: [
        { Value: customer_ID,   Label: '고객' },
        { Value: segmentName,   Label: '세그먼트명' },
        { Value: segmentCode,   Label: '세그먼트 코드' },
        { Value: clusterLabel,  Label: '클러스터 번호' },
        { Value: description,   Label: '설명' }
      ]
    },

    FieldGroup#RFMDetail: {
      Data: [
        { Value: rfmScore,       Label: 'RFM 합계' },
        { Value: recencyScore,   Label: 'Recency 점수 (1~5)' },
        { Value: frequencyScore, Label: 'Frequency 점수 (1~5)' },
        { Value: monetaryScore,  Label: 'Monetary 점수 (1~5)' }
      ]
    },

    FieldGroup#ModelInfo: {
      Data: [
        { Value: modelName,    Label: '모델명' },
        { Value: modelVersion, Label: '모델 버전' },
        { Value: analyzedAt,   Label: '분석일시' }
      ]
    }
  }
);