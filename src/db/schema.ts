import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cuisine: text("cuisine").notNull(),
  category: text("category").notNull(),
  rating: real("rating").notNull().default(4.5),
  deliveryTime: text("delivery_time").notNull().default("25–35 min"),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  area: text("area").notNull().default("Indiranagar"),
  isPromoted: boolean("is_promoted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull().default("Popular"),
  imageUrl: text("image_url").notNull(),
  isVeg: boolean("is_veg").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
});

export type OrderItemSnapshot = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  paymentMethod: text("payment_method").notNull().default("Cash on delivery"),
  items: jsonb("items").$type<OrderItemSnapshot[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Placed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
