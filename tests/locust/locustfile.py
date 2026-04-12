import json
from locust import HttpUser, task, between
from locust.exception import StopUser


class TaskAPIUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Login at the start of the session"""
        response = self.client.post("/api/accounts/login/", json={
            "username": "user1",
            "password": "password123"
        })

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            self.user_id = data.get("user_id")
            if not self.token:
                raise StopUser("Login failed - no token received")
        else:
            raise StopUser(f"Login failed with status {response.status_code}")

    @task(3)
    def get_tasks(self):
        """Get user's tasks"""
        headers = {"Authorization": f"Token {self.token}"}
        self.client.get("/api/tasks/", headers=headers, name="get_tasks")

    @task(2)
    def create_task(self):
        """Create a new task"""
        headers = {
            "Authorization": f"Token {self.token}",
            "Content-Type": "application/json"
        }

        import random
        task_data = {
            "title": f"Load Test Task {random.randint(1, 1000)}",
            "description": "Task created during load testing",
            "completed": random.choice([True, False])
        }

        response = self.client.post(
            "/api/tasks/",
            json=task_data,
            headers=headers,
            name="create_task"
        )

        if response.status_code == 201:
            # Store task ID for potential updates/deletes
            data = response.json()
            self.last_task_id = data.get("id")

    @task(1)
    def update_task(self):
        """Update an existing task"""
        if not hasattr(self, 'last_task_id'):
            return

        headers = {
            "Authorization": f"Token {self.token}",
            "Content-Type": "application/json"
        }

        update_data = {
            "title": "Updated Task Title",
            "completed": True
        }

        self.client.patch(
            f"/api/tasks/{self.last_task_id}/",
            json=update_data,
            headers=headers,
            name="update_task"
        )

    @task(1)
    def delete_task(self):
        """Delete a task"""
        if not hasattr(self, 'last_task_id'):
            return

        headers = {"Authorization": f"Token {self.token}"}

        self.client.delete(
            f"/api/tasks/{self.last_task_id}/",
            headers=headers,
            name="delete_task"
        )

        # Remove the task ID after deletion
        if hasattr(self, 'last_task_id'):
            delattr(self, 'last_task_id')


class WebsiteUser(HttpUser):
    wait_time = between(2, 5)

    @task(2)
    def view_home(self):
        """View home page"""
        self.client.get("/", name="home_page")

    @task(1)
    def view_login(self):
        """View login page"""
        self.client.get("/login/", name="login_page")

    @task(1)
    def view_register(self):
        """View register page"""
        self.client.get("/register/", name="register_page")

    @task(3)
    def view_tasks(self):
        """View tasks page"""
        self.client.get("/tasks/", name="tasks_page")