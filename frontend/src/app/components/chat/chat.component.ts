import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../services/websocket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  userId: string | null = null; // Logged-in user
  selectedUser: string | null = null; // Chat recipient
  users = ['5155', '5255', '5355']; // List of users
  chatHistories: { [key: string]: any[] } = {}; // Stores chat history per user
  chatHistory: any[] = []; // Active chat history for selected user
  message = '';
  typingUser: string | null = null;

  wsService = inject<WebSocketService>(WebSocketService);
  route = inject(ActivatedRoute);
  isValidId = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      this.validateId(this.userId || '');
      if (this.userId) {
        this.wsService.startConnection(this.userId);
      }
    });

    // ✅ Handle real-time message updates
    this.wsService.onMessageReceived((fromUserId: string, message: string) => {
      console.log(`📩 New message from ${fromUserId}: ${message}`);

      // ✅ Store the message in the chat history
      if (!this.chatHistories[fromUserId]) {
        this.chatHistories[fromUserId] = [];
      }
      this.chatHistories[fromUserId].push({ fromUserId, message });

      // ✅ If the received message is from the currently selected chat, update the UI instantly
      if (this.selectedUser === fromUserId) {
        this.chatHistory = [...this.chatHistories[fromUserId]];
      }

      // ✅ Play notification sound if the message is from another user
      if (fromUserId !== this.userId) {
        this.playNotificationSound();
      }
    });

    // ✅ Handle typing indicator updates
    this.wsService.onTypingIndicator((fromUserId: string) => {
      if (fromUserId === this.selectedUser) {
        this.typingUser = fromUserId;
        setTimeout(() => (this.typingUser = null), 2000);
      }
    });
  }

  selectUser(user: string): void {
    this.selectedUser = user;

    // ✅ Ensure chat history exists for the selected user
    if (!this.chatHistories[user]) {
      this.chatHistories[user] = [];
      this.loadChatHistory(user);
    }

    // ✅ Always update `chatHistory` when selecting a user
    this.chatHistory = [...this.chatHistories[user]];

    console.log(
      `📩 Chat opened between ${this.userId} and ${this.selectedUser}`
    );
  }

  sendMessage(): void {
    if (this.userId && this.selectedUser) {
      this.wsService.sendMessage(this.userId, this.selectedUser, this.message);

      // ✅ Add message to chat history
      this.chatHistories[this.selectedUser].push({
        fromUserId: this.userId,
        message: this.message,
      });

      // ✅ Update displayed chat history
      this.chatHistory = [...this.chatHistories[this.selectedUser]];

      this.message = '';
    }
  }

  loadChatHistory(user: string): void {
    if (this.userId) {
      this.http
        .get<any[]>(
          `https://localhost:7260/api/messages/${this.userId}/${user}`
        )
        .subscribe((messages) => {
          this.chatHistories[user] = messages;

          // ✅ If this user is currently selected, update UI
          if (this.selectedUser === user) {
            this.chatHistory = [...this.chatHistories[user]];
          }
        });
    }
  }

  onTyping(): void {
    if (this.userId && this.selectedUser) {
      this.wsService.sendTypingIndicator(this.userId, this.selectedUser);
    }
  }

  validateId(userId: string) {
    this.isValidId = this.users.includes(userId);
  }

  // ✅ Play notification sound when message is received
  playNotificationSound(): void {
    const audio = new Audio('/assets/sounds/message-received.mp3');
    audio.play().catch((err) => console.error('❌ Error playing sound:', err));
  }

  getAvailableRecipients(): string[] {
    return this.users.filter((user) => user !== this.userId);
  }
}
