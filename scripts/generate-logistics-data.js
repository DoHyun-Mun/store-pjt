#!/usr/bin/env node
/**
 * 유통 프로세스 연계 데이터 생성
 * PurchaseOrders 기반으로 InboundOrder → GoodsReceipt → Invoice → TransferOrder → StoreReceipt 체인 생성
 */
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'db', 'data');

function uuid(prefix, seq) { return prefix.padStart(8,'0')+'-'+String(seq).padStart(4,'0')+'-4000-8000-'+String(seq).padStart(12,'0'); }
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const dateFmt = (y,m,d) => y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');

// CSV 읽기 헬퍼
function readCsv(file) {
  const lines = fs.readFileSync(path.join(dataDir, file), 'utf-8').trim().split('\n');
  const header = lines[0].split(',');
  return lines.slice(1).map(l => {
    const vals = l.split(',');
    const obj = {};
    header.forEach((h, i) => obj[h] = vals[i] || '');
    return obj;
  });
}

// 기존 마스터 데이터 읽기
const purchaseOrders = readCsv('com.inventory-PurchaseOrders.csv');
const suppliers = readCsv('com.inventory-Suppliers.csv');
const stores = readCsv('com.inventory-Stores.csv');
const products = readCsv('com.inventory-Products.csv');

console.log('📊 기존 데이터: PO', purchaseOrders.length, '공급업체', suppliers.length, '점포', stores.length, '상품', products.length);

// DC 데이터 (5개 고정)
const dcs = [
  {code:'DC-CENTRAL',name:'중앙물류센터',city:'경기도 이천시',type:'CENTRAL',cap:50000},
  {code:'DC-SEOUL',name:'수도권물류센터',city:'경기도 안성시',type:'REGIONAL',cap:30000},
  {code:'DC-BUSAN',name:'부산물류센터',city:'부산 강서구',type:'REGIONAL',cap:20000},
  {code:'DC-COLD',name:'저온물류센터',city:'경기도 용인시',type:'COLD',cap:10000},
  {code:'DC-DAEGU',name:'대구물류센터',city:'대구 달성군',type:'REGIONAL',cap:15000}
];
const dcIds = dcs.map((_,i) => uuid('e1000001', i+1));

// === 1. DistributionCenters ===
const dcH = 'ID,dcCode,name,address,city,postalCode,country,phone,email,manager,capacity,currentStock,dcType,isActive,description,createdAt,createdBy,modifiedAt,modifiedBy';
const dcR = dcs.map((d,i) => [dcIds[i],d.code,d.name,d.city+' 물류단지',d.city,rand(10000,99999),'대한민국','02-'+rand(1000,9999)+'-'+rand(1000,9999),'dc'+(i+1)+'@inventory.co.kr','물류담당'+(i+1),d.cap,rand(5000,d.cap),d.type,'true',d.name,'2024-01-01T00:00:00Z','admin','2024-01-01T00:00:00Z','admin'].join(','));
fs.writeFileSync(path.join(dataDir,'com.inventory-DistributionCenters.csv'), dcH+'\n'+dcR.join('\n')+'\n');
console.log('✅ DistributionCenters:', dcR.length);

// === 비즈니스 흐름 기반 연계 데이터 생성 ===
const ioRows=[], ioiRows=[], grRows=[], griRows=[], ivRows=[], iviRows=[], toRows=[], toiRows=[], srRows=[], sriRows=[];
let ioSeq=1, ioiSeq=1, grSeq=1, griSeq=1, ivSeq=1, iviSeq=1, toSeq=1, toiSeq=1, srSeq=1, sriSeq=1;
const carriers = ['CJ대한통운','한진택배','로젠택배','우체국택배','롯데택배'];
const ts = '2024-01-01T00:00:00Z';

