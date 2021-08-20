using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Spoofy.DiscordHost;

namespace Spoofy.Extensions
{
    public static class GenericHostBuilderExtensions
    {
        public static IHostBuilder UseDiscord<TStartup>(this IHostBuilder hostBuilder) where TStartup : IDiscordStartup
        {
            var startupType = typeof(TStartup);
            return hostBuilder.ConfigureServices((ctx, services) =>
            {
                var cfgServicesMethod = startupType.GetMethod("ConfigureServices", new[] { typeof(IServiceCollection) }); // Find a method that has this signature: ConfigureServices(IServiceCollection)
                var hasEnvCtor = startupType.GetConstructor(new[] { typeof(IHostEnvironment) }) != null; // Check if TStartup has a ctor that takes a IConfiguration parameter
                var startUpObj = hasEnvCtor ? // create a TStartup instance based on ctor
                    (IDiscordStartup) Activator.CreateInstance(startupType, ctx.HostingEnvironment) :
                    (IDiscordStartup) Activator.CreateInstance(startupType, null);

                if (startUpObj == null)
                {
                    throw new ArgumentNullException(nameof(startUpObj));
                }

                cfgServicesMethod?.Invoke(startUpObj, new object[] { services }); // finally, call the ConfigureServices implemented by the TStartup object
                services.AddSingleton(startUpObj);
            });
        }
    }
}
