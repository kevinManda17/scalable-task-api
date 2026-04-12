#!/usr/bin/env python
"""
Script to populate database with test data
Usage: python populate_db.py
"""
import os
import django
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from apps.tasks.models import Task
from django.utils import timezone
import random

User = get_user_model()

def main():
    print("Cleaning existing data...")
    Task.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    # Create super user
    print("Creating super user...")
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("Super user created: admin / admin123")
    else:
        print("Super user already exists: admin")

    # Create test users
    print("\nCreating 10 test users...")
    test_users = []
    for i in range(1, 11):
        user, created = User.objects.get_or_create(
            username=f'user{i}',
            defaults={
                'email': f'user{i}@example.com',
                'first_name': f'User',
                'last_name': f'{i}',
            }
        )
        if created:
            user.set_password('password123')
            user.save()
            print(f"User created: user{i}")
        test_users.append(user)

    # Create tasks for each user
    print("\nCreating tasks...")
    task_titles = [
        'Implement API authentication',
        'Create REST endpoints for tasks',
        'Write API documentation',
        'Add unit tests',
        'Configure Docker',
        'Set up logging',
        'Optimize database queries',
        'Implement caching',
        'Add data validation',
        'Deploy application',
        'Analyze performance',
        'Create database migrations',
        'Implement pagination',
        'Add search filters',
        'Configure CORS',
    ]

    task_count = 0
    for user in test_users:
        # Create between 3 and 8 tasks per user
        num_tasks = random.randint(3, 8)
        for j in range(num_tasks):
            task = Task.objects.create(
                user=user,
                title=random.choice(task_titles),
                description=f'Task description for {user.username}',
                completed=random.choice([True, False]),
                created_at=timezone.now() - timezone.timedelta(days=random.randint(0, 30))
            )
            task_count += 1

    print(f"{task_count} tasks created!")

    print("\nDatabase populated successfully!")
    print(f"\nSummary:")
    print(f"  - Super user: admin (password: admin123)")
    print(f"  - Users: {len(test_users)}")
    print(f"  - Tasks: {task_count}")

if __name__ == '__main__':
    main()
