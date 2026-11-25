import DeliveryRule from '../models/DeliveryRule.js';

/**
 * Default delivery rules for the Maza Printwala store (Kurla, Mumbai).
 *
 * The shop ships all over India, so the storefront must never show
 * "delivery estimate not available" to every visitor just because nobody has
 * opened Admin -> Delivery Rules yet.
 *
 * `ensureDeliveryRules()` runs once at boot: if the collection is completely
 * empty it inserts these three rules and says so in the log. If even one rule
 * exists - including rules the owner created or edited - it does nothing, so
 * an admin who deliberately removes a rule is never overruled.
 */
export const DEFAULT_DELIVERY_RULES = [
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

export const ensureDeliveryRules = async () => {
  try {
    const existing = await DeliveryRule.countDocuments({});
    if (existing > 0) return { created: 0, existing };

    await DeliveryRule.insertMany(DEFAULT_DELIVERY_RULES);
    console.log(
      `[delivery] Seeded ${DEFAULT_DELIVERY_RULES.length} default delivery rules (standard pan-India, express metro, same-day Mumbai).`
    );
    return { created: DEFAULT_DELIVERY_RULES.length, existing: 0 };
  } catch (error) {
    // Never block boot on this: the API must still start, and the admin can
    // create the rules by hand from the panel.
    console.error('[delivery] Could not seed default delivery rules:', error.message);
    return { created: 0, existing: 0, error: error.message };
  }
};

export default ensureDeliveryRules;
