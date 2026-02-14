This Ansible deployment supports a Jenkins-driven CI/CD flow for CafeLove.

Overview
- Playbook: `deploy.yml` (pulls images, stops/removes containers, starts updated containers)
- Inventory: `inventory.ini` (list your web hosts under [web])

Jenkins credentials (you must create these in Jenkins Credentials):
- `dockerhub-creds` (Username/Password) — Docker Hub username and password or token.
- `ec2-ssh-key` (Secret File) — EC2 private key file used to SSH into target host.

How Jenkins calls Ansible
- The Jenkinsfile runs:
  ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml --private-key "$EC2_SSH_KEY" -e "docker_user=$DOCKER_USER docker_pass=$DOCKER_PASS"

EC2 instance requirements
- Docker installed (playbook attempts to install Docker for Amazon Linux / Debian families).
- Open security group ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API) as needed.
- Ensure the EC2 user in `inventory.ini` (default: `ec2-user`) matches the instance's SSH user.

Best practices / notes
- Do NOT hardcode secrets: use Jenkins Credentials and avoid embedding private keys in inventory.
- Production: consider using `docker-compose` or container orchestrator (ECS/EKS) and a proper reverse proxy (nginx) with TLS.
- The playbook uses the `community.docker` Ansible collection. Ensure control node (Jenkins agent) has `ansible` and the `community.docker` collection installed.
  Install on control node: `pip install ansible` and `ansible-galaxy collection install community.docker`

If you want, I can extend the playbook to deploy an nginx reverse proxy, add TLS with Certbot, or replace the container orchestration with a `docker-compose` file copied to the host.
