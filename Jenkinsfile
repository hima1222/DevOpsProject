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
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
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
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
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
            environment {
                DOCKER_API_VERSION = "1.44"
            }
            steps {
                sh 'docker-compose build'
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
                withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
                sh 'docker push hima1222/cafelove-backend:latest'
                sh 'docker push hima1222/cafelove-frontend:latest'
            }
        }

    }
}
