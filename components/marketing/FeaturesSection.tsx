import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Search, Target, BarChart3, Zap, Brain } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Sales Analytics Agent",
      description: "Ask about your sales trends, revenue patterns, and performance metrics. Get insights like 'How did my products perform last month?' with detailed analysis."
    },
    {
      icon: Search,
      title: "Competitor Research",
      description: "Discover what your competitors are doing. Ask 'What are similar sellers pricing their products at?' and get comprehensive market intelligence."
    },
    {
      icon: Target,
      title: "SEO Optimization",
      description: "Improve your product visibility. Get keyword suggestions, title optimization, and content recommendations to rank higher in Wildberries search."
    },
    {
      icon: BarChart3,
      title: "Inventory Management",
      description: "Smart inventory decisions. Ask 'Should I restock this product?' and get data-driven recommendations based on sales velocity and trends."
    },
    {
      icon: Zap,
      title: "Price Optimization",
      description: "Dynamic pricing strategies. Get real-time pricing recommendations considering competition, demand, and your profit margins."
    },
    {
      icon: Brain,
      title: "Strategic Planning",
      description: "Business growth insights. Plan your next product launches, seasonal campaigns, and expansion strategies with AI-powered market analysis."
    }
  ]

  return (
    <section className="px-6 py-16 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Wildberries Success Partner
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Like having a team of marketplace experts, data analysts, and strategists - all in one intelligent agent
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 