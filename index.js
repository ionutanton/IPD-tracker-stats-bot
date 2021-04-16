const Discord = require("discord.js");
const {
  prefix,
  CUSTOM_MESSAGE_CLIMB_DEF,
  CUSTOM_MESSAGE_DROP_DEF,
  ICON_DEF,
} = require("./settings");
const { token } = require("./secret");
const client = new Discord.Client();
var SHARD = [];
var GUILDS = [];
var GUILD_SETTINGS = [];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith(prefix + "help")) {
    helptext = "Usage:";
    helptext += "\n```$climb `CUSTOM_MESSAGE_CLIMB` ```";
    helptext += "\n```$drop `CUSTOM_MESSAGE_DROP` ```";
    helptext += "\n```$icon `ICON` ```";
    helptext += "\n```$settings```";
    helptext += "\n```$stats #channel days```";
    msg.channel.send(helptext);
  }

  if (msg.content.startsWith(prefix + "climb")) {
    //set climb message
    go = false;
    if (msg.content.length > 8) {
      var arg = msg.content.substring(8, msg.content.length - 1);
      if (arg) {
        var guildid = msg.guild.id;
        var guildindex = GUILDS.indexOf(guildid);
        if (guildindex == -1) {
          initguild(guildid);
          guildindex = GUILDS.indexOf(guildid);
        }

        GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB = arg;
        console.log(
          `Set for guild:${guildid} CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}`
        );
        msg.channel.send(
          `Set \`CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}\``
        );
        go = true;
      }
    }
    if (!go) {
      msg.channel.send("Usage: \n ```$climb `CUSTOM_MESSAGE_CLIMB` ```");
    }
  }

  if (msg.content.startsWith(prefix + "drop")) {
    //set drop message
    var go = false;
    if (msg.content.length > 7) {
      var arg = msg.content.substring(7, msg.content.length - 1);
      if (arg) {
        var guildid = msg.guild.id;
        var guildindex = GUILDS.indexOf(guildid);
        if (guildindex == -1) {
          initguild(guildid);
          guildindex = GUILDS.indexOf(guildid);
        }

        GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP = arg;
        console.log(
          `Set for guild:${guildid} CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}`
        );
        msg.channel.send(
          `Set \`CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}\``
        );
        go = true;
      }
    }
    if (!go) {
      msg.channel.send("Usage: \n ```$drop `CUSTOM_MESSAGE_DROP` ```");
    }
  }

  if (msg.content.startsWith(prefix + "icon")) {
    //set non shard icon
    go = false;
    if (msg.content.length > 7) {
      var arg = msg.content.substring(7, msg.content.length - 1);
      if (arg) {
        var guildid = msg.guild.id;
        var guildindex = GUILDS.indexOf(guildid);
        if (guildindex == -1) {
          initguild(guildid);
          guildindex = GUILDS.indexOf(guildid);
        }

        GUILD_SETTINGS[guildindex].ICON = arg;
        console.log(
          `Set for guild:${guildid} ICON: ${GUILD_SETTINGS[guildindex].ICON}`
        );
        msg.channel.send(`Set \`ICON: ${GUILD_SETTINGS[guildindex].ICON}\``);
        go = true;
      }
    }
    if (!go) {
      msg.channel.send("Usage: \n ```$icon `ICON` ```");
    }
  }

  if (msg.content.startsWith(prefix + "settings")) {
    var settings_txt = "Current settings:\n";
    var guildid = msg.guild.id;
    var guildindex = GUILDS.indexOf(guildid);
    if (guildindex = -1) {
      initguild(guildid);
      guildindex = GUILDS.indexOf(guildid);
    }
    settings_txt += `\`CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}\`\n`;
    settings_txt += `\`CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}\`\n`;
    settings_txt += `\`ICON: ${GUILD_SETTINGS[guildindex].ICON}\`\n`;
    msg.channel.send(settings_txt);
  }

  if (msg.content.startsWith(prefix + "stats")) {
    var settings_txt = "Current settings:\n";
    var guildid = msg.guild.id;
    var guildindex = GUILDS.indexOf(guildid);
    if (guildindex != -1) {
      initguild(guildid);
      guildindex = GUILDS.indexOf(guildid);
    }
    // get channelid and number of days as args
    var go = true;
    var args = msg.content.split(` `);
    //check args 2 - channel id, 3 - number of days
    var channelid = args[1].substring(2, args[1].length - 1);
    const channel = client.channels.cache.get(channelid);
    if (channel) {
      console.log(
        `Getting data from guildid: ${channel.guild.id} channel name: ${channel.name}`
      );
    } else {
      msg.channel.send(
        `$stats needs first argument channel to be channel id (#channel)\nSee $help for usage`
      );
      go = false;
    }
    const days = args[2];
    if (days) {
      console.log(`Getting number of days: ${days}`);
    } else {
      msg.channel.send(
        `$stats needs second rgument days to be a number\nSee $help for usage`
      );
      go = false;
    }
    if (go) {
      await make_stats(
        msg,
        channel,
        days,
        GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP,
        GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB,
        GUILD_SETTINGS[guildindex].ICON
      );
    }
  }
});

