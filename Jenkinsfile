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
                    CHANGED_FILES = sh(
                        script: "git fetch origin ${branchName} && git diff --name-only origin/${branchName}...HEAD",
                        returnStdout: true
                    ).trim().split("\n")

                    // Detect which services changed
                    RUN_FRONTEND = CHANGED_FILES.any { it.startsWith('frontend/') }
                    RUN_BACKEND = CHANGED_FILES.any { it.startsWith('backend/') }

                    // Apply manual override
                    if (params.DEPLOY_TARGET == 'frontend') {
                        echo "⚠️ Manually forcing FRONTEND deploy"
                        RUN_FRONTEND = true
                        RUN_BACKEND = false
                    } else if (params.DEPLOY_TARGET == 'backend') {
                        echo "⚠️ Manually forcing BACKEND deploy"
                        RUN_FRONTEND = false
                        RUN_BACKEND = true
                    } else if (params.DEPLOY_TARGET == 'both') {
                        echo "⚠️ Manually forcing BOTH frontend & backend deploy"
                        RUN_FRONTEND = true
                        RUN_BACKEND = true
                    } else {
                        echo "🧠 Auto mode — using detected file changes"
                    }

                    echo "Changed files in this push: ${CHANGED_FILES}"
                    echo "Run Frontend: ${RUN_FRONTEND}"
                    echo "Run Backend: ${RUN_BACKEND}"
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
                        expression { return RUN_FRONTEND }
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
                                nextstore_frontend:${env.BUILD_NUMBER}
                            """
                        }
                    }
                }

                stage('Backend Pipeline') {
                    when {
                        expression { return RUN_BACKEND }
                    }
                    steps {
                        echo "🚀 Building and deploying Backend..."
                        script {
                            def dockerImage = docker.build("nextstore_backend:${env.BUILD_NUMBER}", "./backend")
                            sh "docker stop nextstore_backend_container || true"
                            sh "docker rm nextstore_backend_container || true"
                            sh """
                                docker run -d \
                                --name nextstore_backend_container \
                                -p 8000:8000 \
                                nextstore_backend:${env.BUILD_NUMBER}
                            """
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
