pipeline {
    agent any

    stages {

        // stage('Checkout') {
        //     agent any
        //     steps {
        //         git branch: 'main',
        //             credentialsId: 'github-creds',
        //             url: 'https://github.com/hima1222/DevOpsProject.git'
                
        //     }
        // }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm test || true'
                }
            }
        }

        stage('Frontend Tests') {
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
