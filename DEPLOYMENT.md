# 🚀 Guide Complet de Déploiement AWS

Ce guide explique comment déployer l'application Scalable Task API sur AWS avec ECS, ECR, RDS et ElastiCache.

## Table des matières

1. [Prérequis AWS](#prérequis-aws)
2. [Configuration de l'Infrastructure](#configuration-de-linfrastructure)
3. [Configuration de GitHub](#configuration-de-github)
4. [Déploiement Initial](#déploiement-initial)
5. [Monitoring et Maintenance](#monitoring-et-maintenance)
6. [Troubleshooting](#troubleshooting)

## Prérequis AWS

### Compte AWS

- Account AWS actif avec accès à:
  - **EC2** (pour ECS Fargate)
  - **ECR** (pour Docker images)
  - **RDS** (pour PostgreSQL)
  - **ElastiCache** (pour Redis)
  - **CloudWatch** (pour logs et monitoring)
  - **IAM** (pour les rôles et permissions)
  - **VPC** (pour networking)

### Outils nécessaires

```bash
# AWS CLI
pip install awscli

# Configure AWS credentials
aws configure
```

## Configuration de l'Infrastructure

### 1. Créer les ressources de base

#### 1.1 Créer une base de données RDS PostgreSQL

```bash
# Via AWS CLI
aws rds create-db-instance \
  --db-instance-identifier taskapi-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15 \
  --master-username taskapi_user \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 20 \
  --storage-type gp3 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name default \
  --multi-az false \
  --backup-retention-period 30

# Ou via Console AWS: RDS → Databases → Create database
```

**Configuration recommandée:**
- Instance class: `db.t3.micro` (free tier eligible)
- Storage: 20 GB gp3
- Backup: 30 jours
- Multi-AZ: Non (pour coûts réduits)

#### 1.2 Créer un cache ElastiCache Redis

```bash
# Via AWS CLI
aws elasticache create-cache-cluster \
  --cache-cluster-id taskapi-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name default \
  --security-group-ids sg-xxxxx

# Ou via Console AWS: ElastiCache → Clusters → Create
```

#### 1.3 Créer un ECR Repository

```bash
# Via AWS CLI
aws ecr create-repository \
  --repository-name scalable-task-api \
  --region us-east-1

# Résultat: Notez l'URI du repository
# Ex: 123456789012.dkr.ecr.us-east-1.amazonaws.com/scalable-task-api
```

### 2. Configurer VPC & Networking

#### 2.1 Créer un VPC (optionnel si vous utilisez le VPC par défaut)

```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16
```

#### 2.2 Créer des sous-réseaux

```bash
# Subnet public 1
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Subnet public 2
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1b

# Subnet privé pour RDS
aws ec2 create-subnet \
  --vpc-id vpc-xxxxx \
  --cidr-block 10.0.10.0/24 \
  --availability-zone us-east-1a
```

#### 2.3 Créer des Groupes de Sécurité

```bash
# Security Group pour ECS (port 8000)
aws ec2 create-security-group \
  --group-name taskapi-ecs-sg \
  --description "Security group for TaskAPI ECS tasks" \
  --vpc-id vpc-xxxxx

# Permettre le trafic depuis ALB
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxx \
  --protocol tcp \
  --port 8000 \
  --source-security-group-id sg-alb-xxxxx

# Security Group pour RDS
aws ec2 create-security-group \
  --group-name taskapi-rds-sg \
  --description "Security group for TaskAPI RDS database" \
  --vpc-id vpc-xxxxx

# Permettre le trafic depuis ECS
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds-xxxxx \
  --protocol tcp \
  --port 5432 \
  --source-security-group-id sg-ecs-xxxxx
```

### 3. Créer le Cluster ECS

```bash
# Via AWS CLI
aws ecs create-cluster \
  --cluster-name task-api-cluster \
  --region us-east-1

# Ou via Console: ECS → Clusters → Create Cluster
# Sélectionner: AWS Fargate launch type
```

### 4. Créer la Task Definition

```bash
# Créer le fichier task-definition.json
cat > task-definition.json << 'EOF'
{
  "family": "task-api-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "taskapi",
      "image": "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/scalable-task-api:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8000,
          "hostPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DJANGO_SETTINGS_MODULE",
          "value": "config.settings.prod"
        },
        {
          "name": "DEBUG",
          "value": "False"
        }
      ],
      "secrets": [
        {
          "name": "SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:taskapi/SECRET_KEY"
        },
        {
          "name": "POSTGRES_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT_ID:secret:taskapi/DB_PASSWORD"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/task-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:8000/api/accounts/me/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskRole"
}
EOF

# Remplacer les placeholders
sed -i "s/ACCOUNT_ID/$(aws sts get-caller-identity --query Account --output text)/g" task-definition.json
sed -i "s/REGION/us-east-1/g" task-definition.json

# Enregistrer la task definition
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json
```

### 5. Créer le Service ECS

```bash
# Via AWS CLI
aws ecs create-service \
  --cluster task-api-cluster \
  --service-name task-api-service \
  --task-definition task-api-task:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-ecsxxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:ACCOUNT_ID:targetgroup/taskapi/xxxxx,containerName=taskapi,containerPort=8000"
```

## Configuration de GitHub

### 1. Créer les Secrets GitHub

Allez dans: **Settings → Secrets and variables → Actions → New repository secret**

Ajouter les secrets suivants:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION (ex: us-east-1)
ECS_CLUSTER_NAME (ex: task-api-cluster)
ECS_SERVICE_NAME (ex: task-api-service)
ECS_TASK_DEFINITION (ex: task-api-task)
SUBNET_IDS (ex: subnet-xxxxx,subnet-yyyyy)
SECURITY_GROUP_ID (ex: sg-xxxxx)
```

### 2. Créer un Utilisateur IAM pour GitHub

```bash
# Créer l'utilisateur
aws iam create-user --user-name github-actions

# Créer une clé d'accès
aws iam create-access-key --user-name github-actions

# Créer une politique
cat > github-actions-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:*:ACCOUNT_ID:repository/scalable-task-api"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:UpdateService",
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:DescribeTasks",
        "ecs:ListTasks",
        "ecs:RunTask"
      ],
      "Resource": "*"
    }
  ]
}
EOF

# Attacher la politique
aws iam put-user-policy \
  --user-name github-actions \
  --policy-name github-actions-policy \
  --policy-document file://github-actions-policy.json
```

## Déploiement Initial

### 1. Push vers la branche main

```bash
git add .
git commit -m "Initial commit for AWS deployment"
git push origin main
```

### 2. Suivi du déploiement

```bash
# Consulter les logs GitHub Actions
# Settings → Actions → "CI/CD Pipeline"

# Vérifier l'image dans ECR
aws ecr describe-images --repository-name scalable-task-api

# Vérifier le service ECS
aws ecs describe-services \
  --cluster task-api-cluster \
  --services task-api-service
```

### 3. Accéder à l'application

```bash
# Obtenir l'URL du ALB ou la tâche
aws ecs list-tasks --cluster task-api-cluster
aws ecs describe-tasks \
  --cluster task-api-cluster \
  --tasks task-arn-from-above-command

# L'application sera accessible via l'IP publique / DNS du ALB
```

## Monitoring et Maintenance

### CloudWatch Logs

```bash
# Voir les logs en temps réel
aws logs tail /ecs/task-api --follow

# Filtrer les erreurs
aws logs filter-log-events \
  --log-group-name /ecs/task-api \
  --filter-pattern "[ERROR]"
```

### Autoscaling

```bash
# Créer une Application Auto Scaling target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/task-api-cluster/task-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Créer une politique de scaling
aws application-autoscaling put-scaling-policy \
  --policy-name task-api-scaling-policy \
  --service-namespace ecs \
  --resource-id service/task-api-cluster/task-api-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

### Mise à jour de l'application

```bash
# Pousser vers main déclenche automatiquement le pipeline
# Le déploiement se fait automatiquement

# Vérifier l'état du déploiement
aws ecs describe-services \
  --cluster task-api-cluster \
  --services task-api-service
```

## Troubleshooting

### La tâche ECS n'est pas saine

```bash
# Vérifier les logs
aws logs tail /ecs/task-api --follow

# Vérifier la tâche
aws ecs describe-tasks \
  --cluster task-api-cluster \
  --tasks task-arn

# Vérifier la configuration de sécurité
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

### Erreur de base de données

```bash
# Vérifier que RDS est accessible
aws rds describe-db-instances --db-instance-identifier taskapi-db

# Tester la connexion
psql -h taskapi-db.xxxxx.us-east-1.rds.amazonaws.com \
     -U taskapi_user \
     -d taskapi_db
```

### Erreur de permissions

```bash
# Vérifier le rôle IAM
aws iam get-role --role-name ecsTaskRole

# Vérifier la politique
aws iam list-role-policies --role-name ecsTaskRole
```

## Coûts estimés (par mois)

- **ECS Fargate**: $10-30
- **RDS PostgreSQL**: $15-30 (db.t3.micro)
- **ElastiCache Redis**: $10-20 (cache.t3.micro)
- **Data transfer**: $0-5
- **CloudWatch**: $0-5

**Total estimé**: $35-90 par mois

## Sécurité

- ✅ Utiliser AWS Secrets Manager pour les secrets
- ✅ Chiffrer les données en transit (HTTPS)
- ✅ Utiliser des groupes de sécurité restrictifs
- ✅ Activer les logs CloudWatch
- ✅ Utiliser IAM roles pas de clés hardcodées
- ✅ Mettre à jour les dépendances régulièrement

---

Pour plus d'informations, consulter la documentation officielle:
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
