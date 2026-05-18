# 🤖 AI 점포 운영 시스템 (Store AI Operations)

> SAP BTP + AI Core + HANA Cloud 기반의 AI 융합 점포 운영 관리 시스템

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [시스템 아키텍처](#시스템-아키텍처)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [주요 기능](#주요-기능)
- [AI 인텔리전스](#ai-인텔리전스)
- [데이터 모델](#데이터-모델)
- [API 엔드포인트](#api-엔드포인트)
- [로컬 개발](#로컬-개발)
- [Kyma 배포](#kyma-배포)

---

## 🎯 프로젝트 개요

### 프로젝트 목적

**SAP BTP의 핵심 기술(CAP, AI Core, HANA Cloud, Kyma)을 결합하여, AI가 실시간으로 비즈니스 데이터를 분석하고 대화형으로 의사결정을 지원하는 차세대 점포 운영 시스템**을 구현합니다.

### 핵심 가치

| 영역 | 가치 |
|------|------|
| 🤖 AI 대화형 운영 | 자연어로 재고 조회, 발주 생성, 예측 분석 수행 |
| 📊 데이터 기반 의사결정 | ML 수요 예측, 이상 탐지, 고객 세분화 |
| 🔄 End-to-End 프로세스 | 발주 → 입고검수 → 인보이스 → 배송 → 점포입고 |
| 🏗️ SAP 표준 아키텍처 | CAP + Fiori Elements + OData V4 + XSUAA |

### 주요 기능 요약

- 🏪 **마스터 데이터** - 상품, 점포, 공급업체, 자재, 물류센터 관리
- 🛒 **구매 프로세스 (P2P)** - 발주 → 입고검수 → 인보이스 정산
- 🚚 **물류/재고** - 배송지시 → 점포입고 → 재고 관리
- 💰 **판매 & 고객** - 고객 관리, 구매 이력, 일별 매출
- 🤖 **AI 인텔리전스** - 수요 예측, 발주 추천, 이탈 예측, 고객 세분화, 이상 탐지
- 💬 **AI Chat** - 자연어 대화로 전체 시스템 운영 (MCP Tool Calling)

---

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                        사용자 (Browser)                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Kyma Istio Gateway (APIRule)                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│              SAP Approuter (:5000) ←→ XSUAA (인증)               │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    CAP Backend (:4004)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │ OData V4 API │  │ Chat Service │  │ Static Files (UI) │     │
│  │ (Fiori/CRUD) │  │ (AI Core)    │  │ (Dashboard/AI앱)  │     │
│  └──────┬───────┘  └──────┬───────┘  └───────────────────┘     │
└─────────┼──────────────────┼────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────┐  ┌──────────────────────────────────────────┐
│  HANA Cloud      │  │          SAP AI Core                      │
│  ┌────────────┐  │  │  ┌──────────────────────────────────┐   │
│  │ HDI Schema │  │  │  │ Orchestration (GPT-4o/Claude)    │   │
│  │ + Graph    │  │  │  │ + Tool Calling (MCP Protocol)    │   │
│  │ + Vector   │  │  │  └──────────────┬───────────────────┘   │
│  └────────────┘  │  └─────────────────┼───────────────────────┘
└──────────────────┘                    │
                                        ▼
                              ┌──────────────────────┐
                              │  MCP Tool Server     │
                              │  (Python FastAPI)    │
                              │  ┌────────────────┐  │
                              │  │ 12 Tools:      │  │
                              │  │ • odata_crud   │  │
                              │  │ • ML 예측 5종  │  │
                              │  │ • Graph/Vector │  │
                              │  └────────────────┘  │
                              └──────────────────────┘
```

---

## 🛠 기술 스택

| 구분 | 기술 | 역할 |
|------|------|------|
| **Backend** | SAP CAP (Node.js) | OData V4 서비스, 비즈니스 로직 |
| **Frontend (CRUD)** | SAP Fiori Elements | 마스터 데이터 관리 (annotations 기반 자동 UI) |
| **Frontend (AI)** | Vanilla HTML/JS | AI 대시보드, 채팅, 분석 결과 시각화 |
| **Database** | SAP HANA Cloud | HDI Container, Graph Engine, Vector Engine |
| **AI** | SAP AI Core Orchestration | LLM (GPT-4o/Claude) + Tool Calling |
| **AI Tools** | MCP Server (Python FastAPI) | 12개 비즈니스 도구 (CRUD, ML, Graph, Vector) |
| **인증** | SAP XSUAA | OAuth2 기반 인증/인가 |
| **런타임** | SAP BTP Kyma (Kubernetes) | Docker 컨테이너 배포, Istio Service Mesh |
| **CI/CD** | GitHub + GHCR + deploy-kyma.sh | Docker 빌드 → Push → 자동 배포 |

---

## 📁 프로젝트 구조

```
store-pjt/
├── app/                            # 프론트엔드
│   ├── index.html                  # 메인 대시보드 (커스텀 HTML Shell)
│   ├── css/                        # 스타일시트
│   │   ├── main.css                # 대시보드/사이드바/ShellBar 스타일
│   │   └── chat.css                # AI 채팅 패널 스타일
│   ├── js/                         # JavaScript
│   │   ├── app.js                  # 메뉴 로딩, 라우팅, 네비게이션
│   │   ├── chat.js                 # AI 채팅 + Tool 데이터 처리
│   │   ├── dashboard.js            # 대시보드 KPI/차트
│   │   └── supply-chain.js         # 공급망 네트워크 시각화
│   ├── img/                        # 로고 이미지
│   │
│   │── # Fiori Elements 앱 (UI5 기반 CRUD)
│   ├── categories/                 # 분류 관리
│   ├── products/                   # 상품 관리
│   ├── materials/                  # 자재 관리
│   ├── stores/                     # 점포 관리
│   ├── suppliers/                  # 공급업체 관리
│   ├── distributioncenters/        # 물류센터 관리
│   ├── storeproducts/              # 점포별 상품 관리
│   ├── purchaseorders/             # 발주 관리 (PO)
│   ├── goodsreceipts/              # 입고검수 (GR)
│   ├── invoices/                   # 인보이스 (IR)
│   ├── transferorders/             # 배송지시 (TO)
│   ├── storereceipts/              # 점포입고 (SR)
│   ├── inventories/                # 재고 관리 (IM)
│   ├── customers/                  # 고객 관리
│   ├── customerpurchases/          # 구매 이력
│   ├── dailysales/                 # 일별 매출
│   ├── menus/                      # 메뉴 관리
│   │
│   │── # AI 커스텀 앱 (순수 HTML/JS)
│   ├── demandforecasts/            # 수요 예측 결과 시각화
│   ├── orderrecommendations/       # AI 발주 추천
│   ├── churnpredictions/           # 고객 이탈 예측
│   ├── customersegments/           # 고객 세분화 + 마케팅 전략
│   └── salesanomalies/             # 매출 이상 탐지
│
├── srv/                            # 백엔드 서비스
│   ├── service.cds                 # OData 서비스 정의 (30+ 엔티티)
│   ├── service.js                  # 비즈니스 로직 (발주, 재고, KPI)
│   ├── chat-service.cds            # AI Chat 서비스 정의
│   ├── chat-service.js             # Chat 핸들러 (AI Core 호출)
│   ├── annotations.cds             # 공통 어노테이션
│   ├── logistics-annotations.cds   # 물류 엔티티 어노테이션
│   └── lib/
│       └── aicore-client.js        # AI Core Orchestration + MCP Tool Calling
│
├── db/                             # 데이터베이스
│   ├── schema.cds                  # 전체 데이터 모델 (28개 엔티티)
│   ├── data/                       # 초기 데이터 (CSV, 28개 파일)
│   └── src/                        # HDI artifacts (Graph 권한 등)
│
├── k8s/                            # Kubernetes(Kyma) 배포 매니페스트
├── approuter/                      # SAP Approuter (인증 프록시)
├── scripts/                        # 자동화 스크립트 (배포, 데이터 생성)
├── chart/                          # Helm Chart
├── Dockerfile                      # CAP 백엔드 Docker
├── Dockerfile.hdi-deployer         # HDI Deployer Docker
└── server.js                       # CAP 서버 엔트리포인트
```

---

## 🌟 주요 기능

### 1. AI 대시보드

메인 화면(`app/index.html`)에서 실시간 KPI와 AI 인사이트를 한눈에 확인:
- 💰 최근 매출 (전일 대비 변화율)
- 🏥 재고 건전성 점수 (100점 만점)
- 🚨 결품 위험 건수
- 📋 발주 대기 건수
- 📈 매출 트렌드 + AI 예측 차트
- 🗺️ 점포별 재고 건전성 맵
- 🎯 AI 발주 추천 Top 5
- 🔍 이상 탐지 결과
- 🔗 공급망 네트워크 그래프 (vis.js)

### 2. AI Chat (Store AI 어시스턴트)

우측 사이드 패널에서 자연어로 시스템 운영:
- 데이터 조회: "강남본점 재고 현황 알려줘"
- 데이터 생성: "새 상품 등록해줘" → 필수 필드 질문 → 미리보기 → 확인 → 생성
- AI 분석: "수요 예측 해줘", "고객 세분화 해줘"
- 메뉴 안내: "재고 관리 메뉴 어디있어?" → [📂 해당 메뉴로 이동] 버튼

### 3. 유통 프로세스 (P2P + SCM)

```
공급업체 → PurchaseOrders(발주) → GoodsReceipts(입고검수) → Invoices(정산)
                                         ↓
                               TransferOrders(배송지시) → StoreReceipts(점포입고)
                                                                ↓
                                                         Inventories(재고)
```

각 단계별 상태 관리 (Draft → Submitted → Approved → Received 등)

### 4. 메뉴 시스템

DB 기반 3계층 메뉴 트리 구조:
- 대메뉴 (상단 탭): 마스터 데이터, 구매, 물류·재고, 판매&고객, AI 인텔리전스, 시스템
- 중메뉴 (사이드바 그룹): 상품, 점포, 거래처 등
- 소메뉴 (사이드바 항목): 분류 관리, 상품 관리 등

---

## 🤖 AI 인텔리전스

### SAP AI Core Orchestration

`srv/lib/aicore-client.js`에서 SAP AI Core의 Orchestration API를 사용하여 LLM + Tool Calling을 구현:

```javascript
const client = new OrchestrationClient({
  promptTemplating: {
    model: { name: 'anthropic--claude-4.6-sonnet' },
    prompt: { template: [{ role: 'system', content: '...' }], tools: mcpTools }
  }
});
```

### MCP Tool Server (12개 도구)

| # | Tool | 기능 | 주요 파라미터 |
|---|------|------|-------------|
| 1 | `odata_crud` | 모든 엔티티 CRUD + Draft 워크플로우 | entity, operation, data, confirm |
| 2 | `query_sales` | 일별 매출 조회 | store_id, start_date, end_date |
| 3 | `query_customers` | 고객 정보 + 구매이력 | customer_id, membership_type |
| 4 | `search_products` | 상품 검색 (키워드/Vector) | keyword, use_vector |
| 5 | `graph_co_purchase` | HANA Graph: 함께 구매 분석 | product_id, top_n |
| 6 | `graph_supply_chain` | HANA Graph: 공급망 의존도 | supplier_id |
| 7 | `vector_search` | HANA Vector: 유사도 검색 | query, search_type |
| 8 | `run_demand_forecast` | 수요 예측 (Prophet+XGBoost) | store_id, product_id |
| 9 | `run_anomaly_detection` | 매출 이상 탐지 | store_id, metric |
| 10 | `run_churn_prediction` | 고객 이탈 예측 | segment, city |
| 11 | `run_customer_segmentation` | 고객 세분화 (KMeans+RFM) | - |
| 12 | `search_reorder_products` | 발주 추천 (Safety Stock+EOQ) | store_id, urgency |

### AI 분석 결과 화면

| 앱 | 위치 | 기능 |
|----|------|------|
| 수요 예측 | `/demandforecasts/webapp/` | 7일 예측 차트 + 테이블 + 발주 액션 |
| 발주 추천 | `/orderrecommendations/webapp/` | ML vs RPT-1 비교 + 일괄 발주 생성 |
| 이탈 예측 | `/churnpredictions/webapp/` | 이탈 확률 + 리텐션 캠페인 실행 |
| 고객 세분화 | `/customersegments/webapp/` | RFM 세그먼트 카드 + 마케팅 전략 + 캠페인 실행 |
| 이상 탐지 | `/salesanomalies/webapp/` | Z-Score 기반 이상 항목 + 대응 가이드 |

### Orchestration 규칙 (시스템 프롬프트)

1. 가능성 질문("~할 수 있어?") → Tool 없이 답변
2. 실행 요청("~해줘") → Tool 호출
3. CREATE/UPDATE/DELETE → confirm=false 미리보기
4. confirm_required → 사용자 확인 요청
5. 긍정 답변 → confirm=true 재호출 (동일 파라미터, READ 금지)
6. 부정 답변 → 취소
7. 엔티티 생성 → 필수 필드 부족 시 질문 → 확보 후 호출
8. 메뉴 안내 → [NAVIGATE:URL] 포함 → 이동 버튼 자동 생성

---

## 📊 데이터 모델

### 핵심 엔티티 (28개)

#### 마스터 데이터
| 엔티티 | 설명 |
|--------|------|
| Categories | 상품 분류 |
| Products | 상품 (원가/마진율/판매가 자동계산) |
| Materials | 자재 |
| ProductMaterials | 상품-자재 BOM |
| Stores | 점포 (물류센터 연결) |
| StoreProducts | 점포별 상품 |
| Suppliers | 공급업체 |
| DistributionCenters | 물류센터 |

#### 구매/물류 프로세스
| 엔티티 | 설명 |
|--------|------|
| PurchaseOrders | 발주 (Draft→Submitted→Approved→Received) |
| GoodsReceipts / Items | 입고검수 |
| Invoices / Items | 인보이스/세금계산서 |
| TransferOrders / Items | 배송지시 |
| StoreReceipts / Items | 점포입고 |
| Inventories | 재고 (가용재고 자동계산) |

#### 고객/매출
| 엔티티 | 설명 |
|--------|------|
| Customers | 고객 (회원등급, 구매통계) |
| CustomerPurchases / Items | 고객 구매 이력 |
| DailySales | 일별 매출 집계 |

#### AI 분석 결과
| 엔티티 | 설명 |
|--------|------|
| DemandForecasts | 수요 예측 (Prophet) |
| OrderRecommendations | 발주 추천 |
| ChurnPredictions | 이탈 예측 |
| CustomerSegments | 고객 세분화 (RFM+KMeans) |
| SalesAnomalies | 매출 이상 탐지 |

#### 시스템
| 엔티티 | 설명 |
|--------|------|
| MenuItems | 메뉴 관리 (3계층 트리, self-reference) |

---

## 🔌 API 엔드포인트

기본 URL: `https://store-pjt.c56380c.kyma.ondemand.com`

### OData V4 (Fiori Elements + CRUD)
| 경로 | 설명 |
|------|------|
| `/inventory/Products` | 상품 |
| `/inventory/Categories` | 분류 |
| `/inventory/Stores` | 점포 |
| `/inventory/Inventories` | 재고 |
| `/inventory/PurchaseOrders` | 발주 (Actions: submit/approve/reject/receive) |
| `/inventory/GoodsReceipts` | 입고검수 |
| `/inventory/Invoices` | 인보이스 |
| `/inventory/TransferOrders` | 배송지시 |
| `/inventory/StoreReceipts` | 점포입고 |
| `/inventory/Customers` | 고객 |
| `/inventory/DailySales` | 일별 매출 |
| `/inventory/MenuItems` | 메뉴 |

### AI Chat
| 경로 | 설명 |
|------|------|
| `POST /chat/sendMessage` | AI 대화 (message + history) |
| `GET /chat/healthCheck` | 서비스 상태 확인 |

### Dashboard Function Imports
| 경로 | 설명 |
|------|------|
| `/inventory/getDashboardKPIs()` | 매출, 건전성, 결품위험, 발주대기 |
| `/inventory/getAIInsights()` | AI 인사이트 카드 (최대 5개) |
| `/inventory/getStoreHealthScores()` | 점포별 건전성 점수 |
| `/inventory/getSalesForecastTrend()` | 매출 실적 + AI 예측 결합 |

---

## 🚀 로컬 개발

### 사전 요구사항
- Node.js 22+
- SAP CDS CLI (`npm i -g @sap/cds-dk`)
- SAP AI Core Service Key (환경변수 또는 `.env`)

### 설치 및 실행

```bash
npm install
cds watch
# → http://localhost:4004
```

### 환경변수 (.env)
```
MCP_SERVER_URL=https://mcp-tools.c56380c.kyma.ondemand.com
AICORE_SERVICE_KEY={"clientid":"...","clientsecret":"...","url":"..."}
```

---

## ☸️ Kyma 배포

### 배포 방법 (자동)

```bash
./scripts/deploy-kyma.sh /path/to/kubeconfig.yaml
```

9단계 자동 실행: Namespace → Docker 빌드 → Push → BTP Services → HDI Deploy → Secrets → CAP → Approuter → APIRule

### 접속 URL

```
https://store-pjt.c56380c.kyma.ondemand.com/
```

### 유용한 명령어

```bash
# Pod 상태 확인
kubectl get pods -n store-pjt

# 재배포
kubectl rollout restart deployment store-pjt -n store-pjt

# 로그 확인
kubectl logs -f deploy/store-pjt -n store-pjt
```

---

## 🔐 보안 / Secret 관리

### Secret 관리 원칙

- `k8s/*-secret.yaml` 은 **절대 git commit 금지** (`.gitignore`로 차단)
- 새로운 환경에서는 `k8s/*-secret.example.yaml` 을 복사해서 placeholder를 채움
- 모든 자격증명은 BTP Cockpit / HANA Cockpit에서 발급받아 로컬 secret 파일에만 저장
- 실수 commit 방지를 위해 `gitleaks` pre-commit hook 사용 (아래 셋업 참조)

### 신규 개발자 셋업 (Clone 후 1회)

```bash
# 1) gitleaks 설치
brew install gitleaks               # macOS
# (Linux: https://github.com/gitleaks/gitleaks#installing 참조)

# 2) pre-commit hook 활성화
git config core.hooksPath .githooks

# 3) Secret 파일 준비
cp k8s/aicore-secret.example.yaml         k8s/aicore-secret.yaml
cp k8s/graph-grantor-secret.example.yaml  k8s/graph-grantor-secret.yaml
# → 각 파일의 <PLACEHOLDER> 를 실제 값으로 교체

# 4) (선택) 작업 트리에 secret 누출 없는지 자가 점검
gitleaks detect --source . --no-git --config .gitleaks.toml -v
```

### 🔁 Secret Rotation 절차 (유출 의심 시)

#### 1. XSUAA Service Key 회전 (Blue-Green, 다운타임 ~0)

```bash
export KUBECONFIG=$(pwd)/kubeconfig-dev.yaml

# 1) 새 ServiceBinding 생성 (이름만 다르게)
cat <<EOF | kubectl apply -f -
apiVersion: services.cloud.sap.com/v1
kind: ServiceBinding
metadata:
  name: xsuaa-binding-v2
  namespace: store-pjt
spec:
  serviceInstanceName: xsuaa-instance
  secretName: xsuaa-binding-secret-v2
EOF

# 2) approuter-deployment.yaml 의 secretName 을 -v2 로 변경 후 재배포
#    (vi/sed 등으로 secretName: xsuaa-binding-secret → xsuaa-binding-secret-v2)
kubectl apply -f k8s/approuter-deployment.yaml
kubectl rollout restart deployment/approuter -n store-pjt

# 3) 동작 검증 (브라우저 로그인) 후 기존 binding 삭제
kubectl delete servicebinding xsuaa-binding -n store-pjt    # 유출 credential 무효화

# 4) (선택) 이름 원복 — 동일 절차를 반대로 한 번 더
```

#### 2. AI Core Service Key 회전

```bash
# 1) BTP Cockpit → AI Core Service Instance → Service Keys
#    → 기존 key 삭제 → 새 key 발급 → JSON 복사
# 2) k8s/aicore-secret.yaml 의 AICORE_SERVICE_KEY 에 새 JSON 붙여넣기
# 3) 적용 + Pod 재시작
kubectl apply -f k8s/aicore-secret.yaml
kubectl rollout restart deployment/store-pjt -n store-pjt
```

#### 3. HANA Graph 사용자 비밀번호 회전

```sql
-- HANA Database Explorer 에서:
ALTER USER GRAPH_USER_01 PASSWORD "<NEW_PASSWORD>" NO FORCE_FIRST_PASSWORD_CHANGE;
```

```bash
# k8s/graph-grantor-secret.yaml 의 password 필드를 동일한 새 값으로 변경 후
kubectl apply -f k8s/graph-grantor-secret.yaml
# graph-grantor 는 hdi-deployer Job 에서만 사용되므로,
# 다음 HDI deploy 시 자동 반영됨 (즉시 재시작 불필요)
```

#### 4. Git history 에 노출된 경우 (포함 commit 정리)

```bash
# 1) 안전 백업 (mirror)
cd ..
git clone --mirror https://github.com/DoHyun-Mun/store-pjt.git \
    store-pjt-backup-$(date +%Y%m%d-%H%M).git

# 2) git-filter-repo 로 히스토리에서 영구 제거
cd store-pjt
brew install git-filter-repo   # 미설치 시
git filter-repo --invert-paths \
  --path k8s/aicore-secret.yaml \
  --path k8s/graph-grantor-secret.yaml

# 3) gitleaks 재검증
gitleaks detect --source . --config .gitleaks.toml --redact

# 4) origin remote 재등록 + force push
git remote add origin https://github.com/DoHyun-Mun/store-pjt.git
git push --force origin --all
git push --force origin --tags

# ⚠️ 다른 협업자가 있다면 사전 공지 후, 모두 다시 clone 받도록 안내 필요
```

### 자동화된 누출 차단

- `.gitleaks.toml` — SAP/k8s 환경에 맞춘 커스텀 룰셋
- `.githooks/pre-commit` — staged 변경분에 대해 `gitleaks protect --staged` 실행
- 위반 시 commit이 차단됨. 정 우회가 필요하면 `git commit --no-verify` (권장하지 않음)

---

## 📝 라이선스

UNLICENSED - Private Project (SAP BTP AI Workshop 2026)
