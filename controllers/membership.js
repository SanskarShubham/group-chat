const Order = require('../models/order');
const Razorpay = require('razorpay');
const { generateToken } = require('../util/jwtToken');

// Initialize Razorpay instance
const initializeRazorpay = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
  });
};

exports.postUpdateOrder = async (req, res, next) => {
  try {
    const [updatedOrder] = await Promise.all([
      Order.update({ paymentId: req.body.razorpay_payment_id, status: 'complete' }, { where: { orderId: req.body.razorpay_order_id, userId: req.user.id } }),
      req.user.update({ isPremium: true })
    ]);
    const token =  generateToken(req.user.id,req.user.name,1);
    res.status(200).json({status:true,data:token,isLogin:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating payment' });
  }
};

exports.postUpdateFailedOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.update({ status: 'failed' }, { where: { orderId: req.body.razorpay_order_id, userId: req.user.id } });
    res.json({ order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating payment' });
  }
};

exports.postCreateOrder = async (req, res, next) => {
  const { amount, currency } = req.body;
  const razorpay = initializeRazorpay();

  try {
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency
    });
    const createdOrder = await req.user.createOrder({
      orderId: order.id,
      paymentId: '',
      amount: order.amount / 100,
      currency: order.currency,
      status: 'pending',
    });
    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the order' });
  }
};