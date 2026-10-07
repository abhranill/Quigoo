import { QuigooApp, type QuigooRestaurant } from "@/app/quigoo-app";
import { getRestaurantCatalog } from "@/lib/restaurants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const restaurants = await getRestaurantCatalog();
  const initialRestaurants: QuigooRestaurant[] = restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    cuisine: restaurant.cuisine,
    category: restaurant.category,
    rating: restaurant.rating,
    deliveryTime: restaurant.deliveryTime,
    deliveryFee: restaurant.deliveryFee,
    imageUrl: restaurant.imageUrl,
    area: restaurant.area,
    isPromoted: restaurant.isPromoted,
    menuItems: restaurant.menuItems.map((item) => ({
      id: item.id,
      restaurantId: item.restaurantId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
      isPopular: item.isPopular,
    })),
  }));

  return <QuigooApp initialRestaurants={initialRestaurants} />;
}
