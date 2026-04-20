# 점포 상품별 재고 발주 관리 시스템

SAP CAP (Cloud Application Programming Model) + Fiori Elements를 활용한 OData V4 기반 점포 상품별 재고·발주·고객·매출 관리 풀스택 애플리케이션입니다.

**Kyma Runtime 배포** | **SAP HANA Cloud** | **XSUAA 인증** | **16개 Fiori Elements 앱**

## 📁 프로젝트 구조

```
fiori-mcp-test/
├── db/
│   ├── schema.cds                          # CDS 데이터 모델 (18개 엔티티)
│   └── data/                               # 초기 CSV 데이터 (19개 파일)
│       ├── com.inventory-Categories.csv
│       ├── com.inventory-Products.csv
│       ├── com.inventory-Stores.csv
│       ├── com.inventory-Suppliers.csv
│       ├── com.inventory-Materials.csv
│       ├── com.inventory-ProductMaterials.csv
│       ├── com.inventory-StoreProducts.csv
│       ├── com.inventory-Inventories.csv
│       ├── com.inventory-PurchaseOrders.csv
│       ├── com.inventory-SupplyOrders.csv
│       ├── com.inventory-SupplyOrderItems.csv
│       ├── com.inventory-Customers.csv
│       ├── com.inventory-CustomerPurchases.csv
│       ├── com.inventory-CustomerPurchaseItems.csv
│       ├── com.inventory-DailySales.csv
│       ├── com.inventory-InventorySnapshots.csv
│       ├── com.inventory-DemandForecasts.csv
│       ├── com.inventory-OrderRecommendations.csv
│       └── com.inventory-MenuItems.csv
├── srv/
│   ├── service.cds                         # OData V4 서비스 정의 (InventoryService)
│   ├── service.js                          # 서비스 핸들러 (Actions, Before/After 이벤트)
│   └── annotations.cds                     # 공통 Fiori Elements UI Annotations
├── app/
│   ├── index.html                          # 커스텀 대시보드 (KPI + Chart.js 차트 + 메뉴 기반 네비게이션)
│   ├── services.cds                        # 앱 레벨 서비스 설정
│   ├── categories/                         # 분류 관리 Fiori Elements 앱
│   │   ├── annotations.cds
│   │   ├── webapp/manifest.json
│   │   └── ui5.yaml
│   ├── products/                           # 상품 관리
│   ├── stores/                             # 점포 관리
│   ├── suppliers/                          # 공급업체 관리
│   ├── materials/                          # 자재 관리
│   ├── storeproducts/                      # 점포별 상품 관리
│   ├── inventories/                        # 재고 관리
│   ├── purchaseorders/                     # 발주 관리
│   ├── supplyorders/                       # 공급/입출고 주문
│   ├── customers/                          # 고객 관리
│   ├── customerpurchases/                  # 고객 구매 이력
│   ├── dailysales/                         # 일별 매출 집계
│   ├── inventorysnapshots/                 # 재고 스냅샷 이력
│   ├── demandforecasts/                    # 수요 예측 결과 (ML)
│   ├── orderrecommendations/               # 발주 추천 (ML 기반)
│   └── menus/                              # 메뉴 관리 (3계층 트리)
├── approuter/
│   ├── Dockerfile                          # Approuter Docker 이미지
│   ├── package.json                        # @sap/approuter 의존성
│   └── xs-app.json                         # 라우팅 설정 (XSUAA 인증)
├── k8s/                                    # Kyma/K8s 배포 매니페스트
│   ├── namespace.yaml
│   ├── deployment.yaml                     # CAP Backend Deployment
│   ├── service.yaml                        # CAP Backend ClusterIP Service
│   ├── approuter-deployment.yaml           # Approuter Deployment
│   ├── approuter-service.yaml              # Approuter ClusterIP Service
│   ├── approuter-xs-app-configmap.yaml     # Approuter xs-app.json ConfigMap
│   ├── apirule.yaml                        # Istio Gateway 외부 접속
│   ├── xsuaa-serviceinstance.yaml          # BTP Service Operator → XSUAA 프로비저닝
│   ├── xsuaa-servicebinding.yaml           # XSUAA credentials Secret 생성
│   ├── uaa-default-services-secret.yaml    # Approuter용 XSUAA credentials
│   ├── hana-serviceinstance.yaml           # HANA Cloud ServiceInstance
│   ├── hana-servicebinding.yaml            # HANA Cloud ServiceBinding
│   ├── hdi-deployer-job.yaml               # HDI Deployer Job (스키마/데이터 배포)
│   └── README.md                           # K8s 리소스 상세 설명
├── scripts/
│   ├── generate-data.js                    # 초기 데이터 생성 스크립트
│   └── generate-bulk-data.js               # 대량 데이터 생성 스크립트
├── Dockerfile                              # CAP Backend Docker 이미지
├── Dockerfile.hdi-deployer                 # HDI Deployer Docker 이미지
├── server.js                               # CAP 서버 커스텀 부트스트랩
├── xs-security.json                        # XSUAA 보안 설정
├── .cdsrc.json                             # CAP 설정
├── package.json                            # 프로젝트 의존성 & CDS 설정
└── README.md
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 로컬 개발 (SQLite 인메모리)

```bash
npm run watch
# 또는
cds watch
```

서버가 시작되면 http://localhost:4004 접속

### 3. Fiori Elements 앱 접근

- **대시보드**: http://localhost:4004/index.html (KPI + 차트 + 메뉴 네비게이션)
- **개별 앱 직접 접근**: http://localhost:4004/{앱이름}/webapp/index.html

## 📋 데이터 모델 (db/schema.cds)

### 마스터 데이터

| 엔티티 | 설명 | 주요 필드 |
|--------|------|-----------|
| **Categories** | 분류 마스터 | code, name, isActive |
| **Products** | 상품 마스터 | productCode, name, category, costPrice, sellingPrice, marginRate |
| **Stores** | 점포 마스터 | storeCode, name, city, storeType(Store/Warehouse/Online) |
| **Suppliers** | 공급업체 | supplierCode, name, leadTime, rating |
| **Materials** | 자재 마스터 | materialCode, materialType(RAW/SUB/PKG), unitPrice, safetyStock |
| **Customers** | 고객 마스터 | customerCode, name, membershipType(REGULAR/SILVER/GOLD/VIP), ageGroup |
| **MenuItems** | 메뉴 관리 | code, title, icon, level(1~3계층), parent, url |

### 관계/매핑 데이터

| 엔티티 | 설명 |
|--------|------|
| **StoreProducts** | 점포별 상품 (점포별 판매가/원가, min/maxStock) |
| **ProductMaterials** | 상품-자재 BOM (상품 1단위당 필요 자재 수량) |
| **Inventories** | 재고 (점포×상품별 수량, 예약수량, 가용수량) |

### 거래 데이터

| 엔티티 | 설명 | 상태 |
|--------|------|------|
| **PurchaseOrders** | 발주 | Draft → Submitted → Approved → Received (또는 Rejected) |
| **SupplyOrders** | 공급/입출고 주문 | Draft → Confirmed → Shipped → Delivered (또는 Cancelled) |
| **SupplyOrderItems** | 공급 주문 상세 품목 (Composition) |
| **CustomerPurchases** | 고객 구매 이력 | paymentMethod: CASH/CARD/MOBILE/POINTS |
| **CustomerPurchaseItems** | 구매 상세 품목 (Composition) |

### 분석/ML 데이터

| 엔티티 | 설명 | 용도 |
|--------|------|------|
| **DailySales** | 일별 매출 집계 | ML 수요 예측 입력, 대시보드 차트 |
| **InventorySnapshots** | 재고 스냅샷 이력 | ML 재고 최적화 입력, 대시보드 차트 |
| **DemandForecasts** | 수요 예측 결과 | ML 출력 저장 (Prophet, LSTM 등) |
| **OrderRecommendations** | 발주 추천 | ML 예측 기반 자동 발주 추천 |

## ⚙️ OData V4 서비스 (srv/service.cds)

### 서비스 엔드포인트

서비스 경로: `/inventory`

```
GET  /inventory/Products
GET  /inventory/Products?$select=productCode,name,sellingPrice&$orderby=sellingPrice desc
GET  /inventory/Products?$filter=isActive eq true&$expand=category
GET  /inventory/Stores?$expand=inventories($expand=product)
GET  /inventory/DailySales?$orderby=salesDate asc&$select=salesDate,revenue
GET  /inventory/PurchaseOrders?$expand=product,store,supplier
GET  /inventory/$metadata
```

### Bound Actions (서비스 핸들러)

**PurchaseOrders (발주)**
| 액션 | 설명 | 상태 전이 |
|------|------|-----------|
| `submitOrder` | 승인 요청 | Draft → Submitted |
| `approveOrder` | 승인 | Submitted → Approved |
| `rejectOrder(reason)` | 반려 | Submitted → Rejected |
| `receiveOrder(warehouse)` | 입고 처리 (재고 반영) | Approved → Received |

**SupplyOrders (공급 주문)**
| 액션 | 설명 | 상태 전이 |
|------|------|-----------|
| `confirmOrder` | 주문 확정 | Draft → Confirmed |
| `shipOrder` | 출하 | Confirmed → Shipped |
| `deliverOrder` | 배송 완료 (재고 반영) | Shipped → Delivered |
| `cancelOrder(reason)` | 주문 취소 | Draft/Confirmed → Cancelled |

### 자동 이벤트 핸들러 (srv/service.js)

- `before CREATE PurchaseOrders`: PO 번호 자동 채번 (`PO-YYYYMMDD-XXXX`)
- `before CREATE SupplyOrders`: SO 번호 자동 채번 (`SO-YYYYMMDD-XXXX`)
- `before CREATE CustomerPurchases`: CP 번호 자동 채번 (`CP-YYYYMMDD-XXXX`)
- `after CREATE/UPDATE/DELETE SupplyOrderItems`: 주문 총금액 자동 계산
- `after CREATE/UPDATE/DELETE CustomerPurchaseItems`: 구매 총금액 자동 계산
- `receiveOrder`: 재고 자동 반영 (Inventories 수량 업데이트)

## 🎨 대시보드 (app/index.html)

DB 기반 3계층 메뉴 구조를 사용하는 커스텀 대시보드:

- **KPI 카드**: 상품, 점포, 재고, 발주, 공급업체, 고객 건수 실시간 표시
- **Chart.js 차트**: 일별 매출 추이(Line), 재고 추이(Line), 발주 승인 현황(Doughnut)
- **메뉴 네비게이션**: MenuItems 엔티티에서 동적 로딩 → 상단 탑메뉴 + 사이드바 + iframe으로 Fiori 앱 표시
- **바로가기**: 주요 앱으로 빠른 접근

## 🖥️ Fiori Elements 앱 (16개)

모든 앱은 **List Report + Object Page** 패턴:

| 앱 | 경로 | 설명 |
|----|------|------|
| 분류 관리 | `/categories/webapp/` | 상품 분류 CRUD |
| 상품 관리 | `/products/webapp/` | 상품 마스터 CRUD, 카테고리 연결 |
| 점포 관리 | `/stores/webapp/` | 점포 마스터 CRUD |
| 공급업체 관리 | `/suppliers/webapp/` | 공급업체 CRUD |
| 자재 관리 | `/materials/webapp/` | 자재 마스터 CRUD |
| 점포별 상품 | `/storeproducts/webapp/` | 점포-상품 매핑 관리 |
| 재고 관리 | `/inventories/webapp/` | 점포×상품별 재고 관리 |
| 발주 관리 | `/purchaseorders/webapp/` | 발주 생성/승인/입고 (Bound Actions) |
| 공급 주문 | `/supplyorders/webapp/` | 공급/입출고 주문 관리 |
| 고객 관리 | `/customers/webapp/` | 고객 마스터 CRUD |
| 고객 구매 이력 | `/customerpurchases/webapp/` | 구매 이력 + 상세 품목 |
| 일별 매출 | `/dailysales/webapp/` | 매출 집계 데이터 |
| 재고 스냅샷 | `/inventorysnapshots/webapp/` | 재고 이력 스냅샷 |
| 수요 예측 | `/demandforecasts/webapp/` | ML 수요 예측 결과 |
| 발주 추천 | `/orderrecommendations/webapp/` | ML 기반 발주 추천 |
| 메뉴 관리 | `/menus/webapp/` | 3계층 메뉴 트리 CRUD |

## ☁️ Kyma Runtime 배포

### 아키텍처

```
[브라우저]
    ↓
