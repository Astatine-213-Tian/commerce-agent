import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/product-card";
import { Id } from "@/convex/_generated/dataModel";

interface Product {
  _id: Id<"products">;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: Id<"categories">;
  embeddingId: Id<"productEmbeddings">;
  createdAt: number;
}

interface CategoryWithProducts {
  _id: Id<"categories">;
  name: string;
  slug: string;
  description: string;
  products: Product[];
}

function CategorySection({ category }: { category: CategoryWithProducts }) {
  if (category.products.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{category.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {category.products.map((product) => (
          <ProductCard
            key={product._id}
            name={product.name}
            brand={product.brand}
            price={product.price}
            description={product.description}
            imageUrl={product.imageUrl}
          />
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage() {
  const categories = await fetchQuery(api.category.queries.listCategories);

  // Prefetch products for all categories
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await fetchQuery(api.product.queries.getProductsByCategory, {
        categoryId: category._id,
      });
      return {
        ...category,
        products,
      };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      {categoriesWithProducts.map((category) => (
        <CategorySection key={category._id} category={category} />
      ))}
    </div>
  );
}
