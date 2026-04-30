#!/bin/bash
# ══════════════════════════════════════════════════════════════════════
# Kyma 배포 자동화 스크립트
# 사용법: ./scripts/deploy-kyma.sh [kubeconfig-path]
# ══════════════════════════════════════════════════════════════════════

set -e

# ─── 색상 정의 ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── 변수 설정 ───
KUBECONFIG_PATH="${1:-kubeconfig-dev.yaml}"
NAMESPACE="store-pjt"
DOCKER_REGISTRY="ghcr.io/dohyun-mun"
APP_NAME="store-pjt"

echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Kyma 배포 자동화 - ${APP_NAME}${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─── Step 0: 사전 확인 ───
echo -e "${YELLOW}[Step 0] 사전 요구사항 확인...${NC}"

# kubeconfig 파일 확인
if [ ! -f "$KUBECONFIG_PATH" ]; then
    echo -e "${RED}❌ kubeconfig 파일을 찾을 수 없습니다: $KUBECONFIG_PATH${NC}"
    echo ""
    echo -e "${YELLOW}Kyma Runtime kubeconfig를 다운로드하려면:${NC}"
    echo "  1. BTP Cockpit → Subaccount → Overview 페이지"
    echo "  2. 'Kyma Environment' 탭 → 'KubeconfigURL' 링크 클릭"
    echo "     또는 'btp CLI' 사용:"
    echo "     btp get security/oidc-token --subaccount <subaccount-id>"
    echo ""
    echo "  3. 또는 BTP Cockpit → Subaccount → Kyma Dashboard 접속"
    echo "     → 우측 상단 사용자 아이콘 → 'Get Kubeconfig' 클릭"
    echo ""
    echo "  4. 다운로드한 파일을 프로젝트 루트에 저장:"
    echo "     mv ~/Downloads/kubeconfig.yaml ./kubeconfig-dev.yaml"
    echo ""
    echo "  사용법: $0 [kubeconfig-파일-경로]"
    exit 1
fi

export KUBECONFIG="$KUBECONFIG_PATH"
echo -e "  ✅ kubeconfig: ${KUBECONFIG_PATH}"

# kubectl 확인
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl이 설치되어 있지 않습니다.${NC}"
    echo "  brew install kubectl"
    exit 1
fi
echo -e "  ✅ kubectl: $(kubectl version --client --short 2>/dev/null || kubectl version --client -o json | jq -r '.clientVersion.gitVersion')"

# docker 확인
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ docker가 설치되어 있지 않습니다.${NC}"
    exit 1
fi
echo -e "  ✅ docker: $(docker --version | awk '{print $3}')"

# 클러스터 연결 확인
echo -e "${YELLOW}  클러스터 연결 확인 중...${NC}"
if ! kubectl cluster-info --request-timeout=10s &> /dev/null; then
    echo -e "${RED}❌ Kyma 클러스터에 연결할 수 없습니다.${NC}"
    echo "  kubeconfig가 유효한지, OIDC 로그인이 필요한지 확인하세요."
    echo "  kubectl-oidc_login 플러그인이 필요합니다:"
    echo "    brew install int128/kubelogin/kubelogin"
    exit 1
fi
CLUSTER_URL=$(kubectl cluster-info 2>/dev/null | head -1 | grep -oE 'https://[^ ]+' || echo "연결됨")
echo -e "  ✅ 클러스터: ${CLUSTER_URL}"
echo ""

# ─── Step 1: Namespace 생성 ───
echo -e "${YELLOW}[Step 1] Namespace 생성...${NC}"
kubectl apply -f k8s/namespace.yaml
echo -e "  ${GREEN}✅ Namespace '${NAMESPACE}' 준비 완료${NC}"
echo ""

# ─── Step 2: Docker 이미지 빌드 & Push ───
echo -e "${YELLOW}[Step 2] Docker 이미지 빌드 & Push...${NC}"

echo -e "  📦 CAP Backend 빌드 중..."
docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:latest --platform linux/amd64 . -q
echo -e "  ${GREEN}✅ CAP Backend 이미지 빌드 완료${NC}"

echo -e "  📦 HDI Deployer 빌드 중..."
docker build -f Dockerfile.hdi-deployer -t ${DOCKER_REGISTRY}/${APP_NAME}-hdi-deployer:latest --platform linux/amd64 . -q
echo -e "  ${GREEN}✅ HDI Deployer 이미지 빌드 완료${NC}"

if [ -d "approuter" ]; then
    echo -e "  📦 Approuter 빌드 중..."
    docker build -t ${DOCKER_REGISTRY}/${APP_NAME}-approuter:latest --platform linux/amd64 approuter/ -q
    echo -e "  ${GREEN}✅ Approuter 이미지 빌드 완료${NC}"
fi

echo -e "  🚀 이미지 Push 중..."
docker push ${DOCKER_REGISTRY}/${APP_NAME}:latest -q
docker push ${DOCKER_REGISTRY}/${APP_NAME}-hdi-deployer:latest -q
[ -d "approuter" ] && docker push ${DOCKER_REGISTRY}/${APP_NAME}-approuter:latest -q
echo -e "  ${GREEN}✅ 모든 이미지 Push 완료${NC}"
echo ""

# ─── Step 3: BTP Service Operator 리소스 배포 ───
echo -e "${YELLOW}[Step 3] BTP Service Operator 리소스 배포 (XSUAA + HANA)...${NC}"

kubectl apply -f k8s/xsuaa-serviceinstance.yaml
kubectl apply -f k8s/xsuaa-servicebinding.yaml
echo -e "  ✅ XSUAA ServiceInstance/ServiceBinding 적용"

kubectl apply -f k8s/hana-serviceinstance.yaml
kubectl apply -f k8s/hana-servicebinding.yaml
echo -e "  ✅ HANA HDI ServiceInstance/ServiceBinding 적용"

echo -e "  ⏳ ServiceBinding이 Ready 될 때까지 대기 중..."
for i in $(seq 1 60); do
    HANA_STATUS=$(kubectl get servicebinding hana-hdi-binding -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
    XSUAA_STATUS=$(kubectl get servicebinding xsuaa-binding -n ${NAMESPACE} -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}' 2>/dev/null || echo "Unknown")
    
    if [ "$HANA_STATUS" = "True" ] && [ "$XSUAA_STATUS" = "True" ]; then
        echo -e "  ${GREEN}✅ 모든 ServiceBinding Ready!${NC}"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo -e "  ${YELLOW}⚠️  타임아웃 (5분). 수동으로 확인하세요:${NC}"
        echo "     kubectl get serviceinstances,servicebindings -n ${NAMESPACE}"
        echo "  계속 진행합니다..."
        break
    fi
    
    echo -ne "  ⏳ 대기 중... (${i}/60) HANA=${HANA_STATUS}, XSUAA=${XSUAA_STATUS}\r"
    sleep 5
done
echo ""

# ─── Step 4: HDI Deployer 실행 ───
echo -e "${YELLOW}[Step 4] HDI Deployer 실행 (스키마 + CSV 데이터 배포)...${NC}"
kubectl delete job hdi-deployer -n ${NAMESPACE} 2>/dev/null || true
sleep 2
kubectl apply -f k8s/hdi-deployer-job.yaml

echo -e "  ⏳ HDI Deployer 완료 대기 중..."
kubectl wait --for=condition=complete job/hdi-deployer -n ${NAMESPACE} --timeout=300s 2>/dev/null || {
    echo -e "  ${YELLOW}⚠️  HDI Deployer 타임아웃. 로그 확인:${NC}"
    kubectl logs job/hdi-deployer -n ${NAMESPACE} --tail=10
}
echo -e "  ${GREEN}✅ HDI Deploy 완료${NC}"
echo ""

# ─── Step 5: Secrets & ConfigMap 배포 ───
echo -e "${YELLOW}[Step 5] Secrets & ConfigMap 배포...${NC}"
kubectl apply -f k8s/uaa-default-services-secret.yaml
kubectl apply -f k8s/approuter-xs-app-configmap.yaml
echo -e "  ${GREEN}✅ Secrets & ConfigMap 적용 완료${NC}"
echo ""

# ─── Step 6: CAP Backend 배포 ───
echo -e "${YELLOW}[Step 6] CAP Backend 배포...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
echo -e "  ${GREEN}✅ CAP Backend 배포 완료${NC}"
echo ""

# ─── Step 7: Approuter 배포 ───
echo -e "${YELLOW}[Step 7] Approuter 배포...${NC}"
kubectl apply -f k8s/approuter-deployment.yaml
kubectl apply -f k8s/approuter-service.yaml
echo -e "  ${GREEN}✅ Approuter 배포 완료${NC}"
echo ""

# ─── Step 8: APIRule 배포 ───
echo -e "${YELLOW}[Step 8] APIRule (Istio Gateway) 배포...${NC}"
kubectl apply -f k8s/apirule.yaml
echo -e "  ${GREEN}✅ APIRule 배포 완료${NC}"
echo ""

# ─── Step 9: 배포 상태 확인 ───
echo -e "${YELLOW}[Step 9] 배포 상태 확인...${NC}"
echo ""
echo -e "${BLUE}── Pods ──${NC}"
kubectl get pods -n ${NAMESPACE} -o wide
echo ""
echo -e "${BLUE}── Services ──${NC}"
kubectl get services -n ${NAMESPACE}
echo ""
echo -e "${BLUE}── APIRules ──${NC}"
kubectl get apirules -n ${NAMESPACE}
echo ""

# 앱 URL 추출
APP_HOST=$(kubectl get apirule ${APP_NAME} -n ${NAMESPACE} -o jsonpath='{.spec.hosts[0]}' 2>/dev/null || echo "store-pjt.c56380c.kyma.ondemand.com")

echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 배포 완료!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 앱 URL: ${BLUE}https://${APP_HOST}/${NC}"
echo ""
echo -e "  📋 유용한 명령어:"
echo "     kubectl get pods -n ${NAMESPACE}                    # Pod 상태"
echo "     kubectl logs -f deploy/store-pjt -n ${NAMESPACE}  # 로그"
echo "     kubectl rollout restart deploy -n ${NAMESPACE}       # 재시작"
echo ""