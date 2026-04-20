const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'db', 'data');

// ── Helper ──────────────────────────────────────────────────────
function uuid(prefix, seq) {
  const p = prefix.padStart(8, '0');
  const s = String(seq).padStart(4, '0');
  const tail = String(seq).padStart(12, '0');
  return `${p}-${s}-4000-8000-${tail}`;
}
const ts = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}T00:00:00Z`;
const date = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const dec = (min, max, digits=2) => (Math.random() * (max - min) + min).toFixed(digits);

// ── 1. Categories (20건) ────────────────────────────────────────
const categories = [
  { code:'ELEC', name:'전자제품', desc:'전자기기 및 IT 장비' },
  { code:'OFFC', name:'사무용품', desc:'사무실 소모품 및 용품' },
  { code:'FURN', name:'가구', desc:'사무용 가구' },
  { code:'FOOD', name:'식품', desc:'식품 및 음료' },
  { code:'CHEM', name:'화학제품', desc:'화학 원료 및 세제' },
  { code:'CLTH', name:'의류', desc:'의류 및 패션' },
  { code:'SPRT', name:'스포츠용품', desc:'스포츠 및 레저 용품' },
  { code:'BOOK', name:'도서', desc:'도서 및 출판물' },
  { code:'TOOL', name:'공구', desc:'산업용 공구 및 장비' },
  { code:'AUTO', name:'자동차용품', desc:'자동차 부품 및 액세서리' },
  { code:'HLTH', name:'건강용품', desc:'건강 및 의료용품' },
  { code:'COSM', name:'화장품', desc:'화장품 및 뷰티' },
  { code:'HOME', name:'생활용품', desc:'가정용품 및 생활잡화' },
  { code:'BABY', name:'유아용품', desc:'유아 및 아동용품' },
  { code:'PETA', name:'반려동물', desc:'반려동물 용품 및 사료' },
  { code:'GARDN', name:'원예', desc:'원예 및 정원용품' },
  { code:'JEWL', name:'쥬얼리', desc:'쥬얼리 및 액세서리' },
  { code:'MUSC', name:'악기', desc:'악기 및 음향장비' },
  { code:'STNY', name:'문구', desc:'문구 및 필기구' },
  { code:'DGTL', name:'디지털기기', desc:'디지털 가전 및 액세서리' },
];
const catIds = categories.map((c, i) => uuid('a1000001', i+1));
let catCsv = 'ID,code,name,description,isActive,createdAt,createdBy,modifiedAt,modifiedBy\n';
categories.forEach((c, i) => {
  catCsv += `${catIds[i]},${c.code},${c.name},${c.desc},${i===4?'false':'true'},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
});
fs.writeFileSync(path.join(dataDir, 'com.inventory-Categories.csv'), catCsv.trimEnd());
console.log('✅ Categories: 20건');

