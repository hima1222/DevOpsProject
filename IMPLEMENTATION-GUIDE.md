# Complete DevOps Implementation Guide

## What Was Built

You now have a **complete DevOps solution** with:

1. ✅ **Automatic Git Webhook Trigger** - No more "Build Now" button
2. ✅ **Full CI/CD Pipeline** - Tests, builds, pushes automatically
3. ✅ **EC2 Auto-Deployment** - Ansible deploys automatically
4. ✅ **SystemD Auto-Start** - App restarts on EC2 reboot
5. ✅ **Zero Manual Commands** - Everything automated

---

## 🚀 Implementation Steps (30 minutes)

### Step 1: Update Git Repository Reference (1 min)

Your repository was renamed on GitHub. Update local config:

```bash
cd D:\CafeLove
git remote set-url origin https://github.com/hima1222/DevOpsProject.git
git push origin main
```

### Step 2: Jenkins GitHub Webhook Setup (10 min)

Follow the [QUICK-SETUP.md](QUICK-SETUP.md) checklist, Phase 1:

**Key points:**
- Install GitHub plugin in Jenkins
- Create GitHub Personal Access Token (PAT)
- Add PAT as credential in Jenkins (`github-token`)
- Add GitHub webhook to your repo pointing to `http://JENKINS_IP:8080/github-webhook/`
- Test: Push to main branch → Jenkins should auto-trigger

**Verify:**
```bash
git commit --allow-empty -m "test webpack"
git push origin main
# Watch Jenkins console - build should start automatically!
```

### Step 3: EC2 Instance Preparation (5 min)

1. **Ensure EC2 is running** with inbound rules for:
   - SSH (22)
   - HTTP (80) - frontend
   - HTTPS (443) - future SSL
   - TCP 5000 - backend API

2. **Update Ansible inventory**:
   ```bash
   # File: infra/ansible/inventory.ini
   [web]
   18.xxx.xxx.xxx ansible_user=ec2-user  # Replace with your EC2 IP
   ```

3. **Test Ansible can reach EC2**:
   ```bash
   ansible all -i infra/ansible/inventory.ini -m ping
   # Should respond: "SUCCESS"
   ```

### Step 4: Jenkins EC2 Credentials (5 min)

Go to Jenkins UI: **Manage Jenkins → Manage Credentials → System → Global**

**Add credential 1: Docker Hub**
- Click **Add Credentials**
- Kind: `Username with password`
- Username: `hima1222`
- Password: `<your Docker Hub token>`
- ID: `dockerhub-creds`
- Click **Create**

**Add credential 2: EC2 SSH Key**
- Click **Add Credentials**
- Kind: `SSH Username with private key`
- Username: `ec2-user`
- Private Key: Paste contents of your EC2 key file (`.pem`)
- ID: `ec2-ssh-key`
- Click **Create**

### Step 5: Trigger Full Pipeline (5 min)

```bash
# Make a test change
echo "# Automated deployment test" >> backend/README.md

# Commit and push
git add .
git commit -m "test: automated pipeline"
git push origin main
```

**Watch in Jenkins UI:**
1. GitHub webhook fires → Build starts automatically ✓
2. Backend Tests pass ✓
3. Frontend Tests pass ✓
4. Build Docker Images ✓
5. Docker Login succeeds ✓
6. Push Images to Docker Hub ✓
7. Deploy with Ansible ✓
   - Installs Docker on EC2
   - Pulls latest images
   - Starts containers
   - Enables systemd service for auto-restart

### Step 6: Verify EC2 Deployment (5 min)

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@EC2_IP

# Check containers running
docker ps
# Should show: backend_c, frontend_c, mongo_c

# Check systemd service
sudo systemctl status cafelove
# Should show: active (running)

# View service logs
sudo journalctl -u cafelove -f

# Exit
exit
```

### Step 7: Test App Access

Open your browser:

```
Frontend:  http://EC2_IP/
Backend:   http://EC2_IP:5000/api/test
```

Both should be accessible **without any manual `docker-compose` commands**!

### Step 8: Test EC2 Auto-Restart

```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@EC2_IP

# Reboot
sudo reboot

# Wait 60 seconds...
# SSH back and check
ssh -i your-key.pem ec2-user@EC2_IP
docker ps  # Containers should be running automatically!
exit
```

---

## 📁 File Structure created

```
CafeLove/
├── docker-compose.prod.yaml        # Production compose (no volumes)
├── Jenkinsfile                      # Updated: GitHub webhook trigger
├── AUTO-DEPLOYMENT-SETUP.md         # Complete setup guide
├── QUICK-SETUP.md                   # Step-by-step checklist
├── scripts/
│   ├── ec2-deploy.sh               # Auto-deployment script
│   └── cafelove.service            # SystemD service unit
└── infra/ansible/
    └── deploy.yml                  # Updated: systemd service setup
