/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(
  "sk_test_51QTmYLGSurLaCLspP43XSHAOhodgBzIm31c5BZRMoWHlvBcK7679ayo6A7KwrPBw4QVRVgPMRAZZ0bdjAcBAGD5e00lUJmsNdE"
); 

admin.initializeApp();

exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
  try {
    const { email, paymentMethodId } = data;

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Store customer ID in Firestore
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    await userRef.update({
      stripeCustomerId: customer.id,
    });

    return { customerId: customer.id };
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating Stripe customer"
    );
  }
});

exports.createSubscription = functions.https.onCall(async (data, context) => {
  try {
    const { planId, customerId } = data;

    // Create a Stripe subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ plan: planId }],
      trial_period_days: 7, // 7-day free trial
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
    });

    // Store subscription ID in Firestore
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    await userRef.update({
      stripeSubscriptionId: subscription.id,
    });

    return { subscriptionId: subscription.id };
  } catch (error) {
    console.error("Error creating Stripe subscription:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error creating Stripe subscription"
    );
  }
});

exports.updateSubscription = functions.https.onCall(async (data, context) => {
  try {
    const { subscriptionId, planId } = data;

    // Update the Stripe subscription
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{ plan: planId }],
    });

    // Update subscription ID in Firestore
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    await userRef.update({
      stripeSubscriptionId: subscription.id,
    });

    return { subscriptionId: subscription.id };
  } catch (error) {
    console.error("Error updating Stripe subscription:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error updating Stripe subscription"
    );
  }
});

exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  try {
    const { subscriptionId } = data;

    // Cancel the Stripe subscription
    const subscription = await stripe.subscriptions.del(subscriptionId);

    // Update subscription ID in Firestore
    const userRef = admin.firestore().collection("users").doc(context.auth.uid);
    await userRef.update({
      stripeSubscriptionId: null,
    });

    return { message: "Subscription canceled" };
  } catch (error) {
    console.error("Error canceling Stripe subscription:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error canceling Stripe subscription"
    );
  }
});
