
import type { Timestamp } from 'firebase/firestore';

export const formatCurrency = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
        amount = 0;
    }
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(amount);
};

export const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};
