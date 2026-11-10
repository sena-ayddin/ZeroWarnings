// Bilet süreçlerinin ana beyni: Esma'nın formundan gelen veriyi alır,
// Gülçin'in SLA servisini çağırır, Elif'in veri modeline uygun kaydeder.
const { tickets, nextTicket } = require('../models/store');
const { ApiError } = require('../middlewares/errorHandler');
const { ROLES } = require('../middlewares/authMiddleware');
const slaService = require('../services/slaService');

const PRIORITIES = Object.keys(slaService.SLA_POLICIES); // Low, Medium, High, Critical
const REQUEST_TYPES = ['Incident', 'Change Request'];
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Email', 'Other'];

const isStaff = (user) => [ROLES.TECHNICIAN, ROLES.ADMIN].includes(user.role);

// Gülçin'in getSlaStatus() fonksiyonuna biletin alanlarını eşler.
// slaStatus: ON_TRACK | WARNING | ESCALATED
const withSla = (ticket) => ({
  ...ticket,
  sla: slaService.getSlaStatus({
    id: ticket.ticket_number,
    priority: ticket.priority,
    createdAt: ticket.created_at,
    resolvedAt: ticket.resolved_at
  })
});

// POST /api/tickets
exports.createTicket = (req, res, next) => {
  try {
    const body = req.body || {};
    const title = body.title || body.subject; // wireframe'de alan adı "Subject"
    const { description, category, priority = 'Medium', request_type = 'Incident' } = body;

    const errors = [];
    if (!title || String(title).trim().length < 3) errors.push('title (subject) en az 3 karakter olmalı');
    if (!description || !String(description).trim()) errors.push('description zorunlu');
    if (!CATEGORIES.includes(category)) errors.push(`category şunlardan biri olmalı: ${CATEGORIES.join(', ')}`);
    if (!PRIORITIES.includes(priority)) errors.push(`priority şunlardan biri olmalı: ${PRIORITIES.join(', ')}`);
    if (!REQUEST_TYPES.includes(request_type)) errors.push(`request_type şunlardan biri olmalı: ${REQUEST_TYPES.join(', ')}`);
    if (errors.length) throw new ApiError(400, 'Doğrulama hatası', errors);

    const createdAt = new Date();
    const ticket = {
      ...nextTicket(request_type),
      user_id: req.user.id,
      assigned_to: null,
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      priority,
      status: 'Open',
      request_type,
      escalation_level: 1,
      created_at: createdAt.toISOString(),
      updated_at: null,
      resolution_due_at: slaService.calculateSlaDeadline(createdAt, priority).toISOString(), // FR-05
      resolved_at: null,
      sla_warning_sent: false,
      is_escalated: false
    };
    tickets.push(ticket);

    res.status(201).json({ success: true, ticket: withSla(ticket) });
  } catch (err) { next(err); }
};

// GET /api/tickets  (Employee: sadece kendi biletleri, Technician/Administrator: tümü)
exports.listTickets = (req, res, next) => {
  try {
    const result = isStaff(req.user) ? tickets : tickets.filter((t) => t.user_id === req.user.id);
    const list = result.map(withSla);
    res.json({ success: true, count: list.length, tickets: list });
  } catch (err) { next(err); }
};

// GET /api/tickets/:id  (id = INC-1024 gibi ticket_number)
exports.getTicket = (req, res, next) => {
  try {
    const ticket = tickets.find((t) => t.ticket_number === req.params.id);
    if (!ticket) throw new ApiError(404, 'Bilet bulunamadı');
    if (!isStaff(req.user) && ticket.user_id !== req.user.id) {
      throw new ApiError(403, 'Bu bilete erişim yetkiniz yok');
    }
    res.json({ success: true, ticket: withSla(ticket) });
  } catch (err) { next(err); }
};