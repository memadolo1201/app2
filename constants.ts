
import type { Product, Customer, Settings } from './types';

export const exampleProducts: Omit<Product, 'id'>[] = [
    { ref: 'CP-HYD-50', nom: 'Crème Hydratante Intense', description: 'Pot 50ml, peaux sèches', prixAchat: 85.00, prixVente: 199.90, stock: 150 },
    { ref: 'SV-VITC-30', nom: 'Sérum Vitamine C Éclat', description: 'Flacon 30ml, anti-âge', prixAchat: 150.20, prixVente: 349.90, stock: 80 },
    { ref: 'PS-SPF50-100', nom: 'Protection Solaire SPF 50+', description: 'Tube 100ml, visage et corps', prixAchat: 70.10, prixVente: 165.00, stock: 200 },
    { ref: 'CA-VITA-60', nom: 'Compléments Alimentaires Vitalité', description: 'Boîte de 60 gélules', prixAchat: 68.00, prixVente: 149.00, stock: 120 },
    { ref: 'SH-DOUX-250', nom: 'Shampooing Doux Quotidien', description: 'Flacon 250ml, usage fréquent', prixAchat: 32.00, prixVente: 79.00, stock: 180 },
    { ref: 'GN-VIS-200', nom: 'Gel Nettoyant Visage Purifiant', description: 'Tube 200ml, peaux mixtes', prixAchat: 55.00, prixVente: 129.00, stock: 100 },
    { ref: 'BB-LINI-500', nom: 'Liniment Oléo-calcaire Bébé', description: 'Flacon pompe 500ml', prixAchat: 45.00, prixVente: 89.90, stock: 90 },
    { ref: 'BB-EAU-1L', nom: 'Eau Nettoyante Bébé Sans Rinçage', description: 'Flacon 1L', prixAchat: 60.00, prixVente: 119.00, stock: 75 },
    { ref: 'BB-CHG-72', nom: 'Lingettes Bébé Hypoallergéniques', description: 'Paquet de 72 lingettes', prixAchat: 15.00, prixVente: 29.90, stock: 300 },
    { ref: 'CP-CORPS-400', nom: 'Lait Corps Hydratant Quotidien', description: 'Flacon pompe 400ml', prixAchat: 75.00, prixVente: 159.00, stock: 110 },
    { ref: 'CP-MAIN-50', nom: 'Crème Mains Réparatrice', description: 'Tube 50ml, mains abîmées', prixAchat: 28.00, prixVente: 59.00, stock: 160 },
    { ref: 'H-DENT-SENSI-75', nom: 'Dentifrice Dents Sensibles', description: 'Tube 75ml', prixAchat: 22.00, prixVente: 45.00, stock: 250 },
    { ref: 'H-BAD-500', nom: 'Bain de Bouche Fraîcheur Intense', description: 'Flacon 500ml', prixAchat: 38.00, prixVente: 75.00, stock: 130 },
    { ref: 'H-BROSSE-MED', nom: 'Brosse à Dents Medium', description: 'Unité', prixAchat: 12.00, prixVente: 24.90, stock: 400 },
    { ref: 'CA-MAGN-30', nom: 'Magnésium Marin Vitamine B6', description: 'Boîte de 30 ampoules', prixAchat: 90.00, prixVente: 179.00, stock: 60 },
    { ref: 'CA-SOMMEIL-45', nom: 'Complément Sommeil Mélatonine', description: 'Boîte de 45 gélules', prixAchat: 72.00, prixVente: 139.00, stock: 85 },
    { ref: 'CA-OMEGA3-100', nom: 'Oméga 3 Huile de Poisson', description: 'Boîte de 100 capsules', prixAchat: 110.00, prixVente: 229.00, stock: 70 },
    { ref: 'SH-ANTICHUTE-200', nom: 'Shampooing Traitant Anti-Chute', description: 'Flacon 200ml', prixAchat: 80.00, prixVente: 169.00, stock: 95 },
    { ref: 'S-HUILE-PRO-100', nom: 'Huile Prodigieuse Sèche', description: 'Flacon 100ml, multi-usages', prixAchat: 130.00, prixVente: 279.00, stock: 50 },
    { ref: 'S-EAU-THERM-300', nom: 'Eau Thermale Apaisante', description: 'Spray 300ml', prixAchat: 40.00, prixVente: 85.00, stock: 220 },
    { ref: 'S-ANTI-AGE-30', nom: 'Soin Anti-Âge Global Jour', description: 'Pot 50ml', prixAchat: 210.00, prixVente: 449.00, stock: 45 },
    { ref: 'S-CONTOUR-YEUX-15', nom: 'Contour des Yeux Anti-Cernes', description: 'Tube 15ml', prixAchat: 95.00, prixVente: 219.00, stock: 75 },
    { ref: 'PS-ENFANT-SPF50-200', nom: 'Spray Solaire Enfant SPF 50+', description: 'Spray 200ml', prixAchat: 90.00, prixVente: 199.00, stock: 140 },
    { ref: 'PS-APRES-SOL-200', nom: 'Lait Après-Soleil Réparateur', description: 'Tube 200ml', prixAchat: 55.00, prixVente: 119.00, stock: 110 },
    { ref: 'HYG-INTIME-250', nom: 'Gel Hygiène Intime Doux', description: 'Flacon 250ml', prixAchat: 42.00, prixVente: 89.00, stock: 130 },
    { ref: 'HYG-DEO-ROLL-50', nom: 'Déodorant Roll-On 48h', description: 'Roll-on 50ml, sans alcool', prixAchat: 30.00, prixVente: 65.00, stock: 190 },
    { ref: 'HYG-SAVON-SURGRAS-200', nom: 'Pain Savon Surgras Solide', description: 'Pain 200g', prixAchat: 18.00, prixVente: 39.00, stock: 280 },
    { ref: 'BB-SERUM-PHY-30', nom: 'Sérum Physiologique Unidoses', description: 'Boîte de 30 unidoses 5ml', prixAchat: 25.00, prixVente: 49.00, stock: 350 },
    { ref: 'BB-MOUCHE', nom: 'Mouche Bébé Manuel', description: 'Unité + 2 embouts', prixAchat: 45.00, prixVente: 89.00, stock: 80 },
    { ref: 'MINC-CREME-200', nom: 'Crème Minceur Anti-Cellulite', description: 'Tube 200ml', prixAchat: 140.00, prixVente: 299.00, stock: 65 },
    { ref: 'MINC-DRAINEUR-500', nom: 'Draineur Minceur Goût Pêche', description: 'Flacon 500ml', prixAchat: 95.00, prixVente: 189.00, stock: 70 },
    { ref: 'AROMA-HE-LAVANDE-10', nom: 'Huile Essentielle Lavande Vraie', description: 'Flacon 10ml', prixAchat: 35.00, prixVente: 75.00, stock: 120 },
    { ref: 'AROMA-HE-MENTHE-10', nom: 'Huile Essentielle Menthe Poivrée', description: 'Flacon 10ml', prixAchat: 40.00, prixVente: 89.00, stock: 115 },
    { ref: 'AROMA-DIFFUSEUR', nom: 'Diffuseur Ultrasonique HE', description: 'Modèle Prise USB', prixAchat: 120.00, prixVente: 249.00, stock: 40 },
];

export const exampleCustomer: Omit<Customer, 'id'> = {
    nom: 'Client de Passage',
    email: 'comptoir@parapharmacie.dev',
    telephone: 'N/A',
    adresse: 'Comptoir'
};

export const defaultSettings: Settings = {
    companyInfo: {
        nom: "ParaPharma Pro",
        adresse: "123 Rue de la Santé, Casablanca",
        email: "contact@parapharma.ma",
        telephone: "05 22 33 44 55",
        legal: "SARL au capital de 100 000 MAD - RC 123456 - IF 87654321",
        logoUrl: ""
    },
    tvaRate: 0.20
};
