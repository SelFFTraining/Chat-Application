 const generateMessage = (text, username) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
 }
 const generateLinkMessage = (link, linkName, username) => {
     return {
         username,
         link,
         linkName,
         createdAt: new Date().getTime()
     }
 }
module.exports  = {
    generateMessage,
    generateLinkMessage
 }