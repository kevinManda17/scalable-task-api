import json
import random
from locust import HttpUser, task, between, events
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
            self.token = data.get("access") or data.get("token")
            self.user_id = data.get("user", {}).get("id") if isinstance(data.get("user"), dict) else None
            if not self.token:
                raise StopUser("Login failed - no token received")
        else:
            raise StopUser(f"Login failed with status {response.status_code}: {response.text}")

    @task(3)
    def get_tasks(self):
        """Get user's tasks"""
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/tasks/", headers=headers, name="get_tasks")

    @task(2)
    def create_task(self):
        """Create a new task"""
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        task_data = {
            "title": f"Load Test Task {random.randint(1, 1000000)}",
            "description": f"Task created during load testing at {random.randint(1, 100)}",
            "completed": random.choice([True, False])
        }

        response = self.client.post(
            "/api/tasks/",
            json=task_data,
            headers=headers,
            name="create_task"
        )

        if response.status_code in [201, 200]:
            try:
                data = response.json()
                self.last_task_id = data.get("id")
            except:
                pass

    @task(1)
    def update_task(self):
        """Update an existing task"""
        if not hasattr(self, 'last_task_id') or not self.last_task_id:
            return

        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

        update_data = {
            "title": f"Updated Task {random.randint(1, 1000)}",
            "completed": random.choice([True, False])
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
        if not hasattr(self, 'last_task_id') or not self.last_task_id:
            return

        headers = {"Authorization": f"Bearer {self.token}"}

        self.client.delete(
            f"/api/tasks/{self.last_task_id}/",
            headers=headers,
            name="delete_task"
        )

        if hasattr(self, 'last_task_id'):
            self.last_task_id = None

    @task(1)
    def filter_tasks(self):
        """Filter tasks by completion status"""
        headers = {"Authorization": f"Bearer {self.token}"}
        completed = random.choice([True, False])
        self.client.get(
            f"/api/tasks/?completed={completed}",
            headers=headers,
            name="filter_tasks"
        )

    @task(1)
    def search_tasks(self):
        """Search tasks"""
        headers = {"Authorization": f"Bearer {self.token}"}
        search_terms = ["test", "load", "task", "performance"]
        search_term = random.choice(search_terms)
        self.client.get(
            f"/api/tasks/?search={search_term}",
            headers=headers,
            name="search_tasks"
        )


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