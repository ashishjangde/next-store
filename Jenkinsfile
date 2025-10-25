pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch ${env.BRANCH_NAME}..."
                // Checkout the branch and fetch all history
                git branch: "${env.BRANCH_NAME}",
                    url: 'https://github.com/ashishjangde/next-store.git',
                    changelog: true,
                    poll: true
            }
        }

        stage('Determine Changes') {
            steps {
                script {
                    // Get all files changed in the push compared to remote branch
                    CHANGED_FILES = sh(
                        script: "git fetch origin ${env.BRANCH_NAME} && git diff --name-only origin/${env.BRANCH_NAME}...HEAD",
                        returnStdout: true
                    ).trim().split("\n")

                    // Flags to decide which pipelines to run
                    RUN_FRONTEND = CHANGED_FILES.any { it.startsWith('frontend/') }
                    RUN_BACKEND = CHANGED_FILES.any { it.startsWith('backend/') }

                    echo "Changed files in this push: ${CHANGED_FILES}"
                    echo "Run Frontend: ${RUN_FRONTEND}"
                    echo "Run Backend: ${RUN_BACKEND}"
                }
            }
        }

        stage('Build & Deploy') {
            parallel {
                stage('Frontend Pipeline') {
                    when {
                        expression { return RUN_FRONTEND }
                    }
                    steps {
                        echo "Building and deploying Frontend..."
                        script {
                            def dockerImage = docker.build("nextstore_frontend:${env.BUILD_NUMBER}", "./frontend")
                            sh "docker stop nextstore_frontend_container || true"
                            sh "docker rm nextstore_frontend_container || true"
                            sh "docker run -d --name nextstore_frontend_container -p 3000:3000 nextstore_frontend:${env.BUILD_NUMBER}"
                        }
                    }
                }

                stage('Backend Pipeline') {
                    when {
                        expression { return RUN_BACKEND }
                    }
                    steps {
                        echo "Building and deploying Backend..."
                        script {
                            def dockerImage = docker.build("nextstore_backend:${env.BUILD_NUMBER}", "./backend")
                            sh "docker stop nextstore_backend_container || true"
                            sh "docker rm nextstore_backend_container || true"
                            sh "docker run -d --name nextstore_backend_container -p 8000:8000 nextstore_backend:${env.BUILD_NUMBER}"
                        }
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up old Docker images...'
                sh 'docker image prune -f'
            }
        }
    }

    post {
        always { echo 'Pipeline finished.' }
        success { echo 'Pipeline executed successfully!' }
        failure { echo 'Pipeline failed. Check logs.' }
    }
}
