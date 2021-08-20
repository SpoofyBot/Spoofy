using System.Threading.Tasks;
using DSharpPlus.SlashCommands;

namespace Spoofy.Modules
{
    [SlashCommandGroup("spotify", "Spotify controls")]
    public class SpotifyModule : ApplicationCommandModule
    {
        [SlashCommand("play", "Play a spotify track or playlist")]
        public async Task Play(InteractionContext ctx, [Option("link", "Playlist or Track share link")] string link)
        {
            //await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, new DiscordInteractionResponseBuilder().WithContent(link));
        }

        [SlashCommand("pause", "Pause the current track")]
        public async Task Pause(InteractionContext ctx)
        {
            //await ctx.CreateResponseAsync(InteractionResponseType.ChannelMessageWithSource, new DiscordInteractionResponseBuilder().WithContent("Paused"));
        }

        [SlashCommand("skip", "Skip current track")]
        public async Task Skip(InteractionContext ctx)
        {

        }
    }
}
