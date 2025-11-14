
import React, { useState, useMemo } from 'react';
import { Search, Trash2, RefreshCw, Printer } from 'lucide-react';
import { doc, deleteDoc, writeBatch, collection, Timestamp } from 'firebase/firestore';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Document, Settings, FirebaseContextType, Product } from '../types';
import PrintableDocument from './PrintableDocument';

interface DocumentListProps {
    documents: Document[];
    settings: Settings;
    firebaseContext: FirebaseContextType;
    openModal: (title: string | false, content?: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void;
    openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
    onDocumentCreated: () => void;
    products: Product[];
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, settings, firebaseContext, openModal, openConfirmModal, onDocumentCreated, products }) => {
    const { db, userId, appId } = firebaseContext;
    const [filter, setFilter] = useState<'all' | 'devis' | 'bon' | 'facture'>('all');

    const filteredDocuments = useMemo(() =>
        documents
        .filter(d => filter === 'all' || d.type === filter)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis()),
        [documents, filter]);

    const handlePrint = (docId: string) => {
        const printContentNode = document.getElementById(`printable-doc-${docId}`);
        if (!printContentNode) return;

        const printWindow = window.open('', '_blank', 'height=800,width=600');
        if (!printWindow) {
            openModal("Erreur d'impression", <p>La fenêtre d'impression a été bloquée. Veuillez autoriser les pop-ups.</p>, 'md');
            return;
        }

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map(el => el.outerHTML).join('');
        printWindow.document.write(`<html><head><title>Imprimer</title>${styles}<style>@media print { body { padding: 1cm !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } .no-print { display: none !important; } } body { font-family: 'Inter', sans-serif; }</style></head><body>${printContentNode.innerHTML}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };
        
    const showDocumentModal = (doc: Document) => {
        openModal(
            `${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} - ${doc.reference}`,
            <>
                <div className="max-h-[65vh] overflow-y-auto"><PrintableDocument document={doc} settings={settings} /></div>
                <div className="flex justify-end mt-4 pt-4 border-t no-print">
                    <button onClick={() => handlePrint(doc.id)} className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"> <Printer size={20} /> <span>Imprimer</span> </button>
                </div>
            </>,
            '2xl'
        );
    };

    const confirmDeleteDocument = (id: string, ref: string) => {
        openConfirmModal('Supprimer le Document', `Êtes-vous sûr de vouloir supprimer le document "${ref}" ?`,
            async () => {
                try {
                    if (!userId) throw new Error("User not authenticated");
                    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'documents', id);
                    await deleteDoc(docRef);
                } catch (error) {
                    console.error("Erreur:", error);
                    openModal('Erreur', <p>Impossible de supprimer le document.</p>);
                }
            }
        );
    };

    const convertToFacture = async (devis: Document) => {
        openConfirmModal('Convertir en Facture', `Convertir le devis ${devis.reference} en facture ? Le stock sera mis à jour.`,
            async () => {
                try {
                    if (!userId) throw new Error("User not authenticated");
                    const batch = writeBatch(db);
                    let stockIssues = devis.items.filter(item => {
                        const product = products.find(p => p.id === item.id);
                        return !product || product.stock < item.quantity;
                    }).map(item => `${item.nom} (demandé: ${item.quantity}, dispo: ${products.find(p => p.id === item.id)?.stock || 0})`);

                    if (stockIssues.length > 0) throw new Error(`Stock insuffisant pour: ${stockIssues.join(', ')}`);
                    
                    const newFacture = { ...devis, type: 'facture', reference: `FACTURE-${Date.now()}`, date: Timestamp.now(), status: 'Payée', devisRef: devis.reference };
                    delete (newFacture as any).id;
                    
                    batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'documents')), newFacture);
                    batch.update(doc(db, 'artifacts', appId, 'users', userId, 'documents', devis.id), { status: 'Converti' });

                    for (const item of devis.items) {
                        const productRef = doc(db, 'artifacts', appId, 'users', userId, 'products', item.id);
                        const product = products.find(p => p.id === item.id);
                        if(product) batch.update(productRef, { stock: product.stock - item.quantity });
                    }

                    await batch.commit();
                    onDocumentCreated();
                } catch (error: any) {
                    console.error("Erreur de conversion:", error);
                    openModal('Erreur de Stock', <p>{error.message}</p>);
                }
            }
        );
    };

    const docTypeClasses: Record<string, string> = { 'devis': 'bg-yellow-100 text-yellow-800', 'bon': 'bg-blue-100 text-blue-800', 'facture': 'bg-green-100 text-green-800' };
    const docStatusClasses: Record<string, string> = { 'Brouillon': 'bg-gray-100 text-gray-800', 'Converti': 'bg-purple-100 text-purple-800', 'Payée': 'bg-green-100 text-green-800', 'Annulée': 'bg-red-100 text-red-800' };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-800">Documents</h2>
                <div className="flex space-x-2">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-md text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Tous</button>
                    <button onClick={() => setFilter('devis')} className={`px-4 py-2 rounded-md text-sm ${filter === 'devis' ? 'bg-yellow-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Devis</button>
                    <button onClick={() => setFilter('bon')} className={`px-4 py-2 rounded-md text-sm ${filter === 'bon' ? 'bg-blue-400 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Bons Liv.</button>
                    <button onClick={() => setFilter('facture')} className={`px-4 py-2 rounded-md text-sm ${filter === 'facture' ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Factures</button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-medium">Type</th> <th scope="col" className="px-6 py-3 font-medium">Statut</th> <th scope="col" className="px-6 py-3 font-medium">Référence</th> <th scope="col" className="px-6 py-3 font-medium">Date</th> <th scope="col" className="px-6 py-3 font-medium">Client</th> <th scope="col" className="px-6 py-3 font-medium">Total TTC</th> <th scope="col" className="px-6 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocuments.map((doc) => (
                                <tr key={doc.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${docTypeClasses[doc.type]}`}>{doc.type.toUpperCase()}</span></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${docStatusClasses[doc.status] || 'bg-gray-100 text-gray-800'}`}>{doc.status}</span></td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{doc.reference}</td>
                                    <td className="px-6 py-4">{formatDate(doc.date)}</td>
                                    <td className="px-6 py-4">{doc.customer.nom}</td>
                                    <td className="px-6 py-4 font-semibold">{formatCurrency(doc.totalTTC)}</td>
                                    <td className="px-6 py-4 flex space-x-2">
                                        <button onClick={() => showDocumentModal(doc)} className="text-blue-600 hover:text-blue-800 p-1" title="Voir"><Search size={18} /></button>
                                        {doc.type === 'devis' && doc.status === 'Brouillon' && (<button onClick={() => convertToFacture(doc)} className="text-green-600 hover:text-green-800 p-1" title="Convertir en Facture"><RefreshCw size={18} /></button>)}
                                        <button onClick={() => confirmDeleteDocument(doc.id, doc.reference)} className="text-red-600 hover:text-red-800 p-1" title="Supprimer"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredDocuments.length === 0 && (<p className="text-center text-gray-500 py-6">Aucun document trouvé.</p>)}
            </div>
        </div>
    );
};

export default DocumentList;
