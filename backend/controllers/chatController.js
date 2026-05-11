const Chat    = require('../models/Chat');
const User    = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/email');

// GET /api/chat  — list all conversations for current user
const getMyChats = async (req, res) => {
  try {
    const field = req.user.role === 'seller' ? 'seller' : 'buyer';
    const chats = await Chat.find({ [field]: req.user._id })
      .populate('buyer',  'name email')
      .populate('seller', 'name shopName email')
      .populate('product','name image')
      .sort({ lastMessageAt: -1 });
    res.json({ chats });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// GET /api/chat/:chatId  — full message history
const getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('buyer',  'name email')
      .populate('seller', 'name shopName email')
      .populate('product','name image')
      .populate('messages.sender', 'name');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Check access
    const uid = req.user._id.toString();
    if (chat.buyer._id.toString() !== uid && chat.seller._id.toString() !== uid)
      return res.status(403).json({ message: 'Access denied' });

    // Mark messages as read
    const isBuyer = chat.buyer._id.toString() === uid;
    if (isBuyer) { chat.buyerUnread = 0; }
    else         { chat.sellerUnread = 0; }
    chat.messages.forEach(m => { if (m.sender.toString() !== uid) m.isRead = true; });
    await chat.save();

    res.json({ chat });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// POST /api/chat/start  — start or get existing chat
const startChat = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    if (req.user.role !== 'buyer') return res.status(403).json({ message: 'Only buyers can start chats' });

    let chat = await Chat.findOne({ buyer: req.user._id, seller: sellerId, ...(productId ? { product: productId } : {}) });
    if (!chat) {
      chat = await Chat.create({ buyer: req.user._id, seller: sellerId, product: productId || null });
    }
    await chat.populate([
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name shopName email' },
      { path: 'product', select: 'name image' },
    ]);
    res.json({ chat });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// POST /api/chat/:chatId/message  — send message
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const chat = await Chat.findById(req.params.chatId)
      .populate('buyer',  'name email')
      .populate('seller', 'name shopName email');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const uid = req.user._id.toString();
    const isBuyer  = chat.buyer._id.toString()  === uid;
    const isSeller = chat.seller._id.toString() === uid;
    if (!isBuyer && !isSeller) return res.status(403).json({ message: 'Access denied' });

    chat.messages.push({ sender: req.user._id, content: content.trim() });
    chat.lastMessage   = content.trim().substring(0, 100);
    chat.lastMessageAt = new Date();

    // Increment unread counter for recipient
    if (isBuyer)  chat.sellerUnread += 1;
    else           chat.buyerUnread  += 1;

    await chat.save();

    // Email notification (throttled — only if other party has 0 prior unread)
    const recipientEmail = isBuyer ? chat.seller.email : chat.buyer.email;
    const recipientName  = isBuyer ? (chat.seller.shopName || chat.seller.name) : chat.buyer.name;
    const senderName     = isBuyer ? chat.buyer.name : (chat.seller.shopName || chat.seller.name);
    if ((isBuyer && chat.sellerUnread === 1) || (!isBuyer && chat.buyerUnread === 1)) {
      const tmpl = emailTemplates.newMessage(recipientName, senderName);
      sendEmail({ to: recipientEmail, ...tmpl });
    }

    const lastMsg = chat.messages[chat.messages.length - 1];
    res.json({ message: 'Message sent', msg: lastMsg });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

// GET /api/chat/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const field = req.user.role === 'seller' ? 'sellerUnread' : 'buyerUnread';
    const result = await Chat.aggregate([
      { $match: { [req.user.role === 'seller' ? 'seller' : 'buyer']: req.user._id } },
      { $group: { _id: null, total: { $sum: `$${field}` } } },
    ]);
    res.json({ count: result[0]?.total || 0 });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { getMyChats, getChat, startChat, sendMessage, getUnreadCount };
