require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
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
    "أهلاً وسهلاً بك في CHIKA TEX 🎉\n\nنفتخر بتقديم أجود وأفخم أنواع قماش الخياطة الراقية في الجزائر.\n\nالرد التلقائي هذا为了更好地خدمتك، راح نرسلك جميع موديلاتنا واحد تلو الآخر. تفضل بالاطلاع 🤍"
  );

  await delay(2000);

  const products = [
    { name: "موديل 1", image: "https://chika-tex.vercel.app/images/products/1.jpg" },
    { name: "موديل 2", image: "https://chika-tex.vercel.app/images/products/2.jpg" },
    { name: "موديل 3", image: "https://chika-tex.vercel.app/images/products/3.jpg" },
    { name: "موديل 4", image: "https://chika-tex.vercel.app/images/products/4.jpg" },
    { name: "موديل 5", image: "https://chika-tex.vercel.app/images/products/5.jpg" },
    { name: "موديل 6", image: "https://chika-tex.vercel.app/images/products/6.jpg" },
    { name: "موديل 7", image: "https://chika-tex.vercel.app/images/products/7.jpg" },
    { name: "موديل 8", image: "https://chika-tex.vercel.app/images/products/8.jpg" },
    { name: "موديل 9", image: "https://chika-tex.vercel.app/images/products/9.jpg" },
    { name: "موديل 10", image: "https://chika-tex.vercel.app/images/products/10.jpg" },
    { name: "موديل 11", image: "https://chika-tex.vercel.app/images/products/11.jpg" },
    { name: "موديل 12", image: "https://chika-tex.vercel.app/images/products/12.jpg" },
    { name: "موديل 13", image: "https://chika-tex.vercel.app/images/products/13.jpg" },
    { name: "موديل 14", image: "https://chika-tex.vercel.app/images/products/14.jpg" },
    { name: "موديل 15", image: "https://chika-tex.vercel.app/images/products/15.jpg" },
    { name: "موديل 16", image: "https://chika-tex.vercel.app/images/products/16.jpg" },
    { name: "موديل 17", image: "https://chika-tex.vercel.app/images/products/17.jpg" },
    { name: "موديل 18", image: "https://chika-tex.vercel.app/images/products/18.jpg" },
    { name: "موديل 19", image: "https://chika-tex.vercel.app/images/products/19.jpg" },
    { name: "موديل 20", image: "https://chika-tex.vercel.app/images/products/20.jpg" },
    { name: "موديل 21", image: "https://chika-tex.vercel.app/images/products/21.jpg" },
    { name: "موديل 22", image: "https://chika-tex.vercel.app/images/products/22.jpg" },
    { name: "موديل 23", image: "https://chika-tex.vercel.app/images/products/23.jpg" },
    { name: "موديل 24", image: "https://chika-tex.vercel.app/images/products/24.jpg" },
    { name: "موديل 25", image: "https://chika-tex.vercel.app/images/products/25.jpg" },
    { name: "موديل 26", image: "https://chika-tex.vercel.app/images/products/26.jpg" },
    { name: "موديل 27", image: "https://chika-tex.vercel.app/images/products/27.jpg" },
    { name: "موديل 28", image: "https://chika-tex.vercel.app/images/products/28.jpg" },
    { name: "موديل 29", image: "https://chika-tex.vercel.app/images/products/29.jpg" },
  ];

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
    await sendAudio(
      psid,
      "https://chika-tex.vercel.app/audio/welcome.mp3"
    );
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
    await sendMessage(
      psid,
      "لقد استلمت الموديلات بالفعل ✅\nهل قمت باختيار ما يعجبك؟"
    );
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
      await sendMessage(
        psid,
        "أرسلنا لك جميع الموديلات أعلاه ☝️\nننتظر ردّك: هل قمت باختيار؟"
      );
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
    await sendMessage(
      psid,
      "شكراً لتواصلك مع CHIKA TEX 🤍\nللطلب: https://wa.me/213671770903"
    );
    return;
  }
}

async function handleCommentEvent(value) {
  const message = value.message || "";
  const commentId = value.comment_id;
  const postId = value.post_id;
  const from = value.from || {};

  if (message.trim() !== "1") return;

  console.log(`Comment "1" from ${from.name} (${from.id}) on post ${postId}`);

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
    state.commentId = commentId;
    state.postId = postId;
  } catch (err) {
    console.error("Failed to send welcome message:", err.message);
  }
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object !== "page") {
    return res.sendStatus(404);
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
        if (
          change.field === "feed" &&
          change.value &&
          change.value.item === "comment"
        ) {
          handleCommentEvent(change.value).catch((err) =>
            console.error("handleCommentEvent error:", err)
          );
        }
      }
    }
  }

  res.status(200).send("EVENT_RECEIVED");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`CHIKA TEX Bot running on port ${PORT}`);
  console.log(`Webhook URL: https://YOUR-SERVER.railway.app/webhook`);
  console.log(`Health check: https://YOUR-SERVER.railway.app/health`);
});