// 각 PurchaseOrder를 기반으로 프로세스 체인 생성
purchaseOrders.forEach((po, idx) => {
  const poId = po.ID;
  const supplierId = po.supplier_ID;
  const productId = po.product_ID;
  const storeId = po.store_ID;
  const qty = parseInt(po.quantity) || rand(50, 200);
  const unitPrice = parseFloat(po.unitPrice) || rand(5000, 30000);
  const dcId = pick(dcIds);
  const orderMonth = rand(1, 12);
  const orderDay = rand(1, 28);

  // 프로세스 진행도 결정 (일부는 중간 단계에서 멈춤)
  const progress = Math.random();
  // 80%는 완료, 10%는 배송중, 5%는 검수중, 5%는 대기
  const isCompleted = progress < 0.6;
  const isShipped = progress < 0.8;
  const isInspected = progress < 0.9;

  // --- 2. InboundOrder ---
  const ioId = uuid('e2000001', ioSeq);
  const ioStatus = isCompleted ? 'Completed' : isInspected ? 'Arrived' : 'InTransit';
  const ioOrderDate = dateFmt(2024, orderMonth, orderDay);
  const ioExpDate = dateFmt(2024, Math.min(12, orderMonth + 1), orderDay);
  const ioArrDate = ioStatus !== 'InTransit' ? dateFmt(2024, Math.min(12, orderMonth + 1), rand(1, 28)) : '';
  ioRows.push([ioId, 'IO-2024'+String(rand(100,999))+'-'+String(ioSeq).padStart(4,'0'), supplierId, dcId, poId, ioStatus, ioOrderDate, ioExpDate, ioArrDate, qty*unitPrice, '구매담당'+rand(1,3), '발주 '+po.poNumber+' 기반', ts, 'admin', ts, 'admin'].join(','));
  
  // InboundOrder Item
  const receivedQty = ioStatus === 'Completed' ? qty : ioStatus === 'Arrived' ? qty : 0;
  ioiRows.push([uuid('e2100001', ioiSeq), ioId, productId, '', qty, receivedQty, unitPrice, qty*unitPrice, '', ts, 'admin', ts, 'admin'].join(','));
  ioiSeq++;
  ioSeq++;

  if (!isInspected) return; // InTransit 상태면 여기서 끝

  // --- 3. GoodsReceipt ---
  const grId = uuid('e3000001', grSeq);
  const passedQty = qty - rand(0, Math.floor(qty * 0.05)); // 95~100% 합격
  const rejectedQty = qty - passedQty;
  const grStatus = rejectedQty > 0 ? 'PartialReject' : 'Passed';
  grRows.push([grId, 'GR-2024'+String(rand(100,999))+'-'+String(grSeq).padStart(4,'0'), ioId, dcId, grStatus, '검수담당'+rand(1,3), dateFmt(2024, Math.min(12, orderMonth+1), rand(1,28))+'T10:00:00Z', passedQty, rejectedQty, rejectedQty > 0 ? '일부 포장 불량' : '', '', ts, 'admin', ts, 'admin'].join(','));
  griRows.push([uuid('e3100001', griSeq), grId, productId, qty, passedQty, rejectedQty, rejectedQty > 0 ? '파손' : '양호', ts, 'admin', ts, 'admin'].join(','));
  griSeq++;
  grSeq++;

  // --- 4. Invoice ---
  const ivId = uuid('e4000001', ivSeq);
  const subtotal = passedQty * unitPrice;
  const tax = Math.round(subtotal * 0.1);
  const ivStatus = isCompleted ? 'Paid' : 'Approved';
  const paidDate = ivStatus === 'Paid' ? dateFmt(2024, Math.min(12, orderMonth + 2), rand(1, 28)) : '';
  ivRows.push([ivId, 'IV-2024'+String(rand(100,999))+'-'+String(ivSeq).padStart(4,'0'), supplierId, grId, poId, ivStatus, dateFmt(2024, Math.min(12, orderMonth+1), rand(1,28)), dateFmt(2024, Math.min(12, orderMonth+2), rand(1,28)), paidDate, subtotal, 10, tax, subtotal+tax, ivStatus==='Paid'?'BANK_TRANSFER':'', '', '발주 '+po.poNumber+' 정산', ts, 'admin', ts, 'admin'].join(','));
  iviRows.push([uuid('e4100001', iviSeq), ivId, productId, passedQty, unitPrice, subtotal, tax, '', ts, 'admin', ts, 'admin'].join(','));
  iviSeq++;
  ivSeq++;

  if (!isShipped) return; // 검수 완료 but 아직 배송 안됨

  // --- 5. TransferOrder ---
  const toId = uuid('e5000001', toSeq);
  const toStatus = isCompleted ? 'Delivered' : 'Shipped';
  const shipDate = dateFmt(2024, Math.min(12, orderMonth + 1), rand(1, 28));
  const delivDate = toStatus === 'Delivered' ? dateFmt(2024, Math.min(12, orderMonth + 2), rand(1, 28)) : '';
  toRows.push([toId, 'TO-2024'+String(rand(100,999))+'-'+String(toSeq).padStart(4,'0'), dcId, storeId, toStatus, pick(['NORMAL','HIGH','URGENT']), dateFmt(2024, Math.min(12, orderMonth+1), rand(1,28)), shipDate, shipDate, delivDate, passedQty, pick(carriers), 'TRK'+rand(100000000,999999999), '', ts, 'admin', ts, 'admin'].join(','));
  toiRows.push([uuid('e5100001', toiSeq), toId, productId, passedQty, passedQty, toStatus==='Delivered'?passedQty:0, '', ts, 'admin', ts, 'admin'].join(','));
  toiSeq++;
  toSeq++;

  if (!isCompleted) return; // 배송중이면 여기서 끝

  // --- 6. StoreReceipt ---
  const srId = uuid('e6000001', srSeq);
  const damagedQty = rand(0, Math.floor(passedQty * 0.03)); // 0~3% 파손
  srRows.push([srId, 'SR-2024'+String(rand(100,999))+'-'+String(srSeq).padStart(4,'0'), toId, storeId, 'Received', '점포담당'+rand(1,5), dateFmt(2024, Math.min(12, orderMonth+2), rand(1,28))+'T14:00:00Z', passedQty-damagedQty, damagedQty, '', ts, 'admin', ts, 'admin'].join(','));
  sriRows.push([uuid('e6100001', sriSeq), srId, productId, passedQty, passedQty-damagedQty, damagedQty, damagedQty > 0 ? '일부 파손' : '정상', ts, 'admin', ts, 'admin'].join(','));
  sriSeq++;
  srSeq++;
});

