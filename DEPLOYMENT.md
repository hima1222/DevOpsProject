co# CafeLove - Complete CI/CD Deployment Guide

This guide provides step-by-step instructions to set up the complete automated CI/CD pipeline from GitHub push to live EC2 deployment.

## ✨ Architecture Overview

```
Git Push (GitHub)
    ↓
Jenkins Pipeline (CI)
    ├─ Backend Tests
    ├─ Frontend Tests
    ├─ Build Docker Images
    ├─ Login to Docker Hub
    ├─ Push Images (with exponential-backoff retry)
    ├─ Deploy with Ansible (EC2)
    └─ Verify Health
    ↓
EC2 Instance (Production)
    ├─ Pull latest images
    ├─ Stop/remove old containers
    └─ Start new containers → Live
```

---

## 🔐 Step 1: Configure Jenkins Credentials

Jenkins stores sensitive data securely. You must add two credentials for the pipeline to work:

### 1.1 Docker Hub Credentials (`dockerhub-creds`)

**Type:** Username with password

1. Open Jenkins Dashboard → **Manage Jenkins** → **Manage Credentials**
2. Click **System** (or your domain folder) → **Global credentials**
3. Click **+ Add Credentials**
4. Fill in:
   - **Kind:** Username with password
   - **Scope:** Global
   - **Username:** Your Docker Hub username (e.g., `hima1222`)
   - **Password:** Docker Hub [Personal Access Token](https://docs.docker.com/docker-hub/access-tokens/) (NOT your password)
     - Go to https://hub.docker.com/settings/personal-access-tokens
     - Click "Generate New Token"
     - Name: `Jenkins`
     - Permissions: `Read, Write, Delete`
     - Copy the token and paste here
   - **ID:** `dockerhub-creds` (must match Jenkinsfile)
5. Click **Create**

**Why a token instead of a password?**
- More secure: tokens can be revoked without changing your account password
- Granular permissions: can be limited to specific scopes
- Best practice in CI/CD

### 1.2 EC2 SSH Key (`ec2-ssh-key`)

**Type:** Secret file

1. Open Jenkins Dashboard → **Manage Jenkins** → **Manage Credentials**
2. Click **System** → **Global credentials** → **+ Add Credentials**
3. Fill in:
   - **Kind:** Secret file
   - **Scope:** Global
   - **File:** Upload your `cafelove-key.pem` (or whatever your EC2 private key is named)
   - **ID:** `ec2-ssh-key` (must match Jenkinsfile)
4. Click **Create**

**Note:** The private key file must:
- Have **no passphrase** (empty passphrase) or you'll need to modify the Jenkinsfile to use `ssh-agent`
- Match the public key (.pub) uploaded to your EC2 instance
- Be in OpenSSH format (not PuTTY format)

---

## 🖥️ Step 2: EC2 Instance Setup

### 2.1 Security Group Configuration

Your EC2 security group must allow:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22   | TCP      | Your IP / 0.0.0.0/0 | SSH (Ansible/Jenkins) |
| 80   | TCP      | 0.0.0.0/0 | HTTP (Frontend) |
| 443  | TCP      | 0.0.0.0/0 | HTTPS (Optional, for future TLS) |
| 5000 | TCP      | 0.0.0.0/0 | Backend API |
| 5173 | TCP      | 0.0.0.0/0 | Frontend Dev (if needed) |

**Update security group:**
```bash
# Example AWS CLI
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# ... repeat for ports 80, 443, 5000, 5173
```

### 2.2 EC2 Instance Software Prerequisites

SSH into your EC2 instance and run:

```bash
# Update system
sudo yum update -y  # Amazon Linux
# OR: sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian

# Install Docker
sudo amazon-linux-extras install docker -y  # Amazon Linux
# OR: https://docs.docker.com/engine/install/ubuntu/  # Ubuntu

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (avoid sudo)
sudo usermod -aG docker ec2-user

# Verify Docker works
docker ps
```

### 2.3 Update Ansible Inventory

Edit [infra/ansible/inventory.ini](infra/ansible/inventory.ini):

```ini
[web]
your-ec2-public-ip-or-dns ansible_user=ec2-user
```

Replace:
- `your-ec2-public-ip-or-dns` with your EC2's Public IPv4 address or DNS name
- `ec2-user` with the default user for your AMI (e.g., `ubuntu` for Ubuntu AMIs, `ec2-user` for Amazon Linux)

Example:
```ini
[web]
54.123.45.67 ansible_user=ec2-user
# OR
ec2-instance.us-east-1.compute.amazonaws.com ansible_user=ec2-user
```

---

## 🔧 Step 3: Jenkins Agent Setup

### 3.1 Install Required Tools on Jenkins Agent

The Jenkins agent (or controller if running pipeline locally) must have:

```bash
# Install Docker
sudo yum install docker -y  # or apt install docker.io
sudo systemctl start docker
sudo usermod -aG docker jenkins

# Install Ansible
sudo yum install ansible -y  # or apt install ansible
# OR: pip install ansible

# Install community.docker collection for Ansible
ansible-galaxy collection install community.docker

# Verify
ansible --version
docker --version
```

### 3.2 Jenkins Workspace Permissions

If Jenkins runs in a container, bind-mount the Docker socket:

```yaml
# docker-compose.yml (Jenkins service)
services:
  jenkins:
    image: jenkins/jenkins:lts
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock  # Access host Docker daemon
      - jenkins_home:/var/jenkins_home
```

---

## 🚀 Step 4: Trigger Your First Deployment

### 4.1 Make a Code Change & Push

```bash
# From your local repo
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin main
```

### 4.2 Monitor Jenkins Build

1. Open Jenkins → Your job → **Build History**
2. Click the latest build → **Console Output**
3. Watch stages:
   - ✓ Backend Tests
   - ✓ Frontend Tests
   - ✓ Build Docker Images
   - ✓ Docker Login
   - ✓ Push Images (with retries)
   - ✓ Deploy with Ansible
4. **Expected output:**
   ```
   ========================================
   ✓ CI/CD Pipeline SUCCEEDED
   ✓ Changes deployed to EC2
   ========================================
   ```

### 4.3 Verify Deployment on EC2

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# List running containers
docker ps

# Expected output:
# CONTAINER ID  IMAGE                              PORTS
# abc123        hima1222/cafelove-backend:latest   0.0.0.0:5000->5000/tcp
# def456        hima1222/cafelove-frontend:latest  0.0.0.0:80->5173/tcp

# Check logs
docker logs cafelove-backend
docker logs cafelove-frontend

# Test API
curl http://localhost:5000/api/test

# Open in browser
# Frontend: http://your-ec2-ip
# Backend API: http://your-ec2-ip:5000/api/test
```

---

## 🛠️ Advanced: Docker Push Retry Logic

The Jenkinsfile uses exponential-backoff retries for `docker push`:

```groovy
def retryPush(String image, int maxAttempts = 3) {
    for (int i = 1; i <= maxAttempts; i++) {
        try {
            sh "docker push ${image}"
            return  // Success
        } catch (Exception e) {
            if (i == maxAttempts) {
                throw e  // Final attempt failed, abort
            }
            int waitTime = Math.pow(2, i - 1) as int  // 1s, 2s, 4s
            echo "Push attempt ${i} failed. Retrying in ${waitTime}s..."
            sh "sleep ${waitTime}"
        }
    }
}
```

**How it works:**
- Attempt 1 fails → wait 1s, retry
- Attempt 2 fails → wait 2s, retry
- Attempt 3 fails → abort pipeline
- Success at any attempt → proceed to Deploy

This handles transient Docker Hub network issues without manual intervention.

---

## 🐛 Troubleshooting

### Issue: "Could not resolve host: github.com"
**Cause:** Transient network connectivity issue from Jenkins to GitHub

**Solution:**
- The Jenkinsfile now includes **automatic retry logic** for git operations (with `GIT_TERMINAL_PROMPT=0`)
- Jenkins will automatically retry the checkout 3 times before giving up
- This typically resolves itself on retry (transient DNS/network issue)
- If persistent:
  - Verify Jenkins server has internet access: `ping github.com` on Jenkins host
  - Check DNS is working: `nslookup github.com`
  - Verify no firewall is blocking port 443 (HTTPS to GitHub)
  - Check Jenkins agent network connectivity or proxy settings

### Issue: Pipeline timeout (over 1 hour)
**Cause:** Large image builds, slow Docker Hub pushes, or network latency

**Solution:**
- The Jenkinsfile now includes `timeout(time: 1, unit: 'HOURS')` — increase if needed:
  ```groovy
  options {
      timeout(time: 2, unit: 'HOURS')  // Increase from 1
  }
  ```

### Issue: "Skipped due to earlier failure(s)"
**Cause:** A previous stage failed (Tests, Build, or Push)

**Solution:**
1. Check console output for the failing stage
2. Common issues:
   - **Tests failing:** Fix code and push again
   - **Image push failing:** Check Docker Hub credentials, network, image size
   - **Ansible failing:** Check EC2 SSH key, inventory IP, security groups

### Issue: Docker push hangs or times out
**Solution:**
- Increase timeouts in `Jenkinsfile`:
  ```groovy
  environment {
      DOCKER_CLIENT_TIMEOUT = '600'       // Increase from 300
      COMPOSE_HTTP_TIMEOUT = '600'
  }
  ```
- Create Docker Hub Personal Access Token (not account password)
- Check Jenkins agent network/bandwidth
- Reduce image size (multi-stage builds)

### Issue: Ansible "connection refused" to EC2
**Solution:**
1. Verify security group allows port 22: `aws ec2 describe-security-groups --group-ids sg-xxx`
2. Verify private key matches public key on EC2: `ssh -v -i key.pem ec2-user@ip`
3. Update inventory.ini with correct IP and user

### Issue: Containers run but app is not accessible
**Solution:**
1. Check container logs: `docker logs cafelove-frontend`
2. Check ports are mapped correctly: `docker ps`
3. Check security group allows ports 80 and 5000
4. Test from EC2: `curl http://localhost:80`

---

## ✅ Checklist: Is Everything Working?

Run `./scripts/validate-setup.sh` to auto-check prerequisites:

```bash
chmod +x scripts/validate-setup.sh
./scripts/validate-setup.sh
```

Manual checklist:
- [ ] Jenkins credentials created: `dockerhub-creds` and `ec2-ssh-key`
- [ ] EC2 security group allows ports 22, 80, 443, 5000
- [ ] EC2 instance has Docker installed and running
- [ ] Jenkins agent has Docker, Ansible, and community.docker collection
- [ ] ansible inventory.ini has correct EC2 IP and user
- [ ] Git webhook configured to trigger Jenkins on push (optional but recommended)
- [ ] First CI/CD run succeeded (all stages green)
- [ ] Containers visible on EC2: `docker ps`
- [ ] Application accessible: `http://ec2-ip` and `http://ec2-ip:5000/api/test`

---

## 📝 Next Steps (Optional Enhancements)

1. **Add TLS/HTTPS:** Install nginx reverse proxy + Certbot on EC2
2. **Health checks:** Add liveness/readiness probes in Ansible
3. **Backup strategy:** Add database backups to post_tasks
4. **Monitoring:** Integrate CloudWatch or Prometheus for logs/metrics
5. **Canary deployments:** Use `docker service` or Kubernetes for rolling updates
6. **Multi-environment:** Add dev/staging/prod parameter to pipeline

---

## 📚 References

- [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
- [Docker Hub Personal Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)
- [Ansible Docker Modules](https://docs.ansible.com/ansible/latest/collections/community/docker/index.html)
- [EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security.html)

---

**Questions?** Check the [infra/ansible/README.md](infra/ansible/README.md) for more details on the playbook structure.
