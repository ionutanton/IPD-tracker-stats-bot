const Discord = require("discord.js");
const {
  prefix,
  // CUSTOM_MESSAGE_CLIMB_DEF,
  // CUSTOM_MESSAGE_DROP_DEF,
  ICON_DEF,
} = require("./settings");
const { token, devhookid, devhooktoken } = require("./secret");
const client = new Discord.Client();
var SHARD = [];
var GUILDS = [];
var GUILD_SETTINGS = [];

client.on("ready", () => {
  var date = new Date();
  logdev(`Logged in as ${client.user.tag} on ${date}`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.startsWith(prefix + "help")) {
    cmd_help(msg);
  }

  if (msg.content.startsWith(prefix + "climb")) {
    // cmd_climb(msg);
  }

  if (msg.content.startsWith(prefix + "drop")) {
    // cmd_drop(msg);
  }

  if (msg.content.startsWith(prefix + "icon")) {
    cmd_icon(msg);
  }

  if (msg.content.startsWith(prefix + "settings")) {
    cmd_settings(msg);
  }

  if (msg.content.startsWith(prefix + "stats")) {
    await cmd_stats(msg);
  }
});

function cmd_help(msg) {
  helptext = "Usage:";
  helptext += "\n```$settings | show current settings```";
  helptext += "\n```$stats #channel days | make stats for #channel that outputs IPD-FOR-ROTBOT for number of days```";
  // helptext += "Experimental:";
  // helptext += "\n```$climb `CUSTOM_MESSAGE_CLIMB` ```";
  // helptext += "\n```$drop `CUSTOM_MESSAGE_DROP` ```";
  helptext += "\n```$icon ICON | Set enemy icon in IPD-FOR-ROTBOT output```";
  log(helptext, msg);
}

function cmd_icon(msg) {
  //set non shard icon
  go = false;
  if (msg.content.length > 7) {
    var arg = msg.content.substring(6, msg.content.length);
    if (arg) {
      var guildid = msg.guild.id;
      var guildindex = GUILDS.indexOf(guildid);
      if (guildindex == -1) {
        initguild(guildid);
        guildindex = GUILDS.indexOf(guildid);
      }

      GUILD_SETTINGS[guildindex].ICON = arg;
      logdev(`Set for guild:${guildid} ICON: ${GUILD_SETTINGS[guildindex].ICON} by author: ${msg.author.tag}`);
      log(`Set \`ICON: ${GUILD_SETTINGS[guildindex].ICON}\``, msg);
      go = true;
    }
  }
  if (!go) {
    log("Usage: \n ```$icon ICON | Set enemy icon id in IPD-FOR-ROTBOT output```", msg);
  }
}

function cmd_settings(msg) {
  // printout settings
  var settings_txt = "Current settings:\n";
  var guildid = msg.guild.id;
  var guildindex = GUILDS.indexOf(guildid);
  if (guildindex = -1) {
    initguild(guildid);
    guildindex = GUILDS.indexOf(guildid);
  }
  // settings_txt += `\`CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}\`\n`;
  // settings_txt += `\`CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}\`\n`;
  settings_txt += `\`GUILDID: ${GUILDS[guildindex]}\`\n`;
  settings_txt += `\`ICON: ${GUILD_SETTINGS[guildindex].ICON}\`\n`;
  log(settings_txt, msg);
  logdev(`$settings command by author: ${msg.author.tag} in guild: ${GUILDS[guildindex]} has icon: ${GUILD_SETTINGS[guildindex].ICON}`);
}

