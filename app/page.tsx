import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { SparklesIcon, ShieldCheckIcon, GlobeAltIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline"

export default function Home() {
  const features = [
    {
      title: "AI-Powered Smart Triage",
      description: "Our advanced AI automatically categorizes and prioritizes civic issues for faster resolution.",
      icon: SparklesIcon,
    },
    {
      title: "Blockchain Transparency",
      description: "Every complaint and resolution is immutably recorded on the blockchain for complete transparency.",
      icon: ShieldCheckIcon,
    },
    {
      title: "Citizen Empowerment via Web3",
      description: "Own your civic data and get rewarded for meaningful contributions through CARV integration.",
      icon: GlobeAltIcon,
    },
    {
      title: "Data-Driven Insights",
      description: "Generate actionable insights from civic data to improve city services and infrastructure.",
      icon: DocumentMagnifyingGlassIcon,
    },
  ]

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">AegisAI: Empowering Smart Civic Action</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform how citizens engage with their communities through AI-powered issue reporting, blockchain
          transparency, and Web3 data ownership.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="secondary" size="lg">
              Log In
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16">
        {features.map((feature, index) => (
          <Card key={index} className="text-center">
            <feature.icon className="w-12 h-12 text-violet-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-violet-50 rounded-lg p-8 text-center my-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h2>
        <p className="text-lg text-gray-600 mb-6">
          Join thousands of citizens already using AegisAI to improve their communities.
        </p>
        <Link href="/auth/signup">
          <Button variant="primary" size="lg">
            Start Reporting Issues
          </Button>
        </Link>
      </div>
    </MainLayout>
  )
}