function initguild(guildid) {
  GUILDS.push(guildid);
  var settings = {
    CUSTOM_MESSAGE_CLIMB: CUSTOM_MESSAGE_CLIMB_DEF,
    CUSTOM_MESSAGE_DROP: CUSTOM_MESSAGE_DROP_DEF,
    ICON: ICON_DEF,
  };
  GUILD_SETTINGS.push(settings);
}

async function make_stats(
  msg,
  channel,
  days,
  CUSTOM_MESSAGE_DROP,
  CUSTOM_MESSAGE_CLIMB,
  ICON
) {
  //set channel to search msg from
  // const channel = client.channels.cache.get(channelid);
  console.log(`Getting channel id: ${channel}`);

  //Async method - needs async (msg) on function
  let rcv_msg = await lots_of_messages_getter(channel, 2000, days);
  console.log(`Read ${rcv_msg.length} messages`);
  msg.channel.send(`Read ${rcv_msg.length} messages`);

  //parse all messages
  let msg_parsed = parse_all(
    rcv_msg,
    CUSTOM_MESSAGE_DROP,
    CUSTOM_MESSAGE_CLIMB
  );
  console.log(`Parsed ${msg_parsed.length} climb messages`);
  msg.channel.send(`Parsed ${msg_parsed.length} climb messages`);

  //make stats
  let msg_stats = stats_all(msg_parsed, ICON);
  console.log(`Names found: ${Object.keys(msg_stats).length}`);
  msg.channel.send(`Names found: ${Object.keys(msg_stats).length}`);

  //publish data to console and channel for shard members
  for (const i in msg_stats) {
    if (SHARD.includes(msg_stats[i].name)) {
      var msg_out = ``;
      msg_out += `**${msg_stats[i].name}**\n`;
      msg_out += `Lowest daily rank:             `;
      for (const j in msg_stats[i].Daylow) {
        msg_out += msg_stats[i].Daylow[j] + ` | `;
      }
      msg_out += `Average lowest daily rank: ${msg_stats[i].DaylowAvr.toFixed(
        2
      )}\n`;

      msg_out += `Daily dropped by shard member: `;
      for (const j in msg_stats[i].Daydropped) {
        msg_out += msg_stats[i].Daydropped[j] + ` | `;
      }
      msg_out += `Average Daily dropped by shard member: ${msg_stats[
        i
      ].DaydroppedAvr.toFixed(2)}\n`;

      console.log(msg_out);
      msg.channel.send(msg_out);
    }
  }
}

// populate SHARD array with shard names
function get_shard(msg_byNames, ICON) {
  var SHARD_names = [];
  // var names = Object.keys(msg_byNames);
  // names.forEach((element) => {
  for (const i in msg_byNames) {
    var msg_list = msg_byNames[i].msg;
    var icon = msg_list[msg_list.length - 1].USER_ICON;
    if (icon != ICON) {
      SHARD_names.push(msg_byNames[i].name);
    }
  }
  // });
  return SHARD_names;
}

