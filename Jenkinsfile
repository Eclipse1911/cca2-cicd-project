pipeline {
    agent any

    environment {
        // Docker Hub repository definition (Format: <username>/<repository>)
        // Evaluators/Students: Replace 'eclipse1911' with your Docker Hub username if different
        DOCKER_IMAGE_NAME = 'eclipse1911/cca2-app'
        
        // Jenkins Credentials ID configured in Jenkins UI (Manage Jenkins -> Credentials)
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-credentials'
        
        // Kubernetes Resource Identifiers
        K8S_DEPLOYMENT = 'cca2-app-deployment'
        K8S_CONTAINER = 'cca2-app-container'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo "=========================================================="
                echo "Stage 1: Checking out source code from Git repository"
                echo "=========================================================="
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                echo "=========================================================="
                echo "Stage 2: Installing dependencies & running automated tests"
                echo "=========================================================="
                sh '''
                    # Install dependencies and execute test suite
                    npm install
                    npm test
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo "=========================================================="
                echo "Stage 3: Building container images (Build #${BUILD_NUMBER} & latest)"
                echo "=========================================================="
                sh """
                    docker build -t ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER} -t ${DOCKER_IMAGE_NAME}:latest .
                """
            }
        }

        stage('Push Image') {
            steps {
                echo "=========================================================="
                echo "Stage 4: Authenticating & pushing image to Docker Hub"
                echo "=========================================================="
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE_NAME}:latest
                        docker logout
                    """
                }
            }
        }

        stage('Minikube Deploy') {
            steps {
                echo "=========================================================="
                echo "Stage 5: Deploying manifests & triggering rolling update"
                echo "=========================================================="
                sh """
                    # Apply Kubernetes deployment and service manifests
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    # Trigger rolling update with new container image tag
                    kubectl set image deployment/${K8S_DEPLOYMENT} ${K8S_CONTAINER}=${DOCKER_IMAGE_NAME}:${BUILD_NUMBER}
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "=========================================================="
                echo "Stage 6: Verifying rollout status and inspecting Pods/Service"
                echo "=========================================================="
                sh """
                    # Wait for zero-downtime rolling update to complete
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} --timeout=90s

                    # Display running pods and service details
                    echo "\n--- Kubernetes Pod Status ---"
                    kubectl get pods -l app=cca2-app -o wide

                    echo "\n--- Kubernetes Service Status (NodePort 30080) ---"
                    kubectl get svc cca2-app-service
                """
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "🎉 CI/CD Pipeline Build #${BUILD_NUMBER} SUCCEEDED!"
            echo "Application is live and reachable via http://<EC2-PUBLIC-IP>:30080"
            echo "=========================================================="
        }
        failure {
            echo "=========================================================="
            echo "❌ CI/CD Pipeline Build #${BUILD_NUMBER} FAILED!"
            echo "Check console logs above for test, build, or deployment errors."
            echo "=========================================================="
        }
    }
}
