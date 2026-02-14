# Jenkins Configuration for Stable CI/CD Pipeline

This guide helps resolve Jenkins-specific issues like timeouts, filesystem lag, and restarts.

## 🔧 Critical Configurations

### 1. Increase Durable Task Heartbeat

**Issue:** "wrapper script does not seem to be touching the log file"  
**Cause:** Jenkins can't write to filesystem fast enough  
**Fix:** Set Java system property

**Option A: Jenkins UI (Temporary)**
1. Jenkins → Manage Jenkins → System
2. Add to "Jenkins system message" or script:
```
-Dorg.jenkinsci.plugins.durabletask.BourneShellScript.HEARTBEAT_CHECK_INTERVAL=86400
```

**Option B: Jenkins Home (Persistent)**
1. Edit `/var/jenkins_home/jenkins.xml` or startup script
2. Add JVM flag:
```bash
JAVA_OPTS="-Dorg.jenkinsci.plugins.durabletask.BourneShellScript.HEARTBEAT_CHECK_INTERVAL=86400"
```

**Option C: Docker Compose (If Running Jenkins in Container)**
```yaml
services:
  jenkins:
    environment:
      JAVA_OPTS: "-Dorg.jenkinsci.plugins.durabletask.BourneShellScript.HEARTBEAT_CHECK_INTERVAL=86400"
```

This sets heartbeat check to 24 hours (86400 seconds) instead of default 15 minutes.

---

### 2. Increase Pipeline Timeout

The Jenkinsfile now sets a **2-hour timeout** to handle large Docker builds and Jenkins restarts:

```groovy
options {
    timeout(time: 2, unit: 'HOURS')
}
```

If builds still timeout, increase further in Jenkinsfile:
```groovy
options {
    timeout(time: 3, unit: 'HOURS')  // Increase to 3 hours
}
```

---

### 3. Enable Docker BuildKit

Docker BuildKit provides:
- Better caching
- Parallel layer builds
- Faster builds
- More console output

**Already enabled in Jenkinsfile:**
```groovy
environment {
    DOCKER_BUILDKIT = '1'
    COMPOSE_DOCKER_CLI_BUILD = '1'
}
```

---

### 4. Prevent Concurrent Builds

The pipeline now disables concurrent builds to avoid resource contention:

```groovy
options {
    disableConcurrentBuilds()
}
```

This ensures only one pipeline runs at a time, preventing disk/network bottlenecks.

---

## 🚨 Responding to Specific Errors

### Error: "Resuming build after Jenkins restart"
**Cause:** Jenkins controller restarted during the pipeline  
**Impact:** Timeout resets to much lower value  
**Fix:** 
1. Increase heartbeat check interval (above)
2. Increase pipeline timeout (above)
3. Reduce image size (optimize Dockerfiles)

### Error: "wrapper script does not seem to be touching the log file"
**Cause:** Filesystem latency  
**Fix:**
1. Increase heartbeat check interval (86400 seconds)
2. Check host filesystem health: `df -h`, `iostat -x 1 5`
3. Move Jenkins to faster storage if possible

### Error: Docker build timeout
**Cause:** Large images or slow pulls  
**Fix:**
1. Use `DOCKER_BUILDKIT=1` (already enabled)
2. Use `.dockerignore` to exclude unnecessary files
3. Consider multi-stage builds in Dockerfile
4. Increase `DOCKER_CLIENT_TIMEOUT` (now 600s, was 300s)

---

## 📋 Jenkins Health Checklist

Run these commands on the Jenkins host:

```bash
# Check Jenkins is running
curl -I http://localhost:8080

# Check disk space (should be >10% free)
df -h /

# Check CPU/Memory (should have room)
free -h
top -bn1 | head -20

# Check Docker daemon
docker ps
docker version

# Check filesystem performance
dd if=/dev/zero of=test.img bs=1M count=100 oflag=direct && rm test.img
# Should complete in <5 seconds for good filesystem
```

---

## 🔌 Jenkins Configuration as Code (JCasC)

For fully automated Jenkins setup, create `jenkins.yaml`:

```yaml
jenkins:
  securityRealm:
    local:
      allowsSignup: false
  authorizationStrategy:
    roleBased:
      roles:
        global: []

unclassified:
  location:
    url: "http://your-jenkins-url/"
  jobDSL:
    sandbox: false

credentials:
  system:
    domainCredentials:
      - credentials:
          - basic:
              scope: GLOBAL
              id: dockerhub-creds
              username: <docker-user>
              password: <docker-token>
          - ssh:
              scope: GLOBAL
              id: ec2-ssh-key
              privateKey: |
                -----BEGIN OPENSSH PRIVATE KEY-----
                ...your EC2 key...
                -----END OPENSSH PRIVATE KEY-----
```

Load with:
```bash
export CASC_JENKINS_CONFIG=/path/to/jenkins.yaml
```

---

## 📊 Monitoring Jenkins Health

### Enable Jenkins Metrics Plugin
1. Jenkins → Manage Plugins
2. Install "Prometheus metrics plugin"
3. Access metrics at `http://jenkins:8080/prometheus`

### Log File Watchdog
Keep an eye on Jenkins logs:
```bash
tail -f /var/log/jenkins/jenkins.log | grep -i "error\|timeout\|refused"
```

### Build Performance
Jenkins → Manage Jenkins → System Log  
Set level to DEBUG for pipeline-specific logs:
```
org.jenkinsci.plugins.workflow
```

---

## 🎯 For Production Deployments

### Recommended Settings
```groovy
options {
    timeout(time: 3, unit: 'HOURS')           // 3-hour timeout
    timestamps()                               // All logs timestamped
    buildDiscarder(logRotator(
        numToKeepStr: '30',                   // Keep 30 builds
        artifactNumToKeepStr: '10'            // Keep 10 with artifacts
    ))
    disableConcurrentBuilds()                 // One at a time
    ansiColor('xterm')                        // Color output
}
```

### Recommended JVM Settings
```bash
JAVA_OPTS="
  -Dorg.jenkinsci.plugins.durabletask.BourneShellScript.HEARTBEAT_CHECK_INTERVAL=86400
  -Xmx2g
  -Xms1g
  -XX:+UseG1GC
  -XX:+ParallelRefProcEnabled
  -Dhudson.model.UpdateCenter.never=true
"
```

---

## ✅ Verification Checklist

After applying configs:

- [ ] Pipeline timeout is 2+ hours
- [ ] Heartbeat check interval set to 86400
- [ ] Docker BuildKit enabled (`DOCKER_BUILDKIT=1`)
- [ ] Concurrent builds disabled
- [ ] Disk space > 10% free
- [ ] Docker daemon healthy (`docker ps` works)
- [ ] Jenkins logs show no timeout warnings

---

## 🔗 References

- [Jenkins Durable Task Plugin](https://plugins.jenkins.io/durable-task/)
- [Docker BuildKit](https://docs.docker.com/build/buildkit/)
- [Jenkins Configuration as Code](https://plugins.jenkins.io/configuration-as-code/)
- [Jenkins Performance Tuning](https://wiki.jenkins.io/display/JENKINS/Performance+characteristics)

---

**Last Updated:** February 15, 2026  
**Applies to:** CafeLove CI/CD Pipeline v2.0+
