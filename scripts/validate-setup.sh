#!/bin/bash
# CafeLove Setup Validation Script
# Checks all prerequisites are installed and configured correctly

set -e

echo "=========================================="
echo "🔍 CafeLove Setup Validation"
echo "=========================================="
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_command() {
    local cmd=$1
    local name=$2
    
    if command -v "$cmd" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name installed"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $name not found (required)"
        ((CHECKS_FAILED++))
    fi
}

check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $name exists"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $name missing"
        ((CHECKS_FAILED++))
    fi
}

check_file_content() {
    local file=$1
    local pattern=$2
    local name=$3
    
    if [ -f "$file" ] && grep -q "$pattern" "$file"; then
        echo -e "${GREEN}✓${NC} $name configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $name not configured"
        ((CHECKS_FAILED++))
    fi
}

# 1. Check Docker
echo "📦 Docker & Container Tools"
check_command docker "Docker"

# 2. Check Ansible
echo ""
echo "🎯 Ansible & Deployment Tools"
check_command ansible "Ansible"

# 3. Check Git
echo ""
echo "🔗 Git Configuration"
check_command git "Git"

# 4. Check Jenkinsfile
echo ""
echo "🏗️  Pipeline Configuration"
check_file "Jenkinsfile" "Jenkinsfile"
check_file_content "Jenkinsfile" "retryPush" "Docker push retry logic"

# 5. Check Ansible inventory
echo ""
echo "📋 Ansible Inventory"
check_file "infra/ansible/inventory.ini" "Ansible inventory"

# Check if inventory has actual content (not just defaults)
if [ -f "infra/ansible/inventory.ini" ]; then
    if grep -q "^\\[web\\]" "infra/ansible/inventory.ini"; then
        if ! grep -q "your-ec2" "infra/ansible/inventory.ini"; then
            echo -e "${GREEN}✓${NC} Ansible inventory updated with host"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} Ansible inventory still has placeholder IP"
            ((CHECKS_FAILED++))
        fi
    fi
fi

# 6. Check Ansible playbook
echo ""
echo "📜 Ansible Playbook"
check_file "infra/ansible/deploy.yml" "Ansible playbook"
check_file_content "infra/ansible/deploy.yml" "community.docker" "Ansible Docker collection"

# 7. Check documentation
echo ""
echo "📚 Documentation"
check_file "DEPLOYMENT.md" "DEPLOYMENT.md guide"
check_file "infra/ansible/README.md" "Ansible README"

# 8. Check Docker credentials
echo ""
echo "🔐 Docker Configuration (Optional)"
if [ -d ~/.docker ]; then
    echo -e "${GREEN}✓${NC} Docker config directory exists"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Docker not configured locally (OK if only on Jenkins)"
fi

# Summary
echo ""
echo "=========================================="
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Update infra/ansible/inventory.ini with your EC2 IP"
    echo "2. Create Jenkins credentials: dockerhub-creds and ec2-ssh-key"
    echo "3. Configure EC2 security groups (ports 22, 80, 5000)"
    echo "4. SSH to EC2 and install Docker"
    echo "5. Push code: git commit && git push origin main"
    echo ""
    exit 0
else
    echo -e "${RED}✗ $CHECKS_FAILED check(s) failed${NC}"
    echo ""
    echo "⚠️  Fix issues above and re-run this script"
    echo ""
    exit 1
fi
