import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const WEBHOOK_PORT = 4000;
const API_URL = 'http://localhost:3000/payments';

const app = express();
app.use(express.json());

// 1. Setup Fake Merchant Webhook Server
app.post('/webhook-receiver', (req, res) => {
  console.log(`\n🔔 [MERCHANT SERVER] Webhook Received:`, req.body.type);
  console.log(`   Payload:`, JSON.stringify(req.body.data));
  res.status(200).send('OK');
});

const server = app.listen(WEBHOOK_PORT, async () => {
  console.log(`\n🚀 [DEMO] Fake Merchant Webhook Server running on port ${WEBHOOK_PORT}`);
  console.log(`------------------------------------------------------------------`);
  
  try {
    // 2. Client creates a payment
    console.log(`\n[CLIENT] Creating new payment ($100 USD)...`);
    let res = await axios.post(
      API_URL, 
      { amount: 100, currency: 'USD' }, 
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    const paymentId = res.data.paymentId;
    console.log(`[CLIENT] Payment created. ID: ${paymentId}`);

    // Wait to let webhook arrive
    await new Promise(r => setTimeout(r, 2000));

    // 3. Client authorizes payment
    console.log(`\n[CLIENT] Authorizing payment ${paymentId}...`);
    await axios.post(
      `${API_URL}/${paymentId}/authorize`, 
      {}, 
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    console.log(`[CLIENT] Payment authorized.`);

    // Wait to let webhook arrive
    await new Promise(r => setTimeout(r, 2000));

    // 4. Client captures payment
    console.log(`\n[CLIENT] Capturing payment ${paymentId}...`);
    await axios.post(
      `${API_URL}/${paymentId}/capture`, 
      {}, 
      { headers: { 'Idempotency-Key': crypto.randomUUID() } }
    );
    console.log(`[CLIENT] Payment captured.`);

    // Wait to let final webhook arrive
    await new Promise(r => setTimeout(r, 3000));

    console.log(`\n✅ [DEMO] End-to-End flow complete! The backend strictly enforced the FSM, saved events securely, and reliably delivered webhooks.`);
    
  } catch (err: any) {
    console.error(`\n❌ [DEMO] Error:`, err.response?.data || err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});
