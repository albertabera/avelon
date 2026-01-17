
import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { startCheckout } from './stripe';

// RevenueCat Keys - REPLACE THESE WITH YOUR ACTUAL KEYS FROM REVENUECAT DASHBOARD
const REVENUECAT_API_KEY_IOS = 'appl_YOUR_IOS_KEY'; // PENDING USER INPUT
const REVENUECAT_API_KEY_ANDROID = 'goog_GmgJxkugVDJrFxcBBJOzlTBluxT';

export interface PaymentProduct {
    id: string; // Identifier (e.g., 'premium_unlock')
    priceString: string; // Display price (e.g., "$4.99")
    title: string;
    description: string;
    nativePackage?: PurchasesPackage; // RevenueCat package object
}

class PaymentService {
    private initialized = false;
    private isNative = Capacitor.isNativePlatform();

    async init() {
        if (this.initialized) return;

        if (this.isNative) {
            try {
                if (Capacitor.getPlatform() === 'ios') {
                    await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
                } else if (Capacitor.getPlatform() === 'android') {
                    await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
                }
                this.initialized = true;
                console.log('RevenueCat Initialized');
            } catch (e) {
                console.error('Failed to init RevenueCat', e);
            }
        } else {
            // Web: Nothing special to init for Stripe here (handled in stripe.ts or checkout)
            this.initialized = true;
        }
    }

    async getProducts(): Promise<PaymentProduct[]> {
        if (!this.initialized) await this.init();

        if (this.isNative) {
            try {
                const offerings = await Purchases.getOfferings();
                if (offerings.current && offerings.current.availablePackages.length > 0) {
                    return offerings.current.availablePackages.map(pkg => ({
                        id: pkg.identifier,
                        priceString: pkg.product.priceString,
                        title: pkg.product.title,
                        description: pkg.product.description,
                        nativePackage: pkg
                    }));
                }
            } catch (error) {
                console.error('Error fetching offerings', error);
            }
            return [];
        } else {
            // Web: Return static definition (Stripe doesn't give us list easily without backend)
            return [{
                id: 'premium_web',
                priceString: '$4.99',
                title: 'Director Clearance',
                description: 'Unlock all roles and remove ads',
            }];
        }
    }

    async purchase(product?: PaymentProduct): Promise<boolean> {
        if (this.isNative) {
            if (!product || !product.nativePackage) {
                console.error("No product provided for native purchase");
                return false;
            }
            try {
                const { customerInfo } = await Purchases.purchasePackage({ aPackage: product.nativePackage });
                if (customerInfo.entitlements.active['premium']) { // Assuming 'premium' is entitlement ID
                    return true;
                }
            } catch (e: any) {
                if (!e.userCancelled) {
                    alert("Purchase failed: " + e.message);
                }
            }
            return false;

        } else {
            // Web: Stripe
            try {
                await startCheckout();
                return false; // Stripe redirects to new page, so we don't return "true" instantly
            } catch (e: any) {
                alert(e.message);
                return false;
            }
        }
    }

    async restorePurchases(): Promise<boolean> {
        if (this.isNative) {
            try {
                const { customerInfo } = await Purchases.restorePurchases();
                return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
            } catch (e: any) {
                alert("Restore failed: " + e.message);
                return false;
            }
        } else {
            alert("To restore on Web, simply log in.");
            return false;
        }
    }

    async checkPremiumStatus(): Promise<boolean> {
        if (!this.initialized) await this.init();

        if (this.isNative) {
            try {
                const { customerInfo } = await Purchases.getCustomerInfo();
                return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
            } catch {
                return false;
            }
        }
        // Web status is usually checked via user profile/DB in App.tsx
        return false;
    }
}

export const Payment = new PaymentService();
