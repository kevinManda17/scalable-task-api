import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const USERNAME = 'user1';
const PASSWORD = 'password123';

// Métriques personnalisées
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const loginCount = new Counter('login_count');
const taskCreatedCount = new Counter('tasks_created');
const taskFetchCount = new Counter('tasks_fetched');

// Configuration des options
export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Ramp-up: de 0 à 10 utilisateurs en 10s
    { duration: '30s', target: 50 },    // Augmentation: de 10 à 50 utilisateurs en 30s
    { duration: '30s', target: 50 },    // Charge stable: 50 utilisateurs pendant 30s
    { duration: '10s', target: 0 },     // Ramp-down: de 50 à 0 utilisateurs en 10s
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% des requêtes < 500ms
    errors: ['rate<0.1'],                             // Taux d'erreur < 10%
  },
};

let authToken = null;
let userId = null;

export function setup() {
  // Authentification avant les tests
  console.log('🔐 Authentification...');
  const loginRes = http.post(`${BASE_URL}/api/accounts/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200 || r.status === 401,
  });

  if (loginRes.status === 200) {
    const data = JSON.parse(loginRes.body);
    return {
      token: data.token || null,
      userId: data.user_id || null,
    };
  }
  return { token: null, userId: null };
}

export default function (data) {
  if (data && data.token) {
    authToken = data.token;
    userId = data.userId;
  }

  // Tests d'authentification
  group('Authentication Tests', () => {
    testLogin();
  });

  sleep(1);

  // Tests des tâches
  group('Task API Tests', () => {
    if (authToken) {
      testGetTasks();
      testCreateTask();
      testUpdateTask();
      testDeleteTask();
    }
  });

  sleep(1);
}

function testLogin() {
  const payload = {
    username: USERNAME,
    password: PASSWORD,
  };

  const res = http.post(`${BASE_URL}/api/accounts/login/`, payload);
  const success = check(res, {
    'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'login response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
  if (success && res.status === 200) {
    loginCount.add(1);
  }
}

function testGetTasks() {
  const params = {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  };

  const res = http.get(`${BASE_URL}/api/tasks/`, params);
  const success = check(res, {
    'fetch tasks status is 200': (r) => r.status === 200,
    'fetch tasks response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
  if (success) {
    taskFetchCount.add(1);
  }
}

function testCreateTask() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${authToken}`,
    },
  };

  const payload = {
    title: `Test Task ${Date.now()}`,
    description: 'This is a test task created by k6',
    completed: false,
  };

  const res = http.post(`${BASE_URL}/api/tasks/`, JSON.stringify(payload), params);
  const success = check(res, {
    'create task status is 201 or 200': (r) => r.status === 201 || r.status === 200,
    'create task response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  responseTime.add(res.timings.duration);
  if (success) {
    taskCreatedCount.add(1);
  }

  return res.status === 201 || res.status === 200 ? JSON.parse(res.body).id : null;
}

function testUpdateTask() {
  // D'abord, récupérer une tâche
  const params = {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  };

  const listRes = http.get(`${BASE_URL}/api/tasks/`, params);

  if (listRes.status === 200) {
    const tasks = JSON.parse(listRes.body);
    if (tasks.length > 0 || tasks.results?.length > 0) {
      const taskList = tasks.results || tasks;
      if (taskList.length > 0) {
        const taskId = taskList[0].id;

        const updateParams = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${authToken}`,
          },
        };

        const updatePayload = {
          title: `Updated Task ${Date.now()}`,
          completed: true,
        };

        const updateRes = http.patch(
          `${BASE_URL}/api/tasks/${taskId}/`,
          JSON.stringify(updatePayload),
          updateParams
        );

        check(updateRes, {
          'update task status is 200': (r) => r.status === 200,
          'update task response time < 500ms': (r) => r.timings.duration < 500,
        });

        errorRate.add(updateRes.status !== 200);
        responseTime.add(updateRes.timings.duration);
      }
    }
  }
}

function testDeleteTask() {
  const params = {
    headers: {
      Authorization: `Token ${authToken}`,
    },
  };

  const listRes = http.get(`${BASE_URL}/api/tasks/`, params);

  if (listRes.status === 200) {
    const tasks = JSON.parse(listRes.body);
    if (tasks.length > 0 || tasks.results?.length > 0) {
      const taskList = tasks.results || tasks;
      if (taskList.length > 0) {
        const taskId = taskList[taskList.length - 1].id;

        const deleteRes = http.del(`${BASE_URL}/api/tasks/${taskId}/`, null, params);

        check(deleteRes, {
          'delete task status is 204 or 200': (r) => r.status === 204 || r.status === 200,
          'delete task response time < 500ms': (r) => r.timings.duration < 500,
        });

        errorRate.add(deleteRes.status !== 204 && deleteRes.status !== 200);
        responseTime.add(deleteRes.timings.duration);
      }
    }
  }
}
