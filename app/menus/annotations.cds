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
      { Value: code, Label: '코드', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: title, Label: '메뉴명', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: level, Label: '레벨', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: url, Label: 'URL', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: parent.code, Label: '상위코드', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: parent.title, Label: '상위메뉴', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: sortOrder, Label: '정렬', ![@HTML5.CssDefaults]: {width: 'auto'} },
      { Value: isActive, Label: '활성', ![@HTML5.CssDefaults]: {width: 'auto'} }
    ],
    FieldGroup #General: {
      Data: [
        { Value: code, Label: '코드' },
        { Value: title, Label: '메뉴명' },
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

// parent_ID 외래키에 텍스트 표시 + Value Help 적용
// 상세 페이지와 리스트 모두에서 UUID 대신 메뉴명 표시
annotate service.MenuItems with {
  parent @(
    Common.ValueList: {
      Label: '상위 메뉴 선택',
      CollectionPath: 'MenuItems',
      Parameters: [
        { $Type: 'Common.ValueListParameterInOut', LocalDataProperty: parent_ID, ValueListProperty: 'ID' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'code' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'title' },
        { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'level' }
      ]
    },
    Common.ValueListWithFixedValues: false
  );
  parent_ID @(
    Common.Text: parent.title,
    Common.TextArrangement: #TextFirst
  );
};