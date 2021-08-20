using Microsoft.Extensions.DependencyInjection;
using Spoofy.Extensions;

namespace Spoofy.DiscordHost
{
    public interface IDiscordStartup
    {
        void ConfigureServices(IServiceCollection services);
        void Configure(IDiscordClientBuilder client);
    }
}
