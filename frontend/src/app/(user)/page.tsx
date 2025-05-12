import BannerCrousal from "./_components/crousal/BannerCrousal";
import CategoryCrousal from "./_components/crousal/CategoryCrousal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight, Heart, ShoppingCart, Star } from "lucide-react";

export default function Home() {
  const featuredProducts = [
    {
      id: 1,
      name: "Premium Wireless Headphones",
      price: 199.99,
      rating: 4.5,
      image: "https://placehold.co/300x300",
      category: "Electronics"
    },
    {
      id: 2,
      name: "Slim Fit Denim Jacket",
      price: 89.99,
      rating: 4.8,
      image: "https://placehold.co/300x300",
      category: "Fashion"
    },
    {
      id: 3,
      name: "Smart Home Security Camera",
      price: 149.99,
      rating: 4.7,
      image: "https://placehold.co/300x300",
      category: "Electronics"
    },
    {
      id: 4,
      name: "Organic Green Tea Set",
      price: 34.99,
      rating: 4.6,
      image: "https://placehold.co/300x300",
      category: "Food & Beverages"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Carousel */}
      <div className="w-screen">
        <BannerCrousal />
        <div className="flex flex-col items-center justify-center">
        <CategoryCrousal /> 
        </div>
     </div>

      {/* Featured Products Section */}
      {/* <section className="max-w-[1600px] mx-auto w-full px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-semibold">Featured Products</h2>
            <p className="text-muted-foreground">Discover our top picks for you</p>
          </div>
          <Button variant="outline" className="gap-2">
            View All <ArrowRight size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group relative overflow-hidden">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} />
                  </Button>
                  <Button size="icon" variant="secondary" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShoppingCart size={16} />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                <h3 className="font-medium mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center text-yellow-400">
                    <Star size={16} fill="currentColor" />
                    <span className="ml-1 text-sm text-muted-foreground">{product.rating}</span>
                  </div>
                </div>
                <p className="font-semibold">${product.price}</p>
              </div>
            </Card>
          ))}
        </div>
      </section> */}

      {/* Deal of the Day Section */}
      {/* <section className="w-full bg-accent/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">Deal of the Day</Badge>
              <h2 className="text-3xl font-bold mb-4">Special Collection<br />Up to 60% Off</h2>
              <p className="text-muted-foreground mb-6">
                Discover our exclusive collection with amazing discounts. Limited time offer!
              </p>
              <Button size="lg" className="gap-2">
                Shop Now <ArrowRight size={16} />
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/3]">
                <img
                  src="https://placehold.co/600x450"
                  alt="Deal of the Day"
                  className="object-cover w-full h-full rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto w-full px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingCart className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Free Shipping</h3>
            <p className="text-muted-foreground">On orders over $50</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingCart className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Money Back</h3>
            <p className="text-muted-foreground">30 days guarantee</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ShoppingCart className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Secure Payment</h3>
            <p className="text-muted-foreground">100% protected</p>
          </div>
        </div>
      </section>
    </div>
  );
}
