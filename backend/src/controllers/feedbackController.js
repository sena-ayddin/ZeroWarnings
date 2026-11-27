// POST /api/tickets/:id/feedback — ISO 9001:2015 Madde 9.1.2
const { withTransaction } = require('../config/db');
const ticketModel = require('../models/ticketModel');
const feedbackModel = require('../models/feedbackModel');
const audit = require('../models/auditModel');
const { ApiError } = require('../middlewares/errorHandler');

exports.createFeedback = async (req, res, next) => {
  try {
    const rating = Number(req.body && req.body.satisfaction_rating);
    const comments = req.body && req.body.comments;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new ApiError(400, 'satisfaction_rating 1 ile 5 arasında tam sayı olmalı');
    }
    if (comments !== undefined && comments !== null && typeof comments !== 'string') {
      throw new ApiError(400, 'comments metin olmalı');
    }
    if (typeof comments === 'string' && comments.length > 5000) {
      throw new ApiError(400, 'comments en fazla 5000 karakter olabilir');
    }

    const result = await withTransaction(async (conn) => {
      const ticket = await ticketModel.findByRef(req.params.id, conn, true);
      if (!ticket) throw new ApiError(404, 'Bilet bulunamadı');
      if (ticket.user_id !== req.user.id) {
        throw new ApiError(403, 'Yalnızca kendi açtığınız bilet için geri bildirim verebilirsiniz');
      }
      if (!['Resolved', 'Closed'].includes(ticket.status)) {
        throw new ApiError(409, 'Geri bildirim yalnızca çözülmüş veya kapatılmış biletler için verilebilir');
      }
      if (await feedbackModel.findByTicketId(ticket.ticket_id, conn)) {
        throw new ApiError(409, 'Bu bilet için daha önce geri bildirim gönderilmiş');
      }
      const feedback = await feedbackModel.create(conn, {
        ticket_id: ticket.ticket_id,
        user_id: req.user.id,
        satisfaction_rating: rating,
        comments: comments ? comments.trim() : null
      });
      await audit.log(conn, {
        user_id: req.user.id,
        entity_type: 'Customer_Feedback',
        entity_id: feedback.feedback_id,
        action: 'CUSTOMER_FEEDBACK_SUBMITTED',
        new_value: { ticket_id: ticket.ticket_id, satisfaction_rating: rating }
      });
      return feedback;
    });

    res.status(201).json({ success: true, feedback: result });
  } catch (err) { next(err); }
};

// GET /api/feedback — administrator CSAT results (ISO 9001:2015 9.1.2)
exports.listFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackModel.listResults();
    res.json({ success: true, count: feedback.length, feedback });
  } catch (err) { next(err); }
};
