import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";
import { getRestaurantCatalog } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

type RecordBody = Record<string, unknown>;

function isRecord(value: unknown): value is RecordBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function textField(body: RecordBody, field: string, maxLength: number, minLength = 1) {
  const value = body[field];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength ? trimmed : null;
}

function imageField(body: RecordBody, field: string, fallback: string) {
  const value = body[field];
  if (typeof value !== "string" || value.trim() === "") return fallback;
  const url = value.trim();
  return url.startsWith("https://") || url.startsWith("/images/") ? url : null;
}

export async function GET() {
  try {
    const restaurants = await getRestaurantCatalog();
    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error("Could not load restaurant catalog", error);
    return NextResponse.json({ error: "We couldn't load restaurants right now." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid restaurant form." }, { status: 400 });
  }

  if (!isRecord(body) || !isRecord(body.firstItem)) {
    return NextResponse.json({ error: "Restaurant details and a first menu item are required." }, { status: 400 });
  }

  const name = textField(body, "name", 80);
  const description = textField(body, "description", 320, 8);
  const cuisine = textField(body, "cuisine", 100);
  const category = textField(body, "category", 40);
  const area = textField(body, "area", 80);
  const imageUrl = imageField(body, "imageUrl", "/images/quigoo-hero.jpg");
  const deliveryTime = textField(body, "deliveryTime", 40) ?? "25–35 min";
  const deliveryFee = Number(body.deliveryFee ?? 0);
  const firstItem = body.firstItem;
  const itemName = textField(firstItem, "name", 80);
  const itemDescription = textField(firstItem, "description", 240, 5);
  const itemCategory = textField(firstItem, "category", 40) ?? "Popular";
  const itemImageUrl = imageField(firstItem, "imageUrl", imageUrl ?? "/images/quigoo-hero.jpg");
  const itemPrice = Number(firstItem.price);
  const isVeg = typeof firstItem.isVeg === "boolean" ? firstItem.isVeg : null;

  if (
    !name ||
    !description ||
    !cuisine ||
    !category ||
    !area ||
    !imageUrl ||
    !itemName ||
    !itemDescription ||
    !itemImageUrl ||
    isVeg === null ||
    !Number.isInteger(deliveryFee) ||
    deliveryFee < 0 ||
    deliveryFee > 500 ||
    !Number.isInteger(itemPrice) ||
    itemPrice < 1 ||
    itemPrice > 20000
  ) {
    return NextResponse.json({ error: "Please check the restaurant and first-item details." }, { status: 400 });
  }

  try {
    const created = await db.transaction(async (transaction) => {
      const [restaurant] = await transaction
        .insert(restaurants)
        .values({
          name,
          description,
          cuisine,
          category,
          area,
          imageUrl,
          deliveryTime,
          deliveryFee,
          rating: 4.7,
        })
        .returning();
      const [menuItem] = await transaction
        .insert(menuItems)
        .values({
          restaurantId: restaurant.id,
          name: itemName,
          description: itemDescription,
          price: itemPrice,
          category: itemCategory,
          imageUrl: itemImageUrl,
          isVeg,
          isPopular: true,
        })
        .returning();
      return { restaurant, menuItem };
    });

    return NextResponse.json({ restaurant: { ...created.restaurant, menuItems: [created.menuItem] } }, { status: 201 });
  } catch (error) {
    console.error("Could not create restaurant", error);
    return NextResponse.json({ error: "We couldn't add that restaurant. Please try again." }, { status: 500 });
  }
}
