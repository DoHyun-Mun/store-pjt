async function loadDashboardData() {
    // KPI counts
    const kpis = [
        { id: 'kpi-products', entity: 'Products' },
        { id: 'kpi-stores', entity: 'Stores' },
        { id: 'kpi-inventories', entity: 'Inventories' },
        { id: 'kpi-purchaseorders', entity: 'PurchaseOrders' },
        { id: 'kpi-suppliers', entity: 'Suppliers' },
        { id: 'kpi-customers', entity: 'Customers' }
    ];
    for (const kp of kpis) {
        try {
            const r = await fetch(`/inventory/${kp.entity}/$count`);
            if (r.ok) { const c = await r.text(); document.getElementById(kp.id).textContent = Number(c).toLocaleString(); }
        } catch(e) {}
    }

    // Charts
    await loadSalesChart();
    await loadInventoryChart();
    await loadOrdersChart();

    // Shortcuts
    renderShortcuts();
    await loadSupplyChainGraph();
}

async function loadSalesChart() {
    try {
        const res = await fetch("/inventory/DailySales?$orderby=salesDate desc&$select=salesDate,revenue&$top=175");

        if (!res.ok) return;
        const data = await res.json();
        const items = data.value || [];
        // Aggregate by date
        const dateMap = {};
        items.forEach(i => {
            const d = i.salesDate;
            dateMap[d] = (dateMap[d] || 0) + parseFloat(i.revenue);
        });
        const dates = Object.keys(dateMap).sort().slice(-7);
        const values = dates.map(d => dateMap[d]);
        const labels = dates.map(d => { const p = d.split('-'); return `${p[1]}/${p[2]}`; });

        if (salesChart) salesChart.destroy();
        salesChart = new Chart(document.getElementById('chartSales'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '매출액',
                    data: values,
                    borderColor: '#0070F2',
                    backgroundColor: 'rgba(0,112,242,0.08)',
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointBackgroundColor: '#0070F2',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => `₩${ctx.raw.toLocaleString()}` } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { callback: v => `₩${(v/10000).toFixed(0)}만` }, grid: { color: '#F0F0F0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch(e) { console.warn('매출 차트 실패:', e); }
}

async function loadInventoryChart() {
    try {
        // Inventories 테이블에서 점포별 재고 집계
        const res = await fetch("/inventory/Inventories?$select=store_ID,quantity,availableQty&$top=500");

        if (!res.ok) return;
        const data = await res.json();
        const items = data.value || [];
        // 점포별 집계
        const storeMap = {};
        items.forEach(i => {
            const s = i.store_ID || 'unknown';
            if (!storeMap[s]) storeMap[s] = { total: 0, available: 0 };
            storeMap[s].total += parseInt(i.quantity) || 0;
            storeMap[s].available += parseInt(i.availableQty) || 0;
        });
        // 상위 7개 점포만 표시
        const sorted = Object.entries(storeMap).sort((a, b) => b[1].total - a[1].total).slice(0, 7);
        const totals = sorted.map(([_, v]) => v.total);
        const avails = sorted.map(([_, v]) => v.available);
        const labels = sorted.map(([_, __], idx) => `점포${idx + 1}`);

        if (inventoryChart) inventoryChart.destroy();
        inventoryChart = new Chart(document.getElementById('chartInventory'), {
            type: 'line',
            data: {
                labels,
                datasets: [
                    { label: '총 재고', data: totals, borderColor: '#188038', backgroundColor: 'rgba(24,128,56,0.08)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#188038', tension: 0.3, fill: true },
                    { label: '가용 재고', data: avails, borderColor: '#E37400', backgroundColor: 'rgba(227,116,0,0.06)', borderWidth: 2, pointRadius: 3, pointBackgroundColor: '#E37400', tension: 0.3, fill: true, borderDash: [5,3] }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#F0F0F0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } catch(e) { console.warn('재고 차트 실패:', e); }
}

async function loadOrdersChart() {
    try {
        const res = await fetch('/inventory/PurchaseOrders?$select=status');
        if (!res.ok) return;
        const data = await res.json();
        const items = data.value || [];
        const statusMap = {};
        items.forEach(i => { statusMap[i.status] = (statusMap[i.status] || 0) + 1; });

        const statusLabels = { Draft: '초안', Submitted: '제출됨', Approved: '승인', Rejected: '반려', Received: '입고완료' };
        const statusColors = { Draft: '#8396A8', Submitted: '#1A73E8', Approved: '#188038', Rejected: '#D93025', Received: '#7B2FF2' };

        const labels = Object.keys(statusMap).map(s => statusLabels[s] || s);
        const values = Object.values(statusMap);
        const colors = Object.keys(statusMap).map(s => statusColors[s] || '#999');

        if (ordersChart) ordersChart.destroy();
        ordersChart = new Chart(document.getElementById('chartOrders'), {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
                    tooltip: { callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}건 (${((ctx.raw/items.length)*100).toFixed(1)}%)` } }
                },
                cutout: '60%'
            }
        });
    } catch(e) { console.warn('발주 차트 실패:', e); }
}

function renderShortcuts() {
    const grid = document.getElementById('shortcutGrid');
    if (!grid) return;
    const sc = [
        { icon: '🏷️', title: '상품 관리', url: '/products/webapp/index.html' },
        { icon: '🏪', title: '점포 관리', url: '/stores/webapp/index.html' },
        { icon: '📊', title: '재고 관리', url: '/inventories/webapp/index.html' },
        { icon: '📋', title: '발주 관리', url: '/purchaseorders/webapp/index.html' },
        { icon: '🏭', title: '물류센터', url: '/distributioncenters/webapp/index.html' },
        { icon: '📥', title: '입고오더', url: '/inboundorders/webapp/index.html' },
        { icon: '✅', title: '입고검수', url: '/goodsreceipts/webapp/index.html' },
        { icon: '📄', title: '인보이스', url: '/invoices/webapp/index.html' },
        { icon: '🚛', title: '배송지시', url: '/transferorders/webapp/index.html' },
        { icon: '📦', title: '점포입고', url: '/storereceipts/webapp/index.html' },
        { icon: '👤', title: '고객 관리', url: '/customers/webapp/index.html' },
        { icon: '💰', title: '일별 매출', url: '/dailysales/webapp/index.html' },
        { icon: '🔮', title: '수요 예측', url: '/demandforecasts/webapp/index.html' },
        { icon: '⚠️', title: '이탈 예측', url: '/churnpredictions/webapp/index.html' },
        { icon: '🎯', title: '고객 세분화', url: '/customersegments/webapp/index.html' },
        { icon: '🚨', title: '매출 이상 탐지', url: '/salesanomalies/webapp/index.html' }
    ];
    grid.innerHTML = sc.map(s => `<a class="shortcut-card" onclick="showContentFrame('${s.url}')">${s.icon} ${s.title}</a>`).join('');
}
