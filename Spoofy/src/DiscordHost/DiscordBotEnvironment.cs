using DSharpPlus;

namespace Spoofy.DiscordHost
{
    public class DiscordBotEnvironment
    {
        public string BotName { get; set; } = "DSharpPlus-Bot";
        public DiscordConfiguration Configuration { get; set; } = new();
    }
}