async function cmd_stats(msg) {
  var guildid = msg.guild.id;
  var guildindex = GUILDS.indexOf(guildid);
  if (guildindex = -1) {
    initguild(guildid);
    guildindex = GUILDS.indexOf(guildid);
  }
  // get channelid and number of days as args
  var go = true;
  var args = msg.content.split(` `);
  if (args.length > 2) {
    //check args 2 - channel id, 3 - number of days
    var channelid = args[1].substring(2, args[1].length - 1);
    try {
      const channel = client.channels.cache.get(channelid);
      if (channel) {
        logdev(`Getting data from guildid: ${channel.guild.id} channel name: ${channel.name} author: ${msg.author.tag}`);
      } else {
        log(`$stats needs first argument channel to be channel id (#channel)\nSee $help for usage`, msg);
        go = false;
      }
      const days = args[2];
      if (days) {
        logdev(`Getting number of days: ${days}`);
      } else {
        log(`$stats needs second argument days to be a number\nSee $help for usage`, msg);
        go = false;
      }
      if (go) {
        logdev(`Making stats in guild: ${channel.guild.id} from ${channel.name} for ${days} days author: ${msg.author.tag}`, msg);
        logdev(`ICON: ${GUILD_SETTINGS[guildindex].ICON}`,msg);
        log(`Making stats from ${channel.name} for ${days} days`, msg);
        log(`ICON: ${GUILD_SETTINGS[guildindex].ICON}`,msg);
        try {
          await make_stats(
            msg,
            channel,
            days,
            // GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP,
            // GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB,
            guildindex
          );
        } catch (err) {
          logdev(err);
        }
      }
    } catch (error) {
      logdev(`bad permissions - cannot read channel in guild: ${msg.guild.id} by author: ${msg.author.username}`);
      logdev(error);
      logdm(`bot needs permissions to view all channels, read messages, read message history and send messages in channel that executes command and in IPD-FOR-ROTBOT channel`, msg)
    }


  } else {
    logdev(`bad argument for $stats in guild: ${msg.guild.id} by author: ${msg.author.tag}`)
    log(`$stats needs 2 arguments, first argument channel to be channel id (#channel) and second argument days to be a number\nSee $help for usage`, msg);
  }
}

function log(string, msg) {
  try {
    msg.channel.send(string);
  } catch (err) {
    logdev(err);
    logdm(`bot needs permissions to view all channels, read messages, read message history and send messages in channel that executes command and in IPD-FOR-ROTBOT channel`);
  }
}

function logdm(string, msg) {
  try {
    msg.author.send(string);
  } catch (error) {
    logdev(err);
  }
}

function logdev(string){
  console.log(string);
  const webhook = new Discord.WebhookClient(devhookid, devhooktoken);
  webhook.send(string)
    .catch(console.error);
}

function initguild(guildid) {
  GUILDS.push(guildid);
  var settings = {
    // CUSTOM_MESSAGE_CLIMB: CUSTOM_MESSAGE_CLIMB_DEF,
    // CUSTOM_MESSAGE_DROP: CUSTOM_MESSAGE_DROP_DEF,
    ICON: ICON_DEF,
    SHARD: ``
  };
  GUILD_SETTINGS.push(settings);
  logdev(`Init guildid ${guildid}`);
}

async function make_stats(
  msg,
  channel,
  days,
  guildindex
) {
  //set channel to search msg from
  logdev(`Getting messages from channel ${channel.name}`);

  //Async method - needs async (msg) on function
  let rcv_msg = await lots_of_messages_getter(channel, 2000, days);
  logdev(`Read ${rcv_msg.length} messages`);
  log(`Read ${rcv_msg.length} messages`, msg);

  //parse all messages
  let msg_parsed = parse_all(
    rcv_msg,
  );
  logdev(`Parsed ${msg_parsed.length} climb messages`);
  log(`Parsed ${msg_parsed.length} climb messages`, msg);

  //make stats
  let msg_stats = stats_all(msg_parsed, guildindex);
  logdev(`Names found: ${Object.keys(msg_stats).length}`);
  log(`Names found: ${Object.keys(msg_stats).length}`, msg);
  logdev(`Found shard members: ${GUILD_SETTINGS[guildindex].SHARD.length}`);
  log(`Found shard members: ${GUILD_SETTINGS[guildindex].SHARD.length}`, msg);

  //publish data to console and channel for shard members
  out_msg = 0;
  for (const i in msg_stats) {
    if (GUILD_SETTINGS[guildindex].SHARD.includes(msg_stats[i].name)) {
      var msg_out = ``;
      msg_out += `**${msg_stats[i].name}**\n`;
      msg_out += `Lowest daily rank:             `;
      for (const j in msg_stats[i].Daylow) {
        msg_out += msg_stats[i].Daylow[j] + ` | `;
      }
      msg_out += `Average lowest daily rank: ${msg_stats[i].DaylowAvr.toFixed(2)}\n`;
      msg_out += `Daily dropped by shard member: `;
      for (const j in msg_stats[i].Daydropped) {
        msg_out += msg_stats[i].Daydropped[j] + ` | `;
      }
      msg_out += `Average Daily dropped by shard member: ${msg_stats[i].DaydroppedAvr.toFixed(2)}\n`;
      out_msg +=1;
      console.log(msg_out);
      log(msg_out, msg);
    }
  }
  logdev(`Command complete. Output stats for ${out_msg}`);
  log(`Command complete`,msg);
}

