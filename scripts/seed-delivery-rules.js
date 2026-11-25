/**
 * Creates / refreshes the three production delivery rules.
 *
 * Safe to run repeatedly: it upserts by rule name, never deletes anything.
 * Use this instead of seed.js, which is guarded and would also touch the
 * catalogue.
 *
 * Usage:
 *   MONGO_URI="<uri>" node scripts/seed-delivery-rules.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { default: DeliveryRule } = await import('../src/models/DeliveryRule.js');

const rules = [
  {
    name: 'Standard Pan-India Delivery (5-7 Business Days)',
    pinCodePrefixes: ['*'],
    deliveryMethod: 'STANDARD',
    charge: 99,
    freeDeliveryThreshold: 1500,
    estimatedDaysMin: 5,
    estimatedDaysMax: 7,
    isActive: true,
    isDemoData: false,
  },
  {
    name: 'Express Metro Delivery (2-3 Business Days)',
    pinCodePrefixes: ['400', '110', '560', '600', '700'],
    deliveryMethod: 'EXPRESS',
    charge: 199,
    freeDeliveryThreshold: 3000,
    estimatedDaysMin: 2,
    estimatedDaysMax: 3,
    isActive: true,
    isDemoData: false,
  },
  {
    name: 'Same-Day Priority Print Express (Mumbai Zone)',
    pinCodePrefixes: ['400'],
    deliveryMethod: 'SAME_DAY',
    charge: 299,
    freeDeliveryThreshold: 5000,
    estimatedDaysMin: 1,
    estimatedDaysMax: 1,
    isActive: true,
    isDemoData: false,
  },
];

async function run() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected: ${mongoose.connection.name}`);

  for (const rule of rules) {
    const result = await DeliveryRule.findOneAndUpdate(
      { name: rule.name },
      { $set: rule },
      { upsert: true, new: true, runValidators: true }
    );
    console.log(`  ${result.deliveryMethod.padEnd(9)} ${result.pinCodePrefixes.join(', ')} -> ${result.estimatedDaysMin}-${result.estimatedDaysMax} days, ₹${result.charge}`);
  }

  const total = await DeliveryRule.countDocuments({ isActive: true });
  console.log(`Active delivery rules now: ${total}`);
  console.log('Done. Test: curl "<api>/api/checkout/delivery-methods?pinCode=400001"');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
