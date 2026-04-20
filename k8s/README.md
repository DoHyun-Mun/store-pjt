# Kyma Deployment Guide

## 아키텍처

```
[브라우저] → [APIRule/Istio Gateway] → [Approuter (XSUAA 인증)] → [CAP Backend] → [HANA Cloud]
                                              ↓
                                    [XSUAA (BTP Service Operator)]
                                              ↓
                                         [IAS (IdP)]
```

## 사전 요구사항

1. Kyma 클러스터에 접근 가능한 kubeconfig (`kubeconfig-dev.yaml`)
2. BTP Service Operator가 설치되어 있어야 함
3. Docker 이미지가 ghcr.io에 push 되어 있어야 함
4. ghcr-secret이 namespace에 생성되어 있어야 함
5. SAP HANA Cloud 인스턴스가 BTP subaccount에 프로비저닝 되어 있어야 함

## 배포 순서

### 1. Namespace 생성
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/namespace.yaml
```

### 2. XSUAA ServiceInstance & ServiceBinding 생성 (BTP Service Operator)
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/xsuaa-serviceinstance.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/xsuaa-servicebinding.yaml
```

ServiceInstance와 ServiceBinding이 Ready 상태인지 확인:
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl get serviceinstances,servicebindings -n fiori-mcp-test
```

ServiceBinding이 생성되면 `xsuaa-binding-secret` Secret이 자동 생성됩니다.
이 Secret의 credentials를 사용하여 `uaa-default-services-secret.yaml`의 `default-services.json`을 업데이트합니다.

### 3. HANA Cloud HDI Container 생성 (BTP Service Operator)
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/hana-serviceinstance.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/hana-servicebinding.yaml
```

상태 확인:
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl get serviceinstances,servicebindings -n fiori-mcp-test
```

ServiceBinding이 Ready 되면 `hana-hdi-secret` Secret이 자동 생성됩니다 (host, port, user, password, schema 등 포함).

### 4. HDI Deployer 실행 (스키마 + CSV 데이터 배포)
```bash
# 기존 Job이 있으면 삭제
KUBECONFIG=kubeconfig-dev.yaml kubectl delete job hdi-deployer -n fiori-mcp-test 2>/dev/null || true

# HDI Deployer Job 생성
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/hdi-deployer-job.yaml
```

로그 확인:
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl logs job/hdi-deployer -n fiori-mcp-test --tail=20 -f
```

`Deployment ended` 메시지가 나오면 성공입니다.

### 5. Secrets & ConfigMap 배포
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/uaa-default-services-secret.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/approuter-xs-app-configmap.yaml
```

### 6. CAP Backend 배포
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/deployment.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/service.yaml
```

### 7. Approuter 배포
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/approuter-deployment.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/approuter-service.yaml
```

### 8. APIRule (Istio Ingress) 배포
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/apirule.yaml
```

### 9. 접속 확인
```
https://fiori-mcp-test.c56380c.kyma.ondemand.com/
```

## 인증 흐름

1. 사용자가 앱 URL에 접속
2. Approuter가 XSUAA authorize URL로 리다이렉트
3. XSUAA가 설정된 IAS (Identity Authentication Service)로 인증 위임
4. 사용자가 IAS에서 로그인
5. IAS → XSUAA → Approuter로 토큰 발급
6. Approuter가 JWT 토큰을 CAP Backend로 전달

## HANA Cloud 연결 구조

```
[CAP Backend Pod]
  ├── ENV: SERVICE_BINDING_ROOT=/bindings
  ├── Volume: /bindings/hana-hdi (← hana-hdi-secret)
  │     ├── .metadata (type: hana)
  │     ├── host, port, user, password, schema, certificate ...
  └── @cap-js/hana → HANA Cloud HDI Container에 접속
```

- **BTP Service Operator**가 `hana-serviceinstance.yaml`로 HDI Container를 프로비저닝
- **ServiceBinding**이 `hana-hdi-secret`을 자동 생성 (HANA 접속 정보)
- **HDI Deployer Job**이 CDS 스키마 + CSV 데이터를 HANA에 배포
- **CAP 서버**가 `SERVICE_BINDING_ROOT=/bindings`를 통해 `/bindings/hana-hdi/` 의 credentials를 읽어 HANA 연결

## 주요 파일

| 파일 | 설명 |
|------|------|
| `k8s/namespace.yaml` | Namespace 정의 |
| `k8s/xsuaa-serviceinstance.yaml` | XSUAA ServiceInstance (BTP Service Operator) |
| `k8s/xsuaa-servicebinding.yaml` | XSUAA ServiceBinding → `xsuaa-binding-secret` 자동 생성 |
| `k8s/hana-serviceinstance.yaml` | HANA HDI Container ServiceInstance |
| `k8s/hana-servicebinding.yaml` | HANA ServiceBinding → `hana-hdi-secret` 자동 생성 |
| `k8s/hdi-deployer-job.yaml` | HDI Deployer Job (스키마+CSV 배포) |
| `k8s/uaa-default-services-secret.yaml` | Approuter의 default-services.json |
| `k8s/approuter-xs-app-configmap.yaml` | Approuter의 xs-app.json (라우팅 설정) |
| `k8s/approuter-deployment.yaml` | Approuter Deployment |
| `k8s/approuter-service.yaml` | Approuter Service |
| `k8s/deployment.yaml` | CAP Backend Deployment (HANA binding 포함) |
| `k8s/service.yaml` | CAP Backend Service |
| `k8s/apirule.yaml` | Istio Gateway APIRule |

## Docker 이미지 빌드 & Push

```bash
# CAP Backend
docker build -t ghcr.io/dohyun-mun/fiori-mcp-test:latest --platform linux/amd64 .
docker push ghcr.io/dohyun-mun/fiori-mcp-test:latest

# Approuter
cd approuter
docker build -t ghcr.io/dohyun-mun/fiori-mcp-test-approuter:latest --platform linux/amd64 .
docker push ghcr.io/dohyun-mun/fiori-mcp-test-approuter:latest

# HDI Deployer
docker build -f Dockerfile.hdi-deployer -t ghcr.io/dohyun-mun/fiori-mcp-test-hdi-deployer:latest --platform linux/amd64 .
docker push ghcr.io/dohyun-mun/fiori-mcp-test-hdi-deployer:latest
```

## 전체 재배포
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment fiori-mcp-test -n fiori-mcp-test
KUBECONFIG=kubeconfig-dev.yaml kubectl rollout restart deployment approuter -n fiori-mcp-test
```

## HDI Deployer 재실행 (스키마 변경 시)
```bash
KUBECONFIG=kubeconfig-dev.yaml kubectl delete job hdi-deployer -n fiori-mcp-test 2>/dev/null || true
KUBECONFIG=kubeconfig-dev.yaml kubectl apply -f k8s/hdi-deployer-job.yaml
KUBECONFIG=kubeconfig-dev.yaml kubectl logs job/hdi-deployer -n fiori-mcp-test --tail=20 -f