// populate SHARD array with shard names
function get_shard(msg_byNames, guildindex) {
  var SHARD_names = [];
  for (const i in msg_byNames) {
    var msg_list = msg_byNames[i].msg;
    var icon = msg_list[msg_list.length - 1].USER_ICON;
    if (icon != GUILD_SETTINGS[guildindex].ICON) {
      SHARD_names.push(msg_byNames[i].name);
    }
  }
  return SHARD_names;
}

// make statistics for each shard member
function stats_all(msg_parsed, guildindex) {
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
    msg_byNames[index].msg.push(msg_current);
  }

  //sort by date messages grouped by name
  for (const index in names) {
    msg_byNames[index].msg.sort((a, b) => (a.date > b.date ? 1 : -1));
  }

  //get shard mates from list - icon is not :icon id:
  GUILD_SETTINGS[guildindex].SHARD = [];
  GUILD_SETTINGS[guildindex].SHARD = get_shard(msg_byNames, guildindex);

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
            if (GUILD_SETTINGS[guildindex].SHARD.includes(item[j].DROPPED_BY)) {
              Daydropped += 1;
            }
          }
        } else {
          Daylowlist.push(Daylow);
          Daylow = 0;
          Daydroppedlist.push(Daydropped);
          Daydropped = 0;
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

//parse all messages and store only drop data in array
function parse_all(rcv_msg) {
  //parse messages by climb or down message format
  let msg_parsedClimb = [];
  let msg_parsedDrop = [];
  for (const prs_msg in rcv_msg) {
    var toParse = rcv_msg[prs_msg];
    var bool = toParse.content.includes('climbed');
    var bool = !toParse.content.includes('dropped');
    let parsed = parse_msg(toParse, bool);
    if (bool) {
      msg_parsedClimb.push(parsed);
    } else if (!bool) {
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

// parse message from rotbot with regex
function parse_msg(mgs_to_parse, bool) {
  var msg_item = {};
  if (mgs_to_parse.author.bot == true) {
    var parsed = [];
    if (bool) {
      let CLIMB = /(`|<:)(\d{9})(`\||:\d*>)`(.*)`[ ]*climbed[ ]*from[ ]*(\d*)[ ]*to[ ]*(\d*)[.,][ ]*payout[ ]*in[ ]*`(\d{2}:\d{2})`/;
      var parsed = mgs_to_parse.content.split(CLIMB);
    } else {
      let DROP = /(`|<:)(\d{9})(`\||:\d*>)`(.*)`[ ]*dropped[ ]*from[ ]*(\d*)[ ]*to[ ]*(\d*)[.,][ ]*payout[ ]*in[ ]*`(\d{2}:\d{2})`/;
      var parsed = mgs_to_parse.content.split(DROP);
    }
  }
  if (parsed[3]>2) {
    msg_item.USER_ICON = parsed[3].substring(1, parsed[3].length - 1);
  }
  msg_item.ALLY_CODE = parsed[2];
  msg_item.PLAYER_NAME = parsed[4];
  msg_item.PREVIOUS_RANK = parsed[5];
  msg_item.CURRENT_RANK = parsed[6];
  msg_item.TIME_TO_PO = parsed[7];
  msg_item.date = mgs_to_parse.createdAt;
  return msg_item;
}

//read messages from discord until limit or date - x days whichever is first
async function lots_of_messages_getter(channel, limit, days) {
  var sum_messages = [];
  var sum_messages_trimmed = [];
  let last_id;

  // current timestamp in milliseconds
  let ts = Date.now();
  let date_ob = new Date(ts);
  logdev(`Current date ${date_ob}`);
  var ago = new Date();
  var tempdate = ago.getDate() - days;
  ago.setDate(tempdate);
  logdev(`${days} days ago date ${ago}`);

  while (true) {
    const options = { limit: 100 };
    if (last_id) {
      options.before = last_id;
    }

    const messages = await channel.messages.fetch(options);
    logdev(
      `Received batch of ${messages.size} messages, lastID ${last_id}`
    );
    sum_messages.push(...messages.array());

    last_msg = messages.last();
    last_id = last_msg.id;
    var date_msg = last_msg.createdAt;

    logdev(`Last msg date ${date_msg}`);

    if (date_msg < ago) {
      break;
    }

    if (messages.size != 100 || sum_messages.length >= limit) {
      break;
    }
  }
  logdev(`Received total of ${sum_messages.length}`);

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
  logdev(`Trimmed total of ${sum_messages_trimmed.length}`);
  return sum_messages_trimmed;
}

//login token for discord
client.login(token);
