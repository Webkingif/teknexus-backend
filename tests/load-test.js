import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 500 },  // Scale up to 500 concurrent users
    { duration: '30s', target: 500 }, // Hold steady at 500 users
    { duration: '15s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<250'], // 95% of requests must complete below 250ms
    http_req_failed: ['rate<0.01'],   // Error rate must stay below 1%
  },
};

export default function () {
  const url = 'http://localhost:3000/ussd';
  const payload = JSON.stringify({
    sessionId: `session_${Math.random()}`,
    serviceCode: '*384#',
    phoneNumber: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
    text: '',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