[APIRule / Istio Gateway]
    ↓
[Approuter (XSUAA 인증)] ←→ [XSUAA (BTP Service Operator)] ←→ [IAS (IdP/SSO)]
    ↓
[CAP Backend :4004]
    ↓
[SAP HANA Cloud (HDI Container)]
```

### 접속 URL

https://fiori-mcp-test.c56380c.kyma.ondemand.com/

### 배포된 K8s 리소스

| 리소스 | 파일 | 설명 |
|--------|------|------|
| Namespace | `k8s/namespace.yaml` | `fiori-mcp-test` namespace |
| XSUAA ServiceInstance | `k8s/xsuaa-serviceinstance.yaml` | BTP Service Operator → XSUAA 프로비저닝 |
| XSUAA ServiceBinding | `k8s/xsuaa-servicebinding.yaml` | XSUAA credentials → K8s Secret |
| UAA Default Services Secret | `k8s/uaa-default-services-secret.yaml` | Approuter용 `default-services.json` |
| HANA ServiceInstance | `k8s/hana-serviceinstance.yaml` | HANA Cloud HDI Container 프로비저닝 |
| HANA ServiceBinding | `k8s/hana-servicebinding.yaml` | HANA credentials → K8s Secret |
| HDI Deployer Job | `k8s/hdi-deployer-job.yaml` | 스키마 + CSV 데이터 HANA 배포 |
| Approuter ConfigMap | `k8s/approuter-xs-app-configmap.yaml` | `xs-app.json` 라우팅 설정 |
| Approuter Deployment | `k8s/approuter-deployment.yaml` | XSUAA 인증 + 라우팅 |
| Approuter Service | `k8s/approuter-service.yaml` | Approuter ClusterIP Service |
| CAP Backend Deployment | `k8s/deployment.yaml` | CAP Backend (Istio sidecar 비활성) |
| CAP Backend Service | `k8s/service.yaml` | CAP Backend ClusterIP Service |
| APIRule | `k8s/apirule.yaml` | Istio Gateway 외부 접속 |

### 인증 흐름 (OAuth2 Authorization Code Flow)

```
① 브라우저 → APIRule/Istio Gateway → Approuter
      ↓