// ── 2. Suppliers (100건) ────────────────────────────────────────
const supplierNames = [
  '삼성전자','한솔제지','퍼시스그룹','CJ프레시웨이','애플코리아',
  'LG전자','SK하이닉스','현대모비스','포스코','롯데칠성',
  '한화솔루션','두산중공업','KT','네이버','카카오',
  '쿠팡','마켓컬리','배민프레시','GS리테일','신세계인터',
  '이마트','한샘','쎈트랄','코오롱글로벌','효성',
  '대한제강','동원산업','오뚜기','농심','하림',
  '매일유업','서울우유','빙그레','풀무원','CJ제일제당',
  '삼양식품','동서식품','롯데제과','해태제과','크라운',
  '아모레퍼시픽','LG생활건강','토니모리','이니스프리','미샤',
  '한국야쿠르트','남양유업','일동후디스','파리바게뜨','뚜레쥬르',
  '무인양품코리아','이케아코리아','코스트코코리아','홈플러스','하이마트',
  '다이슨코리아','필립스코리아','보쉬코리아','블랙앤데커','3M코리아',
  '한국HP','레노버코리아','에이서코리아','MSI코리아','인텔코리아',
  'AMD코리아','시스코코리아','델코리아','시게이트코리아','샌디스크코리아',
  '마이크로소프트','구글코리아','오라클코리아','SAP코리아','세일즈포스',
  '현대자동차','기아자동차','쌍용자동차','르노코리아','BMW코리아',
  '벤츠코리아','아우디코리아','볼보코리아','토요타코리아','혼다코리아',
  '나이키코리아','아디다스코리아','뉴발란스코리아','푸마코리아','리복코리아',
  'YG엔터','SM엔터','JYP엔터','하이브','카카오엔터',
  '넷마블','엔씨소프트','크래프톤','넥슨코리아','스마일게이트'
];
const cities = ['서울','부산','대구','인천','광주','대전','울산','세종','수원','성남','고양','용인','창원','청주','전주','천안','제주','포항','김해','안산'];
const countries = ['대한민국'];
const payTerms = ['NET30','NET60','NET90','COD','NET15'];
const contacts = ['김철수','이영희','박지민','최수진','정민호','한서윤','오준석','강다현','윤재현','임소영','조현우','송지은','배성민','유하린','황도윤','전예진','고태영','문서현','양지우','권나영'];
const supplierIds = [];
let supCsv = 'ID,supplierCode,name,contactPerson,phone,email,address,city,country,paymentTerms,leadTime,rating,isActive,description,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('e1000001', i);
  supplierIds.push(id);
  const code = `SUP-${String(i).padStart(3,'0')}`;
  const nm = supplierNames[i-1];
  const contact = contacts[i % contacts.length];
  const city = cities[i % cities.length];
  const phone = `0${rand(2,6)}${rand(1,9)}-${rand(100,999)}-${rand(1000,9999)}`;
  const email = `supply${i}@${nm.replace(/[^a-zA-Z]/g,'').toLowerCase() || 'company'+i}.com`;
  const addr = `${city} ${['중구','강남구','서초구','해운대구','수성구','남구','북구','동구','서구','유성구'][i%10]} ${rand(1,300)}번길 ${rand(1,50)}`;
  const pt = payTerms[i % payTerms.length];
  const lt = rand(3, 30);
  const rating = dec(2.0, 5.0, 1);
  const active = i % 15 === 0 ? 'false' : 'true';
  const desc = `${nm} - ${city} 소재 공급업체`;
  supCsv += `${id},${code},${nm},${contact},${phone},${email},${addr},${city},대한민국,${pt},${lt},${rating},${active},${desc},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-Suppliers.csv'), supCsv.trimEnd());
console.log('✅ Suppliers: 100건');

// ── 3. Materials (100건) ────────────────────────────────────────
const matTypes = ['RAW','SUB','PKG'];
const matUnits = ['EA','KG','L','M','BOX','SET','ROLL','SHEET'];
const matNames = [
  '알루미늄 판재','구리 배선','플라스틱 케이스','고무 패킹','스테인리스 볼트',
  'LED 모듈','리튬 배터리 셀','LCD 패널','터치스크린 모듈','메모리 칩',
  'SSD 낸드플래시','CPU 칩셋','PCB 기판','콘덴서','저항기',
  '나무 합판','MDF 보드','원목 자재','스프링','폼 패드',
  '면 원단','폴리에스터 원단','나일론 원단','가죽 시트','지퍼',
  '버튼','실','라벨 태그','포장 박스 소형','포장 박스 중형',
  '포장 박스 대형','에어캡','테이프','스티커 라벨','비닐 포장재',
  '인쇄 잉크 블랙','인쇄 잉크 컬러','A4 용지','코팅지','접착제',
  '나사 M3','나사 M5','볼트 M8','너트 M8','와셔',
  '전선 AWG22','전선 AWG18','광케이블','USB 커넥터','HDMI 커넥터',
  '밀가루','설탕','소금','식용유','버터',
  '우유 원유','코코아분말','바닐라향','이스트','베이킹파우더',
  '세제 원액','표백제','향료','색소','계면활성제',
  '에탄올','아세톤','벤젠','톨루엔','메탄올',
  '타이어 고무','브레이크 패드','엔진오일 원액','냉각수','점화플러그',
  '유리판','강화유리','거울 원판','아크릴판','폴리카보네이트',
  '철근','시멘트','모래','자갈','석고보드',
  '페인트 백색','페인트 흑색','방수제','실리콘','퍼티',
  '종이컵','종이빨대','플라스틱 뚜껑','일회용 포크','일회용 나이프',
  '전구 LED','형광등','배선 차단기','스위치','콘센트'
];
const materialIds = [];
let matCsv = 'ID,materialCode,name,materialType,unit,unitPrice,supplier_ID,minOrderQty,safetyStock,currentStock,isActive,description,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('c1000001', i);
  materialIds.push(id);
  const code = `MAT-${String(i).padStart(4,'0')}`;
  const nm = matNames[i-1];
  const mt = matTypes[i % matTypes.length];
  const unit = matUnits[i % matUnits.length];
  const price = dec(100, 50000);
  const supId = supplierIds[(i-1) % supplierIds.length];
  const moq = rand(1, 100);
  const ss = rand(10, 500);
  const cs = rand(0, 2000);
  const active = i % 20 === 0 ? 'false' : 'true';
  matCsv += `${id},${code},${nm},${mt},${unit},${price},${supId},${moq},${ss},${cs},${active},${nm} 자재,2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-Materials.csv'), matCsv.trimEnd());
