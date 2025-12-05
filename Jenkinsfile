pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                  echo "Building backend image..."
                  docker build -t revhub-backend ./revHubBack

                  echo "Building frontend image..."
                  docker build -t revhub-frontend ./RevHub/RevHub
                '''
            }
        }

        stage('Deploy Containers') {
            steps {
                bat '''
                  echo "Stopping old containers if they exist..."
                  docker rm -f backend || echo "No backend container to remove"
                  docker rm -f frontend || echo "No frontend container to remove"

                  echo "Starting new backend container..."
                  docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend

                  echo "Starting new frontend container..."
                  docker run -d --name frontend -p 4200:80 revhub-frontend
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! Frontend on port 4200, backend on port 8080.'
        }
        failure {
            echo 'Pipeline failed. Check console output for details.'
        }
    }
}