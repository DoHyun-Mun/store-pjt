// ═══════════════════════════════════════════════════════════════
// AI Chat Side Panel Logic
// ═══════════════════════════════════════════════════════════════
let chatHistory = [];
let chatOpen = false;
let chatSending = false;

function toggleChat() {
    chatOpen = !chatOpen;
    const panel = document.getElementById('chatPanel');
    const tab = document.getElementById('chatToggleTab');
    const main = document.getElementById('main');
    if (chatOpen) {
        panel.classList.add('open');
        tab.classList.add('hidden');
        main.classList.add('chat-open');
        document.getElementById('chatInput').focus();
    } else {
        panel.classList.remove('open');
        tab.classList.remove('hidden');
        main.classList.remove('chat-open');
    }
}

function handleChatKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

function autoResizeInput(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 90) + 'px';
}

function appendMessage(role, content) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;
    if (role === 'assistant') { msgDiv.innerHTML = renderMarkdown(content); checkAndLinkForecast(content, msgDiv); }
    else if (role === 'system') { msgDiv.innerHTML = content; }
    else { msgDiv.textContent = content; }
    const container = document.getElementById('chatMessages');
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// 수요 예측 응답 감지 & 시각화 페이지 연동
function checkAndLinkForecast(content, msgDiv) {
    // 예측 테이블 패턴 감지: | 날짜 | 예측 | 하한 | 상한 |
    // 예측 테이블 패턴 감지: | 날짜 | 예측 | 하한 | 상한 | 또는 "수요 예측" 키워드
    const tableRegex = /\|\s*\d{4}-\d{2}-\d{2}\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|/g;
    const matches = content.match(tableRegex);
    const hasForecastKeyword = /수요\s*예측\s*결과|예측\s*판매량|forecastQty|발주\s*추천|추천\s*발주|이탈\s*예측|이탈\s*위험|이상\s*탐지|anomal/i.test(content);
    if (!matches && !hasForecastKeyword) return;
    if (matches && matches.length < 2 && !hasForecastKeyword) return;

    // 테이블 데이터 파싱
    const tableData = (matches || []).map(row => {
        const cells = row.split("|").filter(c => c.trim());
        return {
            date: cells[0].trim(),
            forecast: parseFloat(cells[1]),
            low: parseFloat(cells[2]),
            high: parseFloat(cells[3])
        };
    }).filter(r => !isNaN(r.forecast));

    

    // KPI 추출
    const avgForecast = tableData.length > 0 ? (tableData.reduce((s,r) => s + r.forecast, 0) / tableData.length).toFixed(1) : "-";
    // 추세 변화율: 테이블 `| 추세_변화율 | +6% |` 또는 인라인 형식
    var trendMatch = content.match(/추세[_\s]*변화율\s*\|\s*([+\-]?\d+%)/);
    if (!trendMatch) trendMatch = content.match(/변화율\s*([+\-]?\d+%)/);
    // 예측 기간 추출: "**예측 기간**: 30일" 형태
    var modelMatch = content.replace(/\*\*/g,"").match(/예측\s*기간[：:]\s*(\d+일?)/i);
    const peakRow = tableData.length > 0 ? tableData.reduce((max, r) => r.forecast > max.forecast ? r : max, tableData[0]) : null;

    // 분석 섹션 파싱 (테이블/리스트/다양한 형식 모두 지원)
    const analysis = [];
    function extractSection(text, titlePattern) {
        const regex = new RegExp(titlePattern + '[\\s\\S]*?(?=#{2,}\\s|$)', 'i');
        const match = text.match(regex);
        if (!match) return [];
        const section = match[0];
        const items = [];
        // 테이블 형식: | key | value | (헤더/구분선 제외)
        const tableRows = section.match(/\|\s*[^|\-][^|]*\|\s*[^|]+\|/g);
        if (tableRows) {
            tableRows.forEach(function(row) {
                const cells = row.split('|').filter(function(c) { return c.trim() && !c.match(/^[\-]+$/); });
                if (cells.length >= 2) {
                    var k = cells[0].trim(), v = cells[1].trim();
                    // 헤더 행 제외
                    if (/^(지표|요인|날짜|항목)$/i.test(k)) return;
                    if (/^(값|상태|예측)$/i.test(v)) return;
                    items.push(k.replace(/_/g, ' ') + ': ' + v);
                }
            });
        }
        // 리스트 형식: - text 또는 • text
        const listItems = section.match(/^\s*[-•]\s*.+/gm);
        if (listItems) {
            listItems.forEach(function(li) { items.push(li.replace(/^\s*[-•]\s*/, '').replace(/\*\*/g, '')); });
        }
        return items;
    }
    var tsItems = extractSection(content, '시계열\\s*분석');
    if (tsItems.length > 0) analysis.push({ title: "📊 시계열 분석", items: tsItems });
    var extItems = extractSection(content, '외부\\s*요인');
    if (extItems.length > 0) analysis.push({ title: "🌍 외부 요인", items: extItems });
    var keyItems = extractSection(content, '(핵심\\s*사유|예측\\s*사유)');
    if (keyItems.length > 0) analysis.push({ title: "💡 핵심 사유", items: keyItems });
    var confItems = extractSection(content, '예측\\s*신뢰');
    if (confItems.length > 0) analysis.push({ title: "🎯 예측 신뢰도", items: confItems });
    // Fallback: analysis가 비어있으면 content에서 직접 추출
    if (analysis.length === 0) {
        var sections = content.split(/#{2,}\s*/g).filter(function(s) { return s.trim().length > 10; });
        sections.forEach(function(sec) {
            var lines = sec.split("\n").filter(function(l) { return l.trim(); });
            if (lines.length < 2) return;
            var title = lines[0].replace(/[#*]/g, "").trim();
            if (title.match(/예측\s*결과|데이터\s*테이블/)) return;
            var items = [];
            for (var i = 1; i < lines.length; i++) {
                var line = lines[i].trim();
                if (line.startsWith("|") && !line.match(/^\|[-\s]+\|/)) {
                    var cells = line.split("|").filter(function(c) { return c.trim(); });
                    if (cells.length >= 2) items.push(cells[0].trim() + ": " + cells[1].trim());
                } else if (line.startsWith("-") || line.startsWith("•")) {
                    items.push(line.replace(/^[-•]\s*/, "").replace(/\*\*/g, ""));
                }
            }
            if (items.length > 0 && title) {
                analysis.push({ title: title.slice(0, 30), items: items.slice(0, 8) });
            }
        });
    }
    // localStorage에 저장
    // 점포명/상품명 추출 (AI 응답에서)
    // 점포명 동적 감지: "XX 본점/지점/점" 패턴 또는 하드코딩 목록
    var detectedStore = "";
    var detectedProduct = "";
    var storeMatch = content.replace(/\*\*/g,"").match(/([가-힣]+\s*(?:본점|지점|점))/);
    if (storeMatch) detectedStore = storeMatch[1].trim();
    if (!detectedStore) {
        var storeNames = ["강남 본점","서초 지점","잠실 지점","여의도 지점","홍대 지점","부산 해운대점","대구 동성로점","인천 송도점","광주 충장로점","대전 둔산점","이태원 지점"];
        storeNames.forEach(function(sn) { if (content.indexOf(sn) !== -1) detectedStore = sn; });
    }
    // 상품명 추출: "**대상**: 강남 본점 - 미니 PC" 형식 우선
    var targetMatch = content.replace(/\*\*/g, "").match(/대상[：:]\s*[^-\n]+-\s*(.+)/i);
    if (targetMatch) detectedProduct = targetMatch[1].trim();
    if (!detectedProduct) {
        try { var qMatch = content.match(/"([^"]{2,30})"/); if (qMatch) detectedProduct = qMatch[1]; } catch(e) {}
    }
    if (!detectedProduct && detectedStore) {
        var idx2 = content.indexOf(detectedStore);
        if (idx2 !== -1) {
            var after = content.substring(idx2 + detectedStore.length, idx2 + detectedStore.length + 60);
            var words = after.replace(/[^\uAC00-\uD7AF\u0020a-zA-Z0-9]/g, " ").trim().split(/\s+/);
            if (words.length >= 1 && words[0].length >= 2) detectedProduct = words.slice(0, 3).join(" ").trim();
        }
    }
    const forecastData = {
        meta: "AI 예측 결과 | " + (detectedStore || "") + " / " + (detectedProduct || "") + " | " + new Date().toLocaleString("ko-KR"),
        storeName: detectedStore,
        productName: detectedProduct,
        kpi: {
            avg: avgForecast,
            trend: trendMatch ? trendMatch[1] : "-",
            peak: peakRow ? peakRow.date.slice(5) : "-",
            model: modelMatch ? modelMatch[1].trim().slice(0,20) : "AI"
        },
        table: tableData,
        analysis: analysis.length > 0 ? analysis : [{ title: "📊 분석 요약", items: ["데이터 기반 예측 완료"] }]
    };
    localStorage.setItem("forecastData", JSON.stringify(forecastData));

    // "상세 보기" 버튼 추가
    const btn = document.createElement("div");
    btn.style.cssText = "margin-top:12px;padding:8px 14px;background:linear-gradient(135deg,#0070F2,#6B4FBB);color:white;border-radius:8px;font-size:0.75rem;font-weight:600;cursor:pointer;display:block;width:fit-content;";
    btn.textContent = "📊 예측 결과 상세 보기";
    btn.onclick = function() {
        showContentFrame("/demandforecasts/webapp/index.html"); highlightMenuForUrl("/demandforecasts/webapp/index.html");
        var frame = document.getElementById("contentFrame");
        var origOnload = frame.onload;
        frame.onload = function() { document.getElementById('frameLoader').classList.add('hidden'); setTimeout(function() { frame.contentWindow.postMessage({type:"forecastUpdate"}, "*"); }, 200); };
    };
    if (!/발주\s*추천|추천\s*발주|이탈\s*예측|이탈\s*위험|이상\s*탐지/i.test(content)) { msgDiv.appendChild(btn); }

    // 발주 추천 감지 & 데이터 파싱 & 버튼 추가
    var hasOrderRec = /발주\s*추천|추천\s*발주|order\s*recommend/i.test(content);
    if (hasOrderRec) {
        // 테이블 셀 값 추출 헬퍼
        var clean = content.replace(/\*\*/g, "");
        function tblVal(key) {
            var re = new RegExp("\\|\\s*" + key + "\\s*\\|\\s*([^|\\n]+)", "i");
            var m = clean.match(re);
            return m ? m[1].trim() : "";
        }
        function tblNum(key) {
            var v = tblVal(key);
            if (!v) return 0;
            var n = v.match(/([\d,.]+)/);
            return n ? parseFloat(n[1].replace(/,/g, "")) : 0;
        }
        function exVal(pattern) { var m = clean.match(pattern); return m ? m[1].trim() : ""; }
        function exNum(pattern) { var m = clean.match(pattern); return m ? parseFloat(m[1].replace(/,/g, "")) || 0 : 0; }

        // ML 발주 추천 테이블에서 추출: | 상품명 | 현재재고 | 일수요 | 추천수량 | 긴급도 | 예상비용 |
        var mlTableMatch = clean.match(/\|\s*[^|\n]+\|\s*[\d,.]+개?\s*\|\s*[\d,.]+[^\n|]*\|\s*[\d,.]+개?\s*\|\s*(HIGH|MEDIUM|LOW|CRITICAL)\s*\|\s*[^\n|]+\|/i);
        var recProduct = "", mlCurrentStock = 0, mlDailyDemand = 0, mlRecommendedQty = 0, mlUrgency = "", mlEstimatedCost = "";
        if (mlTableMatch) {
            var cells = mlTableMatch[0].split("|").filter(function(c) { return c.trim(); });
            if (cells.length >= 6) {
                recProduct = cells[0].trim();
                mlCurrentStock = parseFloat((cells[1].match(/([\d,.]+)/) || [0,0])[1]) || 0;
                mlDailyDemand = parseFloat((cells[2].match(/([\d,.]+)/) || [0,0])[1]) || 0;
                mlRecommendedQty = parseFloat((cells[3].match(/([\d,.]+)/) || [0,0])[1]) || 0;
                mlUrgency = cells[4].trim();
                mlEstimatedCost = cells[5].trim();
            }
        }
        if (!recProduct) recProduct = detectedProduct || "";
        if (!mlEstimatedCost) mlEstimatedCost = exVal(/예상\s*비용[：:]*\s*([^\n|]+)/i);

        // 시계열 분석 테이블에서 추출
        var ts7day = tblNum("최근7일_평균") || tblNum("최근 7일 평균");
        var ts30day = tblNum("최근30일_평균") || tblNum("최근 30일 평균");
        var tsTrend = tblVal("추세_변화율") || tblVal("추세 변화율");
        var rptDaily = tblNum("RPT1_7일예측_일평균") || tblNum("RPT1 7일예측 일평균");
        var mlDailyAvg = tblNum("ML_과거평균") || tblNum("ML 과거평균") || mlDailyDemand;

        // RPT-1 테이블에서 7일 합계 계산
        var rptRows = clean.match(/\|\s*\d{4}-\d{2}-\d{2}\s*\|\s*[\d,.]+/g) || [];
        var rptTotal = 0;
        rptRows.forEach(function(r) { var n = r.match(/([\d,.]+)\s*$/); if (n) rptTotal += parseFloat(n[1]); });
        if (!rptDaily && rptRows.length > 0) rptDaily = rptTotal / rptRows.length;

        // 외부 요인 테이블에서 추출
        var extDay = tblVal("요일");
        var extSeason = tblVal("계절");
        var extNews = tblVal("뉴스_트렌드") || tblVal("뉴스 트렌드");

        // AI 종합 판단
        var aiConclusion = exVal(/결론[：:]*\s*([^\n]+)/i);
        var aiConfidence = exVal(/신뢰도[：:]*\s*([^\n]+)/i);
        var aiRecommend = exVal(/권고[：:]*\s*([^\n]+)/i);

        // 리스크/사유
        var reasons = [];
        var riskSection = clean.match(/리스크[\s\S]*?(?=###|$)/i) || clean.match(/발주\s*사유[\s\S]*?(?=###|$)/i);
        if (riskSection) {
            var rLines = riskSection[0].split("\n");
            for (var ri = 0; ri < rLines.length; ri++) {
                var rl = rLines[ri].trim();
                if (rl.length > 3 && rl.startsWith("-")) reasons.push(rl.replace(/^-\s*/, ""));
            }
        }

        // priority
        var priority = "MEDIUM";
        if (/CRITICAL/i.test(mlUrgency)) priority = "HIGH";
        else if (/HIGH/i.test(mlUrgency)) priority = "HIGH";
        else if (/LOW/i.test(mlUrgency)) priority = "LOW";

        var recData = {
            meta: "AI 발주 추천 | " + (detectedStore || "전체") + " | " + new Date().toLocaleString("ko-KR"),
            storeName: detectedStore,
            productName: recProduct,
            priority: priority,
            ml: { model: "Safety Stock + EOQ", currentStock: mlCurrentStock, safetyStock: 0, reorderPoint: 0, recommendedQty: mlRecommendedQty, estimatedCost: mlEstimatedCost, urgency: mlUrgency, stockDays: "" },
            rpt: { totalDemand7d: rptTotal, dailyAvg: rptDaily },
            timeseries: { avg7d: ts7day || mlDailyAvg, avg30d: ts30day, trend: tsTrend },
            external: { day: extDay, season: extSeason, news: extNews },
            reasons: reasons,
            aiJudgment: { conclusion: aiConclusion, confidence: aiConfidence, recommendation: aiRecommend }
        };
        localStorage.setItem("orderRecommendationData", JSON.stringify(recData));
        var btn2 = document.createElement("div");
        btn2.style.cssText = "margin-top:8px;padding:8px 14px;background:linear-gradient(135deg,#E37400,#D93025);color:white;border-radius:8px;font-size:0.75rem;font-weight:600;cursor:pointer;display:block;width:fit-content;";
        btn2.textContent = "📋 발주 추천 상세 보기";
        btn2.onclick = function() {
            showContentFrame("/orderrecommendations/webapp/index.html");
            highlightMenuForUrl("/orderrecommendations/webapp/index.html");
            var frame = document.getElementById("contentFrame");
            frame.onload = function() { document.getElementById('frameLoader').classList.add('hidden'); setTimeout(function() { frame.contentWindow.postMessage({type:"recommendationUpdate"}, "*"); }, 200); };
        };
        msgDiv.appendChild(btn2);
    }

    // 이탈 예측 감지 & 데이터 파싱 & 버튼 추가
    var hasChurn = /이탈\s*예측|이탈\s*위험|churn/i.test(content);
    if (hasChurn && /고객\s*수|이탈\s*위험\s*비율/i.test(content)) {
        var cc = content.replace(/\*\*/g, "");
        var totalCust = (cc.match(/총\s*고객\s*수[：:]*\s*([\d,]+)/) || [0,""])[1];
        var churnCust = (cc.match(/이탈\s*위험\s*고객\s*수[：:]*\s*([\d,]+)/) || [0,""])[1];
        var churnRate = (cc.match(/이탈\s*위험\s*비율[：:]*\s*([\d,.]+%?)/) || [0,""])[1];
        var accuracy = (cc.match(/정확도[^：:]*[：:]\s*([\d,.]+%?)/) || [0,""])[1];
        var precision = (cc.match(/정밀도[^：:]*[：:]\s*([\d,.]+%?)/) || [0,""])[1];
        var recall = (cc.match(/재현율[^：:]*[：:]\s*([\d,.]+%?)/) || [0,""])[1];
        var f1 = (cc.match(/F1\s*점수[：:]*\s*([\d,.]+%?)/) || [0,""])[1];
        var auc = (cc.match(/AUC[^：:]*[：:]\s*([\d,.]+%?)/) || [0,""])[1];
        // 고객 테이블 파싱
        var custRows = cc.match(/\|\s*CUST-[^|]+\|[^\n]+/g) || [];
        var customers = custRows.map(function(row) {
            var c = row.split("|").filter(function(x){return x.trim();});
            return { code: (c[0]||"").trim(), name: (c[1]||"").trim(), age: (c[2]||"").trim(), membership: (c[3]||"").trim(), city: (c[4]||"").trim(), probability: (c[5]||"").trim(), risk: (c[6]||"").trim(), factor: (c[7]||"").trim() };
        });
        // 주요 이탈 요인
        var factors = [];
        var fSection = cc.match(/주요\s*이탈\s*요인[\s\S]*?(?=###|$)/i);
        if (fSection) {
            var fLines = fSection[0].split("\n");
            for (var fi = 0; fi < fLines.length; fi++) {
                var fl = fLines[fi].trim();
                if (fl.startsWith("-") && fl.length > 3) factors.push(fl.replace(/^-\s*/, ""));
            }
        }
        var churnData = {
            meta: "이탈 예측 | " + (detectedStore || "전체") + " | " + new Date().toLocaleString("ko-KR"),
            storeName: detectedStore,
            totalCustomers: totalCust ? totalCust + "명" : "-",
            churnCustomers: churnCust ? churnCust + "명" : "-",
            churnRate: churnRate || "-",
            accuracy: accuracy || "-",
            performance: { accuracy: accuracy||"-", precision: precision||"-", recall: recall||"-", f1: f1||"-", auc: auc||"-" },
            customers: customers,
            factors: factors
        };
        localStorage.setItem("churnPredictionData", JSON.stringify(churnData));
        var btn3 = document.createElement("div");
        btn3.style.cssText = "margin-top:8px;padding:8px 14px;background:linear-gradient(135deg,#D93025,#7B2FF2);color:white;border-radius:8px;font-size:0.75rem;font-weight:600;cursor:pointer;display:block;width:fit-content;";
        btn3.textContent = "⚠️ 이탈 예측 상세 보기";
        btn3.onclick = function() {
            showContentFrame("/churnpredictions/webapp/index.html");
            highlightMenuForUrl("/churnpredictions/webapp/index.html");
            var frame = document.getElementById("contentFrame");
            frame.onload = function() { document.getElementById('frameLoader').classList.add('hidden'); setTimeout(function() { frame.contentWindow.postMessage({type:"churnUpdate"}, "*"); }, 200); };
        };
        msgDiv.appendChild(btn3);
    }

    // 이상 탐지 감지 & 데이터 파싱 & 버튼 추가
    var hasAnomaly = /이상\s*탐지|anomal/i.test(content);
    if (hasAnomaly && /이상\s*탐지\s*건수|총\s*기록\s*수/i.test(content)) {
        var ac = content.replace(/\*\*/g, "");
        // KPI 추출
        var aStore = (ac.match(/점포\s*\|\s*([^|\n]+)/) || [0,""])[1].trim();
        var aTarget = (ac.match(/분석\s*대상\s*\|\s*([^|\n]+)/) || [0,""])[1].trim();
        var aTotal = (ac.match(/총\s*기록\s*수\s*\|\s*([^|\n]+)/) || [0,""])[1].trim();
        var aCount = (ac.match(/이상\s*탐지\s*건수\s*\|\s*([^|\n]+)/) || [0,""])[1].trim();
        // 이상 항목 테이블 파싱
        var anomRows = ac.match(/\|\s*\d{4}-\d{2}-\d{2}\s*\|[^\n]+/g) || [];
        var anomItems = anomRows.map(function(row) {
            var c = row.split("|").filter(function(x){return x.trim();});
            return { date:(c[0]||"").trim(), product:(c[1]||"").trim(), qty:(c[2]||"").trim(), change:(c[3]||"").trim(), type:(c[4]||"").trim(), severity:(c[5]||"").trim() };
        });
        // 탐지 사유
        var aReasons = [];
        var rSec = ac.match(/탐지\s*사유[\s\S]*?(?=###|$)/i);
        if (rSec) { var rL = rSec[0].split("\n"); for (var ai=0;ai<rL.length;ai++) { var al=rL[ai].trim(); if(al.startsWith("-")&&al.length>3) aReasons.push(al.replace(/^-\s*/,"")); } }
        // 권고 사항
        var aRecs = [];
        var recSec = ac.match(/권고\s*사항[\s\S]*?(?=###|$)/i);
        if (recSec) { var rcL = recSec[0].split("\n"); for (var ri2=0;ri2<rcL.length;ri2++) { var rl2=rcL[ri2].trim(); if(rl2.startsWith("-")&&rl2.length>3) aRecs.push(rl2.replace(/^-\s*/,"")); } }

        var anomData = {
            meta: "이상 탐지 | " + (aStore || detectedStore || "전체") + " | " + new Date().toLocaleString("ko-KR"),
            store: aStore || detectedStore || "-",
            target: aTarget || "-",
            totalRecords: aTotal || "-",
            anomalyCount: aCount || "-",
            items: anomItems,
            reasons: aReasons,
            recommendations: aRecs
        };
        localStorage.setItem("salesAnomalyData", JSON.stringify(anomData));
        var btn4 = document.createElement("div");
        btn4.style.cssText = "margin-top:8px;padding:8px 14px;background:linear-gradient(135deg,#E37400,#D93025);color:white;border-radius:8px;font-size:0.75rem;font-weight:600;cursor:pointer;display:block;width:fit-content;";
        btn4.textContent = "🚨 이상 탐지 상세 보기";
        btn4.onclick = function() {
            showContentFrame("/salesanomalies/webapp/index.html");
            highlightMenuForUrl("/salesanomalies/webapp/index.html");
            var frame = document.getElementById("contentFrame");
            frame.onload = function() { document.getElementById('frameLoader').classList.add('hidden'); setTimeout(function() { frame.contentWindow.postMessage({type:"anomalyUpdate"}, "*"); }, 200); };
        };
        msgDiv.appendChild(btn4);
    }
}

function renderMarkdown(text) {
    return text
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

function setTyping(show) {
    document.getElementById('chatTyping').classList.toggle('show', show);
    if (show) { const c = document.getElementById('chatMessages'); c.scrollTop = c.scrollHeight; }
}

async function sendChatMessage() {
    if (chatSending) return;
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    input.value = ''; input.style.height = 'auto';
    appendMessage('user', message);
    chatSending = true;
    document.getElementById('chatSendBtn').disabled = true;
    setTyping(true);

    try {
        const response = await fetch('/chat/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: chatHistory })
        });
        const data = await response.json();
        if (data.success !== false && data.reply) {
            appendMessage('assistant', data.reply);
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.reply });
            if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
        } else {
            appendMessage('system', '&#x26A0;&#xFE0F; ' + (data.error || '응답을 받을 수 없습니다.'));
        }
    } catch (error) {
        appendMessage('system', '&#x26A0;&#xFE0F; 네트워크 오류가 발생했습니다.');
    } finally {
        chatSending = false;
        document.getElementById('chatSendBtn').disabled = false;
        setTyping(false);
    }
}

// Chat Panel Resize (drag to resize)
(function() {
    var handle = document.getElementById("chatResizeHandle");
    var panel = document.getElementById("chatPanel");
    var main = document.getElementById("main");
    var MIN_W = 300, MAX_W = 800;
    var isResizing = false, startX, startWidth;
    if (!handle) return;
    handle.addEventListener("mousedown", function(e) {
        isResizing = true; startX = e.clientX; startWidth = panel.offsetWidth;
        panel.classList.add("resizing"); main.classList.add("chat-resizing");
        document.body.classList.add("chat-resizing"); handle.classList.add("active");
        e.preventDefault();
    });
    document.addEventListener("mousemove", function(e) {
        if (!isResizing) return;
        var diff = startX - e.clientX;
        var nw = Math.min(MAX_W, Math.max(MIN_W, startWidth + diff));
        panel.style.width = nw + "px";
        main.style.marginRight = nw + "px";
        document.documentElement.style.setProperty("--chat-width", nw + "px");
    });
    document.addEventListener("mouseup", function() {
        if (!isResizing) return;
        isResizing = false;
        panel.classList.remove("resizing"); main.classList.remove("chat-resizing");
        document.body.classList.remove("chat-resizing"); handle.classList.remove("active");
    });
})();
