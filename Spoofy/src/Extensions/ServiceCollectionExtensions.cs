using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Spoofy.DiscordHost;

namespace Spoofy.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDiscord(this IServiceCollection services, Action<DiscordBotEnvironment> configure)
        {
            services.AddSingleton<IDiscordClientBuilder>(prov => new DiscordClientBuilder(prov.GetService<IServiceProvider>(), configure));
            services.AddSingleton<IHostedService, DiscordHostService>();
            return services;
        }
    }
}
