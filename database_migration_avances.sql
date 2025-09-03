-- Migration pour ajouter la gestion des avances sur salaire
-- À exécuter dans votre base de données Supabase

-- Créer la table des avances sur salaire
CREATE TABLE IF NOT EXISTS avances_salaires (
    id SERIAL PRIMARY KEY,
    employe_id INTEGER NOT NULL REFERENCES employes(id) ON DELETE CASCADE,
    montant DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    date_avance DATE NOT NULL,
    description TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'En attente' CHECK (statut IN ('En attente', 'Approuvée', 'Refusée', 'Payée')),
    date_creation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_avances_salaires_employe_id ON avances_salaires(employe_id);
CREATE INDEX IF NOT EXISTS idx_avances_salaires_statut ON avances_salaires(statut);
CREATE INDEX IF NOT EXISTS idx_avances_salaires_date ON avances_salaires(date_avance);

-- Créer une fonction pour mettre à jour automatiquement la date de modification
CREATE OR REPLACE FUNCTION update_date_modification()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour mettre à jour automatiquement la date de modification
CREATE TRIGGER trigger_update_date_modification
    BEFORE UPDATE ON avances_salaires
    FOR EACH ROW
    EXECUTE FUNCTION update_date_modification();

-- Insérer quelques exemples de données (optionnel)
-- INSERT INTO avances_salaires (employe_id, montant, date_avance, description, statut) VALUES
-- (1, 50.00, '2024-01-15', 'Avance pour frais médicaux', 'Approuvée'),
-- (2, 100.00, '2024-01-20', 'Avance pour loyer', 'En attente');

-- Vérifier que la table a été créée
SELECT 'Table avances_salaires créée avec succès' as message;