// make statistics for each shard member
function stats_all(msg_parsed, ICON) {
  //sort bynames
  var msg_byNames = [];
  var names = [];
  for (const item in msg_parsed) {
    var msg_current = msg_parsed[item];
    var index = names.indexOf(msg_current.PLAYER_NAME);
    if (index == -1) {
      names.push(msg_current.PLAYER_NAME);
      index = names.indexOf(msg_current.PLAYER_NAME);
      msg_byNames[index] = {
        name: "",
        msg: [],
        Daylow: [],
        Daydropped: [],
        DaylowAvr: 0,
        DaydroppedAvr: 0,
      };
      msg_byNames[index].name = msg_current.PLAYER_NAME;
    }
    msg_byNames[index].msg.push(msg_current); // array
  }

  //sort by date messages grouped by name
  for (const index in names) {
    msg_byNames[index].msg.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  //get shard mates from list - icon is not :skull:
  SHARD = get_shard(msg_byNames, ICON);

  //find when PO last < PO current, count daylylow and daylydropped
  for (const i in msg_byNames) {
    var Daylow = 0;
    var Daydropped = 0;
    var Daylowlist = [];
    var Daydroppedlist = [];
    for (const j in msg_byNames[i].msg) {
      var item = msg_byNames[i].msg;
      if (j > 0) {
        var curr_time = format_time(item[j].TIME_TO_PO);
        var last_time = format_time(item[j - 1].TIME_TO_PO);
        if (curr_time < last_time) {
          if (Daylow < Number(item[j].CURRENT_RANK)) {
            Daylow = Number(item[j].CURRENT_RANK);
            if (SHARD.includes(item[j].DROPPED_BY)) {
              Daydropped += 1;
            }
          }
        } else {
          Daylowlist.push(Daylow);
          Daylow = Number(item[j].CURRENT_RANK);
          Daydroppedlist.push(Daydropped);
          Daydroped = 0;
        }
      } else {
        Daylow = Number(item[j].CURRENT_RANK);
        if (SHARD.includes(item[j].DROPPED_BY)) {
          Daydropped += 1;
        }
      }
    }
    Daylowlist.push(Daylow);
    Daydroppedlist.push(Daydropped);
    msg_byNames[i].Daylow.push(...Daylowlist);
    msg_byNames[i].Daydropped.push(...Daydroppedlist);
  }

  // make average from day low and day dropped
  for (const i in msg_byNames) {
    var DaylowAvr = 0;
    var count = 0;
    for (const j in msg_byNames[i].Daylow) {
      DaylowAvr += Number(msg_byNames[i].Daylow[j]);
      count = j;
    }
    DaylowAvr = DaylowAvr / count;
    msg_byNames[i].DaylowAvr = DaylowAvr;

    var DaydroppedAvr = 0;
    var count = 0;
    for (const j in msg_byNames[i].Daydropped) {
      DaydroppedAvr += Number(msg_byNames[i].Daydropped[j]);
      count = j;
    }
    DaydroppedAvr = DaydroppedAvr / count;
    msg_byNames[i].DaydroppedAvr = DaydroppedAvr;
    var DaydroppedAvr = 0;
  }

  return msg_byNames;
}

// format time HH:MM to minutes for compare
function format_time(time) {
  var timesplit = time.split(":");
  var timemin = Number(timesplit[0]) * 60 + Number(timesplit[1]);
  return timemin;
}

// parse all messages and store only drop data in an array
function parse_all(rcv_msg, CUSTOM_MESSAGE_DROP, CUSTOM_MESSAGE_CLIMB) {
  //init parsing splitters by messages for climb or drop
  var myRe = new RegExp("%", "g");
  var splitByClimb = CUSTOM_MESSAGE_CLIMB.split(myRe);
  var splitByDrop = CUSTOM_MESSAGE_DROP.split(myRe);

  //parse messages by climb or down message format
  let msg_parsedClimb = [];
  let msg_parsedDrop = [];
  for (const prs_msg in rcv_msg) {
    var toParse = rcv_msg[prs_msg];
    var parse_climb = toParse.content.includes(splitByClimb[0]);
    var parse_drop = toParse.content.includes(splitByDrop[0]);
    if (parse_climb) {
      let parsed = parse_msg(toParse, splitByClimb);
      msg_parsedClimb.push(parsed);
    } else if (parse_drop) {
      let parsed = parse_msg(toParse, splitByDrop);
      msg_parsedDrop.push(parsed);
    }
  }

  // get who dropped each name from climb array
  for (const prs_msg in msg_parsedDrop) {
    var msg_drop = msg_parsedDrop[prs_msg];
    var coeff = 1000 * 60 * 5;
    var drop_date = msg_drop.date;
    var drop_date = new Date(Math.round(drop_date.getTime() / coeff) * coeff);
    var drop_PREVIOUS_RANK = msg_drop.PREVIOUS_RANK;
    for (var i = 0; i < msg_parsedClimb.length; i++) {
      var msg_climb = msg_parsedClimb[i];
      var climb_date = msg_climb.date;
      var climb_date = new Date(
        Math.round(climb_date.getTime() / coeff) * coeff
      );
      var climb_CURRENT_RANK = msg_climb.CURRENT_RANK;
      var date = climb_date.getTime() == drop_date.getTime() ? true : false;
      var rank = climb_CURRENT_RANK == drop_PREVIOUS_RANK ? true : false;
      if (date && rank) {
        msg_parsedDrop[prs_msg].DROPPED_BY = msg_climb.PLAYER_NAME;
        break;
      }
    }
  }
  return msg_parsedDrop;
}

// parse messages by splitter
function parse_msg(mgs_to_parse, splitBy) {
  var msg_item = {};
  if (mgs_to_parse.author.bot == true) {
    var parsed = [];
    var parsed_names = [];
    var toSplit = mgs_to_parse.content;
    for (const splitter in splitBy) {
      var split_part = toSplit.split(splitBy[splitter]);

      if (split_part.length > 1) {
        if (splitter > 0) {
          parsed.push(split_part[0]);
        }
        toSplit = split_part[1];
      } else {
        toSplit = split_part[0];
        parsed_names.push(splitBy[splitter]);
      }
    }
  }
  for (const item in parsed) {
    msg_item[parsed_names[item]] = parsed[item];
  }
  msg_item.date = mgs_to_parse.createdAt;
  return msg_item;
}

// read 100 messages from discord - obsolete
function read_one_hundred() {
  // Direct method
  channel.messages.fetch({ limit: 100 }).then((messages) => {
    console.log(`Received ${messages.size} messages`);
    //Iterate through the messages here with the variable "messages".
    messages.forEach((message) =>
      console.log(message.createdAt + message.content)
    );
    msg.channel.send(`Read ${messages.size} messages`);
  });
}

//read messages from discord until limit or date - x days whichever is first
async function lots_of_messages_getter(channel, limit, days) {
  var sum_messages = [];
  var sum_messages_trimmed = [];
  let last_id;

  // current timestamp in milliseconds
  let ts = Date.now();
  let date_ob = new Date(ts);
  console.log(`Current date ${date_ob}`);
  var ago = new Date();
  var tempdate = ago.getDate() - days;
  ago.setDate(tempdate);
  console.log(`${days} days ago date ${ago}`);

  while (true) {
    const options = { limit: 100 };
    if (last_id) {
      options.before = last_id;
    }

    const messages = await channel.messages.fetch(options);
    console.log(
      `Received batch of ${messages.size} messages, lastID ${last_id}`
    );
    sum_messages.push(...messages.array());

    last_msg = messages.last();
    last_id = last_msg.id;
    var date_msg = last_msg.createdAt;

    console.log(`Last msg date ${date_msg}`);

    if (date_msg < ago) {
      break;
    }

    if (messages.size != 100 || sum_messages.length >= limit) {
      break;
    }
  }
  console.log(`Received total of ${sum_messages.length}`);

  // remove messages that have date < ago
  for (var i = 0; i < sum_messages.length; i++) {
    if (i > Math.floor(sum_messages.length / 100 - 1) * 100) {
      var date_cmp = sum_messages[i].createdAt;
      if (date_cmp > ago) {
        sum_messages_trimmed.push(sum_messages[i]);
      }
    } else {
      sum_messages_trimmed.push(sum_messages[i]);
    }
  }
  console.log(`Trimmed total of ${sum_messages_trimmed.length}`);
  return sum_messages_trimmed;
}

//login token for discord
client.login(token);
