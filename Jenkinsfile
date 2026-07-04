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
        }
    }
}
