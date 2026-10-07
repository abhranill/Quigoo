import { asc } from "drizzle-orm";
import { db } from "@/db";
import { menuItems, restaurants } from "@/db/schema";
import { menuItemSeeds, restaurantSeeds } from "@/lib/seed-data";

export async function getRestaurantCatalog() {
  const existing = await db.select({ id: restaurants.id }).from(restaurants).limit(1);

  if (existing.length === 0) {
    await db.insert(restaurants).values(restaurantSeeds).onConflictDoNothing();
    await db.insert(menuItems).values(menuItemSeeds).onConflictDoNothing();
  }

  const [restaurantRows, menuRows] = await Promise.all([
    db.select().from(restaurants).orderBy(asc(restaurants.name)),
    db.select().from(menuItems),
  ]);
  const menuByRestaurant = new Map<string, typeof menuRows>();

  for (const menuItem of menuRows) {
    const items = menuByRestaurant.get(menuItem.restaurantId) ?? [];
    items.push(menuItem);
    menuByRestaurant.set(menuItem.restaurantId, items);
  }

  return restaurantRows.map((restaurant) => ({
    ...restaurant,
    menuItems: menuByRestaurant.get(restaurant.id) ?? [],
  }));
}
