using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Spoofy.DiscordHost
{
    public class DiscordHostService : IHostedService
    {
        private readonly IDiscordStartup _startup;
        private readonly IDiscordClientBuilder _builder;

        public DiscordHostService(IDiscordStartup startup, IDiscordClientBuilder builder)
        {
            _startup = startup;
            _builder = builder;

            DiscordEventMethods.BotEventId = new EventId(42, _builder.Environment.BotName);
            _builder.Discord.Ready += DiscordEventMethods.Client_Ready;
            _builder.Discord.GuildAvailable += DiscordEventMethods.Client_GuildAvailable;
            _builder.Discord.ClientErrored += DiscordEventMethods.Client_ClientError;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _startup.Configure(_builder);

            await _builder.Discord.ConnectAsync();
            await _builder.Discord.ReconnectAsync(true);
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            await _builder.Discord.DisconnectAsync();
        }
    }
}
