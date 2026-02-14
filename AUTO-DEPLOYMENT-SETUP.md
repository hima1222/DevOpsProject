# Complete Auto-Deployment Setup Guide

## Overview
This guide sets up a fully automated CI/CD pipeline where:
1. ✅ **Git push** → automatically triggers Jenkins
2. ✅ **Jenkins** → builds, tests, and pushes Docker images
3. ✅ **Ansible** → deploys to EC2 automatically
4. ✅ **EC2** → runs containers automatically on reboot (systemd)
5. ✅ **App** → accessible at EC2 IP without manual `docker-compose` commands

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Git Push (Your Laptop)                                      │
└────────────────┬────────────────────────────────────────────┘
                 │ GitHub Webhook (automatic)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Jenkins (CI/CD)                                             │
│  - Test backend & frontend                                   │
│  - Build Docker images                                       │
│  - Push to Docker Hub                                        │
│  - Trigger Ansible deployment                               │
└────────────────┬────────────────────────────────────────────┘
                 │ SSH + Docker credentials
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  EC2 Instance (via Ansible)                                  │
│  - Install Docker & Docker Compose                           │
│  - Download /opt/cafelove/deploy.sh                          │
│  - Enable cafelove systemd service                           │
│  - Start containers automatically                            │
└────────────────┬────────────────────────────────────────────┘
                 │ On reboot or service restart
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  CafeLove App Running                                        │
│  - Backend: http://EC2-IP:5000                               │
│  - Frontend: http://EC2-IP                                   │
│  - Auto-restart on failure                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Jenkins Setup (GitHub Webhook Auto-Trigger)

### Step 1.1: Ensure GitHub Plugin is Installed
Jenkins needs the **GitHub plugin** for webhook support.

1. Open Jenkins UI: `http://localhost:8080`
2. Go to **Manage Jenkins → Manage Plugins → Available**
3. Search for `GitHub` and install:
   - ✅ **GitHub** (by CloudBees)
   - ✅ **GitHub API** (by CloudBees)
4. Restart Jenkins after installation

### Step 1.2: Create GitHub Personal Access Token

1. Go to GitHub: **Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Click **Generate new token (classic)**
3. Set **Name**: `Jenkins-DevOps`
4. Select scopes:
   - ✅ `repo` (full control of private repos)
   - ✅ `admin:repo_hook` (write access to hooks)
   - ✅ `admin:org_hook` (if using organization repos)
5. Click **Generate** and copy the token (save it securely!)

### Step 1.3: Add GitHub Credentials to Jenkins

1. Jenkins UI: **Manage Jenkins → Manage Credentials → System → Global credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: `GitHub Server Credentials`
   - **Scope**: `Global`
   - **Username**: `hima1222` (your GitHub username)
   - **Password**: Paste your PAT from Step 1.2
   - **ID**: `github-token`
   - **Description**: `GitHub Personal Access Token for webhook`
4. Click **Create**

### Step 1.4: Configure Jenkins GitHub Server

1. **Manage Jenkins → System → GitHub**
2. Under **GitHub Servers**:
   - **Name**: `GitHub.com`
   - **GitHub Server URL**: `https://api.github.com`
   - **Credentials**: Select `GitHub Personal Access Token for webhook` (created in Step 1.3)
   - **Test connection** - should show "Credentials verified"
3. Click **Save**

### Step 1.5: Add Webhook to GitHub Repository

1. GitHub repo: **Settings → Webhooks → Add webhook**
2. Fill in:
   - **Payload URL**: `http://YOUR-JENKINS-IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events?** Select `Just the push event`
   - ✅ **Active**
3. Click **Add webhook**

**On Docker (Jenkins in container)?** Use:
```
http://DOCKER_HOST_IP:8080/github-webhook/
```
Or expose Jenkins properly via ngrok/reverse proxy.

### Step 1.6: Verify Webhook Trigger

1. Make a test commit to `main`:
   ```bash
   echo "# Test webhook" >> README_WEBHOOK_TEST.md
   git add .
   git commit -m "test: trigger jenkins webhook"
   git push origin main
   ```

2. Check GitHub webhook delivery:
   - GitHub repo: **Settings → Webhooks** → Click your webhook → **Recent Deliveries**
   - Should show a **200 OK** response

3. Check Jenkins:
   - Jenkins UI should show a new build started automatically
   - Build #X should be running/completed

---

## Phase 2: EC2 Setup (Auto-Deployment & Auto-Start)

### Step 2.1: Prepare EC2 Instance

**If creating new EC2:**
1. Launch Ubuntu 22.04 LTS or Amazon Linux 2
2. **Security Group** → Allow inbound:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP 5000 (backend API) from anywhere
3. Note EC2 IP address

**Update inventory:**
```bash
# infra/ansible/inventory.ini
[web]
EC2_IP_HERE ansible_user=ec2-user
```

### Step 2.2: Test Ansible Deployment (First Time)

```bash
cd /path/to/CafeLove

# Run Ansible playbook with Docker credentials
ansible-playbook \
  -i infra/ansible/inventory.ini \
  infra/ansible/deploy.yml \
  -e "docker_user=hima1222" \
  -e "docker_pass=YOUR_DOCKER_HUB_TOKEN" \
  -v
