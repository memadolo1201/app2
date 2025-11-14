
import React, { useState, useEffect } from 'react';
import { Percent } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import type { Settings, FirebaseContextType } from '../types';

interface SettingsComponentProps {
    settings: Settings;
    firebaseContext: FirebaseContextType;
    openModal: (title: string, content: React.ReactNode) => void;
}

const SettingsComponent: React.FC<SettingsComponentProps> = ({ settings, firebaseContext, openModal }) => {
    const { db, userId, appId } = firebaseContext;
    const [formData, setFormData] = useState<Settings>(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            companyInfo: { ...prev.companyInfo, [name]: value }
        }));
    };

    const handleTvaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rate = parseFloat(e.target.value);
        if (!isNaN(rate)) {
            setFormData(prev => ({ ...prev, tvaRate: rate / 100 }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (!userId) throw new Error("User not authenticated");
            const settingsRef = doc(db, 'artifacts', appId, 'users', userId, 'config', 'settings');
            await setDoc(settingsRef, formData);
            openModal('Succès', <p>Paramètres enregistrés avec succès.</p>);
        } catch (error) {
            console.error("Erreur d'enregistrement des paramètres:", error);
            openModal('Erreur', <p>Impossible d'enregistrer les paramètres.</p>);
        }
        setIsSaving(false);
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Paramètres</h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto space-y-6">
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold text-gray-700 px-2">Informations sur l'entreprise</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div> <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label> <input type="text" name="nom" value={formData.companyInfo.nom} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                        <div> <label className="block text-sm font-medium text-gray-700 mb-1">Email</label> <input type="email" name="email" value={formData.companyInfo.email} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                        <div> <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label> <input type="tel" name="telephone" value={formData.companyInfo.telephone} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                        <div> <label className="block text-sm font-medium text-gray-700 mb-1">URL du Logo (Optionnel)</label> <input type="text" name="logoUrl" value={formData.companyInfo.logoUrl} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                        <div className="md:col-span-2"> <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label> <textarea name="adresse" value={formData.companyInfo.adresse} onChange={handleCompanyChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea> </div>
                        <div className="md:col-span-2"> <label className="block text-sm font-medium text-gray-700 mb-1">Infos Légales (RC, IF, etc.)</label> <input type="text" name="legal" value={formData.companyInfo.legal} onChange={handleCompanyChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                    </div>
                </fieldset>
                <fieldset className="border p-4 rounded-md">
                    <legend className="text-lg font-semibold text-gray-700 px-2">Finances</legend>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Taux de TVA (%)</label>
                        <div className="relative"> <input type="number" name="tvaRate" value={formData.tvaRate * 100} onChange={handleTvaChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" /> </div>
                    </div>
                </fieldset>
                <div className="flex justify-end pt-4"> <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors disabled:opacity-50"> {isSaving ? 'Enregistrement...' : 'Enregistrer'} </button> </div>
            </form>
        </div>
    );
};

export default SettingsComponent;
