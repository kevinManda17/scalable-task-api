import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://nginx:80';
const USERNAME = 'user1';
const PASSWORD = 'password123';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const loginCount = new Counter('login_count');
const taskCreatedCount = new Counter('tasks_created');
const taskFetchCount = new Counter('tasks_fetched');

export const options = {
  stages: [
    { duration: '30s', target: 100 },    // 0 → 100
    { duration: '30s', target: 250 },    // 100 → 250
    { duration: '30s', target: 500 },    // 250 → 500
    { duration: '30s', target: 750 },    // 500 → 750
    { duration: '30s', target: 1000 },   // 750 → 1000
    { duration: '30s', target: 1250 },   // 1000 → 1250
    { duration: '30s', target: 1500 },   // 1250 → 1500
    { duration: '1m', target: 1500 },    // Maintien à 1500
    { duration: '30s', target: 750 },    // 1500 → 750
    { duration: '30s', target: 250 },    // 750 → 250
    { duration: '10s', target: 0 },      // 250 → 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    errors: ['rate<0.05'],
  },
  batchPerHost: 30,
};

let authToken = null;

export function setup() {
  console.log('=== SETUP: Login ===');
  
  const loginRes = http.post(`${BASE_URL}/api/accounts/login/`, {
    username: USERNAME,
    password: PASSWORD,
  });

  check(loginRes, {
    'setup login successful': (r) => r.status === 200,
  });

  if (loginRes.status === 200) {
    const data = loginRes.json();
    const token = data.access || data.token;
    console.log(`Token obtenu: ${token ? 'OK' : 'ERREUR'}`);
    loginCount.add(1);
    return { token: token };
  }
  
  console.error(`Setup login failed: ${loginRes.status}`);
  return { token: null };
}

export default function (data) {
  if (!data || !data.token) {
    errorRate.add(1);
    return;
  }
  
  const token = data.token;
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // GET tasks
  const getRes = http.get(`${BASE_URL}/api/tasks/`, { headers, timeout: '60s' });
  
  const getOk = check(getRes, {
    'GET tasks 200': (r) => r.status === 200,
  });
  
  errorRate.add(!getOk);
  responseTime.add(getRes.timings.duration);
  if (getOk) taskFetchCount.add(1);
  
  sleep(0.2);

  // GET with filter
  const filterRes = http.get(`${BASE_URL}/api/tasks/?completed=false`, { headers });
  
  const filterOk = check(filterRes, {
    'filter tasks 200': (r) => r.status === 200,
  });
  
  errorRate.add(!filterOk);
  responseTime.add(filterRes.timings.duration);
  
  sleep(0.2);

  // POST task (10% du temps pour réduire la charge DB)
  if (Math.random() < 0.1) {
    const payload = JSON.stringify({
      title: `K6 Test ${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      description: 'Load test task',
      completed: false,
    });
    
    const createRes = http.post(`${BASE_URL}/api/tasks/`, payload, { headers });
    
    const createOk = check(createRes, {
      'POST task 201/200': (r) => r.status === 201 || r.status === 200,
    });
    
    errorRate.add(!createOk);
    responseTime.add(createRes.timings.duration);
    if (createOk) taskCreatedCount.add(1);
  }
  
  sleep(Math.random() * 0.5 + 0.3);  // 0.3 à 0.8 secondes
}

export function teardown(data) {
  console.log('\n=== TEST TERMINÉ ===');
  console.log(`Logins réussis: ${loginCount.value}`);
  console.log(`Tâches récupérées: ${taskFetchCount.value}`);
  console.log(`Tâches créées: ${taskCreatedCount.value}`);
}