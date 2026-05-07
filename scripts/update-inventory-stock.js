#!/usr/bin/env node
/**
 * 재고 상태 다양화 스크립트
 * CSV 파일의 minStock 값을 조정하여 재고 상태가 60% 정상, 30% 주의, 10% 부족이 되도록 합니다.
 * 
 * cds watch 재시작하면 반영됩니다.
 * HANA에도 같은 CSV 배포하면 동일하게 적용됩니다.
 */

const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'db', 'data', 'com.inventory-Inventories.csv');

console.log(`\n🔄 재고 상태 다양화 스크립트`);
console.log(`   대상: ${csvPath}`);
console.log(`   목표: 60% 정상 / 30% 주의 / 10% 부족\n`);

// CSV 읽기
const content = fs.readFileSync(csvPath, 'utf-8');
const lines = content.trim().split('\n');
const header = lines[0];
const rows = lines.slice(1);

console.log(`📦 총 ${rows.length}개 재고 항목`);

// 헤더에서 컬럼 인덱스 찾기
const cols = header.split(',');
const availableQtyIdx = cols.indexOf('availableQty');
const minStockIdx = cols.indexOf('minStock');
const quantityIdx = cols.indexOf('quantity');

console.log(`   컬럼: availableQty[${availableQtyIdx}], minStock[${minStockIdx}], quantity[${quantityIdx}]`);

// 랜덤 셔플용 인덱스 배열
const indices = Array.from({length: rows.length}, (_, i) => i);
indices.sort(() => Math.random() - 0.5);

const total = indices.length;
const normalCount = Math.floor(total * 0.6);
const warningCount = Math.floor(total * 0.3);

const normalIndices = new Set(indices.slice(0, normalCount));
const warningIndices = new Set(indices.slice(normalCount, normalCount + warningCount));
// 나머지는 critical

console.log(`\n🟢 정상: ${normalCount}개 (minStock = availableQty × 0.3)`);
console.log(`🟡 주의: ${warningCount}개 (minStock = availableQty × 1.2~1.5)`);
console.log(`🔴 부족: ${total - normalCount - warningCount}개 (minStock = availableQty × 2.5~3.5)\n`);

// 각 행의 minStock 수정
const newRows = rows.map((row, idx) => {
    const fields = row.split(',');
    const availableQty = parseInt(fields[availableQtyIdx]) || parseInt(fields[quantityIdx]) || 100;
    
    let newMinStock;
    if (normalIndices.has(idx)) {
        // 정상: minStock << availableQty
        newMinStock = Math.max(5, Math.floor(availableQty * 0.3));
    } else if (warningIndices.has(idx)) {
        // 주의: minStock ≈ availableQty (약간 초과)
        const factor = 1.2 + Math.random() * 0.3;
        newMinStock = Math.max(10, Math.floor(availableQty * factor));
    } else {
        // 부족: minStock >> availableQty
        const factor = 2.5 + Math.random() * 1.0;
        newMinStock = Math.max(20, Math.floor(availableQty * factor));
    }
    
    fields[minStockIdx] = String(newMinStock);
    return fields.join(',');
});

// CSV 저장
const output = [header, ...newRows].join('\n') + '\n';
fs.writeFileSync(csvPath, output, 'utf-8');

console.log(`✅ CSV 파일 업데이트 완료!`);
console.log(`\n💡 cds watch를 재시작하면 로컬 SQLite에 반영됩니다.`);
console.log(`💡 HANA 배포 시에도 동일한 CSV가 사용되어 자동 반영됩니다.\n`);