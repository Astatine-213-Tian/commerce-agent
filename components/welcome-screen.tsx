import { Card } from "./ui/card";
import { Headphones, ShoppingBag, Laptop } from "lucide-react";

export function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center space-y-8">
        <div className="text-7xl">🛍️</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Commerce Assistant</h1>
          <p className="text-lg text-muted-foreground">
            Voice Shopping Assistant
          </p>
          <p className="text-sm text-muted-foreground">
            Start a conversation to find products
          </p>
        </div>
        <Card className="px-12 py-6 space-y-2 text-left">
          <p className="text-sm font-medium text-center">Try asking:</p>
          <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Headphones className="size-5 shrink-0" />
            <p className="text-sm">&quot;Show me wireless headphones&quot;</p>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="size-5 shrink-0" />
            <p className="text-sm">&quot;Find red sneakers under $50&quot;</p>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
            <Laptop className="size-5 shrink-0" />
            <p className="text-sm">&quot;I need a laptop for gaming&quot;</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