② Approuter: "인증 안 됐네?" → XSUAA authorize URL로 리다이렉트
      ↓
③ 브라우저 → XSUAA (BTP 클라우드, Kyma 외부)
      ↓
④ XSUAA → IAS(IdP) 로그인 페이지로 리다이렉트
      ↓
⑤ 사용자 로그인 (ID/PW 또는 SSO)
      ↓
⑥ IAS → XSUAA로 SAML assertion 전달
      ↓
⑦ XSUAA → authorization code 발급 → Approuter callback
      ↓
⑧ Approuter → XSUAA에 authorization code로 JWT 교환
      ↓
⑨ XSUAA → JWT 토큰 발급
      ↓
⑩ Approuter → JWT를 세션에 저장 → CAP Backend로 포워딩 (Authorization 헤더)
      ↓
⑪ CAP Backend → Fiori 앱 + OData 응답
```

### 핵심 포인트

- **XSUAA**는 Kyma 안에서 실행되지 않는다. BTP 클라우드 서비스로 외부에서 운영된다.
- **ServiceInstance/ServiceBinding**은 BTP Service Operator가 BTP 클라우드의 서비스를 프로비저닝하고, credentials을 K8s Secret으로 주입하는 역할.
- **Approuter**가 Kyma 안에서 XSUAA credentials로 OAuth2 flow 수행.
- **IAS**는 XSUAA 뒤의 실제 IdP, XSUAA가 인증을 IAS에 위임.
- **HANA Cloud**: HDI Deployer Job이 스키마(CDS → HANA 테이블)와 CSV 데이터를 한번에 배포.

## 🐳 Docker 빌드 & 배포

### Docker 이미지 빌드

```bash
# CAP Backend (linux/amd64 for Kyma)
docker build --platform linux/amd64 -t ghcr.io/dohyun-mun/fiori-mcp-test:latest .
docker push ghcr.io/dohyun-mun/fiori-mcp-test:latest

