/* AI Dashboard */
var salesForecastChart = null;

async function loadDashboardData() {
    await Promise.all([
        loadDynamicKPIs(),
        loadAIInsights(),
        loadSalesForecastChart(),
        loadStoreHealthMap(),
        loadOrderRecommendations(),
        loadAnomalyDetections(),
    ]);
    renderShortcuts();
    await loadSupplyChainGraph();
}

async function loadDynamicKPIs() {
    try {
        var res = await fetch("/inventory/getDashboardKPIs()");
        if (!res.ok) throw new Error("KPI fetch failed: " + res.status);
        var data = await res.json();
        var rev = data.todayRevenue || 0;
        var revEl = document.getElementById("kpi-revenue");
        if (rev >= 100000000) revEl.textContent = "\u20A9" + (rev / 100000000).toFixed(1) + "\uC5B5";
        else if (rev >= 10000) revEl.textContent = "\u20A9" + (rev / 10000).toFixed(0) + "\uB9CC";
        else revEl.textContent = "\u20A9" + rev.toLocaleString();
        var changeEl = document.getElementById("kpi-revenue-change");
        var change = data.revenueChange || 0;
        if (change >= 0) { changeEl.textContent = "\u2191 \uC804\uC77C \uB300\uBE44 +" + change.toFixed(1) + "%"; changeEl.className = "kpi-change up"; }
        else { changeEl.textContent = "\u2193 \uC804\uC77C \uB300\uBE44 " + change.toFixed(1) + "%"; changeEl.className = "kpi-change down"; }
        document.getElementById("kpi-health").textContent = (data.healthScore || 0) + "\uC810";
        var hEl = document.getElementById("kpi-health-change");
        var hc = data.healthChange || 0;
        if (hc >= 0) { hEl.textContent = "\u2191 " + hc; hEl.className = "kpi-change up"; }
        else { hEl.textContent = "\u2193 " + Math.abs(hc); hEl.className = "kpi-change down"; }
        document.getElementById("kpi-stockout").textContent = (data.stockoutRisk || 0) + "\uAC74";
        document.getElementById("kpi-pending").textContent = (data.pendingOrders || 0) + "\uAC74";
    } catch (e) {
        console.warn("KPI load fail:", e);
        document.getElementById("kpi-revenue").textContent = "-";
        document.getElementById("kpi-health").textContent = "-";
        document.getElementById("kpi-stockout").textContent = "-";
        document.getElementById("kpi-pending").textContent = "-";
    }
}

async function loadAIInsights() {
    var c = document.getElementById("aiInsightsRow");
    try {
        var res = await fetch("/inventory/getAIInsights()");
        if (!res.ok) throw new Error("fail " + res.status);
        var data = await res.json();
        var items = data.value || data || [];
        if (!items.length) { c.innerHTML = '<div class="ai-insight-card"><div class="insight-title">AI \uBAA8\uB2C8\uD130\uB9C1 \uC911...</div></div>'; return; }
        c.innerHTML = items.map(function (it) {
            var icon = "\uD83D\uDCA1";
            if (it.type === "STOCKOUT") icon = "\uD83D\uDEA8";
            else if (it.type === "ALERT") icon = "\u26A0\uFE0F";
            else if (it.type === "OPPORTUNITY") icon = "\uD83D\uDCC8";
            else if (it.type === "RECOMMEND") icon = "\uD83C\uDFAF";
            return '<div class="ai-insight-card severity-' + it.severity + '">' +
                '<span class="insight-badge ' + it.severity + '">' + icon + " " + it.severity + '</span>' +
                '<div class="insight-title">' + it.title + '</div>' +
                '<div class="insight-desc">' + it.description + '</div>' +
                '<div class="insight-metrics">' +
                '<div class="insight-metric"><span class="insight-metric-label">' + (it.metric1Label || "") + '</span><span class="insight-metric-value">' + (it.metric1Value || "") + '</span></div>' +
                '<div class="insight-metric"><span class="insight-metric-label">' + (it.metric2Label || "") + '</span><span class="insight-metric-value">' + (it.metric2Value || "") + '</span></div>' +
                '</div>' +
                '<a class="insight-action" onclick="showContentFrame(\'' + (it.actionUrl || "#") + '\')">' + (it.actionLabel || "\uC0C1\uC138 \uBCF4\uAE30") + ' \u2192</a>' +
                '</div>';
        }).join("");
    } catch (e) { console.warn("Insights fail:", e); c.innerHTML = '<div class="ai-insight-card"><div class="insight-desc">\uB85C\uB4DC \uC2E4\uD328</div></div>'; }
}

