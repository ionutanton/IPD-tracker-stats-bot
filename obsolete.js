// obsolete

// not used
function cmd_drop(msg) {
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
        console.log(`Set for guild:${guildid} CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}`);
        log(`Set \`CUSTOM_MESSAGE_DROP: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_DROP}\``,msg);
        go = true;
      }
    }
    if (!go) {
      log("Usage: \n ```$drop `CUSTOM_MESSAGE_DROP` ```",msg);
    }
}

// not used
function cmd_climb(msg) {
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
      console.log(`Set for guild:${guildid} CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}`);
      log(`Set \`CUSTOM_MESSAGE_CLIMB: ${GUILD_SETTINGS[guildindex].CUSTOM_MESSAGE_CLIMB}\``, msg);
      go = true;
    }
  }
  if (!go) {
    log("Usage: \n ```$climb `CUSTOM_MESSAGE_CLIMB` ```", msg);
  }
}

// parse all messages and store only drop data in an array
function parse_all_custom(rcv_msg, CUSTOM_MESSAGE_DROP, CUSTOM_MESSAGE_CLIMB) {
    //init parsing splitters by messages for climb or drop
    var myRe = new RegExp("%", "g");
    var splitByClimb = CUSTOM_MESSAGE_CLIMB.split(myRe);
    var splitByDrop = CUSTOM_MESSAGE_DROP.split(myRe);
  
    if (splitByClimb[0] == "") { splitByClimb.shift(); }
    for (const i in splitByClimb) {
      if (splitByClimb[i] == "") {
        splitByClimb.splice(i, 1);
      }
    }
  
    if (splitByDrop[0] == "") { splitByDrop.shift(); }
    for (const i in splitByDrop) {
      if (splitByDrop[i] == "") {
        splitByDrop.splice(i, 1);
      }
    }
  
    var splitclimbsearch = 0;
    for (const i in splitByClimb) {
      if (splitByClimb[i] != `` && splitByClimb[i] != `USER_ICON` && splitByClimb[i] != `PLAYER_NAME` && splitByClimb[i] != `PREVIOUS_RANK` && splitByClimb[i] != `CURRENT_RANK` && splitByClimb[i] != `TIME_TO_PO` && splitByClimb[i] != "`" && splitByClimb[i] != "``") {
        splitclimbsearch = i;
        break;
      }
    }
    var splitdropsearch = 0;
    for (const i in splitByDrop) {
      if (splitByDrop[i] != `` && splitByDrop[i] != `USER_ICON` && splitByDrop[i] != `PLAYER_NAME` && splitByDrop[i] != `PREVIOUS_RANK` && splitByDrop[i] != `CURRENT_RANK` && splitByDrop[i] != `TIME_TO_PO` && splitByDrop[i] != "`" && splitByDrop[i] != "``") {
        splitdropsearch = i;
        break;
      }
    }
    //parse messages by climb or down message format
    let msg_parsedClimb = [];
    let msg_parsedDrop = [];
    for (const prs_msg in rcv_msg) {
      var toParse = rcv_msg[prs_msg];
      var parse_climb = toParse.content.includes(splitByClimb[splitclimbsearch]);
      var parse_drop = toParse.content.includes(splitByDrop[splitdropsearch]);
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
  
  // obsolete
  // parse messages by splitter
  function parse_msg_bysplitter(mgs_to_parse, splitBy) {
    var msg_item = {};
    if (mgs_to_parse.author.bot == true) {
      var parsed = [];
      var parsed_names = [];
      var toSplitlist = mgs_to_parse.content.split("`");
      var toSplit = toSplitlist.join("");
      // #TODO - split message by  ` returns a larger list than needed. just need the first item in split list. rest needs to rejoin.
      for (const splitter in splitBy) {
        var split_part = toSplit.split(splitBy[splitter]);
  
        if (split_part.length > 1) {
          if (splitter > 0) {
            parsed.push(split_part[0]);
          }
          split_part.shift();
          toSplit = split_part.join("");
          //toSplit = split_part[1];
        } else {
          //toSplit = split_part[0];
          toSplit = split_part.join("");
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
  function read_one_hundred(msg) {
    // Direct method
    channel.messages.fetch({ limit: 100 }).then((messages) => {
      console.log(`Received ${messages.size} messages`);
      //Iterate through the messages here with the variable "messages".
      messages.forEach((message) =>
        console.log(message.createdAt + message.content)
      );
      log(`Read ${messages.size} messages`, msg);
    });
  }