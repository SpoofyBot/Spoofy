using DSharpPlus;
using DSharpPlus.VoiceNext;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Spoofy.DiscordHost;
using Spoofy.Extensions;

namespace Spoofy
{
    public class Startup : IDiscordStartup
    {
        private readonly IConfiguration _configuration;

        public Startup(IHostEnvironment env)
        {
            var builder = new ConfigurationBuilder();

            builder.Sources.Clear();
            builder.SetBasePath(env.ContentRootPath);
            builder.AddKeyPerFile("/run/secrets", true); // docker secrets - https://docs.microsoft.com/en-us/dotnet/core/extensions/configuration-providers#key-per-file-configuration-provider
            builder.AddEnvironmentVariables();

            _configuration = builder.Build();
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<DiscordBotOptions>(_configuration.GetSection(DiscordBotOptions.Section));

            services.AddDiscord(config =>
            {
                var options = _configuration.GetSection(DiscordBotOptions.Section).Get<DiscordBotOptions>() ?? new DiscordBotOptions();

                config.BotName = options.Name;
                config.Configuration.Token = options.Token;
                config.Configuration.TokenType = TokenType.Bot;
                config.Configuration.Intents = DiscordIntents.AllUnprivileged;
                config.Configuration.AutoReconnect = true;
                config.Configuration.MinimumLogLevel = LogLevel.Debug;
            });
        }

        public void Configure(IDiscordClientBuilder client)
        {
            client.UseSlashCommands();
            client.Discord.UseVoiceNext();
        }
    }
}
