import cors from "cors";
import express from "express";
import verifySignature from "./verify";
const app = express();
app.use(cors());
app.use(express.json());
app.post("/verify", async function (req, res) {
  const { message, signature, publicKey } = req.body;
  const isValid = await verifySignature(message, signature, publicKey);
  if (isValid) {
    res
      .status(200)
      .json({ success: true, msg: "Signature verified. Wallet is authentic." });
  } else {
    res.json({ success: false, msg: "Invalid Signature" });
  }
});

app.listen(5000, function () {
  console.log("Listening at PORT: 5000");
});
