pipeline {
    agent any
    
    environment {
        MYSQL_ROOT_PASSWORD = 'root'
        MYSQL_DATABASE = 'revhubteam7'
        MONGO_URI = 'mongodb://localhost:27017/revhubteam4'
        GITHUB_REPO = 'https://github.com/shaiksuhas2228/revhub-social-platform.git'
    }
    
    triggers {
        githubPush()
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'version1', url: env.GITHUB_REPO
            }
        }
        
        stage('Build & Deploy') {
            steps {
                bat 'docker build -t revhub-backend ./revHubBack'
                bat 'docker build -t revhub-frontend ./RevHub/RevHub'
                bat 'docker rm -f backend frontend || echo "No containers to remove"'
                bat 'docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend'
                bat 'docker run -d --name frontend -p 4200:80 revhub-frontend'
            }
        }
        

        
        stage('Health Check') {
            steps {
                script {
                    sleep(30)
                    bat 'curl -f http://localhost:8080 || echo "Backend health check failed"'
                    bat 'curl -f http://localhost:4200 || echo "Frontend health check failed"'
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo 'Build completed'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
            echo 'Backend: http://localhost:8080'
            echo 'Frontend: http://localhost:4200'
        }
        failure {
            bat 'docker rm -f backend frontend || echo "No containers to stop"'
            echo 'Pipeline failed!'
        }
        cleanup {
            bat 'docker system prune -f || echo "Cleanup done"'
        }
    }
}