const express = require('express');
const  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — permite cualquier origen
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Roscoe Club server running OK' });
});

app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'mxn', customerName, customerEmail } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Monto invalido' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      receipt_email: customerEmail || undefined,
      description: `Roscoe Club — ${customerName || 'Cliente'}`,
      metadata: { store: 'Roscoe Club', customer: customerName || '', email: customerEmail || '' },
    });

    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