async function loadSalesForecastChart() {
    try {
        var res = await fetch("/inventory/getSalesForecastTrend()");
        if (!res.ok) throw new Error("fail");
        var data = await res.json();
        var items = data.value || data || [];
        if (!items.length) return;
        var labels = items.map(function (d) { var p = d.date.split("-"); return p[1] + "/" + p[2]; });
        var actuals = items.map(function (d) { return d.actual; });
        var forecasts = items.map(function (d) { return d.forecast; });
        var confLow = items.map(function (d) { return d.confidenceLow; });
        var confHigh = items.map(function (d) { return d.confidenceHigh; });
        var canvas = document.getElementById("chartSalesForecast");
        if (!canvas) return;
        if (salesForecastChart) salesForecastChart.destroy();
        salesForecastChart = new Chart(canvas, {
            type: "line",
            data: {
                labels: labels, datasets: [
                    { label: "\uC2E4\uC801", data: actuals, borderColor: "#0070F2", backgroundColor: "rgba(0,112,242,0.08)", borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: "#0070F2", tension: 0.3, fill: true, spanGaps: false },
                    { label: "AI \uC608\uCE21", data: forecasts, borderColor: "#7B2FF2", backgroundColor: "rgba(123,47,242,0.05)", borderWidth: 2, borderDash: [6, 3], pointRadius: 3, pointBackgroundColor: "#7B2FF2", tension: 0.3, fill: false, spanGaps: false },
                    { label: "CI-H", data: confHigh, borderColor: "transparent", backgroundColor: "rgba(123,47,242,0.08)", borderWidth: 0, pointRadius: 0, fill: "+1", spanGaps: false },
                    { label: "CI-L", data: confLow, borderColor: "transparent", backgroundColor: "transparent", borderWidth: 0, pointRadius: 0, fill: false, spanGaps: false }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: "bottom", labels: { boxWidth: 12, padding: 10, font: { size: 10 }, filter: function (i) { return i.text !== "CI-H" && i.text !== "CI-L"; } } },
                    tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ": " + (ctx.raw ? ctx.raw.toLocaleString() : "-"); } } }
                },
                scales: {
                    y: { beginAtZero: false, ticks: { callback: function (v) { return (v / 10000).toFixed(0) + "\uB9CC"; }, font: { size: 9 } }, grid: { color: "#F0F0F0" } },
                    x: { grid: { display: false }, ticks: { font: { size: 9 } } }
                }
            }
        });
        var infoEl = document.getElementById("forecastReason");
        if (infoEl) {
            var actualVals = actuals.filter(function (v) { return v !== null && v !== undefined; });
            var forecastVals = forecasts.filter(function (v) { return v !== null && v !== undefined; });
            if (actualVals.length > 0 && forecastVals.length > 0) {
                var lastActual = actualVals[actualVals.length - 1];
                var avgForecast = forecastVals.reduce(function (s, v) { return s + v; }, 0) / forecastVals.length;
                var changeRate = lastActual > 0 ? ((avgForecast - lastActual) / lastActual * 100).toFixed(1) : 0;
                var arrow = changeRate >= 0 ? "\uD83D\uDCC8" : "\uD83D\uDCC9";
                var color = changeRate >= 0 ? "#188038" : "#D93025";
                var reasons = [];
                var today = new Date();
                var dow = today.getDay();
                if (dow === 5 || dow === 6 || dow === 0) reasons.push("\uC8FC\uB9D0/\uAE08\uC694\uC77C \uC18C\uBE44 \uD65C\uC131\uD654");
                var month = today.getMonth() + 1;
                if (month >= 3 && month <= 5) reasons.push("\uBD04 \uC2DC\uC98C \uC218\uC694 \uC99D\uAC00");
                else if (month >= 9 && month <= 11) reasons.push("\uAC00\uC744 \uC2DC\uC98C");
                reasons.push("\uCD5C\uADFC \uD310\uB9E4 \uCD94\uC138 \uBC18\uC601");
                infoEl.innerHTML = '<span style="color:' + color + ';font-weight:700;">' + arrow + ' \uC2E4\uC801 \uB300\uBE44 ' + changeRate + '% ' + (changeRate >= 0 ? '\uC0C1\uC2B9' : '\uD558\uB77D') + ' \uC608\uCE21</span>' +
                    '<span style="margin-left:0.75rem;color:#556B82;">\uD83D\uDCA1 \uADFC\uAC70: ' + reasons.join(' \u00B7 ') + '</span>';
                infoEl.style.display = "block";
            }
        }
    } catch (e) { console.warn("Chart fail:", e); }
}

async function loadStoreHealthMap() {
    var c = document.getElementById("storeHealthGrid");
    try {
        var res = await fetch("/inventory/getStoreHealthScores()");
        if (!res.ok) throw new Error("fail");
        var data = await res.json();
        var stores = data.value || data || [];
        if (!stores.length) { c.innerHTML = '<div class="skeleton">\uC810\uD3EC \uB370\uC774\uD130 \uC5C6\uC74C</div>'; return; }
        c.innerHTML = stores.map(function (s) {
            var icon = s.status === "GREEN" ? "\uD83D\uDFE2" : s.status === "YELLOW" ? "\uD83D\uDFE1" : "\uD83D\uDD34";
            return '<div class="store-health-item ' + s.status + '" onclick="showContentFrame(\'/inventories/webapp/index.html\')" title="' + s.storeName + " (" + s.city + ") - " + s.score + '\uC810">' +
                '<div class="sh-icon">' + icon + '</div>' +
                '<div class="sh-score">' + s.score + '\uC810</div>' +
                '<div class="sh-name">' + s.storeName + '</div><div class="sh-sub">' + (s.stockoutCount > 0 ? "\u26A0\uFE0F " + s.stockoutCount + "\uAC74" : "\u2705 \uC815\uC0C1") + '</div></div>';
        }).join("");
    } catch (e) { console.warn("Health fail:", e); c.innerHTML = '<div class="skeleton">\uB85C\uB4DC \uC2E4\uD328</div>'; }
}

