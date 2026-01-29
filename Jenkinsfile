// pipeline {
//     agent any

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Build Docker Images') {
//             steps {
//                 sh 'docker build -t cafelove-frontend ./frontend'
//                 sh 'docker build -t cafelove-backend ./backend'
//             }
//         }

//         stage('Run Containers') {
//             steps {
//                 sh '''
//                 docker stop frontend_c || true
//                 docker rm frontend_c || true
//                 docker stop backend_c || true
//                 docker rm backend_c || true

//                 docker run -d -p 5173:5173 --name frontend_c cafelove-frontend
//                 docker run -d -p 5000:5000 --name backend_c cafelove-backend
//                 '''
//             }
//         }
//     }

//     post {
//         always {
//             echo 'Pipeline finished.'
//         }
//     }
// }



// // pipeline {
// //     agent any
// //     stages {
// //         stage('Build') {
// //             steps {
// //                 echo 'Building...'
// //             }
// //         }
// //         stage('Test') {
// //             steps {
// //                 echo 'Testing...'
// //             }
// //         }
// //         stage('Deploy') {
// //             steps {
// //                 echo 'Deploying...'
// //             }
// //         }
// //     }
// // }


pipeline {
  agent any

  stages {
    stage('Clone Repository') {
      steps {
        git branch: 'main',
            url: 'https://github.com/hima1222/DevOpsProject'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t cafelove:latest ./backend'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t cafelove:latest ./frontend'
      }
    }

    stage('Run Container') {
      steps {
        sh '''
        docker rm -f cafelove || true
        docker run -d -p 3000:3000 --name cafelove cafelove:latest
        '''
      }
    }
  }
}
