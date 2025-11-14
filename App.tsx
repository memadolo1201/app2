
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, Auth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, getDocs, writeBatch, setDoc, setLogLevel, Firestore } from 'firebase/firestore';
import { AlertTriangle } from 'lucide-react';
import type { Product, Customer, Document, Settings, FirebaseContextType, View } from './types';
import { exampleProducts, exampleCustomer, defaultSettings } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockManagement from './components/StockManagement';
import CustomerManagement from './components/CustomerManagement';
import POS from './components/POS';
import DocumentList from './components/DocumentList';
import AnnualReport from './components/AnnualReport';
import SettingsComponent from './components/SettingsComponent';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlXxm-OYuG8w3LZf2w2k9wB1r2Z_k5Hf8",
  authDomain: "medoapp---abdo.firebaseapp.com",
  projectId: "medoapp---abdo",
  storageBucket: "medoapp---abdo.firebasestorage.app",
  messagingSenderId: "224747133866",
  appId: "1:224747133866:web:398b0d08b0c837248d29d3"
};

const appId = firebaseConfig.appId;

export default function App() {
    const [view, setView] = useState<View>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [firebaseContext, setFirebaseContext] = useState<FirebaseContextType | null>(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', content: null as React.ReactNode, size: 'lg' as 'sm' | 'md' | 'lg' | 'xl' | '2xl' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [initializationError, setInitializationError] = useState<string | null>(null);

    useEffect(() => {
        try {
            if (!firebaseConfig.apiKey) { 
                const errorMsg = "Configuration Firebase manquante. L'application ne peut pas se connecter.";
                console.error(errorMsg);
                setInitializationError(errorMsg);
                return;
            }
            setLogLevel('debug');
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);

            const handleSignIn = async (authInstance: Auth) => {
                try {
                    if (!authInstance.currentUser) {
                        await signInAnonymously(authInstance);
                    }
                } catch (authError: any) {
                    console.error("Anonymous Sign-In Error:", authError);
                }
            };

            const authUnsubscribe = onAuthStateChanged(auth, user => {
                setFirebaseContext({ db, auth, userId: user ? user.uid : null, isAuthReady: true, appId });
            });
            
            handleSignIn(auth);

            return () => authUnsubscribe();
        } catch (e: any) {
            const errorMsg = `Erreur d'initialisation Firebase: ${e.message}`;
            console.error(errorMsg, e);
            setInitializationError(errorMsg);
        }
    }, []);

    useEffect(() => {
        if (!firebaseContext?.isAuthReady || !firebaseContext?.userId) return;
        const { db, userId } = firebaseContext;

        const seedData = async () => {
            try {
                const productsRef = collection(db, 'artifacts', appId, 'users', userId, 'products');
                const q = query(productsRef, where('ref', '==', 'CP-HYD-50'));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    const batch = writeBatch(db);
                    exampleProducts.forEach(p => batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'products')), p));
                    batch.set(doc(collection(db, 'artifacts', appId, 'users', userId, 'customers')), exampleCustomer);
                    batch.set(doc(db, 'artifacts', appId, 'users', userId, 'config', 'settings'), defaultSettings);
                    await batch.commit();
                }
            } catch (error) { console.error("Seeding Error:", error); }
        };
        seedData();
    }, [firebaseContext?.isAuthReady, firebaseContext?.userId]);

    useEffect(() => {
        if (!firebaseContext?.isAuthReady || !firebaseContext?.userId) return;
        const { db, userId } = firebaseContext;

        const unsub = (path: string, setter: (data: any[]) => void) => onSnapshot(collection(db, 'artifacts', appId, 'users', userId, path),
            (snapshot) => setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
            (error) => console.error(`Listener Error on ${path}:`, error)
        );

        const settingsUnsub = onSnapshot(doc(db, 'artifacts', appId, 'users', userId, 'config', 'settings'), (doc) => {
            setSettings(doc.exists() ? doc.data() as Settings : defaultSettings);
        });

        const productsUnsub = unsub('products', setProducts);
        const customersUnsub = unsub('customers', setCustomers);
        const documentsUnsub = unsub('documents', (data) => setDocuments(data as Document[]));

        return () => { productsUnsub(); customersUnsub(); documentsUnsub(); settingsUnsub(); };
    }, [firebaseContext?.isAuthReady, firebaseContext?.userId]);

    const handleOpenModal = (title: string | false, content: React.ReactNode = null, size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'lg') => {
        setModal(title === false ? { isOpen: false, title: '', content: null, size: 'lg' } : { isOpen: true, title, content, size });
    };

    const handleOpenConfirmModal = (title: string, message: string, onConfirm: () => void) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm: () => { onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); } });
    };

    const handleCloseConfirmModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const renderMainView = () => {
        if (initializationError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <AlertTriangle size={48} className="text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-red-600">Erreur de Connexion</h3>
                    <p className="text-lg text-gray-600 mt-2">{initializationError}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        Veuillez vérifier la configuration de Firebase et votre connexion internet.
                    </p>
                </div>
            );
        }

        if (!firebaseContext?.isAuthReady) return <div className="flex items-center justify-center h-full"><p className="text-lg text-gray-600">Chargement de MedoApp...</p></div>;
        if (!firebaseContext.userId) return <div className="flex flex-col items-center justify-center h-full text-center p-4"><AlertTriangle size={48} className="text-red-500 mb-4" /><h3 className="text-xl font-semibold text-red-600">Échec de l'authentification</h3><p className="text-lg text-gray-600 mt-2">L'application n'a pas pu se connecter.</p></div>;
        
        const commonProps = { firebaseContext, openModal: handleOpenModal, openConfirmModal: handleOpenConfirmModal };

        switch (view) {
            case 'dashboard': return <Dashboard products={products} customers={customers} documents={documents} setView={setView} />;
            case 'stock': return <StockManagement products={products} {...commonProps} />;
            case 'customers': return <CustomerManagement customers={customers} {...commonProps} />;
            case 'pos': return <POS products={products} customers={customers} settings={settings} onDocumentCreated={() => setView('documents')} {...commonProps} />;
            case 'documents': return <DocumentList documents={documents} settings={settings} onDocumentCreated={() => setView('documents')} products={products} {...commonProps} />;
            case 'reports': return <AnnualReport documents={documents} products={products} settings={settings} />;
            case 'settings': return <SettingsComponent settings={settings} firebaseContext={firebaseContext} openModal={handleOpenModal} />;
            default: return <Dashboard products={products} customers={customers} documents={documents} setView={setView} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar view={view} setView={setView} userId={firebaseContext?.userId || null} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main id="app-main-content" className="flex-1 overflow-y-auto p-8">
                {renderMainView()}
            </main>
            <Modal isOpen={modal.isOpen} onClose={() => handleOpenModal(false)} title={modal.title} size={modal.size}>{modal.content}</Modal>
            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={handleCloseConfirmModal} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
        </div>
    );
}
