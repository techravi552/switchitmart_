const SupportTicket = require('../models/SupportTicket');
const { createNotification } = require('./notificationController');
const { sendEmail, emailTemplates } = require('../utils/email');
const User = require('../models/User');

// POST /api/support   — create ticket
const createTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;
    if (!subject || !message) return res.status(400).json({ message: 'Subject and message required' });
    const ticket = await SupportTicket.create({
      user: req.user._id, userRole: req.user.role,
      subject, message, category, priority,
    });
    // Notify admins
    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(admins.map(a => createNotification({
      recipientId: a._id, senderId: req.user._id, type: 'admin_message',
      title: `🆘 New Support Ticket: ${subject}`,
      message: `${req.user.name} (${req.user.role}) opened a ticket.`,
      data: { extra: { ticketId: ticket._id } },
    })));
    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// GET /api/support/my  — user's own tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ tickets, total: tickets.length });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// GET /api/support/:id  — single ticket
const getTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('replies.sender','name role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const uid = req.user._id.toString();
    if (ticket.user.toString() !== uid && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    res.json({ ticket });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// POST /api/support/:id/reply  — add reply
const replyTicket = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Reply message required' });
    const ticket = await SupportTicket.findById(req.params.id).populate('user','name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const uid = req.user._id.toString();
    if (ticket.user._id.toString() !== uid && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    ticket.replies.push({ sender: req.user._id, senderRole: req.user.role, message: message.trim() });
    if (req.user.role === 'admin' && ticket.status === 'open') ticket.status = 'in_progress';
    await ticket.save();

    // Notify the other party
    if (req.user.role === 'admin') {
      await createNotification({ recipientId: ticket.user._id, type: 'admin_message', title: `💬 Reply on ticket: ${ticket.subject}`, message: 'Admin replied to your support ticket.' });
      const tmpl = emailTemplates.ticketReply(ticket.user.name, ticket.subject);
      sendEmail({ to: ticket.user.email, ...tmpl });
    }
    res.json({ message: 'Reply added', ticket });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// PUT /api/support/:id/status  — admin update status
const updateStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { status } = req.body;
    if (!['open','in_progress','resolved'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user','name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (status === 'resolved') {
      await createNotification({ recipientId: ticket.user._id, type: 'admin_message', title: '✅ Ticket Resolved', message: `Your ticket "${ticket.subject}" has been marked resolved.` });
    }
    res.json({ message: 'Status updated', ticket });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// GET /api/support  — admin: all tickets
const getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });
    const { status, page = 1, limit = 20 } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    const skip = (parseInt(page)-1)*parseInt(limit);
    const [tickets, total] = await Promise.all([
      SupportTicket.find(q).populate('user','name email role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      SupportTicket.countDocuments(q),
    ]);
    res.json({ tickets, total, pages: Math.ceil(total/parseInt(limit)) });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { createTicket, getMyTickets, getTicket, replyTicket, updateStatus, getAllTickets };
