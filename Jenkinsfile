pipeline {
    agent any

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['auto', 'frontend', 'backend', 'both'],
            description: '''Choose what to deploy:
- auto → build only changed parts (default)
- frontend → force frontend deploy
- backend → force backend deploy
- both → deploy both'''
        )
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out branch ${env.BRANCH_NAME ?: 'master'}..."
                git branch: "${env.BRANCH_NAME ?: 'master'}",
                    url: 'https://github.com/ashishjangde/next-store.git',
                    changelog: true,
                    poll: true
            }
        }

        stage('Determine Changes') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME ?: 'master'
                    def changedFiles = sh(
                        script: "git fetch origin ${branchName} && git diff --name-only origin/${branchName}...HEAD",
                        returnStdout: true
                    ).trim().split("\n")

                    // Detect which services changed
                    def runFrontend = changedFiles.any { it.startsWith('frontend/') }
                    def runBackend = changedFiles.any { it.startsWith('backend/') }

                    // Apply manual override
                    if (params.DEPLOY_TARGET == 'frontend') {
                        echo "⚠️ Manually forcing FRONTEND deploy"
                        runFrontend = true
                        runBackend = false
                    } else if (params.DEPLOY_TARGET == 'backend') {
                        echo "⚠️ Manually forcing BACKEND deploy"
                        runFrontend = false
                        runBackend = true
                    } else if (params.DEPLOY_TARGET == 'both') {
                        echo "⚠️ Manually forcing BOTH frontend & backend deploy"
                        runFrontend = true
                        runBackend = true
                    } else {
                        echo "🧠 Auto mode — using detected file changes"
                    }

                    // Store in environment variables for use in when conditions
                    env.RUN_FRONTEND = runFrontend.toString()
                    env.RUN_BACKEND = runBackend.toString()

                    echo "Changed files in this push: ${changedFiles}"
                    echo "Run Frontend: ${env.RUN_FRONTEND}"
                    echo "Run Backend: ${env.RUN_BACKEND}"
                }
            }
        }

        stage('Inject Env Files') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'frontend_env', variable: 'FRONTEND_ENV_FILE')]) {
                        sh 'cp $FRONTEND_ENV_FILE ./frontend/.env'
                        echo "✅ Injected frontend .env file."
                    }

                    withCredentials([file(credentialsId: 'backend_env_file', variable: 'BACKEND_ENV_FILE')]) {
                        sh 'cp $BACKEND_ENV_FILE ./backend/.env'
                        echo "✅ Injected backend .env file."
                    }
                }
            }
        }

        stage('Build & Deploy') {
            parallel {
                stage('Frontend Pipeline') {
                    when {
                        expression { env.RUN_FRONTEND == 'true' }
                    }
                    steps {
                        echo "🚀 Building and deploying Frontend..."
                        script {
                            def dockerImage = docker.build("nextstore_frontend:${env.BUILD_NUMBER}", "./frontend")
                            sh "docker stop nextstore_frontend_container || true"
                            sh "docker rm nextstore_frontend_container || true"
                            sh """
                                docker run -d \
                                --name nextstore_frontend_container \
                                -p 3000:3000 \
                                --restart unless-stopped \
                                nextstore_frontend:${env.BUILD_NUMBER}
                            """

                            sleep(time: 5, unit: 'SECONDS')
                            def containerStatus = sh(
                                script: "docker ps -q -f name=nextstore_frontend_container",
                                returnStdout: true
                            ).trim()

                            if (!containerStatus) {
                                echo "❌ Container failed to start! Checking logs..."
                                sh "docker logs nextstore_frontend_container"
                                error("Frontend container failed to start")
                            } else {
                                echo "✅ Frontend container is running"
                                sh "docker logs --tail 20 nextstore_frontend_container"
                            }
                        }
                    }
                }

                stage('Backend Pipeline') {
                    when {
                        expression { env.RUN_BACKEND == 'true' }
                    }
                    steps {
                        echo "🚀 Building and deploying Backend with Docker Compose..."
                        dir('backend') {
                            // Stop and remove existing containers
                            sh 'docker compose -f docker-compose-es.yml down || true'
                            
                            // Build and start services
                            sh 'docker compose -f docker-compose-es.yml up -d --build'
                            
                            // Wait for services to be ready
                            sleep(time: 10, unit: 'SECONDS')
                            
                            // Check container status
                            sh 'docker compose -f docker-compose-es.yml ps'
                            
                            // Verify backend container is running
                            script {
                                def containerStatus = sh(
                                    script: "docker ps -q -f name=nextstore_backend_container",
                                    returnStdout: true
                                ).trim()

                                if (!containerStatus) {
                                    echo "❌ Backend container failed to start! Checking logs..."
                                    sh "docker logs nextstore_backend_container || true"
                                    error("Backend container failed to start")
                                } else {
                                    echo "✅ Backend container is running"
                                    sh "docker logs --tail 20 nextstore_backend_container"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up old Docker images...'
                sh 'docker image prune -f'
            }
        }
    }

    post {
        always { echo 'Pipeline finished.' }
        success { echo '✅ Pipeline executed successfully!' }
        failure { echo '❌ Pipeline failed. Check logs.' }
    }
}