async function loadOrderRecommendations() {
    var c = document.getElementById("orderRecList");
    try {
        var url = "/inventory/OrderRecommendations?$filter=status eq 'Pending'&$orderby=priority asc&$top=5&$expand=store($select=name),product($select=name)";
        var res = await fetch(url);
        if (!res.ok) throw new Error("fail " + res.status);
        var data = await res.json();
        var items = data.value || [];
        if (!items.length) { c.innerHTML = '<div class="skeleton">\uCD94\uCC9C \uD56D\uBAA9 \uC5C6\uC74C</div>'; return; }
        var po = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        items.sort(function (a, b) { return (po[a.priority] || 9) - (po[b.priority] || 9); });
        c.innerHTML = items.map(function (it, i) {
            var sn = (it.store && it.store.name) || "\uC810\uD3EC";
            var pn = (it.product && it.product.name) || "\uC0C1\uD488";
            return '<div class="rec-item"><div class="rec-rank ' + it.priority + '">' + (i + 1) + '</div>' +
                '<div class="rec-info"><div class="rec-title">' + sn + '</div><div class="rec-sub">' + pn + '</div></div>' +
                '<div class="rec-qty">+' + it.recommendedQty + '</div>' +
                '<button class="rec-action" onclick="showContentFrame(\'/purchaseorders/webapp/index.html\')">\uBC1C\uC8FC</button></div>';
        }).join("");
    } catch (e) { console.warn("OrderRec fail:", e); c.innerHTML = '<div class="skeleton">\uB85C\uB4DC \uC2E4\uD328</div>'; }
}


async function loadAnomalyDetections() {
    var c = document.getElementById("anomalyList");
    try {
        var url = "/inventory/SalesAnomalies?$orderby=detectedAt desc&$top=5&$expand=store($select=name),product($select=name)";
        var res = await fetch(url);
        if (!res.ok) throw new Error("fail " + res.status);
        var data = await res.json();
        var items = data.value || [];
        if (!items.length) { c.innerHTML = '<div class="skeleton">\uC774\uC0C1 \uD0D0\uC9C0 \uC5C6\uC74C</div>'; return; }
        c.innerHTML = items.map(function(it) {
            var icon = it.anomalyType === "SPIKE" ? "\uD83D\uDCC8" : "\uD83D\uDCC9";
            var sn = (it.store && it.store.name) || "Store";
            return '<div class="anom-item"><div class="anom-icon">' + icon + '</div>' +
                '<div class="anom-info"><div class="anom-title">' + sn + " " + it.metricName + '</div>' +
                '<div class="anom-sub">Z:' + parseFloat(it.zScore).toFixed(1) + ' | Dev:' + Math.round(it.deviation) + '</div></div>' +
                '<span class="anom-badge ' + it.anomalyType + '">' + it.anomalyType + '</span></div>';
        }).join("");
    } catch(e) { console.warn("Anomaly fail:", e); c.innerHTML = '<div class="skeleton">\uB85C\uB4DC \uC2E4\uD328</div>'; }
}




function renderShortcuts() {
    var grid = document.getElementById("shortcutGrid");
    if (!grid) return;
    var sc = [
        { icon: "\uD83C\uDFF7\uFE0F", title: "\uC0C1\uD488 \uAD00\uB9AC", url: "/products/webapp/index.html" },
        { icon: "\uD83C\uDFEA", title: "\uC810\uD3EC \uAD00\uB9AC", url: "/stores/webapp/index.html" },
        { icon: "\uD83D\uDCE6", title: "\uC7AC\uACE0 \uAD00\uB9AC", url: "/inventories/webapp/index.html" },
        { icon: "\uD83D\uDCCB", title: "\uBC1C\uC8FC \uAD00\uB9AC", url: "/purchaseorders/webapp/index.html" },
        { icon: "\uD83D\uDD2E", title: "\uC218\uC694 \uC608\uCE21", url: "/demandforecasts/webapp/index.html" },
        { icon: "\uD83D\uDEA8", title: "\uC774\uC0C1 \uD0D0\uC9C0", url: "/salesanomalies/webapp/index.html" },
        { icon: "\uD83C\uDFAF", title: "AI \uCD94\uCC9C", url: "/orderrecommendations/webapp/index.html" },
        { icon: "\uD83D\uDC64", title: "\uACE0\uAC1D \uAD00\uB9AC", url: "/customers/webapp/index.html" }
    ];
    grid.innerHTML = sc.map(function(s) { return '<a class="shortcut-card" onclick="showContentFrame(\'' + s.url + '\')">' + s.icon + " " + s.title + "</a>"; }).join("");
}

function toggleRiskOnly(checked) { loadSupplyChainGraph(checked); }