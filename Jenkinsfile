pipeline {
    agent none

    stages {

        stage('Checkout') {
            agent any
            steps {
                git branch: 'main',
                    credentialsId: 'github-creds',
                    url: 'https://github.com/hima1222/DevOpsProject.git'
            }
        }

        stage('Backend Tests') {
            agent {
                docker {
                    image 'node:20-alpine'
                }
            }
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test'
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
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            agent any
            steps {
                sh 'docker-compose build'
                sh 'docker-compose push'

            }
        }

        stage('Docker Login') {
            agent any
            steps {
                sh '''
                  echo "$DOCKERHUB_CREDENTIALS_PSW" | \
                  docker login -u "$DOCKERHUB_USER" --password-stdin
                '''
            }
        }

        stage('Push Images') {
            agent any
            steps {
                sh 'docker compose push'
            }
        }
    }
}
