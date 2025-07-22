import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles } from "lucide-react"

export function MarketingHero() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-24 md:py-32 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Wildberries Assistant
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Your Smart Agent for
            <span className="text-primary"> Wildberries Success</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Boost your Wildberries marketplace performance with an AI agent that handles analytics, 
            optimization, competitor research, and strategic decisions - all in natural conversation.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?tab=signup">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Growing Your Business
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/auth?tab=signin">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 