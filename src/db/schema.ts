import { relations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const db = drizzle(process.env.DATABASE_URL!);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

export const searchCriteria = pgTable("search_criteria", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  district: text("district"), // Riga district/region
  minRooms: integer("min_rooms"),
  maxRooms: integer("max_rooms"),
  minPrice: numeric("min_price"),
  maxPrice: numeric("max_price"),
  minArea: numeric("min_area"),
  maxArea: numeric("max_area"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  lastChecked: timestamp("last_checked"),
});

export const foundListings = pgTable("found_listings", {
  id: serial("id").primaryKey(),
  criteriaId: integer("criteria_id")
    .notNull()
    .references(() => searchCriteria.id, { onDelete: "cascade" }),
  ssUrl: text("ss_url").notNull().unique(), // Original SS.lv URL
  title: text("title").notNull(),
  price: numeric("price"),
  rooms: integer("rooms"),
  area: numeric("area"),
  district: text("district"),
  description: text("description"),
  foundAt: timestamp("found_at").defaultNow(),
  notified: boolean("notified").default(false),
});

export const searchCriteriaRelations = relations(
  searchCriteria,
  ({ one, many }) => ({
    user: one(users, {
      fields: [searchCriteria.userId],
      references: [users.id],
    }),
    listings: many(foundListings),
  })
);

export const foundListingsRelations = relations(foundListings, ({ one }) => ({
  criteria: one(searchCriteria, {
    fields: [foundListings.criteriaId],
    references: [searchCriteria.id],
  }),
}));

export const pushSubscriptions = pgTable("push_subscriptions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  subscription: text("subscription").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
);

export const usersRelations = relations(users, ({ one, many }) => ({
  pushSubscription: one(pushSubscriptions, {
    fields: [users.id],
    references: [pushSubscriptions.userId],
  }),
  searchCriteria: many(searchCriteria),
}));

export type SearchCriteria = typeof searchCriteria.$inferSelect;
export type NewSearchCriteria = typeof searchCriteria.$inferInsert;
export type FoundListing = typeof foundListings.$inferSelect;
export type NewFoundListing = typeof foundListings.$inferInsert;
