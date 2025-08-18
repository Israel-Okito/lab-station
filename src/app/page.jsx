import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChefHat, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-500 rounded-lg p-2">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-foreground">LAB STATION</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* <Button variant="outline" className="hidden sm:inline-flex bg-transparent">
                Démo gratuite
              </Button> */}
              <Button className="bg-yellow-500 text-primary hover:bg-yellow-600">Se connecter</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-yellow-500 text-primary border-primary/20">🚀 Nouvelle version disponible</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Transformez la gestion de votre <span className="text-yellow-500">fast food</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              LAB STATION révolutionne la gestion de votre restaurant avec une plateforme tout-en-un pour optimiser vos
              commandes, stocks et équipes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8">
                Commencer gratuitement
              </Button> */}
              <Button size="lg" variant="outline" className="text-lg px-8 bg-yellow-500 text-primary border-primary/2">
                Connectez-vous 
                
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-end items-end mt-10">
              <p className="text-primary border-primary/20">
                 Coder par Israel okito et Grace Mwela 
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