// CSV 저장
const headers = {
  io: 'ID,orderNumber,supplier_ID,dc_ID,purchaseOrder_ID,status,orderDate,expectedDate,arrivedDate,totalAmount,requestedBy,note,createdAt,createdBy,modifiedAt,modifiedBy',
  ioi: 'ID,inboundOrder_ID,product_ID,material_ID,orderedQty,receivedQty,unitPrice,totalPrice,note,createdAt,createdBy,modifiedAt,modifiedBy',
  gr: 'ID,grNumber,inboundOrder_ID,dc_ID,status,inspectedBy,inspectedAt,totalPassedQty,totalRejectedQty,rejectReason,note,createdAt,createdBy,modifiedAt,modifiedBy',
  gri: 'ID,goodsReceipt_ID,product_ID,orderedQty,passedQty,rejectedQty,inspectionNote,createdAt,createdBy,modifiedAt,modifiedBy',
  iv: 'ID,invoiceNumber,supplier_ID,goodsReceipt_ID,purchaseOrder_ID,status,invoiceDate,dueDate,paidDate,subtotal,taxRate,taxAmount,totalAmount,paymentMethod,paymentRef,note,createdAt,createdBy,modifiedAt,modifiedBy',
  ivi: 'ID,invoice_ID,product_ID,quantity,unitPrice,amount,taxAmount,note,createdAt,createdBy,modifiedAt,modifiedBy',
  to: 'ID,toNumber,dc_ID,store_ID,status,priority,createdDate,pickedDate,shippedDate,deliveredDate,totalQty,carrier,trackingNo,note,createdAt,createdBy,modifiedAt,modifiedBy',
  toi: 'ID,transferOrder_ID,product_ID,requestedQty,pickedQty,shippedQty,note,createdAt,createdBy,modifiedAt,modifiedBy',
  sr: 'ID,srNumber,transferOrder_ID,store_ID,status,receivedBy,receivedAt,totalReceivedQty,totalDamagedQty,note,createdAt,createdBy,modifiedAt,modifiedBy',
  sri: 'ID,storeReceipt_ID,product_ID,expectedQty,receivedQty,damagedQty,note,createdAt,createdBy,modifiedAt,modifiedBy'
};

fs.writeFileSync(path.join(dataDir,'com.inventory-InboundOrders.csv'), headers.io+'\n'+ioRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-InboundOrderItems.csv'), headers.ioi+'\n'+ioiRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-GoodsReceipts.csv'), headers.gr+'\n'+grRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-GoodsReceiptItems.csv'), headers.gri+'\n'+griRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-Invoices.csv'), headers.iv+'\n'+ivRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-InvoiceItems.csv'), headers.ivi+'\n'+iviRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-TransferOrders.csv'), headers.to+'\n'+toRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-TransferOrderItems.csv'), headers.toi+'\n'+toiRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-StoreReceipts.csv'), headers.sr+'\n'+srRows.join('\n')+'\n');
fs.writeFileSync(path.join(dataDir,'com.inventory-StoreReceiptItems.csv'), headers.sri+'\n'+sriRows.join('\n')+'\n');

console.log('✅ InboundOrders:', ioRows.length, 'Items:', ioiRows.length);
console.log('✅ GoodsReceipts:', grRows.length, 'Items:', griRows.length);
console.log('✅ Invoices:', ivRows.length, 'Items:', iviRows.length);
console.log('✅ TransferOrders:', toRows.length, 'Items:', toiRows.length);
console.log('✅ StoreReceipts:', srRows.length, 'Items:', sriRows.length);
console.log('\n🎉 PO 기반 연계 데이터 생성 완료! (PO→IO→GR→IV→TO→SR)');
console.log('   cds watch 재시작하면 반영됩니다.\n');
