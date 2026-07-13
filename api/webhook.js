const axios = require("axios");

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

const userState = {};

function getUserState(psid) {
  if (!userState[psid]) {
    userState[psid] = { step: "new", lastInteraction: Date.now() };
  }
  return userState[psid];
}

async function sendMessage(psid, text) {
  await axios.post(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: psid },
      messaging_type: "MESSAGE_TAG",
      tag: "CONFIRMED_EVENT_UPDATE",
      message: { text },
    }
  );
}

async function sendImage(psid, url) {
  await axios.post(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: psid },
      messaging_type: "MESSAGE_TAG",
      tag: "CONFIRMED_EVENT_UPDATE",
      message: {
        attachment: {
          type: "image",
          payload: { url, is_reusable: true },
        },
      },
    }
  );
}

async function sendAudio(psid, url) {
  await axios.post(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: psid },
      messaging_type: "MESSAGE_TAG",
      tag: "CONFIRMED_EVENT_UPDATE",
      message: {
        attachment: {
          type: "audio",
          payload: { url, is_reusable: true },
        },
      },
    }
  );
}

async function sendQuickReply(psid, text, replies) {
  await axios.post(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      recipient: { id: psid },
      messaging_type: "MESSAGE_TAG",
      tag: "CONFIRMED_EVENT_UPDATE",
      message: {
        text,
        quick_replies: replies.map((r) => ({
          content_type: "text",
          title: r.title,
          payload: r.payload,
        })),
      },
    }
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function handleNewUser(psid) {
  const state = getUserState(psid);
  state.step = "sent_products";

  await sendMessage(
    psid,
    "أهلاً وسهلاً بك في CHIKA TEX 🎉\n\nنفتخر بتقديم أجود وأفخم أنواع قماش الخياطة الراقية في الجزائر.\n\nالرد التلقائي هذا لخدمتك، راح نرسلك جميع موديلاتنا واحد تلو الآخر. تفضل بالاطلاع 🤍"
  );

  await delay(2000);

  const products = Array.from({ length: 29 }, (_, i) => ({
    name: `موديل ${i + 1}`,
    image: `https://chika-tex.vercel.app/images/products/${i + 1}.jpg`,
  }));

  for (const product of products) {
    try {
      await sendImage(psid, product.image);
      await delay(1200);
    } catch (err) {
      console.error(`Failed to send ${product.name}:`, err.message);
    }
  }

  await delay(2000);

  try {
    await sendAudio(psid, "https://chika-tex.vercel.app/audio/welcome.mp3");
  } catch (err) {
    console.error("Failed to send audio:", err.message);
  }

  await delay(3000);

  await sendQuickReply(psid, "هل قمت باختيار؟ 😊", [
    { title: "نعم اخترت ✅", payload: "CHOSE_YES" },
    { title: "مازلت أتصفح 👀", payload: "CHOSE_NO" },
  ]);

  state.step = "awaiting_choice";
  state.lastInteraction = Date.now();
}

async function handleMessageEvent(event) {
  const psid = event.sender.id;
  const message = event.message;

  if (!message || (!message.text && !message.quick_reply)) return;

  const text = (message.text || "").trim();
  const payload = message.quick_reply ? message.quick_reply.payload : null;
  const state = getUserState(psid);

  if ((text === "1" || payload === "SEND_PRODUCTS") && state.step === "new") {
    await sendMessage(psid, "شكراً لتواصلك! جاري إرسال جميع الموديلات...");
    await handleNewUser(psid);
    return;
  }

  if (state.step === "sent_products" && text === "1") {
    await sendMessage(psid, "لقد استلمت الموديلات بالفعل ✅\nهل قمت باختيار ما يعجبك؟");
    await sendQuickReply(psid, "هل قمت باختيار؟ 😊", [
      { title: "نعم اخترت ✅", payload: "CHOSE_YES" },
      { title: "مازلت أتصفح 👀", payload: "CHOSE_NO" },
    ]);
    return;
  }

  if (state.step === "awaiting_choice") {
    if (payload === "CHOSE_YES") {
      await sendMessage(
        psid,
        "مبروك اختيارك! 🎉\nللطلب والاستفسار، تواصل معنا عبر:\n📞 واتساب: https://wa.me/213671770903\n\nنتهلاو فيك 🤍"
      );
      state.step = "done";
      return;
    }
    if (payload === "CHOSE_NO") {
      await sendMessage(
        psid,
        "خذ وقتك ولا تتردد في إلقاء نظرة أخرى على الموديلات أعلاه 👆\n\nإذا احتجت أي مساعدة، نحن هنا لخدمتك 🤍"
      );
      state.step = "browsing";
      return;
    }
    if (text === "1") {
      await sendMessage(psid, "أرسلنا لك جميع الموديلات أعلاه ☝️\nننتظر ردّك: هل قمت باختيار؟");
      return;
    }
  }

  if (state.step === "browsing" && text === "1") {
    await sendMessage(psid, "الموديلات كلها أرسلناها لك فوق ☝️\nهل قمت باختيار؟");
    await sendQuickReply(psid, "هل قمت باختيار؟ 😊", [
      { title: "نعم اخترت ✅", payload: "CHOSE_YES" },
      { title: "مازلت أتصفح 👀", payload: "CHOSE_NO" },
    ]);
    return;
  }

  if (state.step === "done" && text === "1") {
    await sendMessage(psid, "شكراً لتواصلك مع CHIKA TEX 🤍\nللطلب: https://wa.me/213671770903");
    return;
  }
}

async function handleCommentEvent(value) {
  const message = value.message || "";
  const from = value.from || {};

  if (message.trim() !== "1") return;

  console.log(`Comment "1" from ${from.name} (${from.id})`);

  const commentPsid = from.id;
  const state = getUserState(commentPsid);

  try {
    await sendMessage(
      commentPsid,
      `أهلاً ${from.name || "صديق"} 🤍\n\nشكراً لتعليقك! 😊\n\nللحصول على جميع موديلات CHIKA TEX، اضغط على الزر أدناه 👇`
    );

    await delay(1000);

    await sendQuickReply(commentPsid, "اضغط هنا لاستلام الموديلات 👇", [
      { title: "1️⃣ أرسل الموديلات", payload: "SEND_PRODUCTS" },
    ]);

    state.step = "new";
    state.lastInteraction = Date.now();
  } catch (err) {
    console.error("Failed to send welcome message:", err.message);
  }
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    const body = req.body;

    if (body.object !== "page") {
      return res.status(404).send("Not a page event");
    }

    for (const entry of body.entry) {
      if (entry.messaging) {
        for (const event of entry.messaging) {
          handleMessageEvent(event).catch((err) =>
            console.error("handleMessageEvent error:", err)
          );
        }
      }

      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === "feed" && change.value && change.value.item === "comment") {
            handleCommentEvent(change.value).catch((err) =>
              console.error("handleCommentEvent error:", err)
            );
          }
        }
      }
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  res.status(405).send("Method not allowed");
};
