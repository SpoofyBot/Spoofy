using System;
using DSharpPlus;

namespace Spoofy.DiscordHost
{
    public class DiscordClientBuilder : IDiscordClientBuilder
    {
        public IServiceProvider ServiceProvider { get; set; }
        public DiscordClient Discord { get; set; }
        public DiscordBotEnvironment Environment { get; set; } = new();

        public DiscordClientBuilder(IServiceProvider serviceProvider, Action<DiscordBotEnvironment> configure)
        {
            ServiceProvider = serviceProvider;

            configure(Environment);
            Discord = new DiscordClient(Environment.Configuration);
        }
    }
}
