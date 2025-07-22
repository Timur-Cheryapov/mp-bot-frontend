import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <h3 className="text-3xl md:text-4xl font-bold">
          Ready to Dominate Wildberries?
        </h3>
        <p className="text-lg text-muted-foreground">
          Join successful sellers who are already using AI to grow their Wildberries business faster than ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth?tab=signup">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              View Pricing
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          No credit card required • Free 7-day trial • Cancel anytime
        </p>
      </div>
    </section>
  )
} 