# Approuter
cd approuter
docker build --platform linux/amd64 -t ghcr.io/dohyun-mun/fiori-mcp-test-approuter:latest .
docker push ghcr.io/dohyun-mun/fiori-mcp-test-approuter:latest

# HDI Deployer
docker build --platform linux/amd64 -f Dockerfile.hdi-deployer -t ghcr.io/dohyun-mun/fiori-mcp-test-hdi-deployer:latest .
docker push ghcr.io/dohyun-mun/fiori-mcp-test-hdi-deployer:latest
```

### 배포 순서

```bash
# kubeconfig 설정 (Kyma 클러스터)
export KUBECONFIG=kubeconfig-dev.yaml

# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. XSUAA (BTP Service Operator)
kubectl apply -f k8s/xsuaa-serviceinstance.yaml
kubectl apply -f k8s/xsuaa-servicebinding.yaml

# 3. HANA Cloud (BTP Service Operator)
kubectl apply -f k8s/hana-serviceinstance.yaml
kubectl apply -f k8s/hana-servicebinding.yaml

# 4. HDI Deployer (스키마 + 데이터 배포)
kubectl apply -f k8s/hdi-deployer-job.yaml

# 5. Secrets & ConfigMap
kubectl apply -f k8s/uaa-default-services-secret.yaml
kubectl apply -f k8s/approuter-xs-app-configmap.yaml