console.log('✅ Materials: 100건');

// ── 4. Products (100건) ─────────────────────────────────────────
const productNames = [
  '노트북 프로 15','노트북 에어 13','데스크탑 컴퓨터','올인원 PC','미니 PC',
  '27인치 모니터','32인치 커브드 모니터','휴대용 모니터','모니터 암','모니터 거치대',
  '무선 키보드','기계식 키보드','무선 마우스','게이밍 마우스','마우스패드',
  '웹캠 HD','웹캠 4K','블루투스 헤드셋','노이즈캔슬링 이어폰','스피커',
  '외장 SSD 1TB','외장 HDD 2TB','USB 허브','USB 메모리 64GB','SD카드 128GB',
  'A4 복사용지 박스','A3 복사용지 박스','컬러 인쇄용지','라벨 스티커','봉투 세트',
  '볼펜 세트','형광펜 세트','연필 세트','만년필','수정테이프',
  '포스트잇 세트','클립보드','바인더 A4','파일 폴더','스테이플러',
  '사무용 책상 1200','사무용 책상 1500','사무용 책상 1800','스탠딩 데스크','좌식 테이블',
  '메쉬 의자','가죽 의자','임원용 의자','접이식 의자','스툴',
  '3단 서랍장','5단 서랍장','책장','파일 캐비넷','사물함',
  '생수 500ml 24입','생수 2L 6입','커피 원두 1kg','커피 캡슐 세트','녹차 티백',
  '과자 선물세트','라면 박스','즉석밥 세트','통조림 세트','간식 박스',
  '에너지드링크 24입','탄산음료 24입','주스 12입','우유 12입','두유 24입',
  '세탁세제','섬유유연제','주방세제','핸드워시','손소독제',
  '티셔츠 기본','셔츠 슬림핏','청바지 스트레이트','면바지','자켓',
  '운동화','캔버스화','구두','슬리퍼','부츠',
  '축구공','농구공','야구글러브','테니스라켓','요가매트',
  '아령 5kg','덤벨 10kg','풀업바','줄넘기','런닝머신',
  '소설 베스트','자기계발 베스트','영어교재','프로그래밍 입문','경제경영 베스트'
];
const prodUnits = ['EA','SET','BOX','PACK'];
const productIds = [];
let prodCsv = 'ID,productCode,name,category_ID,unit,costPrice,marginRate,sellingPrice,safetyStock,leadTime,isActive,description,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('b1000001', i);
  productIds.push(id);
  const code = `PRD-${String(i).padStart(4,'0')}`;
  const nm = productNames[i-1];
  const catId = catIds[(i-1) % catIds.length];
  const unit = prodUnits[i % prodUnits.length];
  const cost = parseFloat(dec(5000, 500000));
  const margin = parseFloat(dec(5, 45));
  const selling = (cost * (1 + margin / 100)).toFixed(2);
  const ss = rand(5, 100);
  const lt = rand(1, 30);
  const active = i % 25 === 0 ? 'false' : 'true';
  prodCsv += `${id},${code},${nm},${catId},${unit},${cost.toFixed(2)},${margin.toFixed(2)},${selling},${ss},${lt},${active},${nm},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-Products.csv'), prodCsv.trimEnd());
console.log('✅ Products: 100건');

// ── 5. Stores (30건) ────────────────────────────────────────────
const storeTypes = ['Store','Warehouse','Online'];
const storeNames = [
  '강남 본점','서초 지점','잠실 지점','여의도 지점','홍대 지점',
  '신촌 지점','이태원 지점','명동 지점','종로 지점','동대문 지점',
  '부산 해운대점','부산 서면점','대구 동성로점','인천 송도점','광주 충장로점',
  '대전 둔산점','울산 삼산점','수원 인계점','성남 분당점','고양 일산점',
  '용인 수지점','창원 상남점','청주 성안점','전주 객사점','천안 신부점',
  '제주 연동점','포항 북구점','중앙 물류센터','남부 물류센터','온라인 스토어'
];
const storeCities = ['서울','서울','서울','서울','서울','서울','서울','서울','서울','서울','부산','부산','대구','인천','광주','대전','울산','수원','성남','고양','용인','창원','청주','전주','천안','제주','포항','서울','부산','서울'];
const storeIds = [];
let storeCsv = 'ID,storeCode,name,address,city,postalCode,country,phone,email,manager,storeType,isActive,description,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 30; i++) {
  const id = uuid('d1000001', i);
  storeIds.push(id);
  const code = `STR-${String(i).padStart(3,'0')}`;
  const nm = storeNames[i-1];
  const city = storeCities[i-1];
  const addr = `${city} ${['중구','강남구','서초구','송파구','영등포구','마포구','용산구','중구','종로구','동대문구','해운대구','부산진구','중구','연수구','동구','유성구','남구','팔달구','분당구','일산동구','수지구','성산구','상당구','완산구','동남구','연동','북구','강남구','사하구','강남구'][i-1]} ${rand(1,300)}번길 ${rand(1,50)}`;
  const postal = `${rand(10,99)}${rand(100,999)}`;
  const phone = `0${rand(2,6)}${rand(1,9)}-${rand(100,999)}-${rand(1000,9999)}`;
  const email = `store${i}@inventory.co.kr`;
  const mgr = contacts[i % contacts.length];
  const type = i >= 28 && i <= 29 ? 'Warehouse' : (i === 30 ? 'Online' : 'Store');
  const active = i === 29 ? 'false' : 'true';
  storeCsv += `${id},${code},${nm},${addr},${city},${postal},대한민국,${phone},${email},${mgr},${type},${active},${nm},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-Stores.csv'), storeCsv.trimEnd());
