using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Spoofy.Extensions;

namespace Spoofy
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            await host.RunAsync();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseDiscord<Startup>()
                .ConfigureLogging((hostContext, configLogging) => { })
                .UseConsoleLifetime();

    }
}
