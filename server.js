const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 load academy map
const academies = JSON.parse(
  fs.readFileSync("./appxapis.json","utf8")
);

// helper
function findApi(name){
  const a = academies.find(x =>
    x.name.toLowerCase() === name.toLowerCase()
  );
  return a?.api || null;
}

app.all("/api/:academy/*", async (req,res)=>{

  try{

    const academy = req.params.academy;
    const apiDomain = findApi(academy);

    if(!apiDomain){
      return res.status(404).json({error:"academy not found"});
    }

    const path = req.params[0];

    const target = `${apiDomain}/${path}`;

    console.log("➡️",target);

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

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error:"proxy failed",
      details: err.response?.data || err.message
    });
  }
});

app.listen(10000,()=>{
  console.log("🔥 Universal Proxy running");
});
