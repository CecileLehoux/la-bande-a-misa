/**
 * Crée une base SQLite locale (test.db) avec le schéma complet et des données
 * de test pour les tests E2E Playwright. N'a AUCUN lien avec la prod (Turso).
 *
 * Usage : npx tsx scripts/setup-test-db.ts
 */
import { createClient } from "@libsql/client"
import bcrypt from "bcryptjs"
import { rmSync } from "fs"
import path from "path"

const DB_PATH = path.join(process.cwd(), "test.db")

// Repart d'une base vierge à chaque exécution
try { rmSync(DB_PATH) } catch { /* n'existe pas encore */ }
try { rmSync(DB_PATH + "-journal") } catch { /* idem */ }

const db = createClient({ url: `file:${DB_PATH}` })

const TABLES = [
  `CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    emailVerified DATETIME,
    password TEXT,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'CUSTOMER',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, providerAccountId)
  )`,
  `CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    sessionToken TEXT NOT NULL UNIQUE,
    userId TEXT NOT NULL,
    expires DATETIME NOT NULL
  )`,
  `CREATE TABLE verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires DATETIME NOT NULL,
    UNIQUE(identifier, token)
  )`,
  `CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    parentId TEXT,
    isActive BOOLEAN NOT NULL DEFAULT true,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    comparePrice REAL,
    cost REAL,
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    lowStockAt INTEGER NOT NULL DEFAULT 5,
    weight REAL,
    sizes TEXT,
    sizePrices TEXT,
    partnerName TEXT,
    partnerUrl TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT true,
    isFeatured BOOLEAN NOT NULL DEFAULT false,
    categoryId TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE product_categories (
    productId TEXT NOT NULL,
    categoryId TEXT NOT NULL,
    PRIMARY KEY (productId, categoryId)
  )`,
  `CREATE TABLE product_images (
    id TEXT PRIMARY KEY,
    productId TEXT NOT NULL,
    url TEXT NOT NULL,
    alt TEXT,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE addresses (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    company TEXT,
    address1 TEXT NOT NULL,
    address2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postalCode TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'FR',
    phone TEXT,
    isDefault BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL UNIQUE,
    userId TEXT,
    email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
    paymentIntentId TEXT,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL DEFAULT 0,
    tax REAL NOT NULL DEFAULT 0,
    discount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    shippingAddressId TEXT,
    notes TEXT,
    trackingNumber TEXT,
    shippedAt DATETIME,
    deliveredAt DATETIME,
    cancelledAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT,
    name TEXT NOT NULL,
    image TEXT,
    size TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    total REAL NOT NULL,
    CONSTRAINT order_items_orderId_fkey FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT order_items_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    productId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT,
    isApproved BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL,
    UNIQUE(userId, productId)
  )`,
  `CREATE TABLE coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'PERCENTAGE',
    value REAL NOT NULL,
    minAmount REAL,
    maxUses INTEGER,
    usedCount INTEGER NOT NULL DEFAULT 0,
    isActive BOOLEAN NOT NULL DEFAULT true,
    expiresAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE settings (
    id TEXT PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL
  )`,
  `CREATE TABLE shop_reviews (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    orderId TEXT UNIQUE NOT NULL,
    orderNumber TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    rating INTEGER,
    comment TEXT,
    isApproved INTEGER NOT NULL DEFAULT 0,
    submittedAt DATETIME,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
]

async function main() {
  for (const sql of TABLES) {
    await db.execute(sql)
  }

  const now = new Date().toISOString()
  const adminHash = await bcrypt.hash("TestAdmin123!", 10)
  const customerHash = await bcrypt.hash("TestClient123!", 10)

  // Utilisateurs
  await db.execute({
    sql: `INSERT INTO users (id, name, email, password, role, createdAt, updatedAt) VALUES
          ('user-admin-test', 'Admin Test', 'admin-test@labandeamisa.fr', ?, 'ADMIN', ?, ?),
          ('user-client-test', 'Claire Martin', 'client-test@exemple.fr', ?, 'CUSTOMER', ?, ?)`,
    args: [adminHash, now, now, customerHash, now, now],
  })

  // Catégorie
  await db.execute({
    sql: `INSERT INTO categories (id, name, slug, isActive, sortOrder, createdAt, updatedAt)
          VALUES ('cat-test-cabas', 'Cabas', 'cabas', 1, 0, ?, ?)`,
    args: [now, now],
  })

  // Produit avec tailles + prix par taille (S = prix de base 35, M = 45)
  await db.execute({
    sql: `INSERT INTO products (id, name, slug, description, price, stock, sizes, sizePrices, isActive, sortOrder, createdAt, updatedAt)
          VALUES ('prod-test-cabas', 'Cabas Test', 'cabas-test', 'Un cabas cousu main pour les tests.', 35, 10, '["S","M"]', '{"M":45}', 1, 0, ?, ?)`,
    args: [now, now],
  })
  await db.execute({
    sql: `INSERT INTO product_categories (productId, categoryId) VALUES ('prod-test-cabas', 'cat-test-cabas')`,
    args: [],
  })
  await db.execute({
    sql: `INSERT INTO product_images (id, productId, url, alt, sortOrder, createdAt)
          VALUES ('img-test-cabas', 'prod-test-cabas', '/logo.png', 'Cabas Test', 0, ?)`,
    args: [now],
  })

  // Produit simple sans tailles
  await db.execute({
    sql: `INSERT INTO products (id, name, slug, description, price, stock, isActive, sortOrder, createdAt, updatedAt)
          VALUES ('prod-test-trousse', 'Trousse Test', 'trousse-test', 'Une trousse cousue main pour les tests.', 18, 5, 1, 1, ?, ?)`,
    args: [now, now],
  })

  console.log(`✓ Base de test créée : ${DB_PATH}`)
  console.log("  - Admin    : admin-test@labandeamisa.fr / TestAdmin123!")
  console.log("  - Client   : client-test@exemple.fr / TestClient123!")
  console.log("  - Produits : Cabas Test (35€, taille M à 45€), Trousse Test (18€)")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
