using System;
using DSharpPlus;
using Spoofy.Extensions;

namespace Spoofy.DiscordHost
{
    public interface IDiscordClientBuilder
    {
        DiscordClient Discord { get; set; }
        IServiceProvider ServiceProvider { get; set; }
        DiscordBotEnvironment Environment { get; set; }
    }
}
