using chat_api.Models;
using chat_api.Services;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace chat_api.Hubs
{
    public class ChatHub : Hub
    {
        private readonly MessageService _messageService;

        public ChatHub(MessageService messageService)
        {
            _messageService = messageService;
        }
        private static readonly ConcurrentDictionary<string, string> ConnectedUsers = new();

        public async Task SendMessage(string fromUserId, string toUserId, string message)
        {
            Message msg = new() { FromUserId = fromUserId, ToUserId = toUserId, Content = message };
            _messageService.AddMessage(msg);
            if (ConnectedUsers.TryGetValue(toUserId, out string connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", fromUserId, message);
            }
        }

        public async Task UserTyping(string fromUserId, string toUserId)
        {
            if (ConnectedUsers.TryGetValue(toUserId, out string connectionId))
            {
                await Clients.Client(connectionId).SendAsync("UserTyping", fromUserId);
            }
        }

        public override Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                ConnectedUsers[userId] = Context.ConnectionId;
            }
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            var userId = ConnectedUsers.FirstOrDefault(x => x.Value == Context.ConnectionId).Key;
            if (userId != null)
            {
                ConnectedUsers.TryRemove(userId, out _);
            }
            return base.OnDisconnectedAsync(exception);
        }
    }

}
