const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 UNIVERSAL APPX PROXY
app.all("/api/*", async (req,res)=>{

  try{

    // ⭐ QUERY STRING FIX
    const query = req.url.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    const path = req.params[0];

    const target =
      "https://rozgarapinew.teachx.in/" +
      path +
      query;

    console.log("➡️ PROXY:",target);

    const response = await axios({
      url: target,
      method: req.method,
      headers:{
        "Client-Service":"Appx",
        "Auth-Key":"appxapi",
        "Authorization": req.headers["authorization"] || "",
        "User-ID": req.headers["user-id"] || "-2",
        "source":"website"
      },
      data:req.body
    });

    res.json(response.data);

  }catch(err){

    console.log("❌ PROXY ERROR:",err.response?.data || err.message);

    res.status(400).json({
      error:"proxy failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(10000,()=>{
  console.log("✅ Proxy running on 10000");
});
