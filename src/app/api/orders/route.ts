import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, orders, restaurants } from "@/db/schema";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid checkout form." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Please complete your delivery details." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const restaurantId = typeof values.restaurantId === "string" ? values.restaurantId : "";
  const customerName = typeof values.customerName === "string" ? values.customerName.trim() : "";
  const phone = typeof values.phone === "string" ? values.phone.trim() : "";
  const deliveryAddress = typeof values.deliveryAddress === "string" ? values.deliveryAddress.trim() : "";
  const paymentMethod = values.paymentMethod === "UPI on delivery" ? "UPI on delivery" : "Cash on delivery";
  const requestedItems = Array.isArray(values.items) ? values.items : [];

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(restaurantId) ||
    customerName.length < 2 ||
    customerName.length > 80 ||
    phone.replace(/\D/g, "").length < 10 ||
    phone.length > 25 ||
    deliveryAddress.length < 10 ||
    deliveryAddress.length > 300 ||
    requestedItems.length < 1 ||
    requestedItems.length > 40
  ) {
    return NextResponse.json({ error: "Please add a valid name, 10-digit phone number, address, and at least one item." }, { status: 400 });
  }

  const itemQuantities = new Map<string, number>();
  for (const entry of requestedItems) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return NextResponse.json({ error: "One of those menu items is invalid." }, { status: 400 });
    }
    const item = entry as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : "";
    const quantity = Number(item.quantity);
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20
    ) {
      return NextResponse.json({ error: "One of those menu item quantities is invalid." }, { status: 400 });
    }
    itemQuantities.set(id, (itemQuantities.get(id) ?? 0) + quantity);
  }

  try {
    const [restaurantRow, selectedItems] = await Promise.all([
      db.select().from(restaurants).where(eq(restaurants.id, restaurantId)).limit(1),
      db.select().from(menuItems).where(
        and(eq(menuItems.restaurantId, restaurantId), inArray(menuItems.id, [...itemQuantities.keys()])),
      ),
    ]);
    const restaurant = restaurantRow[0];
    if (!restaurant || selectedItems.length !== itemQuantities.size) {
      return NextResponse.json({ error: "Your basket changed. Please refresh and try again." }, { status: 400 });
    }

    const snapshot = selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: itemQuantities.get(item.id) ?? 1,
      price: item.price,
    }));
    const subtotal = snapshot.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : restaurant.deliveryFee;
    const total = subtotal + deliveryFee;
    const [order] = await db
      .insert(orders)
      .values({
        restaurantId,
        customerName,
        phone,
        deliveryAddress,
        paymentMethod,
        items: snapshot,
        subtotal,
        deliveryFee,
        total,
        status: "Placed",
      })
      .returning({ id: orders.id, total: orders.total, status: orders.status, createdAt: orders.createdAt });

    return NextResponse.json({ order, restaurantName: restaurant.name, deliveryTime: restaurant.deliveryTime }, { status: 201 });
  } catch (error) {
    console.error("Could not create order", error);
    return NextResponse.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
  }
}
