const admin = require("firebase-admin");


function buildMessage({title,body,route_name,id}){
    return {
        
        notification: {
            title,
            body
        },
        data: {
            route_name: route_name,
            id: id
        },
        android: {
            priority: "high",
            notification: {
                channelId: "default_channel_id",
                
            }
        },
        apns: {
            headers: {
                "apns-priority": "10"
            },
            payload: {
                aps: {
                    contentAvailable: true,
                    sound: "default"
                }
            }
        }
    }
}

async function sendToToken({token,title,body,route_name,id}) {
    try {
        if(!token) throw new Error("token is required");

        const message = {
            token,
            ...buildMessage({title,body,route_name,id})
        }

        await admin.messaging().send(message);
        
    } catch (error) {
        throw new Error("Error send to token: " + error.message);
        
    }
}

module.exports = {
    sendToToken
}