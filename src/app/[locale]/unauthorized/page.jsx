'use client';

import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();


  return (
    <div className="min-h-screen flex flex-col items-center justify-center  bg-gradient-to-br from-yellow-600  to-black/90">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès non autorisé</h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur.
        </p>
        
        <div className="space-y-4">


              <Button 
              onClick={() => router.push('/login')} 
              className="w-full flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
                Connexion
            </Button>
         
        </div>
      </div>
    </div>
  );
}
  