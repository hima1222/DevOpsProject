# 🚀 DevOps Solution - Quick Start

## What You Need to Do (3 Key Things)

### 1️⃣ GitHub Webhook (5 minutes)
```
Jenkins URL: http://JENKINS_IP:8080/github-webhook/
GitHub Token: Settings → Developer settings → Personal access tokens
Result: Git push → Jenkins auto-triggers (NO "Build Now" clicks!)
```

### 2️⃣ EC2 Setup (5 minutes)
```
infra/ansible/inventory.ini:
[web]
18.xxx.xxx.xxx ansible_user=ec2-user  ← Put your EC2 IP here
```

### 3️⃣ Jenkins Credentials (5 minutes)
```
Manage Credentials → Add:
  dockerhub-creds: Your Docker Hub username + token
  ec2-ssh-key: Your EC2 SSH private key
```

---

## How It Works (The Flow)

```
YOU                               JENKINS                           EC2
┌─────────────────┐              ┌──────────────┐                 ┌────────┐
│ git push origin │──webhook────>│ Auto-trigger │─ssh+ansible────>│ Deploy │
│      main       │              │   pipeline   │                 │ & Run  │
└─────────────────┘              └──────────────┘                 └────────┘
                                        │
                                        ├─ Test backend (Jest)
                                        ├─ Test frontend (Vitest)
                                        ├─ Build Docker images
                                        ├─ Push to Docker Hub
                                        └─ Call Ansible
                                        
Result: App running at http://EC2-IP (no manual commands needed!)
```

---

## 7-Step Implementation

### Step 1: Update Git Remote
```bash
git remote set-url origin https://github.com/hima1222/DevOpsProject.git
git push origin main
```

### Step 2: GitHub Webhook Setup
1. Jenkins: Install `GitHub` plugin
2. GitHub: Create Personal Access Token (PAT)
3. Jenkins: Add credential `github-token` with PAT
4. Jenkins: Configure GitHub server URL
5. GitHub: Add webhook → `http://JENKINS_IP:8080/github-webhook/`

### Step 3: Update Ansible Inventory
```bash
# infra/ansible/inventory.ini
[web]
YOUR_EC2_IP ansible_user=ec2-user
```

### Step 4: Test Ansible Connectivity
```bash
ansible all -i infra/ansible/inventory.ini -m ping
# Should output: SUCCESS
```

### Step 5: Add Jenkins Credentials
**Credential 1: Docker Hub**
- Kind: Username with password
- Username: hima1222
- Password: <Docker Hub Token>
- ID: dockerhub-creds

**Credential 2: EC2 SSH**
- Kind: SSH Username with private key
- Username: ec2-user
- Private Key: <EC2 key content>
- ID: ec2-ssh-key

### Step 6: Test Pipeline Trigger
```bash
git commit --allow-empty -m "test: webhook"
git push origin main
# Jenkins should auto-trigger WITHOUT clicking "Build Now"
```

### Step 7: Verify App on EC2
```bash
# In browser:
http://EC2_IP           # Frontend
http://EC2_IP:5000/api/test  # Backend

# Or from terminal:
curl http://EC2_IP
curl http://EC2_IP:5000/api/test
```

---

## Files Created/Modified

```
NEW FILES:
  ✅ docker-compose.prod.yaml       Production config
  ✅ scripts/ec2-deploy.sh          Auto-deployment script
  ✅ scripts/cafelove.service       SystemD auto-start
  ✅ AUTO-DEPLOYMENT-SETUP.md       Detailed guide
  ✅ QUICK-SETUP.md                 Checklist
  ✅ IMPLEMENTATION-GUIDE.md        Step-by-step guide
  ✅ README-DEVOPS.md               This file's parent

MODIFIED:
  ✅ Jenkinsfile                    Added webhook trigger
  ✅ infra/ansible/deploy.yml      Added systemd setup
```

---

## ✅ Success Checklist

When you see these, you know it's working:

- [ ] **Webhook fires**: Push code → Jenkins starts WITHOUT "Build Now"
- [ ] **Tests pass**: Backend & Frontend tests complete
- [ ] **Docker builds**: Images build successfully
- [ ] **Push succeeds**: Images pushed to Docker Hub
- [ ] **Ansible deploys**: No errors in Ansible stage
- [ ] **App accessible**: `http://EC2_IP` loads frontend
- [ ] **API works**: `http://EC2_IP:5000/api/test` responds
- [ ] **Auto-start works**: Reboot EC2 → App runs automatically

---

## 🐛 Quick Troublehooting

| Problem | Solution |
|---------|----------|
| Webhook not triggering | Check Jenkins IP is accessible from GitHub; verify webhook delivery in GitHub settings |
| Ansible fails | Test: `ansible all -i infra/ansible/inventory.ini -m ping` |
| App not accessible on EC2 | SSH: `sudo systemctl status cafelove` |
| Port 80/5000 in use | Check: `sudo netstat -tulpn \| grep LISTEN` |
| Containers stopped | Restart: `sudo systemctl restart cafelove` |

---

## 📚 Documentation Map

```
START HERE
    ↓
README-DEVOPS.md (this file)
    ├─ Quick overview
    ├─ Architecture diagram
    └─ What's built
    
THEN READ
    ↓
IMPLEMENTATION-GUIDE.md
    ├─ 7-step process
    ├─ 30-minute setup
    ├─ Success criteria
    └─ Troubleshooting
    
ALSO USEFUL
    ├─ QUICK-SETUP.md (checklist)
    ├─ AUTO-DEPLOYMENT-SETUP.md (detailed)
    └─ JENKINS-CONFIG.md (advanced)
```

---

## 🎯 What You Get

**Before:** Manual everything
```
git push → Manual Jenkins build → Manual Ansible deploy → Manual EC2 setup
          Manual "Build Now"      Manual ansible-playbook  Manual docker-compose
```

**After:** Fully automated
```
git push → Auto-triggered → Auto-deployed → Auto-running
         GitHub webhook    From Jenkins     On EC2 boot
```

---

## 💻 Daily Workflow After Setup

```bash
# That's it! Just push code:
git add . && git commit -m "feat: new feature" && git push origin main

# Everything else is automatic:
# 1. GitHub webhook fires
# 2. Jenkins auto-triggers
# 3. Tests run
# 4. Docker builds
# 5. Images push
# 6. Ansible deploys
# 7. EC2 containers restart
# 8. App updates live

# Verify (optional):
curl http://EC2_IP
```

---

## ✨ Summary

You now have:

✅ **Automatic Git Webhook** - No "Build Now" clicks
✅ **Full CI/CD Pipeline** - Tests → Build → Push → Deploy
✅ **EC2 Auto-Deployment** - Ansible handles everything
✅ **SystemD Auto-Start** - App runs on EC2 reboot
✅ **Zero Manual Commands** - No docker-compose, no SSH, no Jenkins UI clicks
✅ **Production Ready** - Health checks, auto-restart, logging

This is **real DevOps** - not just container scripts!

---

## 🚀 Next Move

1. Read **[IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)**
2. Follow the 7 steps
3. Run your first test: `git push origin main`
4. Watch Jenkins auto-trigger
5. Check app at `http://EC2_IP`
6. Celebrate! 🎉

---

## Ready?

👉 **Start here: [IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)**

Good luck! 🚀

