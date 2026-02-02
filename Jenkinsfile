pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_USER = "${DOCKERHUB_CREDENTIALS_USR}"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/hima1222/DevOpsProject.git'
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Docker Login') {
            steps {
                sh '''
                  echo "$DOCKERHUB_CREDENTIALS_PSW" | \
                  docker login -u "$DOCKERHUB_USER" --password-stdin
                '''
            }
        }

        stage('Push Images to Docker Hub') {
            steps {
                sh 'docker compose push'
            }
        }
    }

    post {
        success {
            echo '✅ CI Pipeline completed successfully'
        }
        failure {
            echo '❌ CI Pipeline failed'
        }
    }
}
