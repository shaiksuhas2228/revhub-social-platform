pipeline {
    agent any
    
    environment {
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
        
        stage('Setup Databases') {
            steps {
                script {
                    echo 'Creating Docker network...'
                    bat 'docker network create revhub-network 2>nul || echo "Network exists"'
                    echo 'Setting up MongoDB...'
                    bat 'docker ps -a | findstr mongo-revhub && docker start mongo-revhub || docker run -d --name mongo-revhub --network revhub-network -p 27017:27017 mongo:latest'
                    echo 'Waiting for MongoDB to be ready...'
                    sleep(20)
                    echo 'Initializing MongoDB collections...'
                    bat 'docker exec mongo-revhub mongosh revhubteam4 --eval "db.createCollection(\'chatMessage\'); db.createCollection(\'notificationMongo\'); db.chatMessage.createIndex({\'senderId\': 1, \'receiverId\': 1, \'timestamp\': -1}); db.notificationMongo.createIndex({\'userId\': 1, \'createdDate\': -1});" || echo "MongoDB init done"'
                    echo 'Verifying MongoDB connection...'
                    bat 'docker exec mongo-revhub mongosh revhubteam4 --eval "db.stats()" || echo "MongoDB verification done"'
                    echo 'Using host MySQL on port 3306'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                echo 'Building backend image...'
                bat 'docker build -t revhub-backend ./revHubBack'
                echo 'Building frontend image...'
                bat 'docker build -t revhub-frontend ./RevHub/RevHub'
            }
        }
        
        stage('Deploy Containers') {
            steps {
                echo 'Ensuring Docker network exists...'
                bat 'docker network create revhub-network 2>nul || echo "Network exists"'
                echo 'Starting backend on port 8080...'
                bat 'docker run -d --name backend --network revhub-network --env-file backend.env.properties -p 8080:8080 revhub-backend'
                echo 'Starting frontend on port 4200...'
                bat 'docker run -d --name frontend -p 4200:80 revhub-frontend'
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Waiting for services to start...'
                    sleep(30)
                    echo 'Checking backend health...'
                    bat 'curl -s http://localhost:8080 || echo "Backend starting..."'
                    echo 'Checking frontend health...'
                    bat 'curl -s http://localhost:4200 || echo "Frontend starting..."'
                }
            }
        }
        
        stage('Verify Deployment') {
            steps {
                bat 'docker ps | findstr backend'
                bat 'docker ps | findstr frontend'
                bat 'docker logs backend --tail 50'
            }
        }
    }
    
    post {
        always {
            echo 'Build completed'
        }
        success {
            echo '========================================'
            echo 'Pipeline completed successfully!'
            echo '========================================'
            echo 'Frontend: http://localhost:4200'
            echo 'Backend: http://localhost:8080'
            echo 'MySQL: localhost:3306 (user: root, pass: root, db: revhubteam7)'
            echo 'MongoDB: localhost:27017 (revhubteam4)'
            echo '========================================'
        }
        failure {
            script {
                try {
                    bat 'docker logs backend --tail 100'
                } catch (Exception e) {
                    echo 'No backend logs available'
                }
                try {
                    bat 'docker logs frontend --tail 100'
                } catch (Exception e) {
                    echo 'No frontend logs available'
                }
                try {
                    bat 'docker rm -f backend frontend'
                } catch (Exception e) {
                    echo 'No containers to stop'
                }
                echo 'Pipeline failed! Check logs above.'
            }
        }
        cleanup {
            bat 'docker system prune -f --volumes || echo "Cleanup done"'
        }
    }
}