pipeline {
    agent any

    stages {
        stage('Verify Workspace') {
            steps {
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('ForgeAI Scan') {
            steps {
                forgeAI(
                    analyzers: [
                        'code-review',
                        'vulnerability'
                    ]
                )
            }
            post {
                always {
                    archiveArtifacts artifacts: 'forgeai-reports/**', allowEmptyArchive: true
                }
            }
        }
    }
}
