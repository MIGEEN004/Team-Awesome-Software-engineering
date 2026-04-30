// Example of a function to send a message
async function sendMessage(senderId, receiverId, listingId, text) {
    const sql = "INSERT INTO messages (sender_id, receiver_id, listing_id, message_text) VALUES (?, ?, ?, ?)";
    return await db.query(sql, [senderId, receiverId, listingId, text]);
}