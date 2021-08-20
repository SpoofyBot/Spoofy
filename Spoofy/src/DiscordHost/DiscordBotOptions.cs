namespace Spoofy.DiscordHost
{
    public class DiscordBotOptions
    {
        public static readonly string Section = "Discord";

        public string Name { get; set; } = "DSharpPlus-Bot";
        public string Token { get; set; }
    }
}
