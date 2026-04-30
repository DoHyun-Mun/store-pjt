# 📦 상품 재고 관리 시스템 (Inventory Management)

> SAP CAP + Fiori Elements 기반의 종합 재고 관리 시스템

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [로컬 개발](#로컬-개발)
- [Kyma 배포](#kyma-배포)
- [HANA Graph 연동](#hana-graph-연동)
- [데이터 모델](#데이터-모델)
- [API 엔드포인트](#api-엔드포인트)

---

## 🎯 프로젝트 개요

이 프로젝트는 **SAP Cloud Application Programming Model (CAP)** 과 **SAP Fiori Elements**를 활용한 종합 재고 관리 시스템입니다.

### 주요 기능
- 🏪 **매장 관리** - 매장 정보 및 재고 현황 관리
- 📦 **상품 관리** - 카테고리별 상품 및 원재료 관리
- 📊 **재고 추적** - 실시간 재고 수량 및 이력 추적
- 🛒 **발주/수주 관리** - 공급업체 발주 및 수주 처리
- 👥 **고객 관리** - 고객 정보 및 구매 이력 관리
- 🤖 **AI 분석** - 수요 예측, 이상 탐지, 고객 세그먼트 분석

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | SAP CAP (Node.js) |
| Frontend | SAP Fiori Elements (OData V4) |
| Database | SAP HANA Cloud (Production) / SQLite (Dev) |
| Authentication | SAP XSUAA |
| Deployment | SAP BTP Kyma Runtime |
| Container | Docker + GitHub Container Registry |
| Graph | SAP HANA Cloud Graph Engine (GRAPH_USER_01) |

---

## 📁 프로젝트 구조

```
store-pjt/
├── db/
│   ├── schema.cds              # 데이터 모델 정의
│   ├── data/                   # 초기 데이터 (CSV)
│   └── src/
│       └── roles/
│           ├── .hdiconfig              # HDI artifact 타입 설정
│           ├── graph_access.hdbrole    # HANA Graph 접근 역할 (SELECT 권한)
│           └── graph_user_grants.hdbgrants  # Grantor 권한 설정
├── srv/
│   ├── service.cds             # 서비스 정의 (25개 엔티티)
│   ├── service.js              # 커스텀 핸들러 (발주/수주 상태 관리)
│   └── annotations.cds         # 공통 어노테이션
├── app/
│   ├── index.html              # Fiori Launchpad
│   ├── categories/             # 카테고리 관리 앱
│   ├── products/               # 상품 관리 앱
│   ├── stores/                 # 매장 관리 앱
│   ├── inventories/            # 재고 관리 앱
│   ├── suppliers/              # 공급업체 관리 앱
│   ├── materials/              # 원재료 관리 앱
│   ├── storeproducts/          # 매장별 상품 관리 앱
│   ├── supplyorders/           # 발주 관리 앱
│   ├── purchaseorders/         # 수주 관리 앱
│   ├── customers/              # 고객 관리 앱
│   ├── customerpurchases/      # 고객 구매 이력 앱
│   ├── dailysales/             # 일별 매출 앱
│   ├── inventorysnapshots/     # 재고 스냅샷 앱
│   ├── menus/                  # 메뉴 관리 앱
│   ├── churnpredictions/       # 이탈 예측 앱
│   ├── customersegments/       # 고객 세그먼트 앱
│   ├── salesanomalies/         # 매출 이상 탐지 앱
│   ├── demandforecasts/        # 수요 예측 앱
│   └── orderrecommendations/   # 발주 추천 앱
├── k8s/                        # Kubernetes(Kyma) 매니페스트
├── approuter/                  # SAP Approuter (인증 프록시)
├── scripts/                    # 자동화 스크립트
└── chart/                      # Helm Chart
```

---

## 🚀 로컬 개발

### 사전 요구사항
- Node.js 22+
- npm 또는 yarn
- SAP CDS CLI (`npm i -g @sap/cds-dk`)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (SQLite)
cds watch

# 특정 앱으로 직접 열기
npm run watch-categories
npm run watch-products
npm run watch-stores
```

브라우저에서 `http://localhost:4004` 접속

---

## ☸️ Kyma 배포

### 사전 요구사항
- SAP BTP Kyma Runtime 활성화
- kubectl + kubeconfig 설정
- Docker Desktop + GHCR 인증
- SAP BTP Service Operator 설치됨

### 배포 방법

```bash
# 자동 배포 (권장) - 9단계 자동 실행
./scripts/deploy-kyma.sh

# 또는 kubeconfig 경로 지정
./scripts/deploy-kyma.sh kubeconfig-dev.yaml
```

### 자동 배포 스크립트 (`deploy-kyma.sh`) 단계

| 단계 | 설명 |
|------|------|
| Step 0 | 사전 요구사항 확인 (kubeconfig, kubectl, docker, 클러스터 연결) |
| Step 1 | Namespace `store-pjt` 생성 |
| Step 2 | Docker 이미지 빌드 & Push (CAP Backend, HDI Deployer, Approuter) |
| Step 3 | BTP Service Operator 리소스 배포 (XSUAA + HANA HDI) |
| Step 4 | HDI Deployer 실행 (스키마 + CSV 데이터 + HDI roles 배포) |
| Step 5 | Secrets & ConfigMap 배포 |
| Step 6 | CAP Backend 배포 |
| Step 7 | Approuter 배포 |
| Step 8 | APIRule (Istio Gateway) 배포 |
| Step 9 | 배포 상태 확인 및 URL 출력 |

### 배포 아키텍처

```
[Browser] → [Kyma Istio Gateway]
                   ↓
             [APIRule: store-pjt]
                   ↓
             [Approuter :5000]  ←→  [XSUAA (인증)]
                   ↓
             [CAP Backend :4004]
                   ↓
             [HANA Cloud HDI Container]
                   ↓
             [GRAPH_USER_01] ← graph_access.hdbrole (SELECT 권한)
```

### Kubernetes 리소스

| 리소스 | 파일 | 설명 |
|--------|------|------|
| Namespace | `k8s/namespace.yaml` | `store-pjt` namespace |
| XSUAA ServiceInstance | `k8s/xsuaa-serviceinstance.yaml` | BTP Service Operator → XSUAA 프로비저닝 |
| XSUAA ServiceBinding | `k8s/xsuaa-servicebinding.yaml` | XSUAA Secret 바인딩 |
| HANA ServiceInstance | `k8s/hana-serviceinstance.yaml` | HANA HDI Container 프로비저닝 |
| HANA ServiceBinding | `k8s/hana-servicebinding.yaml` | HANA Secret 바인딩 |
| Graph Grantor Secret | `k8s/graph-grantor-secret.yaml` | GRAPH_USER_01 접속 정보 (HDI grantor용) |
| HDI Deployer Job | `k8s/hdi-deployer-job.yaml` | DB 스키마 + 데이터 + HDI roles 배포 |
| UAA Services Secret | `k8s/uaa-default-services-secret.yaml` | Approuter 인증 설정 |
| XS-App ConfigMap | `k8s/approuter-xs-app-configmap.yaml` | Approuter 라우팅 설정 |
| CAP Deployment | `k8s/deployment.yaml` | CAP 백엔드 서버 |
| CAP Service | `k8s/service.yaml` | ClusterIP 서비스 |
| Approuter Deployment | `k8s/approuter-deployment.yaml` | SAP Approuter (인증 프록시) |
| Approuter Service | `k8s/approuter-service.yaml` | Approuter ClusterIP |
| APIRule | `k8s/apirule.yaml` | Istio Gateway 외부 접근 |

### Docker 이미지

```bash
# CAP Backend (linux/amd64 for Kyma)
docker build --platform linux/amd64 -t ghcr.io/dohyun-mun/store-pjt:latest .
docker push ghcr.io/dohyun-mun/store-pjt:latest

# Approuter
cd approuter
docker build --platform linux/amd64 -t ghcr.io/dohyun-mun/store-pjt-approuter:latest .
docker push ghcr.io/dohyun-mun/store-pjt-approuter:latest
cd ..

# HDI Deployer
docker build --platform linux/amd64 -f Dockerfile.hdi-deployer -t ghcr.io/dohyun-mun/store-pjt-hdi-deployer:latest .
docker push ghcr.io/dohyun-mun/store-pjt-hdi-deployer:latest
```

### 유용한 명령어

```bash
# CAP Backend만 재시작
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment store-pjt -n store-pjt

# Approuter도 재시작
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment approuter -n store-pjt

# Pod 상태 확인
KUBECONFIG=kubeconfig-dev.yaml kubectl get pods -n store-pjt

# HDI Deployer 재실행
KUBECONFIG=kubeconfig-dev.yaml kubectl delete job hdi-deployer -n store-pjt --ignore-not-found
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/hdi-deployer-job.yaml

# HDI Deployer 로그 확인
KUBECONFIG=kubeconfig-dev.yaml kubectl logs -l job-name=hdi-deployer -n store-pjt --tail=30
```

### 접속 URL

```
https://store-pjt.c56380c.kyma.ondemand.com/
```

---

## 🔗 HANA Graph 연동

### 개요

SAP HANA Cloud Graph Engine을 통해 엔티티 간 관계를 그래프로 시각화하고 분석할 수 있습니다. 이를 위해 전용 DB 사용자(`GRAPH_USER_01`)에게 HDI 컨테이너의 테이블 접근 권한을 부여합니다.

### HDI Role 구조

```
db/src/roles/
├── .hdiconfig                    # artifact 타입 매핑
├── graph_access.hdbrole          # SELECT 권한 역할 (22개 테이블)
└── graph_user_grants.hdbgrants   # Grantor 권한 설정 (현재 비활성)
```

### `graph_access.hdbrole`

HDI 컨테이너 내 모든 테이블에 대한 SELECT 권한을 포함하는 역할:
- `COM_INVENTORY_CATEGORIES`, `COM_INVENTORY_PRODUCTS`, `COM_INVENTORY_STORES` 등 22개 테이블

### HDI Deployer 설정

`k8s/hdi-deployer-job.yaml`에서 HDI Deployer는 다음 볼륨을 마운트합니다:

| 볼륨 | Secret | 용도 |
|------|--------|------|
| `hana-hdi-secret-vol` | `hana-hdi-secret` | HDI 컨테이너 접속 정보 |
| `service-binding-root` | `hana-hdi-secret` | CDS 서비스 바인딩 경로 |
| `graph-grantor-vol` | `graph-grantor` | GRAPH_USER_01 접속 정보 |

환경변수:
- `TARGET_CONTAINER=hana-hdi` — 여러 HANA 서비스가 바인딩될 때 대상 컨테이너 지정

### GRAPH_USER_01에게 역할 부여 (수동)

> ⚠️ `.hdbgrants`는 **외부 → HDI 컨테이너** 방향만 지원하므로, **HDI 컨테이너 → 외부 사용자** 방향의 권한 부여는 SQL로 직접 실행해야 합니다.

HANA Cloud Database Explorer에서 HDI 컨테이너의 `#OO` (Object Owner) 사용자로 접속하여 실행:

```sql
-- HDI 컨테이너 스키마명 확인 후 실행
GRANT "<HDI_CONTAINER_SCHEMA>"."graph_access" TO GRAPH_USER_01;

-- 실제 예시 (컨테이너 스키마: 1BDCACB99B5B477498F1D59894934173)
GRANT "1BDCACB99B5B477498F1D59894934173"."graph_access" TO GRAPH_USER_01;
```

또는 HANA Cloud Central의 **User Management**에서 직접 역할을 할당할 수 있습니다.

---

## 📊 데이터 모델

### 핵심 엔티티

| 엔티티 | 설명 | 주요 필드 |
|--------|------|----------|
| Categories | 상품 카테고리 | name, description |
| Products | 상품 | name, price, stock, category |
| Stores | 매장 | name, address, phone |
| Inventories | 재고 | product, store, quantity |
| Suppliers | 공급업체 | name, contact, email |
| Materials | 원재료 | name, unit, unitPrice |
| StoreProducts | 매장별 상품 | store, product, price |
| ProductMaterials | 상품-자재 BOM | product, material, quantity |
| SupplyOrders | 발주 | supplier, orderDate, status |
| SupplyOrderItems | 발주 품목 | supplyOrder, product, quantity |
| PurchaseOrders | 수주 | customer, orderDate, status |
| Customers | 고객 | name, email, phone, grade |
| CustomerPurchases | 고객 구매 | customer, purchaseDate |
| CustomerPurchaseItems | 구매 품목 | purchase, product, quantity |
| DailySales | 일별 매출 | store, product, date, amount |
| InventorySnapshots | 재고 스냅샷 | store, product, date, quantity |
| MenuItems | 메뉴 | name, price, category (3계층 트리) |

### AI 분석 엔티티

| 엔티티 | 설명 |
|--------|------|
| DemandForecasts | 수요 예측 결과 |
| SalesAnomalies | 매출 이상 탐지 결과 |
| ChurnPredictions | 고객 이탈 예측 |
| CustomerSegments | 고객 세그먼트 분석 |
| OrderRecommendations | 자동 발주 추천 |

### 서비스 액션 (상태 관리)

**PurchaseOrders (수주)**:
- `submitOrder()` — Draft → Submitted
- `approveOrder()` — Submitted → Approved
- `rejectOrder(reason)` — Submitted → Rejected
- `receiveOrder(warehouse)` — Approved → Received (재고 반영)

**SupplyOrders (발주)**:
- `confirmOrder()` — Draft → Confirmed
- `shipOrder()` — Confirmed → Shipped
- `deliverOrder()` — Shipped → Delivered (재고 반영)
- `cancelOrder(reason)` — Draft/Confirmed → Cancelled

---

## 🔌 API 엔드포인트

기본 URL: `http://localhost:4004` (개발) 또는 `https://store-pjt.c56380c.kyma.ondemand.com` (Kyma)

| 경로 | 설명 |
|------|------|
| `/odata/v4/inventory/Categories` | 카테고리 CRUD |
| `/odata/v4/inventory/Products` | 상품 CRUD |
| `/odata/v4/inventory/Stores` | 매장 CRUD |
| `/odata/v4/inventory/Inventories` | 재고 CRUD |
| `/odata/v4/inventory/Suppliers` | 공급업체 CRUD |
| `/odata/v4/inventory/Materials` | 원재료 CRUD |
| `/odata/v4/inventory/StoreProducts` | 매장별 상품 CRUD |
| `/odata/v4/inventory/SupplyOrders` | 발주 CRUD + 상태 액션 |
| `/odata/v4/inventory/PurchaseOrders` | 수주 CRUD + 상태 액션 |
| `/odata/v4/inventory/Customers` | 고객 CRUD |
| `/odata/v4/inventory/CustomerPurchases` | 고객 구매 이력 CRUD |
| `/odata/v4/inventory/DailySales` | 일별 매출 CRUD |
| `/odata/v4/inventory/InventorySnapshots` | 재고 스냅샷 CRUD |
| `/odata/v4/inventory/MenuItems` | 메뉴 CRUD |
| `/odata/v4/inventory/DemandForecasts` | 수요 예측 조회 |
| `/odata/v4/inventory/OrderRecommendations` | 발주 추천 조회 |
| `/odata/v4/inventory/ChurnPredictions` | 이탈 예측 조회 |
| `/odata/v4/inventory/CustomerSegments` | 고객 세그먼트 조회 |
| `/odata/v4/inventory/SalesAnomalies` | 매출 이상 탐지 조회 |

---

## 📝 라이선스

UNLICENSED - Private Project