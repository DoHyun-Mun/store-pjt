using InventoryService as service from '../../srv/service';

annotate service.MenuItems with @(
  UI: {
    HeaderInfo: {
      TypeName: '메뉴',
      TypeNamePlural: '메뉴 관리',
      Title: { Value: title },
      Description: { Value: code }
    },
    SelectionFields: [ code, title, level, isActive ],
    LineItem: [
      { Value: code, Label: '코드' },
      { Value: title, Label: '메뉴명' },
      { Value: icon, Label: '아이콘' },
      { Value: level, Label: '레벨', Criticality: level },
      { Value: url, Label: 'URL' },
      { Value: parent_ID, Label: '상위메뉴' },
      { Value: sortOrder, Label: '정렬' },
      { Value: isActive, Label: '활성' }
    ],
    FieldGroup #General: {
      Data: [
        { Value: code, Label: '코드' },
        { Value: title, Label: '메뉴명' },
        { Value: icon, Label: '아이콘' },
        { Value: level, Label: '레벨' },
        { Value: url, Label: 'URL' },
        { Value: parent_ID, Label: '상위메뉴' },
        { Value: sortOrder, Label: '정렬순서' },
        { Value: isActive, Label: '활성여부' },
        { Value: description, Label: '설명' }
      ]
    },
    Facets: [
      { $Type: 'UI.ReferenceFacet', Target: '@UI.FieldGroup#General', Label: '메뉴 정보' }
    ]
  }
);