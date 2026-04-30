/**
 * DailySales 및 InventorySnapshots 시계열 데이터 생성 스크립트
 * 
 * 시계열 분석(수요 예측, 이상 탐지)을 위해 60일치 데이터를 생성합니다.
 * 
 * 실행: node scripts/generate-daily-sales.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'db', 'data');

// ══════════════════════════════════════════════════════════════════
// 참조 데이터 (기존 generate-data.js에서 사용하는 ID 형식과 동일)
// ══════════════════════════════════════════════════════════════════
const storeIds = [
  'd1000001-0001-4000-8000-000000000001',  // 강남 본점
  'd1000001-0002-4000-8000-000000000002',  // 서초 지점
  'd1000001-0003-4000-8000-000000000003',  // 잠실 지점
  'd1000001-0004-4000-8000-000000000004',  // 여의도 지점
  'd1000001-0005-4000-8000-000000000005',  // 홍대 지점
];

const productIds = [
  'b1000001-0001-4000-8000-000000000001',  // 노트북 프로 15
  'b1000001-0002-4000-8000-000000000002',  // 노트북 에어 13
  'b1000001-0003-4000-8000-000000000003',  // 데스크탑 컴퓨터
  'b1000001-0004-4000-8000-000000000004',  // 올인원 PC
  'b1000001-0005-4000-8000-000000000005',  // 미니 PC
];

// 점포별 매출 규모 계수 (강남 본점이 가장 큼)
const storeScales = [1.5, 1.2, 1.3, 1.0, 1.1];

// 상품별 기본 일일 판매량 및 단가
const productProfiles = [
  { baseQty: 25, unitPrice: 20000, costRate: 0.65 },  // 노트북 프로 15
  { baseQty: 20, unitPrice: 18000, costRate: 0.65 },  // 노트북 에어 13
  { baseQty: 15, unitPrice: 22000, costRate: 0.60 },  // 데스크탑 컴퓨터
  { baseQty: 10, unitPrice: 25000, costRate: 0.62 },  // 올인원 PC
  { baseQty: 12, unitPrice: 15000, costRate: 0.68 },  // 미니 PC
];

// ══════════════════════════════════════════════════════════════════
// 헬퍼 함수
// ══════════════════════════════════════════════════════════════════
function mkUUID(prefix, num) {
  return prefix + '-' + String(Math.floor(num / 10000)).padStart(4, '0') + 
         '-4000-8000-' + String(num).padStart(12, '0');
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

// ══════════════════════════════════════════════════════════════════
// 날짜 범위 생성: 2026-03-01 ~ 2026-04-29 (60일)
// ══════════════════════════════════════════════════════════════════
const startDate = new Date(2026, 2, 1); // 3월 1일
const endDate = new Date(2026, 3, 29);  // 4월 29일
const dates = [];
let current = new Date(startDate);
while (current <= endDate) {
  dates.push(new Date(current));
  current.setDate(current.getDate() + 1);
}

console.log(`📅 기간: ${formatDate(startDate)} ~ ${formatDate(endDate)} (${dates.length}일)`);
console.log(`🏪 점포: ${storeIds.length}개`);
console.log(`📦 상품: ${productIds.length}개`);
console.log(`📊 예상 총 건수: ${dates.length * storeIds.length * productIds.length}건\n`);

// ══════════════════════════════════════════════════════════════════
// DailySales 생성
// ══════════════════════════════════════════════════════════════════
console.log('🔄 DailySales 데이터 생성 중...');

let salesRows = [];
let salesIdx = 0;

for (const date of dates) {
  const dayOfWeek = date.getDay(); // 0=일, 6=토
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayIdx = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
  
  // 추세 계수: 일당 0.3% 상승
  const trendFactor = 1 + (dayIdx * 0.003);
  
  // 주말 효과: 토/일 20~40% 증가
  const weekendFactor = isWeekend ? 1.25 : 1.0;
  
  // 월초/월말 효과 (급여일 근처 매출 증가)
  const dayOfMonth = date.getDate();
  const paydayFactor = (dayOfMonth >= 24 && dayOfMonth <= 28) ? 1.15 : 1.0;

  for (let s = 0; s < storeIds.length; s++) {
    for (let p = 0; p < productIds.length; p++) {
      salesIdx++;
      
      const profile = productProfiles[p];
      const storeScale = storeScales[s];
      
      // 기본 수량 계산
      let baseQty = profile.baseQty * storeScale * trendFactor * weekendFactor * paydayFactor;
      
      // 정규분포 노이즈 추가 (표준편차 = 기본수량의 15%)
      const noise = gaussianRandom(0, baseQty * 0.15);
      baseQty = Math.max(1, Math.round(baseQty + noise));
      
      // 이상치 삽입 (5% 확률)
      let isAnomaly = false;
      if (Math.random() < 0.05) {
        isAnomaly = true;
        if (Math.random() < 0.5) {
          // 급증 (1.8~2.5배)
          baseQty = Math.round(baseQty * (1.8 + Math.random() * 0.7));
        } else {
          // 급감 (0.2~0.4배)
          baseQty = Math.max(1, Math.round(baseQty * (0.2 + Math.random() * 0.2)));
        }
      }
      
      const quantity = baseQty;
      const revenue = quantity * profile.unitPrice;
      const costAmount = Math.round(revenue * profile.costRate);
      const profit = revenue - costAmount;
      const customerCount = Math.max(1, Math.round(quantity * (0.5 + Math.random() * 0.3)));
      
      const id = mkUUID('f4000001', salesIdx);
      
      salesRows.push([
        id,
        formatDate(date),
        quantity,
        revenue,
        costAmount,
        profit,
        customerCount,
        storeIds[s],
        productIds[p]
      ].join(','));
    }
  }
}

const salesHeader = 'ID,salesDate,quantity,revenue,costAmount,profit,customerCount,store_ID,product_ID';
const salesCsvContent = salesHeader + '\n' + salesRows.join('\n') + '\n';
fs.writeFileSync(path.join(dataDir, 'com.inventory-DailySales.csv'), salesCsvContent);
console.log(`✅ DailySales: ${salesRows.length}건 생성 완료`);

// ══════════════════════════════════════════════════════════════════
// InventorySnapshots 생성 (재고 스냅샷 - 60일치)
// ══════════════════════════════════════════════════════════════════
console.log('\n🔄 InventorySnapshots 데이터 생성 중...');

let snapRows = [];
let snapIdx = 0;

// 상품별 초기 재고 (시작일 기준)
const initialStocks = [
  [500, 450, 400, 350, 380],  // Store1의 Product1~5 초기재고
  [400, 380, 350, 300, 320],  // Store2
  [450, 400, 380, 320, 350],  // Store3
  [350, 320, 300, 280, 300],  // Store4
  [380, 350, 330, 300, 320],  // Store5
];

// 재입고 시뮬레이션: 재고가 낮아지면 보충
const reorderPoints = [100, 90, 80, 70, 75]; // 상품별 재주문점

for (let s = 0; s < storeIds.length; s++) {
  for (let p = 0; p < productIds.length; p++) {
    let currentStock = initialStocks[s][p];
    
    for (let d = 0; d < dates.length; d++) {
      snapIdx++;
      const date = dates[d];
      
      // 해당일 판매량 참조 (salesRows에서 역산)
      const salesRowIdx = d * storeIds.length * productIds.length + s * productIds.length + p;
      const salesParts = salesRows[salesRowIdx].split(',');
      const soldQty = parseInt(salesParts[2]); // quantity 필드
      
      // 판매로 인한 재고 감소
      currentStock = Math.max(0, currentStock - soldQty);
      
      // 재입고 시뮬레이션 (재주문점 이하이면 다음날 보충)
      if (currentStock <= reorderPoints[p]) {
        // 보충량: 초기재고의 60~80%
        const replenish = Math.round(initialStocks[s][p] * (0.6 + Math.random() * 0.2));
        currentStock += replenish;
      }
      
      const reservedQty = Math.round(currentStock * (0.05 + Math.random() * 0.1)); // 5~15% 예약
      const availableQty = currentStock - reservedQty;
      
      // 평균 일일 판매량 기반 재고일수 계산
      const avgDailySales = productProfiles[p].baseQty * storeScales[s];
      const daysOfSupply = availableQty > 0 ? (availableQty / avgDailySales).toFixed(1) : '0.0';
      
      // 재고 상태 판정
      let stockStatus;
      if (currentStock === 0) stockStatus = 'OUT';
      else if (currentStock <= reorderPoints[p] * 0.5) stockStatus = 'LOW';
      else if (currentStock > initialStocks[s][p] * 1.2) stockStatus = 'OVERSTOCK';
      else stockStatus = 'NORMAL';
      
      const id = mkUUID('f5000001', snapIdx);
      
      snapRows.push([
        id,
        formatDate(date),
        currentStock,
        reservedQty,
        availableQty,
        daysOfSupply,
        stockStatus,
        storeIds[s],
        productIds[p]
      ].join(','));
    }
  }
}

const snapHeader = 'ID,snapshotDate,quantity,reservedQty,availableQty,daysOfSupply,stockStatus,store_ID,product_ID';
const snapCsvContent = snapHeader + '\n' + snapRows.join('\n') + '\n';
fs.writeFileSync(path.join(dataDir, 'com.inventory-InventorySnapshots.csv'), snapCsvContent);
console.log(`✅ InventorySnapshots: ${snapRows.length}건 생성 완료`);

// ══════════════════════════════════════════════════════════════════
// 통계 요약
// ══════════════════════════════════════════════════════════════════
console.log('\n════════════════════════════════════════════════════');
console.log('📊 생성 요약');
console.log('════════════════════════════════════════════════════');
console.log(`📅 기간: ${formatDate(startDate)} ~ ${formatDate(endDate)} (${dates.length}일)`);
console.log(`🏪 점포: ${storeIds.length}개`);
console.log(`📦 상품: ${productIds.length}개`);
console.log(`📈 DailySales: ${salesRows.length}건`);
console.log(`📋 InventorySnapshots: ${snapRows.length}건`);
console.log('════════════════════════════════════════════════════');
console.log('\n🎉 시계열 분석용 데이터 생성 완료!');
console.log('   → 시계열 분석(Prophet, LSTM 등)에 충분한 60일치 데이터가 준비되었습니다.');
console.log('   → 주말/추세/이상치 패턴이 포함되어 있습니다.');