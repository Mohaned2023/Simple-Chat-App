/**
 * MessageInterface is interface use to set the\
 * required fields to deal with the messages.
 */
export interface MessageInterface {
    conversationId: number;
    receiverId: number;
    senderId: number;
    body: string;
}