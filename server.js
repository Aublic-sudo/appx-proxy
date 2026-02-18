const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 load all academy apis
const ACADEMIES = JSON.parse(
  fs.readFileSync("./appxapis.json","utf8")
);

// 🔥 helper — find api by name
function getAcademyApi(name){
  const a = ACADEMIES.find(
    x => x.name.toLowerCase() === (name||"").toLowerCase()
  );
  return a ? a.api : null;
}

// 🔥 UNIVERSAL PROXY
app.all("/api/:academy/*", async (req,res)=>{

  try{

    const academy = req.params.academy;
    const baseApi = getAcademyApi(academy);

    if(!baseApi){
      return res.status(404).json({
        error:"Academy not found"
      });
    }

    const path = req.params[0];

    const query = req.url.includes("?")
      ? req.url.slice(req.url.indexOf("?"))
      : "";

    const target = baseApi + "/" + path + query;

    console.log("➡️",target);

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

    console.log("❌",err.response?.data || err.message);

    res.status(400).json({
      error:"proxy failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(10000,()=>{
  console.log("✅ Universal Proxy Running");
});
