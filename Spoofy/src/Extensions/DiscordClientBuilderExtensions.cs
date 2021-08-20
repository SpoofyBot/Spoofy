using DSharpPlus.SlashCommands;
using Spoofy.DiscordHost;
using Spoofy.Modules;

namespace Spoofy.Extensions
{
    public static class DiscordClientBuilderExtensions
    {
        public static IDiscordClientBuilder UseSlashCommands(this IDiscordClientBuilder builder)
        {
            var slash = builder.Discord.UseSlashCommands(new SlashCommandsConfiguration
                                                             { Services = builder.ServiceProvider });

            slash.RegisterCommands<VoiceModule>();
            slash.RegisterCommands<StatsModule>();
            slash.RegisterCommands<SpotifyModule>();

            slash.SlashCommandErrored += DiscordEventMethods.SlashCommands_CommandErrored;
            slash.SlashCommandExecuted += DiscordEventMethods.SlashCommands_CommandExecuted;

            return builder;
        }
    }
}
