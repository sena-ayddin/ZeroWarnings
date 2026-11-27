// Değişiklik Talebi (Change Request) akışı - FR-04, FR-11, ISO 9001:2015 Madde 8.5.6
// Akış: Pending -> Approved | Rejected (Administrator) ; Approved -> Implemented | Failed (Technician, Administrator)
const { withTransaction } = require('../config/db');
const ticketModel = require('../models/ticketModel');
const changeRequestModel = require('../models/changeRequestModel');
const audit = require('../models/auditModel');
const { ApiError } = require('../middlewares/errorHandler');
const { ROLES } = require('../middlewares/authMiddleware');
const slaService = require('../services/slaService');

const LEVELS = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access', 'Email', 'Other'];
const PRIORITIES = Object.keys(slaService.SLA_POLICIES);
const STATUSES = ['Approved', 'Rejected', 'Implemented', 'Failed'];

const { TECHNICIAN, ADMIN } = ROLES;
const isStaff = (user) => [TECHNICIAN, ADMIN].includes(user.role);

// Geçerli durum geçişleri ve her geçişi yapabilecek roller
const TRANSITIONS = {
  Pending: { Approved: [ADMIN], Rejected: [ADMIN] },
  Approved: { Implemented: [TECHNICIAN, ADMIN], Failed: [TECHNICIAN, ADMIN] }
};

// MySQL DATETIME saniye hassasiyetinde; milisaniyeyi yukarı yuvarlayabildiği için saniyeye indirilir.
const nowSeconds = () => {
  const d = new Date();
  d.setMilliseconds(0);
  return d;
};

// Talep durumuna göre bağlı CHG biletinin durumu
const ticketFieldsFor = (status, ticket, user, now) => {
  const f = { updated_at: now };
  if (status === 'Approved') {
    f.status = 'In Progress';
    if (!ticket.first_response_at) f.first_response_at = now;
  }
  if (status === 'Implemented') {
    f.status = 'Resolved';
    if (!ticket.resolved_at) f.resolved_at = now;
  }
  if (status === 'Rejected' || status === 'Failed') {
    f.status = 'Closed';
    f.closed_at = now;
    if (!ticket.resolved_at) f.resolved_at = now;
  }
  if (user.role === TECHNICIAN && !ticket.assigned_to && (status === 'Implemented' || status === 'Failed')) {
    f.assigned_to = user.id;
  }
  return f;
};

// POST /api/change-requests
exports.createChangeRequest = async (req, res, next) => {
  try {
    const b = req.body || {};
    const title = b.title || b.change_title;
    const { description, reason, impact_level, risk_level, planned_date } = b;
    const category = b.category || 'Other';
    const priority = b.priority || 'Medium';

    const errors = [];
    if (!title || String(title).trim().length < 3) errors.push('title en az 3 karakter olmalı');
    if (!description || !String(description).trim()) errors.push('description zorunlu');
    if (!reason || !String(reason).trim()) errors.push('reason (gerekçe) zorunlu');
    if (!LEVELS.includes(impact_level)) errors.push(`impact_level şunlardan biri olmalı: ${LEVELS.join(', ')}`);
    if (!LEVELS.includes(risk_level)) errors.push(`risk_level şunlardan biri olmalı: ${LEVELS.join(', ')}`);
    if (!CATEGORIES.includes(category)) errors.push(`category şunlardan biri olmalı: ${CATEGORIES.join(', ')}`);
    if (!PRIORITIES.includes(priority)) errors.push(`priority şunlardan biri olmalı: ${PRIORITIES.join(', ')}`);

    let plannedDate = null;
    if (planned_date !== undefined && planned_date !== null && planned_date !== '') {
      plannedDate = new Date(planned_date);
      if (Number.isNaN(plannedDate.getTime())) errors.push('planned_date geçerli bir tarih olmalı (örn. 2026-12-20)');
    }
    if (errors.length) throw new ApiError(400, 'Doğrulama hatası', errors);

    const createdAt = nowSeconds();
    const policy = await ticketModel.getSlaPolicy(priority);
    const responseDue = policy ? slaService.addBusinessMinutes(createdAt, policy.response_time_minutes) : null;

    let changeId;
    // CHG-xxxx bileti ve Change_Requests kaydı tek transaction'da oluşturulur
    const ticket = await ticketModel.createWithAudit({
      user_id: req.user.id,
      sla_policy_id: policy ? policy.sla_policy_id : null,
      title: String(title).trim(),
      description: String(description).trim(),
      category,
      priority,
      status: 'Open',
      request_type: 'Change Request',
      escalation_level: 1,
      created_at: createdAt,
      response_due_at: responseDue,
      resolution_due_at: slaService.calculateSlaDeadline(createdAt, priority)
    }, async (conn, created) => {
      const [result] = await changeRequestModel.create(conn, {
        ticket_id: created.ticket_id,
        requested_by: req.user.id,
        change_title: String(title).trim(),
        description: String(description).trim(),
        reason: String(reason).trim(),
        impact_level,
        risk_level,
        status: 'Pending',
        planned_date: plannedDate,
        created_at: createdAt
      });
      changeId = result.insertId;
      await audit.log(conn, {
        user_id: req.user.id, entity_type: 'Change_Request', entity_id: changeId, action: 'CHANGE_REQUEST_CREATED',
        new_value: { ticket_number: created.ticket_number, impact_level, risk_level }
      });
    });

    const changeRequest = await changeRequestModel.findByRef(changeId);
    res.status(201).json({ success: true, change_request: changeRequest, ticket_number: ticket.ticket_number });
  } catch (err) { next(err); }
};

