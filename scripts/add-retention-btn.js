const fs = require("fs");
let c = fs.readFileSync("app/churnpredictions/webapp/index.html", "utf8");

// 1. Add CSS for retention button and result
const retentionCSS = `
.retention-section{margin-top:1.25rem;text-align:center}
.retention-btn{background:linear-gradient(135deg,#D93025,#FF5252);color:white;border:none;padding:0.85rem 2rem;border-radius:10px;font-size:0.85rem;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(217,48,37,0.3);transition:all 0.3s}
.retention-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(217,48,37,0.4)}
.retention-btn:active{transform:translateY(0)}
.retention-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.retention-result{display:none;margin-top:1rem;background:white;border:1px solid #E5E8ED;border-radius:12px;padding:1.25rem;text-align:left;animation:fadeIn 0.5s}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.retention-result h4{font-size:0.88rem;font-weight:700;color:#188038;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem}
.ret-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.6rem;margin-bottom:0.85rem}
.ret-card{background:#F8F9FB;border-radius:8px;padding:0.65rem;text-align:center}
.ret-card .ret-icon{font-size:1.3rem;margin-bottom:0.2rem}
.ret-card .ret-val{font-size:1.1rem;font-weight:800;color:#0070F2}
.ret-card .ret-lbl{font-size:0.62rem;color:#556B82}
.ret-targets{font-size:0.72rem;color:#556B82;margin-bottom:0.5rem;padding:0.5rem;background:#E6F4EA;border-radius:6px;border-left:3px solid #188038}
.ret-forecast{display:flex;gap:1rem;font-size:0.72rem;margin-bottom:0.6rem}
.ret-forecast span{display:flex;align-items:center;gap:0.3rem}
.ret-note{font-size:0.62rem;color:#8396A8;font-style:italic;padding-top:0.5rem;border-top:1px solid #EEF1F5}
.ret-progress{height:4px;background:#E5E8ED;border-radius:2px;margin-bottom:1rem;overflow:hidden}
.ret-progress-bar{height:100%;background:linear-gradient(90deg,#D93025,#188038);border-radius:2px;animation:progress 1.5s ease-out forwards;width:0}
@keyframes progress{to{width:100%}}
`;

// Insert CSS before </style>
c = c.replace("</style>", retentionCSS + "</style>");

// 2. Add HTML button + result area after the customer table card closing div
c = c.replace(
  '</div>\n</div>\n\n<script>',
  `</div>
</div>

<!-- 리텐션 전략 수행 -->
<div class="retention-section">
<button class="retention-btn" id="retentionBtn" onclick="executeRetention()">🎯 이탈 고객 리텐션 전략 수행</button>
<div class="retention-result" id="retentionResult"></div>
</div>
</div>

<script>`
);

// But we also need to remove one extra </div> since we restructured
// Actually let's find the exact spot - after the customer table card
c = c.replace(
  '</div>\n</div>\n\n<!-- 리텐션 전략 수행 -->',
  '</div>\n\n<!-- 리텐션 전략 수행 -->'
);

// 3. Add the executeRetention function before the loadData() call at the end
c = c.replace(
  "window.addEventListener(\"storage\"",
  `function executeRetention() {
    var btn = document.getElementById("retentionBtn");
    var result = document.getElementById("retentionResult");
    btn.disabled = true;
    btn.textContent = "⏳ 리텐션 캠페인 생성 중...";
    result.style.display = "block";
    result.innerHTML = '<div class="ret-progress"><div class="ret-progress-bar"></div></div><p style="text-align:center;font-size:0.75rem;color:#8396A8;">AI 기반 개인화 캠페인 생성 중...</p>';

    var raw = localStorage.getItem("churnPredictionData");
    var data = raw ? JSON.parse(raw) : {};
    var custs = data.customers || [];
    var highCount = custs.filter(function(c){return c.risk==="HIGH";}).length;
    var medCount = custs.filter(function(c){return c.risk==="MEDIUM";}).length;
    var totalCount = highCount + medCount;
    var names = custs.slice(0,3).map(function(c){return c.name;}).join(", ");
    var extra = totalCount > 3 ? " 외 "+(totalCount-3)+"명" : "";

    setTimeout(function() {
        btn.textContent = "✅ 캠페인 생성 완료";
        result.innerHTML = '<h4>✅ 리텐션 캠페인 생성 완료 (시뮬레이션)</h4>' +
            '<div class="ret-grid">' +
            '<div class="ret-card"><div class="ret-icon">📱</div><div class="ret-val">'+highCount+'건</div><div class="ret-lbl">카카오톡 발송</div></div>' +
            '<div class="ret-card"><div class="ret-icon">📧</div><div class="ret-val">'+medCount+'건</div><div class="ret-lbl">이메일 발송</div></div>' +
            '<div class="ret-card"><div class="ret-icon">🎁</div><div class="ret-val">'+totalCount+'건</div><div class="ret-lbl">쿠폰 생성</div></div>' +
            '<div class="ret-card"><div class="ret-icon">📞</div><div class="ret-val">'+Math.min(highCount,3)+'건</div><div class="ret-lbl">1:1 상담 예약</div></div>' +
            '</div>' +
            '<div class="ret-targets">📋 대상 고객: <strong>'+names+extra+'</strong></div>' +
            '<div class="ret-forecast"><span>📈 예상 복귀율: <strong>15~25%</strong></span><span>💰 예상 매출 보전: <strong>₩'+(totalCount*500).toLocaleString()+'K+</strong></span></div>' +
            '<div class="ret-note">💡 PoC 시뮬레이션입니다. 실제 구현 시 CRM/마케팅 자동화 시스템(SAP Emarsys 등)과 연동하여 실시간 캠페인이 실행됩니다.</div>';
        setTimeout(function(){ btn.disabled = false; btn.textContent = "🎯 이탈 고객 리텐션 전략 수행"; }, 5000);
    }, 2000);
}

window.addEventListener("storage"`
);

fs.writeFileSync("app/churnpredictions/webapp/index.html", c, "utf8");
console.log("✅ Retention button + simulation result added!");