console.log('✅ Stores: 30건');

// ── 6. ProductMaterials (100건) ─────────────────────────────────
let pmCsv = 'ID,product_ID,material_ID,quantity,unit,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('f1000001', i);
  const prodId = productIds[(i-1) % productIds.length];
  const matId = materialIds[(i-1) % materialIds.length];
  const qty = dec(0.5, 20, 3);
  const unit = matUnits[i % matUnits.length];
  pmCsv += `${id},${prodId},${matId},${qty},${unit},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-ProductMaterials.csv'), pmCsv.trimEnd());
console.log('✅ ProductMaterials: 100건');

// ── 7. StoreProducts (100건) ────────────────────────────────────
let spCsv = 'ID,store_ID,product_ID,sellingPrice,costPrice,minStock,maxStock,displayOrder,isActive,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('f2000001', i);
  const stId = storeIds[(i-1) % storeIds.length];
  const prId = productIds[(i-1) % productIds.length];
  const cost = parseFloat(dec(5000, 200000));
  const selling = (cost * parseFloat(dec(1.1, 1.5))).toFixed(2);
  const minS = rand(5, 30);
  const maxS = rand(50, 500);
  const dOrder = i;
  const active = i % 20 === 0 ? 'false' : 'true';
  spCsv += `${id},${stId},${prId},${selling},${cost.toFixed(2)},${minS},${maxS},${dOrder},${active},2024-01-01T00:00:00Z,admin,2024-01-01T00:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-StoreProducts.csv'), spCsv.trimEnd());
console.log('✅ StoreProducts: 100건');

