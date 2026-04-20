/**
 * InventoryService - 커스텀 핸들러
 * 점포 상품별 재고 발주 관리 시스템 비즈니스 로직
 */
const cds = require('@sap/cds');
const LOG = cds.log('InventoryService');

module.exports = cds.service.impl(async function () {
  const {
    Categories, Products, Inventories, PurchaseOrders, Stores,
    Suppliers, Materials, StoreProducts, ProductMaterials,
    SupplyOrders, SupplyOrderItems,
    Customers, CustomerPurchases, CustomerPurchaseItems,
    DailySales, InventorySnapshots, DemandForecasts, OrderRecommendations
  } = this.entities;

  // ════════════════════════════════════════════════════════════════════
  // PurchaseOrders - BEFORE CREATE: 발주 번호 자동 채번 + totalAmount 계산
  // ════════════════════════════════════════════════════════════════════
  this.before('CREATE', PurchaseOrders, async (req) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;

    const result = await SELECT.one
      .from(PurchaseOrders)
      .columns('count(*) as cnt')
      .where`poNumber like ${'PO-' + dateStr + '%'}`;

    const seq = String((result?.cnt || 0) + 1).padStart(4, '0');
    req.data.poNumber = `PO-${dateStr}-${seq}`;

    if (!req.data.status) req.data.status = 'Draft';
    if (!req.data.quantity || req.data.quantity < 1) {
      return req.error(400, '발주 수량은 1 이상이어야 합니다.');
    }
    // totalAmount 자동 계산
    if (req.data.unitPrice && req.data.quantity) {
      req.data.totalAmount = req.data.unitPrice * req.data.quantity;
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // PurchaseOrders - BEFORE UPDATE: 상태 직접 변경 방지 + totalAmount 재계산
  // ════════════════════════════════════════════════════════════════════
  this.before('UPDATE', PurchaseOrders, async (req) => {
    if (req.data.status) {
      const existing = await SELECT.one.from(PurchaseOrders).where({ ID: req.data.ID });
      if (existing && req.data.status !== existing.status) {
        return req.error(400, '상태는 직접 변경할 수 없습니다. 승인 요청/승인/반려/입고 처리 버튼을 사용하세요.');
      }
    }
    // totalAmount 재계산
    if (req.data.unitPrice != null || req.data.quantity != null) {
      const existing = await SELECT.one.from(PurchaseOrders).where({ ID: req.data.ID });
      if (existing) {
        const qty = req.data.quantity ?? existing.quantity;
        const price = req.data.unitPrice ?? existing.unitPrice;
        req.data.totalAmount = (price || 0) * (qty || 0);
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // SupplyOrders - BEFORE CREATE: 주문 번호 자동 채번
  // ════════════════════════════════════════════════════════════════════
  this.before('CREATE', SupplyOrders, async (req) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;

    const result = await SELECT.one
      .from(SupplyOrders)
      .columns('count(*) as cnt')
      .where`orderNumber like ${'SO-' + dateStr + '%'}`;

    const seq = String((result?.cnt || 0) + 1).padStart(4, '0');
    req.data.orderNumber = `SO-${dateStr}-${seq}`;

    if (!req.data.status) req.data.status = 'Draft';
    if (!req.data.orderDate) req.data.orderDate = new Date().toISOString().split('T')[0];
  });

  // ════════════════════════════════════════════════════════════════════
  // SupplyOrderItems - BEFORE CREATE/UPDATE: totalPrice 자동 계산
  // ════════════════════════════════════════════════════════════════════
  this.before(['CREATE', 'UPDATE'], SupplyOrderItems, async (req) => {
    if (req.data.unitPrice != null && req.data.quantity != null) {
      req.data.totalPrice = req.data.unitPrice * req.data.quantity;
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // Inventories - AFTER READ: availableQty 계산
  // ════════════════════════════════════════════════════════════════════
  this.after('READ', Inventories, (data) => {
    const items = Array.isArray(data) ? data : [data];
    items.forEach(item => {
      if (item) {
        item.availableQty = (item.quantity || 0) - (item.reservedQty || 0);
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════
  // Inventories - AFTER CREATE/UPDATE: 재고 부족 경고
  // ════════════════════════════════════════════════════════════════════
  this.after(['CREATE', 'UPDATE'], Inventories, async (data, req) => {
    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return;

    const availableQty = (item.quantity || 0) - (item.reservedQty || 0);
    if (item.product_ID) {
      const product = await SELECT.one.from(Products).where({ ID: item.product_ID });
      if (product && product.safetyStock && availableQty < product.safetyStock) {
        req.warn(
          `재고 부족 경고: ${product.name || product.productCode} - 가용 수량(${availableQty})이 안전 재고(${product.safetyStock}) 미만입니다.`
        );
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // Inventories - BEFORE CREATE: 중복 재고 레코드 방지 (product + store + warehouse)
  // ════════════════════════════════════════════════════════════════════
  this.before('CREATE', Inventories, async (req) => {
    if (req.data.product_ID && req.data.warehouse) {
      const where = {
        product_ID: req.data.product_ID,
        warehouse: req.data.warehouse
      };
      if (req.data.store_ID) where.store_ID = req.data.store_ID;

      const existing = await SELECT.one.from(Inventories).where(where);
      if (existing) {
        return req.error(400, `동일한 상품/점포/창고 조합의 재고 레코드가 이미 존재합니다. (ID: ${existing.ID})`);
      }
    }
    if (req.data.quantity != null && req.data.quantity < 0) {
      return req.error(400, '재고 수량은 0 이상이어야 합니다.');
    }
  });

  this.before('UPDATE', Inventories, async (req) => {
    if (req.data.quantity != null && req.data.quantity < 0) {
      return req.error(400, '재고 수량은 0 이상이어야 합니다.');
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: submitOrder (Draft → Submitted)
  // ════════════════════════════════════════════════════════════════════
  this.on('submitOrder', PurchaseOrders, async (req) => {
    const { ID } = req.params[0];
    const po = await SELECT.one.from(PurchaseOrders).where({ ID });
    if (!po) return req.error(404, `발주를 찾을 수 없습니다: ${ID}`);
    if (po.status !== 'Draft') {
      return req.error(400, `승인 요청은 'Draft' 상태에서만 가능합니다. (현재: ${po.status})`);
    }
    await UPDATE(PurchaseOrders).set({ status: 'Submitted' }).where({ ID });
    const updated = await SELECT.one.from(PurchaseOrders).where({ ID });
    req.info(`발주 ${po.poNumber}이(가) 승인 요청되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: approveOrder (Submitted → Approved)
  // ════════════════════════════════════════════════════════════════════
  this.on('approveOrder', PurchaseOrders, async (req) => {
    const { ID } = req.params[0];
    const po = await SELECT.one.from(PurchaseOrders).where({ ID });
    if (!po) return req.error(404, `발주를 찾을 수 없습니다: ${ID}`);
    if (po.status !== 'Submitted') {
      return req.error(400, `승인은 'Submitted' 상태에서만 가능합니다. (현재: ${po.status})`);
    }
    await UPDATE(PurchaseOrders).set({
      status: 'Approved',
      approvedBy: req.user?.id || 'system',
      approvedAt: new Date().toISOString()
    }).where({ ID });
    const updated = await SELECT.one.from(PurchaseOrders).where({ ID });
    req.info(`발주 ${po.poNumber}이(가) 승인되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: rejectOrder (Submitted → Rejected)
  // ════════════════════════════════════════════════════════════════════
  this.on('rejectOrder', PurchaseOrders, async (req) => {
    const { ID } = req.params[0];
    const { reason } = req.data || {};
    const po = await SELECT.one.from(PurchaseOrders).where({ ID });
    if (!po) return req.error(404, `발주를 찾을 수 없습니다: ${ID}`);
    if (po.status !== 'Submitted') {
      return req.error(400, `반려는 'Submitted' 상태에서만 가능합니다. (현재: ${po.status})`);
    }
    await UPDATE(PurchaseOrders).set({
      status: 'Rejected',
      approvedBy: req.user?.id || 'system',
      approvedAt: new Date().toISOString(),
      note: reason ? `반려 사유: ${reason}` : (po.note || '')
    }).where({ ID });
    const updated = await SELECT.one.from(PurchaseOrders).where({ ID });
    req.info(`발주 ${po.poNumber}이(가) 반려되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: receiveOrder (Approved → Received, 재고 반영)
  // ════════════════════════════════════════════════════════════════════
  this.on('receiveOrder', PurchaseOrders, async (req) => {
    const { ID } = req.params[0];
    const { warehouse } = req.data || {};
    const po = await SELECT.one.from(PurchaseOrders).where({ ID });
    if (!po) return req.error(404, `발주를 찾을 수 없습니다: ${ID}`);
    if (po.status !== 'Approved') {
      return req.error(400, `입고 처리는 'Approved' 상태에서만 가능합니다. (현재: ${po.status})`);
    }

    const targetWarehouse = warehouse || 'WH-DEFAULT';
    const now = new Date().toISOString();

    await UPDATE(PurchaseOrders).set({
      status: 'Received',
      receivedDate: now.split('T')[0]
    }).where({ ID });

    // 재고 반영: product + store + warehouse
    const invWhere = { product_ID: po.product_ID, warehouse: targetWarehouse };
    if (po.store_ID) invWhere.store_ID = po.store_ID;

    const inventory = await SELECT.one.from(Inventories).where(invWhere);

    if (inventory) {
      await UPDATE(Inventories).set({
        quantity: inventory.quantity + po.quantity,
        lastUpdated: now
      }).where({ ID: inventory.ID });
      LOG.info(`재고 업데이트: ${targetWarehouse} +${po.quantity} (총: ${inventory.quantity + po.quantity})`);
    } else {
      await INSERT.into(Inventories).entries({
        ID: cds.utils.uuid(),
        product_ID: po.product_ID,
        store_ID: po.store_ID || null,
        warehouse: targetWarehouse,
        quantity: po.quantity,
        reservedQty: 0,
        availableQty: po.quantity,
        lastUpdated: now
      });
      LOG.info(`신규 재고 생성: ${targetWarehouse} 수량 ${po.quantity}`);
    }

    const updated = await SELECT.one.from(PurchaseOrders).where({ ID });
    req.info(`발주 ${po.poNumber} 입고 처리 완료. 창고: ${targetWarehouse}, 수량: ${po.quantity}`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: confirmOrder (Draft → Confirmed) - SupplyOrders
  // ════════════════════════════════════════════════════════════════════
  this.on('confirmOrder', SupplyOrders, async (req) => {
    const { ID } = req.params[0];
    const so = await SELECT.one.from(SupplyOrders).where({ ID });
    if (!so) return req.error(404, `공급 주문을 찾을 수 없습니다: ${ID}`);
    if (so.status !== 'Draft') {
      return req.error(400, `주문 확정은 'Draft' 상태에서만 가능합니다. (현재: ${so.status})`);
    }

    // items totalAmount 합산
    const items = await SELECT.from(SupplyOrderItems).where({ supplyOrder_ID: ID });
    const total = items.reduce((sum, it) => sum + (it.totalPrice || 0), 0);

    await UPDATE(SupplyOrders).set({ status: 'Confirmed', totalAmount: total }).where({ ID });
    const updated = await SELECT.one.from(SupplyOrders).where({ ID });
    req.info(`공급 주문 ${so.orderNumber}이(가) 확정되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: shipOrder (Confirmed → Shipped) - SupplyOrders
  // ════════════════════════════════════════════════════════════════════
  this.on('shipOrder', SupplyOrders, async (req) => {
    const { ID } = req.params[0];
    const so = await SELECT.one.from(SupplyOrders).where({ ID });
    if (!so) return req.error(404, `공급 주문을 찾을 수 없습니다: ${ID}`);
    if (so.status !== 'Confirmed') {
      return req.error(400, `출하는 'Confirmed' 상태에서만 가능합니다. (현재: ${so.status})`);
    }
    await UPDATE(SupplyOrders).set({ status: 'Shipped' }).where({ ID });
    const updated = await SELECT.one.from(SupplyOrders).where({ ID });
    req.info(`공급 주문 ${so.orderNumber}이(가) 출하되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: deliverOrder (Shipped → Delivered, 재고 반영) - SupplyOrders
  // ════════════════════════════════════════════════════════════════════
  this.on('deliverOrder', SupplyOrders, async (req) => {
    const { ID } = req.params[0];
    const so = await SELECT.one.from(SupplyOrders).where({ ID });
    if (!so) return req.error(404, `공급 주문을 찾을 수 없습니다: ${ID}`);
    if (so.status !== 'Shipped') {
      return req.error(400, `배송 완료는 'Shipped' 상태에서만 가능합니다. (현재: ${so.status})`);
    }

    const now = new Date().toISOString();
    await UPDATE(SupplyOrders).set({
      status: 'Delivered',
      deliveredDate: now.split('T')[0]
    }).where({ ID });

    // 각 품목에 대해 재고 반영
    const items = await SELECT.from(SupplyOrderItems).where({ supplyOrder_ID: ID });
    for (const item of items) {
      if (!item.product_ID) continue;
      const invWhere = { product_ID: item.product_ID };
      if (so.store_ID) invWhere.store_ID = so.store_ID;

      const inv = await SELECT.one.from(Inventories).where(invWhere);
      if (inv) {
        const newQty = so.orderType === 'RETURN'
          ? Math.max(0, inv.quantity - item.quantity)
          : inv.quantity + item.quantity;
        await UPDATE(Inventories).set({ quantity: newQty, lastUpdated: now }).where({ ID: inv.ID });
      } else if (so.orderType !== 'RETURN') {
        await INSERT.into(Inventories).entries({
          ID: cds.utils.uuid(),
          product_ID: item.product_ID,
          store_ID: so.store_ID || null,
          warehouse: 'WH-DEFAULT',
          quantity: item.quantity,
          reservedQty: 0,
          lastUpdated: now
        });
      }
    }

    const updated = await SELECT.one.from(SupplyOrders).where({ ID });
    req.info(`공급 주문 ${so.orderNumber} 배송 완료. 재고가 반영되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Action: cancelOrder (Draft/Confirmed → Cancelled) - SupplyOrders
  // ════════════════════════════════════════════════════════════════════
  this.on('cancelOrder', SupplyOrders, async (req) => {
    const { ID } = req.params[0];
    const { reason } = req.data || {};
    const so = await SELECT.one.from(SupplyOrders).where({ ID });
    if (!so) return req.error(404, `공급 주문을 찾을 수 없습니다: ${ID}`);
    if (!['Draft', 'Confirmed'].includes(so.status)) {
      return req.error(400, `주문 취소는 'Draft' 또는 'Confirmed' 상태에서만 가능합니다. (현재: ${so.status})`);
    }
    await UPDATE(SupplyOrders).set({
      status: 'Cancelled',
      note: reason ? `취소 사유: ${reason}` : (so.note || '')
    }).where({ ID });
    const updated = await SELECT.one.from(SupplyOrders).where({ ID });
    req.info(`공급 주문 ${so.orderNumber}이(가) 취소되었습니다.`);
    return updated;
  });

  // ════════════════════════════════════════════════════════════════════
  // Products - BEFORE CREATE/UPDATE: 마진율 기반 판매가 자동 계산
  // ════════════════════════════════════════════════════════════════════
  this.before(['CREATE', 'UPDATE'], Products, async (req) => {
    const d = req.data;
    // costPrice 또는 marginRate가 변경되면 sellingPrice 자동 계산
    if (d.costPrice != null || d.marginRate != null) {
      let costPrice = d.costPrice;
      let marginRate = d.marginRate;

      // UPDATE 시 기존 값 보완
      if (costPrice == null || marginRate == null) {
        const existing = await SELECT.one.from(Products).where({ ID: d.ID });
        if (existing) {
          if (costPrice == null) costPrice = existing.costPrice;
          if (marginRate == null) marginRate = existing.marginRate;
        }
      }

      costPrice = Number(costPrice) || 0;
      marginRate = Number(marginRate) || 0;

      // 판매가 = 원가 × (1 + 마진율/100), 소수점 이하 반올림
      req.data.sellingPrice = Math.round(costPrice * (1 + marginRate / 100));
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // Products - AFTER READ: placeholder
  // ════════════════════════════════════════════════════════════════════
  this.after('READ', Products, (data) => {
    // Placeholder for future enhancements
  });

  // ════════════════════════════════════════════════════════════════════
  // CustomerPurchases - BEFORE CREATE: 구매 번호 자동 채번 + totalAmount 계산
  // ════════════════════════════════════════════════════════════════════
  this.before('CREATE', CustomerPurchases, async (req) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;

    const result = await SELECT.one
      .from(CustomerPurchases)
      .columns('count(*) as cnt')
      .where`purchaseNumber like ${'CP-' + dateStr + '%'}`;

    const seq = String((result?.cnt || 0) + 1).padStart(4, '0');
    req.data.purchaseNumber = `CP-${dateStr}-${seq}`;

    if (!req.data.purchaseDate) {
      req.data.purchaseDate = new Date().toISOString();
    }

    // items totalPrice & totalAmount 자동 계산
    if (req.data.items && req.data.items.length > 0) {
      let total = 0;
      for (const item of req.data.items) {
        item.totalPrice = (item.unitPrice || 0) * (item.quantity || 1) - (item.discount || 0);
        total += item.totalPrice;
      }
      req.data.totalAmount = total;
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // CustomerPurchases - AFTER CREATE: 고객 통계 업데이트
  // ════════════════════════════════════════════════════════════════════
  this.after('CREATE', CustomerPurchases, async (data, req) => {
    if (data.customer_ID) {
      try {
        const customer = await SELECT.one.from(Customers).where({ ID: data.customer_ID });
        if (customer) {
          await UPDATE(Customers).where({ ID: data.customer_ID }).set({
            totalPurchaseAmount: (customer.totalPurchaseAmount || 0) + (data.totalAmount || 0),
            visitCount: (customer.visitCount || 0) + 1,
            lastVisitDate: new Date().toISOString().split('T')[0]
          });
        }
      } catch (e) {
        LOG.error('고객 통계 업데이트 실패:', e.message);
      }
    }
  });

  // ════════════════════════════════════════════════════════════════════
  // Customers - BEFORE CREATE: 고객 번호 자동 채번
  // ════════════════════════════════════════════════════════════════════
  this.before('CREATE', Customers, async (req) => {
    if (!req.data.customerCode) {
      const result = await SELECT.one
        .from(Customers)
        .columns('count(*) as cnt');
      const seq = String((result?.cnt || 0) + 1).padStart(5, '0');
      req.data.customerCode = `CUST-${seq}`;
    }
    if (!req.data.registeredAt) {
      req.data.registeredAt = new Date().toISOString().split('T')[0];
    }
  });
});
