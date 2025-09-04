'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { captureUserDetails } from '@/utils/auth';
import { createBrowserClient } from '@supabase/ssr';

const UserContext = createContext(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier d'abord le localStorage pour un accès rapide
      const cachedUserData = localStorage.getItem('userData');
      if (cachedUserData) {
        try {
          const parsed = JSON.parse(cachedUserData);
          console.log('Utilisation des données utilisateur en cache pour un affichage rapide');
          
          // Afficher immédiatement les données en cache
          setUserData(parsed);
          setError(null);
          setIsLoading(false);
          
          // Puis vérifier en arrière-plan
          setTimeout(async () => {
            try {
              const userDetails = await captureUserDetails();
              if (userDetails) {
                const formatted = {
                  user: {
                    id: userDetails.id,
                    email: userDetails.email,
                    nom: userDetails.nom,
                  },
                  role: userDetails.role,
                };
                setUserData(formatted);
              }
            } catch (e) {
              console.warn('Erreur lors de la vérification en arrière-plan:', e);
            }
          }, 100);
          
          return;
        } catch (e) {
          console.warn('Erreur lors du parsing des données en cache:', e);
        }
      }
      
      // Timeout pour éviter que le chargement prenne trop de temps
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const userDetailsPromise = captureUserDetails();
      
      const userDetails = await Promise.race([userDetailsPromise, timeoutPromise]);
      
      if (userDetails) {
        const formatted = {
          user: {
            id: userDetails.id,
            email: userDetails.email,
            nom: userDetails.nom,
          },
          role: userDetails.role,
        };
        
        setUserData(formatted);
        setError(null);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      setError(err.message);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Chargement initial
    fetchUser();

    // Créer le client Supabase pour écouter les changements d'authentification
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Recharger les données utilisateur après connexion
          await fetchUser();
        } else if (event === 'SIGNED_OUT') {
          // Vider les données utilisateur après déconnexion
          setUserData(null);
          setIsLoading(false);
        }
      }
    );

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refetch = async () => {
    try {
      setIsLoading(true);
      const userDetails = await captureUserDetails();
      
      if (userDetails) {
        const formatted = {
          user: {
            id: userDetails.id,
            email: userDetails.email,
            nom: userDetails.nom,
          },
          role: userDetails.role,
        };
        
        setUserData(formatted);
        setError(null);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error('Erreur lors du refetch:', err);
      setError(err.message);
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user: userData?.user || null,
    role: userData?.role || null,
    isLoading,
    error,
    refetch,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