// ── 8. Inventories (100건) ──────────────────────────────────────
let invCsv = 'ID,product_ID,store_ID,warehouse,quantity,reservedQty,availableQty,minStock,maxStock,lastUpdated,createdAt,createdBy,modifiedAt,modifiedBy\n';
const warehouses = ['WH-A','WH-B','WH-C','WH-D','WH-E'];
for (let i = 1; i <= 100; i++) {
  const id = uuid('f3000001', i);
  const prId = productIds[(i-1) % productIds.length];
  const stId = storeIds[(i-1) % storeIds.length];
  const wh = warehouses[i % warehouses.length];
  const qty = rand(0, 1000);
  const resQty = rand(0, Math.min(qty, 100));
  const availQty = qty - resQty;
  const minS = rand(10, 50);
  const maxS = rand(200, 1000);
  invCsv += `${id},${prId},${stId},${wh},${qty},${resQty},${availQty},${minS},${maxS},2024-06-15T10:30:00Z,2024-01-01T00:00:00Z,admin,2024-06-15T10:30:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-Inventories.csv'), invCsv.trimEnd());
console.log('✅ Inventories: 100건');

// ── 9. PurchaseOrders (100건) ───────────────────────────────────
const poStatuses = ['Draft','Submitted','Approved','Rejected','Received'];
const requesters = ['김부장','이차장','박과장','최대리','정사원','한주임','오팀장','강본부장','윤이사','임부장'];
let poCsv = 'ID,poNumber,product_ID,store_ID,supplier_ID,quantity,unitPrice,totalAmount,status,requestedBy,approvedBy,approvedAt,expectedDate,receivedDate,note,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('f4000001', i);
  const poNum = `PO-2024${String(Math.floor((i-1)/30)+1).padStart(2,'0')}${String(rand(1,28)).padStart(2,'0')}-${String(i).padStart(4,'0')}`;
  const prId = productIds[(i-1) % productIds.length];
  const stId = storeIds[(i-1) % storeIds.length];
  const supId = supplierIds[(i-1) % supplierIds.length];
  const qty = rand(10, 500);
  const uPrice = parseFloat(dec(1000, 100000));
  const total = (qty * uPrice).toFixed(2);
  const status = poStatuses[i % poStatuses.length];
  const reqBy = requesters[i % requesters.length];
  const appBy = status === 'Approved' || status === 'Received' ? '윤이사' : '';
  const appAt = appBy ? '2024-06-20T14:00:00Z' : '';
  const expDate = date(2024, rand(1,12), rand(1,28));
  const recDate = status === 'Received' ? date(2024, rand(6,12), rand(1,28)) : '';
  const note = `발주 #${i}`;
  poCsv += `${id},${poNum},${prId},${stId},${supId},${qty},${uPrice.toFixed(2)},${total},${status},${reqBy},${appBy},${appAt},${expDate},${recDate},${note},2024-01-15T09:00:00Z,admin,2024-06-20T14:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-PurchaseOrders.csv'), poCsv.trimEnd());
console.log('✅ PurchaseOrders: 100건');

// ── 10. SupplyOrders (100건) ────────────────────────────────────
const soTypes = ['SUPPLY','RETURN','TRANSFER'];
const soStatuses = ['Draft','Confirmed','Shipped','Delivered','Cancelled'];
const supplyOrderIds = [];
let soCsv = 'ID,orderNumber,store_ID,supplier_ID,orderType,status,orderDate,expectedDate,deliveredDate,totalAmount,requestedBy,note,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('f5000001', i);
  supplyOrderIds.push(id);
  const soNum = `SO-2024${String(Math.floor((i-1)/30)+1).padStart(2,'0')}${String(rand(1,28)).padStart(2,'0')}-${String(i).padStart(4,'0')}`;
  const stId = storeIds[(i-1) % storeIds.length];
  const supId = supplierIds[(i-1) % supplierIds.length];
  const type = soTypes[i % soTypes.length];
  const status = soStatuses[i % soStatuses.length];
  const oDate = date(2024, rand(1,12), rand(1,28));
  const eDate = date(2024, rand(6,12), rand(1,28));
  const dDate = status === 'Delivered' ? date(2024, rand(6,12), rand(1,28)) : '';
  const total = dec(50000, 5000000);
  const reqBy = requesters[i % requesters.length];
  const note = `공급주문 #${i}`;
  soCsv += `${id},${soNum},${stId},${supId},${type},${status},${oDate},${eDate},${dDate},${total},${reqBy},${note},2024-01-15T09:00:00Z,admin,2024-06-20T14:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-SupplyOrders.csv'), soCsv.trimEnd());
console.log('✅ SupplyOrders: 100건');

// ── 11. SupplyOrderItems (100건) ────────────────────────────────
let soiCsv = 'ID,supplyOrder_ID,product_ID,material_ID,quantity,unitPrice,totalPrice,note,createdAt,createdBy,modifiedAt,modifiedBy\n';
for (let i = 1; i <= 100; i++) {
  const id = uuid('f6000001', i);
  const soId = supplyOrderIds[(i-1) % supplyOrderIds.length];
  const prId = productIds[(i-1) % productIds.length];
  const matId = materialIds[(i-1) % materialIds.length];
  const qty = rand(1, 200);
  const uPrice = parseFloat(dec(1000, 50000));
  const total = (qty * uPrice).toFixed(2);
  const note = `품목 #${i}`;
  soiCsv += `${id},${soId},${prId},${matId},${qty},${uPrice.toFixed(2)},${total},${note},2024-01-15T09:00:00Z,admin,2024-06-20T14:00:00Z,admin\n`;
}
fs.writeFileSync(path.join(dataDir, 'com.inventory-SupplyOrderItems.csv'), soiCsv.trimEnd());
console.log('✅ SupplyOrderItems: 100건');

console.log('\n🎉 모든 데이터 생성 완료!');