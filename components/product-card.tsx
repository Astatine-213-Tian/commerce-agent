import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export interface ProductCardProps {
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
}

export function ProductCard({
  name,
  brand,
  price,
  category,
  description,
  imageUrl,
}: ProductCardProps) {
  return (
    <Card className="w-full max-w-[280px] overflow-hidden">
      <div className="relative aspect-square w-full">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="280px"
        />
      </div>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{name}</h3>
            <p className="text-xs text-muted-foreground">{brand}</p>
          </div>
          <p className="font-semibold text-base">
            ${price.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