# 6. CAP Backend
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# 7. Approuter
kubectl apply -f k8s/approuter-deployment.yaml
kubectl apply -f k8s/approuter-service.yaml

# 8. APIRule (외부 접속)
kubectl apply -f k8s/apirule.yaml
```

### 롤링 업데이트 (코드 변경 후 재배포)

```bash
# CAP Backend만 재시작
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment fiori-mcp-test -n fiori-mcp-test

# Approuter도 재시작
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment approuter -n fiori-mcp-test

# Pod 상태 확인
KUBECONFIG=kubeconfig-dev.yaml kubectl get pods -n fiori-mcp-test
```

## ⚠️ 해결한 주요 이슈

| 이슈 | 원인 | 해결 |
|------|------|------|
| IAS 직접 인증 불가 | IAS는 XSUAA Bundled 타입으로 직접 authorization_code flow 불가 | XSUAA 인증으로 전환 |
| 502 Bad Gateway (ECONNRESET) | Istio sidecar mTLS 충돌 | Approuter/CAP 양쪽 `sidecar.istio.io/inject: "false"` |
| HANA에서 차트 데이터 1건만 표시 | HANA OData V4에서 `Decimal` 타입을 문자열 반환 | `parseFloat()` 적용 |
| 대시보드 메뉴 로딩 지연 | 사이드바 클릭 시 iframe 매번 새로 로딩 | 단일 iframe + 스피너 방식 |

## 🔧 개발 환경

| 항목 | 버전/설정 |
|------|-----------|
| SAP CAP (`@sap/cds`) | ^8 |
| SAP HANA (`@cap-js/hana`) | ^1 |
| SQLite (로컬) | `@cap-js/sqlite` ^1 |
| XSUAA (`@sap/xssec`) | ^4.13.0 |
| UI5 Tooling | `@sap/ux-ui5-tooling` ^1, `@ui5/cli` ^3 |
| 로컬 DB | SQLite 인메모리 (`:memory:`) |
| 프로덕션 DB | SAP HANA Cloud (HDI Container) |
| 인증 (프로덕션) | XSUAA → IAS (OAuth2 Authorization Code) |
| 인증 (로컬) | dummy (인증 없음) |

## 📚 참고 자료

- [SAP CAP Documentation](https://cap.cloud.sap/docs/)
- [Fiori Elements Documentation](https://ui5.sap.com/#/topic/03265b0408e2432c9571d6b3feb6b1fd)
- [OData V4 Annotations](https://cap.cloud.sap/docs/advanced/odata#annotations)
- [CDS Annotations for Fiori](https://cap.cloud.sap/docs/cds/annotations)
- [SAP BTP Service Operator](https://github.com/SAP/sap-btp-service-operator)
- [SAP Approuter](https://www.npmjs.com/package/@sap/approuter)
- [Kyma Runtime Documentation](https://help.sap.com/docs/btp/sap-business-technology-platform/kyma-environment)