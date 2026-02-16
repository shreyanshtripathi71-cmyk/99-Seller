"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import styles from '@/components/search/styles/dashboard.module.scss';

// Initialize Stripe with your publishable key
// Ideally this should be in an environment variable: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ amount, clientSecret, onSuccess, onCancel }: { amount: number, clientSecret: string, onSuccess: () => void, onCancel: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL where the customer should be redirected after the payment
                return_url: window.location.href, // or a specific success page
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message || 'An unexpected error occurred.');
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess();
        } else {
            setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'));
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ minWidth: '400px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>Complete Payment</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>
                    Total Amount: <strong>${(amount / 100).toFixed(2)}</strong>
                </p>
            </div>

            <PaymentElement />

            {errorMessage && (
                <div style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px' }}>
                    {errorMessage}
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isProcessing ? '#93c5fd' : '#2563eb',
                        color: '#fff',
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isProcessing ? 'Processing...' : 'Pay Now'}
                </button>
            </div>
        </form>
    );
};

interface StripePaymentFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ clientSecret, amount, onSuccess, onCancel }) => {
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
        },
    };

    return (
        <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            {clientSecret && !clientSecret.startsWith('mock_secret') ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm amount={amount} clientSecret={clientSecret} onSuccess={onSuccess} onCancel={onCancel} />
                </Elements>
            ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{
                        background: '#fff7ed',
                        border: '1px solid #ffedd5',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px'
                    }}>
                        <i className="fa-solid fa-flask" style={{ color: '#ea580c', fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                        <h4 style={{ color: '#9a3412', marginBottom: '4px' }}>Test Environment</h4>
                        <p style={{ color: '#c2410c', fontSize: '13px' }}>
                            Stripe is currently in <strong>Mock Mode</strong>. No real payment will be processed.
                        </p>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '8px' }}>Amount to Simulate:</p>
                        <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                            ${(amount / 100).toFixed(2)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                flex: 1,
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                fontWeight: '600',
                                color: '#64748b'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSuccess}
                            style={{
                                flex: 2,
                                padding: '12px',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                color: '#fff',
                                fontWeight: '700',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }}
                        >
                            Simulate Payment Success
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StripePaymentForm;
