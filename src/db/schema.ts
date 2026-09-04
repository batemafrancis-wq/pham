import {
  boolean,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  phone: text("phone").notNull(),
  memberSince: text("member_since").notNull(),
  insurancePlan: text("insurance_plan").notNull(),
  memberId: text("member_id").notNull(),
  hsaBalanceCents: integer("hsa_balance_cents").notNull().default(0),
  fsaBalanceCents: integer("fsa_balance_cents").notNull().default(0),
  verified: boolean("verified").notNull().default(true),
  allergies: text("allergies").notNull().default(""),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  phone: text("phone").notNull(),
  hours: text("hours").notNull(),
  waitMinutes: integer("wait_minutes").notNull(),
  hasColdChain: boolean("has_cold_chain").notNull().default(true),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  image: text("image").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  priceCents: integer("price_cents").notNull(),
  hsaEligible: boolean("hsa_eligible").notNull().default(false),
  fsaEligible: boolean("fsa_eligible").notNull().default(false),
  requiresColdChain: boolean("requires_cold_chain").notNull().default(false),
  rxRequired: boolean("rx_required").notNull().default(false),
  stock: integer("stock").notNull().default(0),
  image: text("image").notNull(),
  shortDescription: text("short_description").notNull(),
  usage: text("usage").notNull(),
  dosage: text("dosage").notNull(),
  warnings: text("warnings").notNull(),
  activeIngredients: text("active_ingredients").notNull(),
  interactions: text("interactions").notNull(),
  clinicalNotes: text("clinical_notes").notNull(),
  clinicalTrials: text("clinical_trials").notNull(),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  symptomTags: text("symptom_tags").notNull(),
});

export const drugInteractions = pgTable("drug_interactions", {
  id: serial("id").primaryKey(),
  productAId: integer("product_a_id").notNull(),
  productBId: integer("product_b_id").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  billingBucket: text("billing_bucket").notNull().default("personal"),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id"),
  sessionId: text("session_id").notNull(),
  fileName: text("file_name").notNull(),
  imagePath: text("image_path"),
  ocrText: text("ocr_text"),
  status: text("status").notNull().default("processing"),
  medicationName: text("medication_name"),
  dosage: text("dosage"),
  prescriber: text("prescriber"),
  ndc: text("ndc"),
  refillsRemaining: integer("refills_remaining").default(0),
  nextRefillAt: text("next_refill_at"),
  copayCents: integer("copay_cents"),
  coinsurancePct: integer("coinsurance_pct"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refillSchedules = pgTable("refill_schedules", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  prescriptionId: integer("prescription_id").notNull(),
  frequency: text("frequency").notNull(),
  deliveryMethod: text("delivery_method").notNull(),
  active: boolean("active").notNull().default(true),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id"),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(),
  scheduledAt: text("scheduled_at"),
  status: text("status").notNull().default("open"),
  topic: text("topic").notNull(),
  pharmacistName: text("pharmacist_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").notNull(),
  sender: text("sender").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id"),
  sessionId: text("session_id").notNull(),
  status: text("status").notNull().default("review"),
  fulfillment: text("fulfillment").notNull(),
  storeId: integer("store_id"),
  subtotalCents: integer("subtotal_cents").notNull(),
  hsaCents: integer("hsa_cents").notNull().default(0),
  fsaCents: integer("fsa_cents").notNull().default(0),
  personalCents: integer("personal_cents").notNull().default(0),
  dobVerified: boolean("dob_verified").notNull().default(false),
  consultAcknowledged: boolean("consult_acknowledged").notNull().default(false),
  timeline: text("timeline").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
  billingBucket: text("billing_bucket").notNull(),
});

export const patientMedications = pgTable("patient_medications", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  productId: integer("product_id"),
  name: text("name").notNull(),
  nextDoseAt: text("next_dose_at").notNull(),
  reminderEnabled: boolean("reminder_enabled").notNull().default(true),
  remainingDoses: integer("remaining_doses").notNull(),
  refillDue: boolean("refill_due").notNull().default(false),
  instructions: text("instructions").notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  label: text("label").notNull(),
  category: text("category").notNull(),
  amountCents: integer("amount_cents").notNull(),
  hsaCents: integer("hsa_cents").notNull().default(0),
  fsaCents: integer("fsa_cents").notNull().default(0),
  occurredOn: text("occurred_on").notNull(),
});
