# 🎉 CafeLove - Full Stack Application with Complete CI/CD Pipeline

**CafeLove** is a full-stack web application (Node.js + React) deployed automatically to AWS EC2 via Jenkins, Docker, and Ansible. Every Git push triggers a complete CI/CD pipeline: tests → build → containerize → push → deploy.

## 🚀 Quick Start (5 minutes)

### Prerequisites
- AWS EC2 instance (`t2.micro` or larger, Amazon Linux 2)
- GitHub account with repository access
- Jenkins server (build host with Docker installed)
- Docker Hub account

### Step 1: Create Jenkins Credentials (One-time)

1. **Jenkins → Manage Jenkins → Manage Credentials → System → Global credentials**

2. **Add Docker Hub Token:**
   - Click **+ Add Credentials**
   - Kind: **Username with password**
   - Username: `<your-docker-hub-username>`
   - Password: [Get token from Docker Hub settings](https://hub.docker.com/settings/personal-access-tokens)
   - ID: **`dockerhub-creds`** ✅ (must match)

3. **Add EC2 SSH Key:**
   - Click **+ Add Credentials**
   - Kind: **Secret file**
   - File: Upload your EC2 `.pem` key (e.g., `cafelove-key.pem`)
   - ID: **`ec2-ssh-key`** ✅ (must match)

### Step 2: Update Inventory (Your EC2 Details)

Edit `infra/ansible/inventory.ini`:
```ini
[web]
<your-ec2-public-ip> ansible_user=ec2-user
```

Example:
```ini
[web]
54.123.45.67 ansible_user=ec2-user
```

### Step 3: EC2 Setup (Run Once)

SSH into your EC2 instance:
```bash
ssh -i cafelove-key.pem ec2-user@<your-ec2-ip>

# Install Docker
sudo yum update -y
sudo amazon-linux-extras install docker -y
sudo systemctl start docker && sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Exit and reconnect
exit
ssh -i cafelove-key.pem ec2-user@<your-ec2-ip>
docker ps  # Verify
```

### Step 4: EC2 Security Group

Allow inbound traffic:
- **Port 22** (SSH) - from Jenkins/your IP
- **Port 80** (HTTP) - from 0.0.0.0/0
- **Port 5000** (API) - from 0.0.0.0/0

### Step 5: First Deploy

```bash
git add .
git commit -m "deploy: trigger CI/CD pipeline"
git push origin main
```

✅ Watch Jenkins → Your build should turn **GREEN** and deploy to EC2 automatically.

Verify:
```
Frontend: http://<ec2-ip>
Backend API: http://<ec2-ip>:5000/api/test
```

---

## 📋 Architecture

```
┌─────────────────┐
│  Your Code      │
│  (GitHub)       │
└────────┬────────┘
         │ git push
         ▼
┌─────────────────────────────────────┐
│  Jenkins Pipeline (Automated)       │
├─────────────────────────────────────┤
│ 1. Backend Tests (npm test)         │
│ 2. Frontend Tests (vitest)          │
│ 3. Build Docker Images              │
│ 4. Push to Docker Hub (with retry)  │
│ 5. Deploy to EC2 (Ansible)          │
│ 6. Health Check                     │
└────────┬────────────────────────────┘
         │ ansible-playbook
         ▼
┌────────────────────────┐
│  EC2 Instance (AWS)    │
├────────────────────────┤
│ ✓ Backend (port 5000)  │
│ ✓ Frontend (port 80)   │
│ ✓ Docker Compose       │
└────────────────────────┘
```

---

## 🔧 Pipeline Stages

| Stage | What it does | Fails if... |
|-------|-------------|-----------|
| **Backend Tests** | Runs Jest unit tests | Tests fail or npm error |
| **Frontend Tests** | Runs Vitest unit tests | Tests fail or npm error |
| **Build Docker Images** | Runs `docker-compose build` | Dockerfile syntax error |
| **Docker Login** | Authenticates to Docker Hub | Credentials invalid |
| **Push Images** | Pushes images with exponential-backoff retry (1s, 2s, 4s) | All 3 push attempts fail |
| **Deploy with Ansible** | Runs playbook on EC2 to pull and restart containers | SSH key invalid or playbook error |

---

## 📚 Full Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Complete setup walkthrough (step-by-step)
- **[infra/ansible/README.md](infra/ansible/README.md)** — Ansible playbook details
- **[Jenkinsfile](Jenkinsfile)** — Pipeline code (comments included)

---

## 🐛 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "Could not resolve host: github.com" | Transient network issue; Jenkins will retry automatically |
| Docker push fails (400/timeout) | Exponential-backoff retry handles this; check logs |
| "connection refused" to EC2 | Check security group allows port 22 |
| Containers not running on EC2 | SSH in and run `docker ps` to debug |

See [DEPLOYMENT.md](DEPLOYMENT.md#-troubleshooting) for detailed troubleshooting.

---

## 📞 Support

1. **Pipeline failing?** → Check [DEPLOYMENT.md](DEPLOYMENT.md#-troubleshooting)
2. **Setup issues?** → Run the validation script
3. **Need full walkthrough?** → See [DEPLOYMENT.md](DEPLOYMENT.md)

---

**Ready to deploy?** Push your code and watch it go live automatically! 🚀
