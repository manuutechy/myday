import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const email = process.env.VAPID_EMAIL || "mailto:manuu@example.com";

try {
  if (publicKey && privateKey) {
    webpush.setVapidDetails(email, publicKey, privateKey);
  } else {
    console.warn("VAPID keys not fully configured. Push notifications will be disabled.");
  }
} catch (error) {
  console.warn("Failed to set VAPID details (probably due to invalid keys at build time):", error);
}

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

export async function sendPushNotification(subscription: WebPushSubscription, title: string, body: string, icon: string = "/icons/icon-192.png") {
  const payload = JSON.stringify({
    title,
    body,
    icon,
    badge: "/icons/icon-192.png",
    data: {
      url: "/dashboard",
    },
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    // If subscription is expired/invalid, return gone status
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { success: false, expired: true };
    }
    return { success: false, error: error.message };
  }
}
