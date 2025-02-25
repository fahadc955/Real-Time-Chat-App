import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private hubConnection: signalR.HubConnection | undefined;

  constructor() {}

  /** Starts WebSocket connection */
  startConnection(userId: string): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:7260/chatHub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log(`WebSocket connected for User ${userId}`))
      .catch((err) => console.error('WebSocket connection error:', err));
  }

  /** Sends a message */
  sendMessage(fromUserId: string, toUserId: string, message: string): void {
    this.hubConnection
      ?.invoke('SendMessage', fromUserId, toUserId, message)
      .catch((err) => console.error('Error sending message:', err));
  }

  /** Sends typing indicator */
  sendTypingIndicator(fromUserId: string, toUserId: string): void {
    this.hubConnection
      ?.invoke('UserTyping', fromUserId, toUserId)
      .catch((err) => console.error('Error sending typing indicator:', err));
  }

  /** Listens for incoming messages */
  onMessageReceived(
    callback: (fromUserId: string, message: string) => void
  ): void {
    this.hubConnection?.on('ReceiveMessage', callback);
  }

  /** Listens for typing indicator */
  onTypingIndicator(callback: (fromUserId: string) => void): void {
    this.hubConnection?.on('UserTyping', callback);
  }
}
