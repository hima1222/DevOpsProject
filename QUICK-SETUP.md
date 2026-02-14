# Quick Setup Checklist - Auto-Deployment

Complete this checklist to enable fully automated CI/CD with Git webhook auto-triggers and EC2 auto-deployment.

## 📋 Checklist

### Phase 1: Jenkins Setup (GitHub Webhook)

- [ ] **Install Jenkins Plugins**
  - Jenkins UI → Manage Jenkins → Manage Plugins
  - Install: `GitHub` and `GitHub API` plugins
  - Restart Jenkins

- [ ] **Create GitHub Personal Access Token (PAT)**
  - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with scopes:
    - ✓ `repo` (full control)
    - ✓ `admin:repo_hook` (webhook access)
  - Save token securely

- [ ] **Add GitHub Credentials to Jenkins**
  - Jenkins → Manage Credentials → System → Global
  - Add → GitHub Server Credentials
    - Username: `hima1222`
    - Password: `<paste your PAT>`
    - ID: `github-token`

- [ ] **Configure Jenkins GitHub Server**
  - Jenkins → Manage Jenkins → System → GitHub
  - GitHub Server URL: `https://api.github.com`
  - Credentials: Select `github-token`
  - Test connection

- [ ] **Add GitHub Webhook**
  - GitHub → Settings → Webhooks → Add webhook
  - Payload URL: `http://JENKINS_IP:8080/github-webhook/`
    - For Docker: Use host IP where Jenkins container is running
  - Content type: `application/json`
  - Events: Just the push event
  - Active: ✓
  - Save webhook

- [ ] **Test Webhook**
  - Make a test commit: `git commit --allow-empty -m "test"`
  - Push: `git push origin main`
  - Jenkins should auto-trigger (no "Build Now" button needed!)

### Phase 2: EC2 Instance Setup

- [ ] **Update EC2 Security Group**
  - Allow inbound:
    - SSH (22) - from your IP
    - HTTP (80) - from anywhere (frontend access)
    - HTTPS (443) - for future SSL
    - TCP 5000 - from anywhere (backend API)

- [ ] **Update Ansible Inventory**
  - Edit `infra/ansible/inventory.ini`
  - Replace `EC2_IP_HERE` with actual EC2 public IP
  - Example: `18.234.56.78 ansible_user=ec2-user`

- [ ] **Test Ansible Connectivity**
  ```bash
  ansible all -i infra/ansible/inventory.ini -m ping
  ```
  Should respond: `SUCCESS`

### Phase 3: Jenkins Credentials for EC2 Deployment

- [ ] **Add Docker Hub Credentials** (if not already done)
  - Jenkins → Manage Credentials → System → Global
  - Add → Username with password
    - Username: `hima1222`
    - Password: `<Docker Hub token or password>`
    - ID: `dockerhub-creds`

- [ ] **Add EC2 SSH Key Credential**
  - Jenkins → Manage Credentials → System → Global
  - Add → SSH Username with private key
    - Username: `ec2-user`
    - Private Key: `<paste your EC2 SSH key (PEM file contents)>`
    - ID: `ec2-ssh-key`

### Phase 4: Verify Complete Pipeline

- [ ] **Test Full Pipeline - Git to EC2**
  ```bash
  # Make a code change
  echo "# TEST" >> backend/README.md
  
  # Commit and push
  git add .
  git commit -m "test: full pipeline automation"
  git push origin main
  ```
  
  Expected: Jenkins auto-triggers → tests → builds → pushes → Ansible deploys

- [ ] **Verify EC2 Containers Running**
  ```bash
  # SSH to EC2
  ssh -i key.pem ec2-user@EC2_IP
  
  # Check containers
  docker ps
  
  # Check service status
  sudo systemctl status cafelove
  ```

- [ ] **Test App Access**
  - Frontend: `http://EC2_IP`
  - Backend: `http://EC2_IP:5000/api/test`

- [ ] **Test EC2 Reboot Auto-Start**
  ```bash
  # SSH to EC2 and reboot
  sudo reboot
  
  # Wait 60 seconds, then verify app is running
  curl http://EC2_IP
  ```

## 📁 Files Modified/Created

New files created:
- `docker-compose.prod.yaml` - Production Docker Compose (no volumes, restart: always)
- `scripts/ec2-deploy.sh` - EC2 deployment script
- `scripts/cafelove.service` - SystemD service unit
- `AUTO-DEPLOYMENT-SETUP.md` - Complete setup guide

Modified files:
- `Jenkinsfile` - Added GitHub webhook trigger + improved Ansible stage
- `infra/ansible/deploy.yml` - Updated for systemd service setup

## 🚀 What's Automated Now

✅ **Git Push** → Automatic Jenkins trigger (no manual "Build Now")
✅ **Jenkins** → Tests, builds, pushes images (unchanged)
✅ **Docker Hub** → Images pushed (unchanged)
✅ **Ansible** → Auto-deploys to EC2 via Jenkins
✅ **EC2** → Auto-starts containers on reboot (via systemd)
✅ **App** → Accessible at EC2 IP (frontend on port 80, backend on port 5000)

## ⚠️ Common Issues & Fixes

### Webhook Not Triggering
- Verify payload URL is accessible: `http://JENKINS_IP:8080/github-webhook/`
- Check GitHub webhook deliveries: Repo → Settings → Webhooks → Recent Deliveries
- Ensure Jenkins GitHub plugin is installed and enabled

### EC2 App Not Starting Automatically
- SSH to EC2: `ssh -i key.pem ec2-user@EC2_IP`
- Check service: `sudo systemctl status cafelove`
- Check logs: `sudo journalctl -u cafelove -f`
- Restart manually: `sudo systemctl restart cafelove`

### Ansible Deploy Fails
- Test connection: `ansible all -i infra/ansible/inventory.ini -m ping`
- Run with verbose: `ansible-playbook ... -vvv`
- Verify SSH key permissions: `chmod 600 key.pem`

### Port Conflicts on EC2
- Frontend should be on port 80 (updated in `docker-compose.prod.yaml`)
- Backend should be on port 5000
- Check listening ports: `sudo netstat -tulpn | grep LISTEN`

## 📞 Support

For detailed explanations, see:
- `AUTO-DEPLOYMENT-SETUP.md` - Complete step-by-step guide
- `JENKINS-CONFIG.md` - Jenkins advanced configuration
- `DEPLOYMENT.md` - Initial deployment reference

