const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 Universal Proxy Route
app.all("/api/*", async (req,res)=>{

  try{

    // target url build
    const target =
      "https://rozgarapinew.teachx.in/" +
      req.params[0];

    const response = await axios({
      url: target,
      method: req.method,
      headers:{
        "Client-Service":"Appx",
        "Auth-Key":"appxapi",
        "Authorization": req.headers.authorization || "",
        "User-ID": req.headers["user-id"] || "-2",
        "source":"website"
      },
      data:req.body
    });

    res.json(response.data);

  }catch(err){
    res.status(500).json({
      error:"proxy failed",
      details: err.message
    });
  }
});

app.listen(10000,()=>{
  console.log("Proxy running...");
});
