const crypto = require("crypto")
let hash,i;
for(i=0;;i++)   {
    hash = crypto.createHash('sha256').update("User1=>User2 | Rs 100"+i.toString()).digest('hex')
    if(hash.startsWith("00000"))
        break;
}
console.log(i,hash)