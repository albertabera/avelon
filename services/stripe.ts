import { supabase } from './supabase';

export const startCheckout = async () => {
    try {
        const priceId = import.meta.env.VITE_STRIPE_PRICE_ID;
        if (!priceId) throw new Error("Missing Price ID");

        // Call Supabase Edge Function 'create-checkout-session'
        // This requires the function to be deployed to Supabase
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                price_id: priceId,
                redirect_url: window.location.origin,
                // Optional: Pass user ID if you want to track it in Stripe Metadata
                // user_id: session.user.id 
            },
        });

        if (error) {
            console.error("Edge Function Error:", error);
            const errMsg = error.message || JSON.stringify(error) || "Unknown Error";
            throw new Error(`API Error: ${errMsg}`);
        }

        if (data?.url) {
            window.location.href = data.url;
        } else {
            throw new Error("No checkout URL returned from API");
        }

    } catch (err: any) {
        console.error("Checkout Error:", err);
        throw err;
    }
};
