// Bilet süreçlerinin ana beyni: formdan gelen veriyi alır, SLA servisini çağırır, MySQL'e kaydeder.
const { withTransaction } = require('../config/db');
const ticketModel = require('../models/ticketModel');
const userModel = require('../models/userModel');
const audit = require('../models/auditModel');
const { ApiError } = require('../middlewares/errorHandler');
const { ROLES } = require('../middlewares/authMiddleware');
const slaService = require('../services/slaService');

const PRIORITIES = Object.keys(slaService.SLA_POLICIES); // Low, Medium, High, Critical
const REQUEST_TYPES = ['Incident', 'Change Request'];
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Email', 'Other'];
const UPDATABLE_STATUSES = ['In Progress', 'Resolved', 'Closed'];

// MySQL DATETIME saniye hassasiyetindedir ve milisaniyeyi yukarı yuvarlayabilir;
// bu yüzden kaydedilecek zamanlar saniyeye indirilir (aksi halde SLA kontrolü "gelecekte açılmış bilet" sanır).
const nowSeconds = () => {
  const d = new Date();
  d.setMilliseconds(0);
  return d;
};

const isStaff = (user) => [ROLES.TECHNICIAN, ROLES.ADMIN].includes(user.role);

// getSlaStatus() çıktısı: slaStatus = ON_TRACK | WARNING | ESCALATED
const withSla = (ticket) => {
  // created_at saat dilimi/yuvarlama yüzünden "şimdi"den ileride kalırsa (örn. yerel saatle yazılmış seed verisi)
  // getSlaStatus hata fırlatır ve tüm liste çöker; bu durumda hesaplama açılış anına göre yapılır.
  const created = new Date(ticket.created_at);
  const now = new Date();
  return {
    ...ticket,
    sla: slaService.getSlaStatus({
      id: ticket.ticket_number,
      priority: ticket.priority,
      createdAt: ticket.created_at,
      resolvedAt: ticket.resolved_at
    }, created > now ? created : now)
  };
};

// POST /api/tickets
exports.createTicket = async (req, res, next) => {
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

    const createdAt = nowSeconds();
    const policy = await ticketModel.getSlaPolicy(priority); // SLA_Policies tablosundan
    const responseDue = policy ? slaService.addBusinessMinutes(createdAt, policy.response_time_minutes) : null;

    const ticket = await ticketModel.createWithAudit({
      user_id: req.user.id,
      sla_policy_id: policy ? policy.sla_policy_id : null,
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      priority,
      status: 'Open',
      request_type,
      escalation_level: 1,
      created_at: createdAt,
      response_due_at: responseDue,
      resolution_due_at: slaService.calculateSlaDeadline(createdAt, priority) // FR-05
    });

    res.status(201).json({ success: true, ticket: withSla(ticket) });
  } catch (err) { next(err); }
};

// GET /api/tickets  (Employee: sadece kendi biletleri, Technician/Administrator: tümü)
exports.listTickets = async (req, res, next) => {
  try {
    const rows = await ticketModel.list(isStaff(req.user) ? null : req.user.id);
    const tickets = rows.map(withSla);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) { next(err); }
};

// GET /api/tickets/:id  (INC-1024 gibi ticket_number veya sayısal ticket_id)
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await ticketModel.findByRef(req.params.id);
    if (!ticket) throw new ApiError(404, 'Bilet bulunamadı');
    if (!isStaff(req.user) && ticket.user_id !== req.user.id) throw new ApiError(403, 'Bu bilete erişim yetkiniz yok');
    res.json({ success: true, ticket: withSla(ticket) });
  } catch (err) { next(err); }
};

// PATCH /api/tickets/:id/status  (Technician / Administrator) - FR-03, FR-11
// Gövde: { "status": "In Progress|Resolved|Closed", "assigned_to": <user_id> | "me" }  (en az biri)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, assigned_to } = req.body || {};
    if (status === undefined && assigned_to === undefined) {
      throw new ApiError(400, 'status veya assigned_to alanlarından en az biri gerekli');
    }
    if (status !== undefined && !UPDATABLE_STATUSES.includes(status)) {
      throw new ApiError(400, `status şunlardan biri olmalı: ${UPDATABLE_STATUSES.join(', ')}`);
    }

    const updated = await withTransaction(async (conn) => {
      const ticket = await ticketModel.findByRef(req.params.id, conn, true); // satır kilidi
      if (!ticket) throw new ApiError(404, 'Bilet bulunamadı');
      if (ticket.status === 'Closed') throw new ApiError(409, 'Kapatılmış bilet güncellenemez');

      const isAdmin = req.user.role === ROLES.ADMIN;
      if (!isAdmin && ticket.assigned_to && ticket.assigned_to !== req.user.id) {
        throw new ApiError(403, 'Bu bilet başka bir teknisyene atanmış');
      }

      // Atama: teknisyen sadece kendi üzerine alabilir, admin istediği teknisyene atar
      let newAssignee = ticket.assigned_to;
      if (assigned_to !== undefined) {
        const target = assigned_to === 'me' ? req.user.id : Number(assigned_to);
        if (!Number.isInteger(target)) throw new ApiError(400, "assigned_to bir kullanıcı id'si veya 'me' olmalı");
        if (!isAdmin && target !== req.user.id) throw new ApiError(403, 'Teknisyen bileti yalnızca kendi üzerine alabilir');
        const assignee = await userModel.findById(target, conn);
        if (!assignee || !assignee.is_active || ![ROLES.TECHNICIAN, ROLES.ADMIN].includes(assignee.role)) {
          throw new ApiError(400, 'Atanacak kullanıcı aktif bir teknisyen olmalı');
        }
        newAssignee = target;
      } else if (status !== undefined && !ticket.assigned_to && req.user.role === ROLES.TECHNICIAN) {
        newAssignee = req.user.id; // atanmamış bileti işleme alan teknisyen otomatik üstüne alır
      }

      const statusChanged = status !== undefined && status !== ticket.status;
      const assigneeChanged = newAssignee !== ticket.assigned_to;
      if (!statusChanged && !assigneeChanged) throw new ApiError(409, 'Değişiklik yok: bilet zaten bu durumda');

      const now = nowSeconds();
      const fields = { updated_at: now };
      if (assigneeChanged) fields.assigned_to = newAssignee;
      if (statusChanged) {
        fields.status = status;
        if (status === 'In Progress') {
          if (!ticket.first_response_at) fields.first_response_at = now;
          if (ticket.resolved_at) fields.resolved_at = null; // yeniden açıldı
        }
        if (status === 'Resolved' && !ticket.resolved_at) fields.resolved_at = now;
        if (status === 'Closed') {
          fields.closed_at = now;
          if (!ticket.resolved_at) fields.resolved_at = now;
        }
      }
      await ticketModel.update(conn, ticket.ticket_id, fields);

      // Her değişiklik Audit_Logs'a aynı transaction'da yazılır
      if (statusChanged) {
        await audit.log(conn, { user_id: req.user.id, entity_type: 'Ticket', entity_id: ticket.ticket_id, action: 'STATUS_CHANGED',
          old_value: { status: ticket.status }, new_value: { status } });
      }
      if (assigneeChanged) {
        await audit.log(conn, { user_id: req.user.id, entity_type: 'Ticket', entity_id: ticket.ticket_id, action: 'TICKET_ASSIGNED',
          old_value: { assigned_to: ticket.assigned_to }, new_value: { assigned_to: newAssignee } });
      }
      return ticketModel.findByRef(ticket.ticket_id, conn);
    });

    res.json({ success: true, ticket: withSla(updated) });
  } catch (err) { next(err); }
};