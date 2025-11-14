
import React from 'react';
import { Package } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Document, Settings } from '../types';

interface PrintableDocumentProps {
    document: Document;
    settings: Settings;
}

const PrintableDocument: React.FC<PrintableDocumentProps> = ({ document, settings }) => {
    const { companyInfo, tvaRate } = settings;
    const { totalHT, totalTVA, totalTTC } = document;

    const docTypeLabel: Record<string, string> = { 'devis': 'DEVIS', 'bon': 'BON DE LIVRAISON', 'facture': 'FACTURE' };
    const docTypeColor: Record<string, string> = { 'devis': 'bg-yellow-500', 'bon': 'bg-blue-500', 'facture': 'bg-green-500' };

    return (
        <div className="bg-white p-10 font-sans" id={`printable-doc-${document.id}`}>
            <header className="flex justify-between items-start pb-6 mb-8 border-b-2 border-gray-100">
                <div className="flex items-start space-x-4">
                    {companyInfo.logoUrl ? (
                        <img src={companyInfo.logoUrl} alt="Logo" className="h-20 w-20 object-contain" onError={(e) => (e.currentTarget.style.display='none')} />
                    ) : (
                        <div className="h-20 w-20 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg flex-shrink-0">
                            <Package size={40} />
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">{companyInfo.nom}</h1>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{companyInfo.adresse}</p>
                        <p className="text-sm text-gray-600">{companyInfo.email}</p>
                        <p className="text-sm text-gray-600">{companyInfo.telephone}</p>
                    </div>
                </div>

                <div className="text-right">
                    <h2 className={`text-3xl font-extrabold text-white px-4 py-2 rounded ${docTypeColor[document.type] || 'bg-gray-500'}`}>
                        {docTypeLabel[document.type] || 'DOCUMENT'}
                    </h2>
                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                        <p><span className="font-semibold text-gray-800">Référence:</span> {document.reference}</p>
                        <p><span className="font-semibold text-gray-800">Date:</span> {formatDate(document.date)}</p>
                        {document.type === 'facture' && (
                            <p><span className="font-semibold text-gray-800">Statut:</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${ document.status === 'Payée' ? 'bg-green-100 text-green-800' : document.status === 'Annulée' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800' }`}>
                                    {document.status}
                                </span>
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <section className="flex justify-between mb-8">
                <div>
                    <h4 className="font-semibold text-gray-500 uppercase text-xs mb-1">Facturé à</h4>
                    <p className="text-lg font-bold text-gray-800">{document.customer.nom}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{document.customer.adresse}</p>
                    <p className="text-sm text-gray-600">{document.customer.email}</p>
                    <p className="text-sm text-gray-600">{document.customer.telephone}</p>
                </div>
                <div className="text-right">
                    <h4 className="font-semibold text-gray-500 uppercase text-xs mb-1">De</h4>
                    <p className="text-lg font-bold text-gray-800">{companyInfo.nom}</p>
                    <p className="text-sm text-gray-600">{companyInfo.legal}</p>
                </div>
            </section>

            <section className="w-full overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-white uppercase bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Référence</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Produit</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-center">Qté</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Prix U. HT</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">Total HT</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {document.items.map((item, index) => (
                            <tr key={item.id || index} className="border-b border-gray-100 even:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{item.ref}</td>
                                <td className="px-6 py-4">{item.nom}</td>
                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                <td className="px-6 py-4 text-right">{formatCurrency(item.prixVente)}</td>
                                <td className="px-6 py-4 text-right font-medium">{formatCurrency(item.prixVente * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-end mt-8">
                <div className="w-full max-w-sm">
                    <div className="space-y-3">
                        <div className="flex justify-between text-md text-gray-600"> <span>Total HT:</span> <span className="font-medium text-gray-800">{formatCurrency(totalHT)}</span> </div>
                        <div className="flex justify-between text-md text-gray-600"> <span>TVA ({tvaRate * 100}%):</span> <span className="font-medium text-gray-800">{formatCurrency(totalTVA)}</span> </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 mt-2 pt-3 border-t-2 border-dashed"> <span>Total TTC:</span> <span className="text-blue-700">{formatCurrency(totalTTC)}</span> </div>
                    </div>
                </div>
            </section>

            <footer className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
                <p className="font-semibold mb-1">Merci de votre confiance.</p>
                <p>{companyInfo.nom} - {companyInfo.legal}</p>
            </footer>
        </div>
    );
};

export default PrintableDocument;
