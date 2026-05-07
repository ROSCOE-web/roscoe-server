const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Roscoe Club server running OK' });
});

// ── Create Payment Intent ─────────────────────────────────────────────────────
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'mxn', customerName, customerEmail } = req.body;

    if (!amount || amount < 10) {
      return res.status(400).json({ error: 'Monto invalido' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      receipt_email: customerEmail || undefined,
      description: `Roscoe Club — Pedido de ${customerName || 'Cliente'}`,
      metadata: {
        store: 'Roscoe Club',
        customer: customerName || '',
        email: customerEmail || '',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Confirm payment status ────────────────────────────────────────────────────
app.get('/payment-status/:id', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.id);
    res.json({ status: paymentIntent.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Roscoe Club server corriendo en puerto ${PORT}`);
});
