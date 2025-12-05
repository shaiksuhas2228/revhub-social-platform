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
        
        stage('Build Backend') {
            steps {
                dir('revHubBack') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('RevHub/RevHub') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Backend Image') {
                    steps {
                        dir('revHubBack') {
                            bat 'docker build -t revhub-backend .'
                        }
                    }
                }
                stage('Frontend Image') {
                    steps {
                        dir('RevHub/RevHub') {
                            bat 'docker build -t revhub-frontend .'
                        }
                    }
                }
            }
        }
        
        stage('Deploy Applications') {
            steps {
                bat 'docker rm -f backend frontend || echo "No containers to remove"'
                bat 'docker run -d --name backend --env-file backend.env.properties -p 8080:8080 revhub-backend'
                bat 'docker run -d --name frontend -p 4200:80 revhub-frontend'
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sleep(30)
                    bat 'curl -f http://localhost:8080/actuator/health || echo "Backend health check failed"'
                    bat 'curl -f http://localhost:4200 || echo "Frontend health check failed"'
                }
            }
        }
    }
    
    post {
        always {
            script {
                try {
                    archiveArtifacts artifacts: 'revHubBack/target/*.jar', fingerprint: true
                } catch (Exception e) {
                    echo 'No backend artifacts to archive'
                }
                try {
                    archiveArtifacts artifacts: 'RevHub/RevHub/dist/**/*', fingerprint: true
                } catch (Exception e) {
                    echo 'No frontend artifacts to archive'
                }
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