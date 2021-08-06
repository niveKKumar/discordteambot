const { Client, MessageEmbed, ReactionEmoji, GuildMember } = require("discord.js");
const config = require("./config");
const commands = require("./help");
const { tipps } = require("./tipps");

let bot = new Client({
  // fetchAllMembers: true,
  presence: {
    status: "online",
    activity: {
      name: `${config.prefix}help`,
      type: "COMPETING",
    },
  },
});
bot.destroy();
require("./server")();
bot.login(config.token);

try {
  bot.on("guildMemberAdd", (member) => {
    bot.channels.cache.get("872367130153218078").send(welcomeMessage(member));
  });
  bot.on("guildMemberUpdate", (o, member) => {
    let count = 0;
    member.roles.cache.map(() => count++);
    if (count == 1) {
      var role = member.guild.roles.cache.find((role) => role.name == "Nicht zugewiesen");
      member.roles.add(role);
    } else {
      var role = member.guild.roles.cache.find((role) => role.name == "Nicht zugewiesen");
      member.roles.remove(role);
    }
    bot.channels.cache.get("872095389040398408").send(member.displayName + " Anzahl der Rollen " + count);
  });

  bot.on("ready", () => console.log(`Logged in as ${bot.user.tag}.`));

  bot.on("message", async (message) => {
    // console.log(message);
    // Check for command

    if (message.content.startsWith(config.prefix)) {
      let args = message.content.slice(config.prefix.length).split(" ");
      let command = args.shift().toLowerCase();
      console.log(command);

      switch (command) {
        case "meineInfos":
          getUserInfoAsCard(message);
          break;
        case "welcome":
          bot.channels.cache.get("872367130153218078").send(welcomeMessage(message));
          break;
        case "randomtip":
          const tipp = tipps[Math.floor(Math.random() * tipps.length)];
          message.reply(`\n**${tipp.frage}** \n${tipp.tipp} -${tipp.name}`);

          break;
        case "ping":
          let msg = await message.reply("Pinging...");
          await msg.edit(`PONG! Message round-trip took ${Date.now() - msg.createdTimestamp}ms.`);
          break;

        case "say":
        case "repeat":
          if (args.length > 0) message.channel.send(args.join(" "));
          else message.reply("You did not send a message to repeat, cancelling command.");
          break;

        /* Unless you know what you're doing, don't change this command. */
        case "help":
          let embed = new MessageEmbed()
            .setTitle("HELP MENU")
            .setColor("GREEN")
            .setFooter(
              `Angefordert von: ${message.member ? message.member.displayName : message.author.username}`,
              message.author.displayAvatarURL()
            )
            .setThumbnail(bot.user.displayAvatarURL());
          if (!args[0])
            embed.setDescription(
              Object.keys(commands)
                .map(
                  (command) =>
                    `\`${command.padEnd(
                      Object.keys(commands).reduce((a, b) => (b.length > a.length ? b : a), "").length
                    )}\` :: ${commands[command].description}`
                )
                .join("\n")
            );
          else {
            if (
              Object.keys(commands).includes(args[0].toLowerCase()) ||
              Object.keys(commands)
                .map((c) => commands[c].aliases || [])
                .flat()
                .includes(args[0].toLowerCase())
            ) {
              let command = Object.keys(commands).includes(args[0].toLowerCase())
                ? args[0].toLowerCase()
                : Object.keys(commands).find(
                    (c) => commands[c].aliases && commands[c].aliases.includes(args[0].toLowerCase())
                  );
              embed.setTitle(`COMMAND - ${command}`);

              if (commands[command].aliases)
                embed.addField("Command aliases", `\`${commands[command].aliases.join("`, `")}\``);
              embed
                .addField("BESCHREIBUNG", commands[command].description)
                .addField("FORMAT", `\`\`\`${config.prefix}${commands[command].format}\`\`\``);
            } else {
              embed
                .setColor("RED")
                .setDescription(
                  "This command does not exist. Please use the help command without specifying any commands to list them all."
                );
            }
          }
          message.channel.send(embed);
          break;
        default:
          message.channel.send("Ich weiß nicht was ich sagen soll");
          break;
      }
    } else {
      if (message.channel.type == "dm") {
        message.react("♥️");
      }
    }
  });
} catch (error) {
  message.reply(error.message);
}
function welcomeMessage(message) {
  let user;
  if (message.mentions.users.first()) {
    user = message.mentions.users.first();
  } else {
    user = message.author;
  }
  let member = message.guild.member(user);
  let roles = member.roles.cache.map((roles) => `${roles}`).join(", ");
  return `Willkommen ${member.displayName}, deine Aufgaben sind ${roles}`;
}
function getUserInfoAsCard(message) {
  let user;
  if (message.mentions.users.first()) {
    user = message.mentions.users.first();
  } else {
    user = message.author;
  }

  const member = message.guild.member(user);

  let embed = new MessageEmbed()
    .setColor("RANDOM")
    .setThumbnail(message.author.avatarURL)
    .addField(`${user.tag}`, `${user}`, true)
    .addField("ID:", `${user.id}`, true)
    .addField("Nickname:", `${member.nickname !== null ? `${member.nickname}` : "None"}`, true)
    .addField("Status:", `${user.presence.status}`, true)
    .addField("In Server", message.guild.name, true)
    .addField("Game:", `${user.presence.game ? user.presence.game.name : "None"}`, true)
    .addField("Bot:", `${user.bot}`, true)
    // .addField("Joined The Server On:", `${moment.utc(member.joinedAt).format("dddd, MMMM Do YYYY")}`, true)
    // .addField("Account Created On:", `${moment.utc(user.createdAt).format("dddd, MMMM Do YYYY")}`, true)
    .addField("Roles:", member.roles.cache.map((roles) => `${roles}`).join(", "), true)
    .setFooter(`Replying to ${message.author.username}#${message.author.discriminator}`);
  message.channel.send({ embed });
}