```

**Expected output:**
```
TASK [Display deployment success]
ok: [EC2_IP] => {
    "msg": [
        "=========================================",
        "✅ CafeLove Deployed Successfully!",
        "=========================================",
        "Frontend:  http://EC2_IP",
        "Backend:   http://EC2_IP:5000/api/test",
        "Status:    sudo systemctl status cafelove",
        ...
    ]
}
```

### Step 2.3: Verify EC2 Auto-Start (SystemD)

SSH into EC2:
```bash
ssh -i your-key.pem ec2-user@EC2_IP

# Check service status
sudo systemctl status cafelove

# Check if containers are running
docker ps

# View logs
sudo journalctl -u cafelove -f

# Test endpoints
curl http://localhost/           # Frontend
curl http://localhost:5000/api/test  # Backend
```

### Step 2.4: Test EC2 Reboot Auto-Start

```bash
# SSH into EC2 and reboot
sudo reboot

# Wait 60 seconds, then test
# Containers should auto-start automatically via systemd
```

---

## Phase 3: Jenkins Integration (Automate Ansible from Pipeline)

### Step 3.1: Add SSH Key Credential to Jenkins

1. Jenkins: **Manage Credentials → System → Global credentials → Add Credentials**
2. Create SSH key:
   - **Kind**: `SSH Username with private key`
   - **Username**: `ec2-user`
   - **Private Key**: Paste your EC2 SSH private key
   - **ID**: `ec2-ssh-key`
3. Click **Create**

### Step 3.2: Update Jenkinsfile Ansible Stage

The pipeline already includes Ansible deployment. Verify the `Deploy with Ansible` stage:

```groovy
stage('Deploy with Ansible') {
    steps {
        withCredentials([
            usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
            sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')
        ]) {
            sh '''
                ansible-playbook \
                  -i infra/ansible/inventory.ini \
                  infra/ansible/deploy.yml \
                  -e "docker_user=${DOCKER_USER}" \
                  -e "docker_pass=${DOCKER_PASS}" \
                  --private-key=${SSH_KEY} \
                  -v
            '''
        }
    }
}
```

---

## Phase 4: Test Full Pipeline

### Step 4.1: Trigger Pipeline

```bash
# Make a code change
echo "# Updated feature" >> backend/README.md

# Commit and push
git add .
git commit -m "feature: update backend"
git push origin main
```

**Expected:**
1. GitHub webhook fires
2. Jenkins auto-triggers (no "Build Now" needed!)
3. Tests run → Docker builds → Images push → Ansible deploys
4. EC2 receives new containers via Ansible

### Step 4.2: Verify Deployment

```bash
# Open browser
http://EC2_IP       # Frontend should load
http://EC2_IP:5000/api/test  # Backend should respond

# Or test from terminal
curl http://EC2_IP
curl http://EC2_IP:5000/api/test
```

### Step 4.3: Test EC2 Reboot

```bash
# SSH to EC2
ssh -i key.pem ec2-user@EC2_IP

# Reboot
sudo reboot

# After 60 seconds, app should be running automatically
curl http://EC2_IP
```

---

## File Structure Changes

```
docker-compose.prod.yaml    # Production config (no volumes, restart: always)
scripts/
  ├── ec2-deploy.sh        # Auto-deployment script (pulls images, starts containers)
  └── cafelove.service     # SystemD unit (auto-start on boot)
infra/ansible/
  └── deploy.yml           # Updated: copies files, enables systemd service
Jenkinsfile                # Updated: added GitHub webhook trigger
```

---

## Troubleshooting

### Jenkins Webhook Not Triggering

1. Check GitHub webhook delivery: **Settings → Webhooks → Recent Deliveries**
2. Look for errors (usually auth or URL issues)
3. Verify Jenkins GitHub plugin installed
4. Re-test payload delivery:
   ```bash
   git commit --allow-empty -m "test webhook"
   git push origin main
   ```

### EC2 App Not Starting Automatically

1. **SSH to EC2** and check service:
   ```bash
   sudo systemctl status cafelove
   sudo journalctl -u cafelove -f
   ```

2. **Check Docker containers**:
   ```bash
   docker ps -a
   docker logs backend_c
   docker logs frontend_c
   ```

3. **Manually restart service**:
   ```bash
   sudo systemctl restart cafelove
   ```

### Ansible Deployment Fails

1. **Check connectivity**:
   ```bash
   ansible all -i infra/ansible/inventory.ini -m ping
   ```

2. **Debug playbook**:
   ```bash
   ansible-playbook infra/ansible/deploy.yml -i infra/ansible/inventory.ini -vvv
   ```

### Docker Images Not Found

1. Verify Docker Hub credentials are correct
2. Check image exists:
   ```bash
   docker pull hima1222/cafelove-backend:latest
   ```

---

## Summary: What You Now Have

✅ **Zero-Manual-Step CI/CD Pipeline:**
1. Push code to GitHub → Automatic webhook fires
2. Jenkins auto-builds and tests
3. Docker images automatically pushed
4. Ansible automatically deploys to EC2
5. EC2 automatically starts containers (via systemd)
6. App accessible at: `http://EC2-IP` (frontend) and `http://EC2-IP:5000` (backend)

✅ **Auto-Restart on EC2 Reboot:**
- Even if EC2 reboots, the `cafelove` systemd service auto-starts containers

✅ **No Manual Commands Needed:**
- ❌ No `docker-compose up --build` 
- ❌ No `docker start jenkins`
- ❌ No "Build Now" button clicks
- ✅ Just `git push` and everything happens automatically!