// GET /api/change-requests  (Employee: sadece kendi talepleri, Technician/Administrator: tümü)
exports.listChangeRequests = async (req, res, next) => {
  try {
    const rows = await changeRequestModel.list(isStaff(req.user) ? null : req.user.id);
    res.json({ success: true, count: rows.length, change_requests: rows });
  } catch (err) { next(err); }
};

// GET /api/change-requests/:id  (CHG-0872 veya sayısal change_id)
exports.getChangeRequest = async (req, res, next) => {
  try {
    const cr = await changeRequestModel.findByRef(req.params.id);
    if (!cr) throw new ApiError(404, 'Değişiklik talebi bulunamadı');
    if (!isStaff(req.user) && cr.requested_by !== req.user.id) throw new ApiError(403, 'Bu talebe erişim yetkiniz yok');
    res.json({ success: true, change_request: cr });
  } catch (err) { next(err); }
};

// PATCH /api/change-requests/:id/status  (Technician / Administrator)
// Gövde: { "status": "Approved | Rejected | Implemented | Failed" }
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!STATUSES.includes(status)) throw new ApiError(400, `status şunlardan biri olmalı: ${STATUSES.join(', ')}`);

    const updated = await withTransaction(async (conn) => {
      const cr = await changeRequestModel.findByRef(req.params.id, conn, true); // satır kilidi
      if (!cr) throw new ApiError(404, 'Değişiklik talebi bulunamadı');

      const allowedRoles = (TRANSITIONS[cr.status] || {})[status];
      if (!allowedRoles) throw new ApiError(409, `${cr.status} durumundaki talep ${status} durumuna geçirilemez`);
      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, `Bu geçiş için yetkiniz yok (gerekli rol: ${allowedRoles.join(', ')})`);
      }

      const ticket = await ticketModel.findByRef(cr.ticket_id, conn, true);
      if (ticket.status === 'Closed') throw new ApiError(409, 'Bağlı bilet kapatılmış, talep güncellenemez');

      const now = nowSeconds();
      const crFields = { status };
      if (status === 'Approved') { crFields.reviewed_by = req.user.id; crFields.approved_by = req.user.id; }
      if (status === 'Rejected') crFields.reviewed_by = req.user.id;
      if (status === 'Implemented' || status === 'Failed') crFields.completed_at = now;
      await changeRequestModel.update(conn, cr.change_id, crFields);

      const ticketFields = ticketFieldsFor(status, ticket, req.user, now);
      await ticketModel.update(conn, ticket.ticket_id, ticketFields);

      // Her değişiklik Audit_Logs'a aynı transaction'da yazılır (FR-11)
      await audit.log(conn, {
        user_id: req.user.id, entity_type: 'Change_Request', entity_id: cr.change_id,
        action: 'CHANGE_REQUEST_STATUS_CHANGED', old_value: { status: cr.status }, new_value: { status }
      });
      await audit.log(conn, {
        user_id: req.user.id, entity_type: 'Ticket', entity_id: ticket.ticket_id,
        action: 'STATUS_CHANGED', old_value: { status: ticket.status }, new_value: { status: ticketFields.status }
      });
      return changeRequestModel.findByRef(cr.change_id, conn);
    });

    res.json({ success: true, change_request: updated });
  } catch (err) { next(err); }
};