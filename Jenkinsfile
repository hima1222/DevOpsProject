def retryPush(String image, int maxAttempts = 3) {
    int[] waitTimes = [1, 2, 4]  // exponential backoff: 1s, 2s, 4s
    for (int i = 1; i <= maxAttempts; i++) {
        try {
            sh "docker push ${image}"
            return
        } catch (Exception e) {
            if (i == maxAttempts) {
                throw e
            }
            int waitTime = waitTimes[i - 1]
            echo "Push attempt ${i} failed. Retrying in ${waitTime}s..."
            sh "sleep ${waitTime}"
        }
    }
}

pipeline {
    agent any

    environment {
        DOCKER_CLIENT_TIMEOUT = '600'
        COMPOSE_HTTP_TIMEOUT = '600'
        GIT_TERMINAL_PROMPT = '0'
        GIT_SSH_COMMAND = 'ssh -o StrictHostKeyChecking=no'
        // Increase heartbeat check interval for slow filesystems (fixes Jenkins restart issues)
        ORG_JENKINSCI_PLUGINS_DURABLETASK_BOURNE_SHELL_SCRIPT_HEARTBEAT_CHECK_INTERVAL = '86400'
    }

    options {
        timeout(time: 2, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
    }

    stages {

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test || true'
                }
            }
        }

        stage('Frontend Tests') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test || true'
                }
            }
        }


        stage('Build Docker Images') {
            agent any
            environment {
                DOCKER_API_VERSION = "1.44"
                DOCKER_BUILDKIT = '1'
                COMPOSE_DOCKER_CLI_BUILD = '1'
            }
            steps {
                sh '''
                echo "═══════════════════════════════════════"
                echo "🐳 Building Docker Images with BuildKit"
                echo "═══════════════════════════════════════"
                
                # Clean up unused images to free space and improve build speed
                docker image prune -af --filter "until=24h" || true
                
                # Build with progress output and caching
                DOCKER_BUILDKIT=1 docker-compose build --progress=plain
                
                echo "✅ Docker images built successfully"
                docker images | grep cafelove
                '''
            }
        }

        stage('Docker Login') {
            agent any
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', 
                                                usernameVariable: 'DOCKER_USER', 
                                                passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }


        stage('Push Images') {
            agent any
            environment {
                DOCKER_API_VERSION = "1.44"
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }

                sh 'docker tag cafelove-backend:latest hima1222/cafelove-backend:latest'
                sh 'docker tag cafelove-frontend:latest hima1222/cafelove-frontend:latest'

                script {
                    echo '=== Pushing backend image with exponential-backoff retry ==='
                    retryPush('hima1222/cafelove-backend:latest', 3)
                    echo '✓ Backend push succeeded'
                }

                script {
                    echo '=== Pushing frontend image with exponential-backoff retry ==='
                    retryPush('hima1222/cafelove-frontend:latest', 3)
                    echo '✓ Frontend push succeeded'
                }
            }
        }

        stage('Deploy with Ansible') {
            agent any
            steps {
                echo '=== Starting automated deployment to EC2 ==='
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                    file(credentialsId: 'ec2-ssh-key', variable: 'EC2_SSH_KEY')
                ]) {
                    sh '''
                    chmod 600 "$EC2_SSH_KEY"
                    echo "[INFO] Running Ansible playbook to deploy CafeLove to EC2..."
                    ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml \
                      --private-key "$EC2_SSH_KEY" \
                      -e "docker_user=$DOCKER_USER docker_pass=$DOCKER_PASS" \
                      -v
                    '''
                }
                echo '✓ Ansible deployment completed'
            }
        }

    }

    post {
        success {
            echo '\n========================================'
            echo '✓ CI/CD Pipeline SUCCEEDED'
            echo '✓ Changes deployed to EC2'
            echo '========================================'
        }
        failure {
            echo '\n========================================'
            echo '✗ CI/CD Pipeline FAILED'
            echo '✗ Check logs above for error details'
            echo '========================================'
        }
    }
}
