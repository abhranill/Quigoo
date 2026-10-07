import { NextResponse } from "next/server";
import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid menu item." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Please choose a restaurant and complete the item details." }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const restaurantId = typeof values.restaurantId === "string" ? values.restaurantId : "";
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const description = typeof values.description === "string" ? values.description.trim() : "";
  const category = typeof values.category === "string" && values.category.trim() ? values.category.trim() : "Popular";
  const imageUrl = typeof values.imageUrl === "string" ? values.imageUrl.trim() : "";
  const price = Number(values.price);

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(restaurantId) ||
    name.length < 2 ||
    name.length > 80 ||
    description.length < 5 ||
    description.length > 240 ||
    category.length > 40 ||
    !Number.isInteger(price) ||
    price < 1 ||
    price > 20000 ||
    (imageUrl !== "" && !imageUrl.startsWith("https://") && !imageUrl.startsWith("/images/")) ||
    typeof values.isVeg !== "boolean"
  ) {
    return NextResponse.json({ error: "Please check the name, description, price, and dietary choice." }, { status: 400 });
  }

  try {
    const [restaurant] = await db
      .select({ imageUrl: restaurants.imageUrl })
      .from(restaurants)
      .where(eq(restaurants.id, restaurantId))
      .limit(1);
    if (!restaurant) {
      return NextResponse.json({ error: "That restaurant could not be found." }, { status: 404 });
    }

    const [menuItem] = await db
      .insert(menuItems)
      .values({
        restaurantId,
        name,
        description,
        category,
        price,
        imageUrl: imageUrl || restaurant.imageUrl,
        isVeg: values.isVeg,
        isPopular: false,
      })
      .returning();

    return NextResponse.json({ menuItem }, { status: 201 });
  } catch (error) {
    console.error("Could not create menu item", error);
    return NextResponse.json({ error: "We couldn't add that menu item. Please try again." }, { status: 500 });
  }
}
