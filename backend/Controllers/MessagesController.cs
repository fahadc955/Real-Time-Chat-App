using chat_api.Models;
using chat_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace chat_api.Controllers
{

    [ApiController]
    [Route("api/messages")]
    public class MessagesController : ControllerBase
    {
        private readonly MessageService _messageService;

        public MessagesController()
        {
            _messageService = new MessageService();
        }

        [HttpGet("{user1}/{user2}")]
        public IActionResult GetMessages(string user1, string user2)
        {
            var messages = _messageService.GetMessages(user1, user2);
            return Ok(messages);
        }

        [HttpPost]
        public IActionResult SendMessage([FromBody] Message message)
        {
            _messageService.AddMessage(message);
            return Ok();
        }
    }

}
