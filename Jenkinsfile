pipeline {
    agent any

    environment {
        GITHUB_CRED = 'github-token'
        IMAGE_FRONT = 'cafelove-frontend'
        IMAGE_BACK = 'cafelove-backend'
    }

    stages {
        stage('Checkout Repo') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/hima1222/DevOpsProject.git',
                    credentialsId: "${GITHUB_CRED}"
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_FRONT} ./frontend'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_BACK} ./backend'
            }
        }

        stage('Run Containers') {
            steps {
                sh '''
                docker rm -f cafelove-frontend || true
                docker rm -f cafelove-backend || true
                docker run -d -p 3000:3000 --name cafelove-frontend ${IMAGE_FRONT}
                docker run -d -p 5000:5000 --name cafelove-backend ${IMAGE_BACK}
                '''
            }
        }
    }
}
