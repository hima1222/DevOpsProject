pipeline {
    agent any

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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }

                sh 'docker tag cafelove-backend:latest hima1222/cafelove-backend:latest'
                sh 'docker tag cafelove-frontend:latest hima1222/cafelove-frontend:latest'

                sh 'docker push hima1222/cafelove-backend:latest'
                sh 'docker push hima1222/cafelove-frontend:latest'
            }
        }

        stage('Deploy with Ansible') {
            agent any
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS'),
                    file(credentialsId: 'ec2-ssh-key', variable: 'EC2_SSH_KEY')
                ]) {
                    sh '''
                    chmod 600 "$EC2_SSH_KEY"
                    ansible-playbook -i infra/ansible/inventory.ini infra/ansible/deploy.yml \
                      --private-key "$EC2_SSH_KEY" \
                      -e "docker_user=$DOCKER_USER docker_pass=$DOCKER_PASS"
                    '''
                }
            }
        }



    }
}
