// Duman testi: sunucu ve MySQL çalışırken `npm run test:smoke` (Node 18+).
// Önce `npm run seed:passwords` çalıştırılmış olmalı. Çıktısı rapora kanıt olarak eklenebilir.
const BASE = process.env.API_URL || 'http://localhost:3000';

const call = async (method, path, { token, body } = {}) => {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: res.status, data: await res.json() };
};

let failed = 0;
const check = (name, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} (beklenen ${expected}, gelen ${actual})`);
};
const login = (email, password) => call('POST', '/api/auth/login', { body: { email, password } });

(async () => {
  const emp = await login('ahmet@iku.edu.tr', 'Emp123!');
  const tech = await login('mehmet@iku.edu.tr', 'Tech123!');
  const admin = await login('elif@iku.edu.tr', 'Admin123!');
  check('Employee girişi', emp.status, 200);
  check('Technician girişi', tech.status, 200);
  check('Administrator girişi', admin.status, 200);
  check('Yanlış şifre', (await login('ahmet@iku.edu.tr', 'x')).status, 401);
  check('Tokensız bilet listeleme', (await call('GET', '/api/tickets')).status, 401);
  check('Geçersiz bilet verisi', (await call('POST', '/api/tickets', { token: emp.data.token, body: { title: 'a' } })).status, 400);

  const created = await call('POST', '/api/tickets', {
    token: emp.data.token,
    body: { title: 'Bilgisayar açılmıyor', description: 'Güç düğmesi tepki vermiyor', category: 'Hardware', priority: 'High', request_type: 'Incident' }
  });
  check('Bilet açma', created.status, 201);
  const id = created.data.ticket && created.data.ticket.ticket_number;
  console.log(`   -> ${id}, SLA son tarihi: ${created.data.ticket.resolution_due_at}, sla.slaStatus: ${created.data.ticket.sla.slaStatus}`);

  check('Employee kendi biletlerini listeler', (await call('GET', '/api/tickets', { token: emp.data.token })).status, 200);
  check('Technician tüm biletleri listeler', (await call('GET', '/api/tickets', { token: tech.data.token })).data.count >= 1, true);
  check('Bilet detayı', (await call('GET', `/api/tickets/${id}`, { token: emp.data.token })).status, 200);
  check('Olmayan bilet', (await call('GET', '/api/tickets/INC-9999', { token: emp.data.token })).status, 404);

  const other = await call('POST', '/api/auth/register', { body: { name: 'Diğer Çalışan', email: `diger${Date.now()}@iku.edu.tr`, password: 'Diger1234!' } });
  check('Başka çalışan bu bileti göremez', (await call('GET', `/api/tickets/${id}`, { token: other.data.token })).status, 403);

  // --- Durum güncelleme & atama (FR-03, FR-11) ---
  const patch = (token, body) => call('PATCH', `/api/tickets/${id}/status`, { token, body });
  check('Employee durum güncelleyemez', (await patch(emp.data.token, { status: 'Resolved' })).status, 403);
  check('Geçersiz durum', (await patch(tech.data.token, { status: 'Done' })).status, 400);
  check('Boş gövde', (await patch(tech.data.token, {})).status, 400);

  const inProgress = await patch(tech.data.token, { status: 'In Progress' });
  check('Teknisyen bileti işleme alır', inProgress.status, 200);
  check('Bilet teknisyene atandı', inProgress.data.ticket.assigned_to, tech.data.user.id);
  check('first_response_at dolduruldu', inProgress.data.ticket.first_response_at !== null, true);

  check('Bilet Resolved yapılır', (await patch(tech.data.token, { status: 'Resolved' })).status, 200);
  check('resolved_at dolduruldu', (await call('GET', `/api/tickets/${id}`, { token: tech.data.token })).data.ticket.resolved_at !== null, true);
  check('Bilet Closed yapılır', (await patch(tech.data.token, { status: 'Closed' })).status, 200);
  check('Kapalı bilet güncellenemez', (await patch(tech.data.token, { status: 'In Progress' })).status, 409);

  // --- CSAT (ISO 9001 Madde 9.1.2) ---
  const feedback = (token, body) => call('POST', `/api/tickets/${id}/feedback`, { token, body });
  check('Geçersiz puan reddedilir', (await feedback(emp.data.token, { satisfaction_rating: 6 })).status, 400);
  check('Bilet sahibi olmayan geri bildirim veremez', (await feedback(tech.data.token, { satisfaction_rating: 5 })).status, 403);
  check('Bilet sahibi geri bildirim verir', (await feedback(emp.data.token, { satisfaction_rating: 5, comments: 'Hızlı çözüldü' })).status, 201);
  check('Aynı bilete ikinci geri bildirim reddedilir', (await feedback(emp.data.token, { satisfaction_rating: 4 })).status, 409);

  // --- Change Request (FR-04, ISO 9001 Madde 8.5.6) ---
  const crBody = { title: 'VPN erişimi talebi', description: 'Uzaktan çalışma için VPN erişimi', reason: 'Evden çalışma onayı', impact_level: 'Low', risk_level: 'Low', category: 'Access', priority: 'Medium' };
  const crPatch = (no, token, status) => call('PATCH', `/api/change-requests/${no}/status`, { token, body: { status } });
  check('Geçersiz değişiklik talebi', (await call('POST', '/api/change-requests', { token: emp.data.token, body: { title: 'x' } })).status, 400);
  const cr = await call('POST', '/api/change-requests', { token: emp.data.token, body: crBody });
  check('Değişiklik talebi açma', cr.status, 201);
  const crNo = cr.data.ticket_number;
  console.log(`   -> ${crNo}, durum: ${cr.data.change_request && cr.data.change_request.status}`);
  check('CHG numarası üretildi', String(crNo).startsWith('CHG-'), true);
  check('Başlangıç durumu Pending', cr.data.change_request.status, 'Pending');
  check('Çalışan kendi taleplerini listeler', (await call('GET', '/api/change-requests', { token: emp.data.token })).data.count >= 1, true);
  check('Talep detayı', (await call('GET', `/api/change-requests/${crNo}`, { token: emp.data.token })).status, 200);
  check('Başka çalışan talebi göremez', (await call('GET', `/api/change-requests/${crNo}`, { token: other.data.token })).status, 403);
  check('Çalışan talebi onaylayamaz', (await crPatch(crNo, emp.data.token, 'Approved')).status, 403);
  check('Technician talebi onaylayamaz', (await crPatch(crNo, tech.data.token, 'Approved')).status, 403);
  check('Onaylanmadan uygulanamaz', (await crPatch(crNo, admin.data.token, 'Implemented')).status, 409);
  check('Administrator talebi onaylar', (await crPatch(crNo, admin.data.token, 'Approved')).status, 200);
  check('Bağlı bilet In Progress oldu', (await call('GET', `/api/tickets/${crNo}`, { token: tech.data.token })).data.ticket.status, 'In Progress');
  check('Technician talebi uygular', (await crPatch(crNo, tech.data.token, 'Implemented')).status, 200);
  check('Bağlı bilet Resolved oldu', (await call('GET', `/api/tickets/${crNo}`, { token: tech.data.token })).data.ticket.status, 'Resolved');
  check('Uygulanmış talep tekrar değişmez', (await crPatch(crNo, admin.data.token, 'Failed')).status, 409);
  const cr2 = await call('POST', '/api/change-requests', { token: emp.data.token, body: crBody });
  check('İkinci değişiklik talebi açma', cr2.status, 201);
  check('Administrator talebi reddeder', (await crPatch(cr2.data.ticket_number, admin.data.token, 'Rejected')).status, 200);
  check('Reddedilen talebin bileti Closed', (await call('GET', `/api/tickets/${cr2.data.ticket_number}`, { token: tech.data.token })).data.ticket.status, 'Closed');

  // --- KPI (FR-10) ---
  const kpi = await call('GET', '/api/kpi', { token: admin.data.token });
  check('Admin KPI raporu alır', kpi.status, 200);
  check('Çözülen bilet sayısı >= 1', kpi.data.kpi.resolved_tickets >= 1, true);
  check('KPI CSAT ortalamasını içerir', kpi.data.kpi.total_feedback >= 1 && kpi.data.kpi.average_csat !== null, true);
  console.log('   -> KPI:', JSON.stringify(kpi.data.kpi));
  check('Employee KPI göremez', (await call('GET', '/api/kpi', { token: emp.data.token })).status, 403);
  check('Technician KPI göremez', (await call('GET', '/api/kpi', { token: tech.data.token })).status, 403);

  console.log(failed ? `\n${failed} test başarısız` : '\nTüm testler geçti');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error('Sunucuya ulaşılamadı:', e.message); process.exit(1); });