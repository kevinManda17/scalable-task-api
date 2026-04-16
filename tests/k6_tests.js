import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://nginx:80';
const USERNAME = 'user1';
const PASSWORD = 'password123';

// Métriques personnalisées
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const loginCount = new Counter('login_count');
const taskCreatedCount = new Counter('tasks_created');
const taskFetchCount = new Counter('tasks_fetched');

// Configuration des options pour 300 utilisateurs
export const options = {
  stages: [
    { duration: '30s', target: 50 },    // 0 → 50 utilisateurs
    { duration: '30s', target: 100 },   // 50 → 100 utilisateurs
    { duration: '30s', target: 150 },   // 100 → 150 utilisateurs
    { duration: '30s', target: 200 },   // 150 → 200 utilisateurs
    { duration: '30s', target: 250 },   // 200 → 250 utilisateurs
    { duration: '30s', target: 300 },   // 250 → 300 utilisateurs
    { duration: '1m', target: 300 },    // Maintien à 300 utilisateurs pendant 1 minute
    { duration: '30s', target: 150 },   // 300 → 150 utilisateurs
    { duration: '30s', target: 50 },    // 150 → 50 utilisateurs
    { duration: '10s', target: 0 },     // 50 → 0 utilisateurs
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // 95% < 1s, 99% < 2s
    errors: ['rate<0.05'],                           // Max 5% d'erreurs
  },
  batchPerHost: 20,  // Requêtes parallèles par hôte
};

let authToken = null;

// ============================================
// SETUP : Login unique pour tout le test
// ============================================
export function setup() {
  console.log('=== SETUP: Authentification unique ===');
  
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

// ============================================
// FONCTION PRINCIPALE
// ============================================
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

  // ============================================
  // TEST 1 : GET /api/tasks/ (le plus fréquent)
  // ============================================
  const getRes = http.get(`${BASE_URL}/api/tasks/`, { headers, timeout: '30s' });
  
  const getOk = check(getRes, {
    'GET tasks 200': (r) => r.status === 200,
  });
  
  errorRate.add(!getOk);
  responseTime.add(getRes.timings.duration);
  if (getOk) taskFetchCount.add(1);
  
  sleep(0.3);

  // ============================================
  // TEST 2 : GET avec filtre
  // ============================================
  const filterRes = http.get(`${BASE_URL}/api/tasks/?completed=false`, { headers });
  
  const filterOk = check(filterRes, {
    'filter tasks 200': (r) => r.status === 200,
  });
  
  errorRate.add(!filterOk);
  responseTime.add(filterRes.timings.duration);
  
  sleep(0.3);

  // ============================================
  // TEST 3 : POST /api/tasks/ (création - 20% du temps)
  // ============================================
  if (Math.random() < 0.2) {
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
    
    // DELETE optionnel (30% des créations)
    if (createOk && Math.random() < 0.3) {
      try {
        const taskId = createRes.json().id;
        sleep(0.2);
        
        const deleteRes = http.del(`${BASE_URL}/api/tasks/${taskId}/`, null, { headers });
        
        check(deleteRes, {
          'DELETE task 204/200': (r) => r.status === 204 || r.status === 200,
        });
        
        errorRate.add(deleteRes.status !== 204 && deleteRes.status !== 200);
        responseTime.add(deleteRes.timings.duration);
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
  }
  
  // Pause entre les itérations (comportement réaliste)
  sleep(Math.random() * 1 + 0.5);  // 0.5 à 1.5 secondes
}

// ============================================
// TEARDOWN : Résumé final
// ============================================
export function teardown(data) {
  console.log('\n=== TEST TERMINÉ ===');
  console.log(`Logins réussis: ${loginCount.value}`);
  console.log(`Tâches récupérées: ${taskFetchCount.value}`);
  console.log(`Tâches créées: ${taskCreatedCount.value}`);
}