```

---

## 🔄 Workflow After Setup Complete

**Your daily workflow becomes simple:**

```bash
# Make changes to your code
echo "new feature" >> backend/src/server.js

# Commit and push (that's it!)
git add .
git commit -m "feat: new feature"
git push origin main

# What happens automatically:
# 1. GitHub webhook fires
# 2. Jenkins receives webhook
# 3. Jenkins auto-triggers build
# 4. Tests run
# 5. Docker images build
# 6. Images push to Docker Hub
# 7. Ansible pulls images on EC2
# 8. Containers auto-restart
# 9. App updated on EC2

# Verify changes are live
curl http://EC2_IP  # Frontend
curl http://EC2_IP:5000/api/test  # Backend
```

---

## ✅ Success Indicators

**You know it's working when:**

1. ✅ Git push → Jenkins builds without "Build Now" button
2. ✅ Jenkins console shows all 6 stages completing
3. ✅ EC2 has running containers (check: `docker ps`)
4. ✅ App accessible at `http://EC2_IP`
5. ✅ EC2 reboot → App auto-starts within 60 seconds
6. ✅ Push code → EC2 app updates within 3-5 minutes

---

## 🐛 Troubleshooting

### Webhook Not Trigger?

**Problem:** Push to main, but Jenkins doesn't start

**Solution:**
1. Check GitHub webhook delivery: GitHub → Settings → Webhooks → Recent Deliveries
2. Look for red ✗ (failed) responses
3. Common causes:
   - Jenkins IP is private (not accessible from GitHub) → Use ngrok or public proxy
   - Firewall blocking 8080 → Check inbound rules
   - GitHub credentials not set → Re-verify `github-token` in Jenkins

### Ansible Deploy Fails?

**Problem:** Pipeline reaches "Deploy with Ansible" but fails

**Solution:**
```bash
# Test manually
ansible-playbook \
  -i infra/ansible/inventory.ini \
  infra/ansible/deploy.yml \
  -e "docker_user=hima1222" \
  -e "docker_pass=YOUR_TOKEN" \
  -vvv

# Check EC2 connectivity
ansible all -i infra/ansible/inventory.ini -m ping

# SSH check
ssh -i your-key.pem ec2-user@EC2_IP "docker --version"
```

### App Not Accessible on EC2?

**Problem:** `http://EC2_IP` shows connection refused

**Solution:**
```bash
# SSH to EC2
ssh -i key.pem ec2-user@EC2_IP

# Check containers
docker ps
docker logs frontend_c  # Check for errors

# Check ports
sudo netstat -tulpn | grep LISTEN
# Should show: 80 (frontend), 5000 (backend), 27017 (mongo)

# Restart service
sudo systemctl restart cafelove
sudo systemctl status cafelove
```

### Containers Stop After Reboot?

**Problem:** EC2 restarts but app is gone

**Solution:**
```bash
# SSH to EC2
ssh -i key.pem ec2-user@EC2_IP

# Check service enabled
sudo systemctl is-enabled cafelove
# Should output: "enabled"

# Enable if not
sudo systemctl enable cafelove

# Start manually
sudo systemctl start cafelove

# Verify
sudo systemctl status cafelove
```

---

## 📚 Additional Resources

- **[AUTO-DEPLOYMENT-SETUP.md](AUTO-DEPLOYMENT-SETUP.md)** - Deep dive into each component
- **[QUICK-SETUP.md](QUICK-SETUP.md)** - Checklist for quick reference
- **[JENKINS-CONFIG.md](JENKINS-CONFIG.md)** - Advanced Jenkins tuning
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Original deployment guide

---

## 🎯 Next Steps (Optional Enhancements)

1. **SSL/HTTPS** - Add Certbot for free SSL certificates
2. **Monitoring** - Add Prometheus + Grafana for metrics
3. **Logging** - Centralize logs with ELK stack
4. **Backup** - Auto-backup MongoDB to S3
5. **Secrets Management** - Use Vault instead of env variables
6. **Multiple Environments** - Add staging/prod branches

---

## 📞 Summary

You now have:
- ✅ **Fully automated CI/CD** - Git push triggers everything
- ✅ **EC2 auto-deployment** - Ansible handles all setup
- ✅ **Auto-restart on boot** - SystemD keeps app running
- ✅ **Zero manual steps** - No `docker-compose`, no `java -jar`, no SSH commands
- ✅ **Production-ready** - Health checks, restart policies, logging

This is a **proper DevOps solution**. Enjoy!

