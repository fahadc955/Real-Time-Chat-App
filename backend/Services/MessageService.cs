using chat_api.Models;
namespace chat_api.Services
{
    public class MessageService
    {
        private static readonly List<Message> Messages = new();

        public void AddMessage(Message message)
        {
            Messages.Add(message);
        }

        public IEnumerable<Message> GetMessages(string user1, string user2)
        {
            return Messages
                .Where(m => (m.FromUserId == user1 && m.ToUserId == user2) ||
                            (m.FromUserId == user2 && m.ToUserId == user1)) 
                .OrderBy(m => m.Timestamp);
        }
    }


}
