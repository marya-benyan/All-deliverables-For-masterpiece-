const { Payment, Order } = require('../models');
const paypal = require('@paypal/checkout-server-sdk');

// PayPal environment setup
const environment = process.env.PAYPAL_MODE === 'live'
  ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
  : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;

    // Validate request body
    if (!orderId || !paymentMethod || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid request: orderId, paymentMethod, and amount are required' });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Verify the amount matches the order total
    if (order.totalAmount !== amount) {
      return res.status(400).json({ error: 'Amount does not match order total' });
    }

    let transactionId;
    let status = 'pending';

    if (paymentMethod === 'paypal') {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: `Payment for Order #${orderId}`,
          },
        ],
        application_context: {
          return_url: 'http://localhost:5000/api/payments/success',
          cancel_url: 'http://localhost:5000/api/payments/cancel',
        },
      });

      const paypalOrder = await client.execute(request);
      transactionId = paypalOrder.result.id;

      const payment = new Payment({
        user: req.user._id,
        order: orderId,
        paymentMethod,
        amount,
        transactionId,
        status,
      });

      await payment.save();

      // Clear problematic cookies from response
      const problematicCookies = [
        'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI',
        'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI+LHCCzYAAAA==',
        '__stripe_mid',
        '__stripe_sid',
      ];
      problematicCookies.forEach(cookie => res.clearCookie(cookie, { path: '/', domain: req.hostname }));

      return res.status(201).json({
        orderId: paypalOrder.result.id,
        paymentId: payment._id,
        redirectUrl: paypalOrder.result.links.find(link => link.rel === 'approve')?.href || null,
      });
    } else if (paymentMethod === 'cash') {
      transactionId = `CASH-${Date.now()}`;
      status = 'pending';

      const payment = new Payment({
        user: req.user._id,
        order: orderId,
        paymentMethod,
        amount,
        transactionId,
        status,
      });

      await payment.save();

      // Update order status for cash payment
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'completed', status: 'processing' });

      return res.status(201).json({
        message: 'Cash payment processed successfully',
        paymentId: payment._id,
        orderId: orderId,
      });
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error) {
    console.error('Create payment error:', error);
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized: Invalid PayPal credentials' });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'Too many requests to PayPal API, please try again later' });
    }
    res.status(500).json({ error: 'Error creating payment', details: error.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});
    const capture = await client.execute(request);

    const payment = await Payment.findOne({ transactionId: token });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    payment.status = capture.result.status === 'COMPLETED' ? 'completed' : 'failed';
    await payment.save();

    const order = await Order.findById(payment.order);
    if (payment.status === 'completed') {
      order.paymentStatus = 'completed';
      order.status = 'processing';
      await order.save();
    } else {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();
    }

    // Clear problematic cookies
    const problematicCookies = [
      'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI',
      'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI+LHCCzYAAAA==',
      '__stripe_mid',
      '__stripe_sid',
    ];
    problematicCookies.forEach(cookie => res.clearCookie(cookie, { path: '/', domain: req.hostname }));

    res.redirect(`http://localhost:5173/order-confirmation?orderId=${payment.order}`);
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Error confirming payment' });
    res.redirect('http://localhost:5173/payment');
  }
};

exports.cancelPayment = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payment = await Payment.findOne({ transactionId: token });
    if (payment) {
      payment.status = 'failed';
      await payment.save();

      const order = await Order.findById(payment.order);
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();
    }

    // Clear problematic cookies
    const problematicCookies = [
      'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI',
      'sdZnT8w4fAh7Y9OoBKtQbmpHG6NHZI+LHCCzYAAAA==',
      '__stripe_mid',
      '__stripe_sid',
    ];
    problematicCookies.forEach(cookie => res.clearCookie(cookie, { path: '/', domain: req.hostname }));

    res.redirect('http://localhost:5173/payment');
  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ error: 'Error cancelling payment' });
    res.redirect('http://localhost:5173/payment');
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payment = await Payment.findOne({ order: orderId }).populate('order');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Error fetching payment status' });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('user order');
    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ error: 'Error fetching payments' });
  }
};