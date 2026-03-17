const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cluster0.djmjum9.mongodb.net", (err, addresses) => {
  if (err) {
    console.log("SRV lookup failed:", err.message);
    console.log("Error code:", err.code);
  } else {
    console.log("SRV records:", addresses);
  }
});