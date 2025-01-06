import React, { useState, useEffect } from "react";
import { useFirestore } from "react-redux-firebase";
import { useFirebase } from "react-redux-firebase";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../../firebase/firebase";

const stripePromise = loadStripe(
  "pk_test_51QTmYLGSurLaCLspbPg5Jd0JFmq9bbkHXJoRoFpdvvSMAsyQRw7oU7Vr4M5nY5UTf3FbGxltpBYdgMLky3F8gfwE00ZVT9qkpG"
); // Replace with your actual publishable key

const SubscriptionForm = () => {
  const firestore = useFirestore();
  const firebase = useFirebase();
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auth, setAuth] = useState(null);
  const [functions, setFunctions] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      const app = initializeApp(firebaseConfig);
      const authInstance = getAuth(app);
      setAuth(authInstance);
      const functionsInstance = getFunctions(app);
      setFunctions(functionsInstance);
    };

    initializeFirebase();
  }, []);

  const handlePlanChange = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: cardError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

      if (cardError) {
        setError(cardError.message);
        setIsLoading(false);
        return;
      }

      // Create a Stripe customer
      const { customerId } = await httpsCallable(
        functions,
        "createStripeCustomer"
      )({
        email: auth.currentUser.email,
        paymentMethodId: paymentMethod.id,
      });

      // Create a Stripe subscription
      const { subscriptionId } = await httpsCallable(
        functions,
        "createSubscription"
      )({
        planId: selectedPlan.id,
        customerId,
      });

      // Update user data in Firestore
      await firestore.collection("users").doc(auth.currentUser.uid).update({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      });

      // Success
      setIsLoading(false);
      // ... (Handle success, e.g., redirect to a thank you page)
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Choose a Subscription Plan</h2>
      <div>
        {/* Display your subscription plans here */}
        {/* Example: */}
        <button onClick={() => handlePlanChange({ id: "monthly_plan_id" })}>
          Monthly Plan
        </button>
        <button onClick={() => handlePlanChange({ id: "yearly_plan_id" })}>
          Yearly Plan
        </button>
      </div>

      {selectedPlan && (
        <form onSubmit={handleSubmit} className="w-[40%]">
          <CardElement />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : "Subscribe"}
          </button>
          {error && <div>{error}</div>}
        </form>
      )}
    </div>
  );
};

const SubscriptionPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm />
    </Elements>
  );
};

export default SubscriptionPage;
