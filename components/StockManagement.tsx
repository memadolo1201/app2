
import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { doc, deleteDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { formatCurrency } from '../utils/formatters';
import type { Product, FirebaseContextType } from '../types';

interface StockManagementProps {
    products: Product[];
    firebaseContext: FirebaseContextType;
    openModal: (title: string | false, content?: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void;
    openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

interface ProductFormProps {
    initialData?: Product | null;
    onSave: (formData: Omit<Product, 'id'> | Product) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        initialData || {
            ref: '',
            nom: '',
            description: '',
            prixAchat: 0,
            prixVente: 0,
            stock: 0
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            prixAchat: parseFloat(String(formData.prixAchat).replace(',', '.')) || 0,
            prixVente: parseFloat(String(formData.prixVente).replace(',', '.')) || 0,
            stock: parseInt(String(formData.stock)) || 0
        };
        onSave(dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div> <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label> <input type="text" name="ref" value={formData.ref} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /> </div>
                <div> <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Produit</label> <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /> </div>
            </div>
            <div> <label className="block text-sm font-medium text-gray-700 mb-1">Description</label> <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea> </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div> <label className="block text-sm font-medium text-gray-700 mb-1">Prix d'Achat (MAD)</label> <input type="number" name="prixAchat" step="0.01" value={formData.prixAchat} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> </div>
                <div> <label className="block text-sm font-medium text-gray-700 mb-1">Prix de Vente (MAD)</label> <input type="number" name="prixVente" step="0.01" value={formData.prixVente} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /> </div>
                <div> <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actuel</label> <input type="number" name="stock" step="1" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /> </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4"> <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"> Annuler </button> <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"> Enregistrer </button> </div>
        </form>
    );
};


const StockManagement: React.FC<StockManagementProps> = ({ products, firebaseContext, openModal, openConfirmModal }) => {
    const { db, userId, appId } = firebaseContext;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = useMemo(() =>
        products.filter(p =>
            p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.ref.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.nom.localeCompare(b.nom)), [products, searchTerm]);

    const confirmDeleteProduct = (id: string, nom: string) => {
        openConfirmModal(
            'Supprimer le Produit',
            `Êtes-vous sûr de vouloir supprimer le produit "${nom}" ? Cette action est irréversible.`,
            async () => {
                try {
                    if (!userId) throw new Error("User not authenticated");
                    const productRef = doc(db, 'artifacts', appId, 'users', userId, 'products', id);
                    await deleteDoc(productRef);
                } catch (error) {
                    console.error("Erreur lors de la suppression du produit:", error);
                    openModal('Erreur', <p>Impossible de supprimer le produit.</p>);
                }
            }
        );
    };
    
    const handleSaveProduct = async (formData: Omit<Product, 'id'> | Product) => {
        if (!userId) return;
        const productData = { ...formData };
        try {
            if ('id' in productData && productData.id) {
                const productRef = doc(db, 'artifacts', appId, 'users', userId, 'products', productData.id);
                const { id, ...dataToSave } = productData;
                await setDoc(productRef, dataToSave, { merge: true });
            } else {
                const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'products');
                await addDoc(collectionRef, productData);
            }
            openModal(false);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du produit:", error);
        }
    };

    const showAddModal = () => openModal('Ajouter un nouveau produit', <ProductForm onSave={handleSaveProduct} onCancel={() => openModal(false)} />);
    const showEditModal = (product: Product) => openModal('Modifier le produit', <ProductForm initialData={product} onSave={handleSaveProduct} onCancel={() => openModal(false)} />);
    const calculateMargin = (prixVente: number, prixAchat: number) => prixVente > 0 ? (((prixVente - prixAchat) / prixVente) * 100).toFixed(1) : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6"> <h2 className="text-3xl font-semibold text-gray-800">Gestion de Stock</h2> <button onClick={showAddModal} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"> <Plus size={20} /> <span>Nouveau Produit</span> </button> </div>
            <div className="mb-4 relative"> <input type="text" placeholder="Rechercher un produit (par nom ou référence)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /> <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Réf.</th>
                                <th scope="col" className="px-6 py-3 font-medium">Nom</th>
                                <th scope="col" className="px-6 py-3 font-medium">Prix Vente</th>
                                <th scope="col" className="px-6 py-3 font-medium">Prix Achat</th>
                                <th scope="col" className="px-6 py-3 font-medium">Marge</th>
                                <th scope="col" className="px-6 py-3 font-medium">Stock</th>
                                <th scope="col" className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{product.ref}</td>
                                    <td className="px-6 py-4">{product.nom}</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">{formatCurrency(product.prixVente)}</td>
                                    <td className="px-6 py-4 text-red-600">{formatCurrency(product.prixAchat)}</td>
                                    <td className="px-6 py-4 text-blue-600 font-medium">{calculateMargin(product.prixVente, product.prixAchat)}%</td>
                                    <td className={`px-6 py-4 font-bold ${product.stock <= 0 ? 'text-red-500' : product.stock <= 10 ? 'text-yellow-500' : 'text-green-500'}`}>{product.stock}</td>
                                    <td className="px-6 py-4 flex space-x-2"> <button onClick={() => showEditModal(product)} className="text-blue-600 hover:text-blue-800 p-1" title="Modifier"> <Edit size={18} /> </button> <button onClick={() => confirmDeleteProduct(product.id, product.nom)} className="text-red-600 hover:text-red-800 p-1" title="Supprimer"> <Trash2 size={18} /> </button> </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProducts.length === 0 && (<p className="text-center text-gray-500 py-6">Aucun produit trouvé.</p>)}
            </div>
        </div>
    );
};

export default StockManagement;
