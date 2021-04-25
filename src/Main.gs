var TelegramBotToken = "1744480346:AAF3ayS5vhFUDhItGUMAF2n4_2JIyNIJpt4";
var TelegramBotAPI = "https://api.telegram.org/bot" + TelegramBotToken + "/";
var sendAmount = 0;
var isGroup = false;
var isMuted = false;
var isWithAt= false;
var clientID = "";
var messageID = "";
var message = "";
var messageLog = new Array();

var patternArray = {};
patternArray.at = new Array();
patternArray.at.push(new RegExp("@rTrigger_bot"));
patternArray.at.push(new RegExp("你.*为.*(什么|何).*存在"));
patternArray.at.push(new RegExp("((怎么|如何).*爱国)|(爱国.*吗)"));
patternArray.at.push(new RegExp("(怕|畏惧).*吗"));
patternArray.at.push(new RegExp("[死妈]{2}|(鸡|几|寄)(巴|吧|八|把)|操|艹|逼|(草|日)(你|拟|泥).+"));
patternArray.nm = new Array();
patternArray.nm.push(new RegExp("别尬黑"));
patternArray.nm.push(new RegExp("赢"));
patternArray.nm.push(new RegExp("你国"));
patternArray.nm.push(new RegExp("解决问题"));
patternArray.nm.push(new RegExp("自杀|跳楼|上吊"));
patternArray.nm.push(new RegExp("普查"));
patternArray.nm.push(new RegExp("早八|早8"));
patternArray.nm.push(new RegExp("这个人"));
patternArray.nm.push(new RegExp("上海大学"));
patternArray.nm.push(new RegExp("(绷.*住)|(bon不jour了)"));

var intro_keyboard = [
  [{
    "text": "你.*为.*(什么|何).*存在",
    "switch_inline_query_current_chat": "你为什么而存在？",
  }],
  [{
    "text": "((怎么|如何).*爱国)|(爱国.*吗)",
    "switch_inline_query_current_chat": "你是如何去爱国的？",
  }],
  [{
    "text": "(怕|畏惧).*吗",
    "switch_inline_query_current_chat": "你怕死吗？",
  }],
  [{
      "text": "建议不要点🥰",
      "switch_inline_query_current_chat": "赢麻了",
  }]
];

function doPost(e) {
  var info = JSON.parse(e.postData.contents);
  // sendEmail(JSON.stringify(info));

  if ("message" in info) {
    isGroup      = "title" in info.message.chat;
    clientID     = info.message.chat.id;
    messageID    = info.message.message_id;
    message      = info.message.text;
  }
  else if ("callback_query" in info) {
    isGroup    = "title" in info.callback_query.message.chat;
    clientID   = info.callback_query.message.chat.id;
    messageID  = info.callback_query.message.message_id;
    message    = info.callback_query.data;
    meanTransfer(message);
    UrlFetchApp.fetch(TelegramBotAPI + "answerCallbackQuery", info.callback_query.id);
    return;
  }
  else {
    return;
  }
  
  if (patternArray.at[0].test(message)) {
    isWithAt = true;
  }

  meanTransfer(message);
}

function meanTransfer(message) {
  if (new RegExp("/[a-z]+").test(message))
  {
    var command = message.match("/([a-z]{0,10})")[1];
    switch (command) {
      case "intro": {
        sendMessageWithButton("<i>你好！我是吴老师，是一个坚定的爱国者呢。你可以输入符合下面列出的正则表达式的文字与我互动。期待我们今后的友好相处！</i>", intro_keyboard);
      } break;
      case "weather": {
        var adString = message.match("/[a-z]+(.*)")[1];
        var isImmediate = true;
        if (adString == "") {                                      // all params is empty without @
          var shuffle = Math.floor(Math.random()*10);
          if (shuffle < 5) {
            sendMessage(false, "差不多得了，能不能把话说完？");
          } else {
            sendMessage(false, "互联网还是降低了人们说话的成本啊");
          }
          break;
        }
        adString = adString.replace(/^\S*\s*/g, "");
        if (adString == "") {                                      // all params is empty and with an @
          var shuffle = Math.floor(Math.random()*10);
          if (shuffle < 5) {
            sendMessage(false, "你是特地来消遣我的？");
          } else {
            sendMessage(false, "地点呢？地点呢？真就环球同此凉热呗？");
          }
          break;
        }
        var secondCommand = adString.replace(/^\S*\s*/g, "");
        if (secondCommand != "") {                                 // with 2 params
          adString = adString.replace(/\s+\S*/g, "");
          if (secondCommand == "now") {
            isImmediate = true;
          } else if (secondCommand == "all") {
            isImmediate = false;
          } else {
            sendMessage(false, "第二个指令是什么意思？我直接给你查你实时天气吧");
          }
        }
        /*========THEN ASK THE API FOR RESULT========*/
        var result = weatherQuery(adString, isImmediate);
        if (result[0] == -1) {
          var shuffle = Math.floor(Math.random()*10);
          if (shuffle < 5) {
            sendMessage(false, "不知道你说的是哪");
          } else {
            sendMessage(false, "查不到，换个地方试试？");
          }
          break;
        }
        if (result[0] == 0) {
          var ad_keyboard = [];
          for (var i = 1; i < result.length; i++) {
            var button = [{"text": result[i].name, "switch_inline_query_current_chat": "/weather " + result[i].adcode}];
            ad_keyboard.push(button);
          }
          sendMessageWithButton("你说的是哪个" + adString + "？", ad_keyboard);
          break;
        }
        if (result[0] == 1) {
          sendMessage(false, "地名里带" + adString + "的情况太多了，就不能换个词吗？");
          break;
        }
        /*========THEN RETURN WEATHER QUERY RESULT========*/
        if (isImmediate) {
          if (result.length == 0) {
            sendMessage(false, "能不能不要乱发地址码？");
            break;
          }
          var reportResult = "截至发布时间" + result.reporttime + "，" + result.province + result.city + "的实时天气状况如下：\n\n<b>天气现象</b>   " + result.weather +
          "\n<b>气温</b>    " + result.temperature + "℃\n<b>风向</b>    " + result.winddirection + "风，风力" + result.windpower + "级\n<b>相对湿度</b>    " + result.humidity + "%";
          sendMessage(false, reportResult);
          break;
        }
        else {
          if (result.casts.length == 0) {
            sendMessage(false, "能不能不要乱发地址码？");
            break;
          }
          var reportResult = "截至发布时间" + result.reporttime + "，" + result.province + result.city + "的天气状况如下：（日间 - 夜间）";
          for (var i = 0; i < result.casts.length; i++) {
            reportResult += "\n\n" + result.casts[i].date +
            "\n<b>天气现象</b>   " + result.casts[i].dayweather + " - " + result.casts[i].nightweather +
            "\n<b>气温</b>    " + result.casts[i].daytemp + "℃ - " + result.casts[i].nighttemp +
            "℃\n<b>风向</b>    " + result.casts[i].daywind + "风" + result.casts[i].daypower + "级 - " + result.casts[i].nightwind + "风" + result.casts[i].nightpower + "级";
          }
          sendMessage(false, reportResult);
          break;
        }
      }
      case "covid": {
        var result = covid19Query();
        sendMessage(false, "【美国新冠肺炎确诊病例超" + result.confirmW + "万例】根据美国约翰斯·霍普金斯大学于" +
         result.date + "统计的数据，美国新冠肺炎累计确诊病例已超过" + result.confirmW + "万例，达到" +
         result.confirm + "例。累计死亡病例超过" + result.deathW + "万例，达到" + result.death + "例。当日新增确诊病例达到" +
         result.newConfirm + "例，新增死亡病例达到" + result.newDeath + "例。");
      } break;
    }
    return;
  }

  if (!isGroup || isWithAt)
  {
    if (patternArray.at[1].test(message)) {
      meanReplyFull(true, "我是为了杀戮与毁灭而存在的");
    }
    else if (patternArray.at[2].test(message)) {
      meanReplyFull(true, "爱国者的尊严倚靠的不是演说与辩论，而是铁与血！");
    }
    else if (patternArray.at[3].test(message)) {
      meanReplyFull(true, "懦夫才会惧怕战争与死亡，男人是在战斗中炼成的！");
    }
    else if (patternArray.at[4].test(message)) {
      var shuffle = Math.floor(Math.random()*10);
      if (shuffle < 3) {
        meanReplyFull(true, "操你妈");
      }
      else if (shuffle < 4) {
        meanReplyFull(true, "虹桥机场门口单挑！老子这条命豁出去了，艹");
      }
      else if (shuffle < 5) {
        meanReplyFull(true, "本周末学校里可能会发生一起恶性流血事件");
      }
      else if (shuffle < 6) {
        meanReplyFull(true, "我觉得吧，杀点人还是有必要的");
      }
      else if (shuffle < 7) {
        meanReplyFull(true, "我怀疑同志们是来给甩棍打广告的");
      }
      else if (shuffle < 8) {
        meanReplyFull(true, "想死可以来我这报名，我说过不止一次了");
        meanReplyFull(true, "干嘛非躲在屏幕后面扭扭捏捏呢？")
      }
      else if (shuffle < 9) {
        meanReplyFull(true, "妈了个逼，最近气不打一处找来，在宿舍也不好捶桌子");
      }
      else {
        meanReplyFull(true, "我发现双刀太适合我了，回学校要不要整一套来");
      }
    }
  }

  if (patternArray.nm[0].test(message))
  {
    meanReply("别尬黑？");
    meanReply("别尬黑你妈呢");
  }
  if (patternArray.nm[1].test(message))
  {
    meanReply("再赢？赢你妈赢，艹");
    meanReply("傻逼阴阳人");
    meanReply("吃屎长大的");
  }
  if (patternArray.nm[2].test(message)) {
    meanReply("说话带\"你国\"的可以不用管立场直接杀了埋了");
  }
  if (patternArray.nm[3].test(message)) {
    meanReply("比起解决问题，我还是更喜欢解决提出问题的人");
  }
  if (patternArray.nm[4].test(message)) {
    meanReply("反正跟我没关系，又没法早放假，死十个人都与我无关");
  }
  if (patternArray.nm[5].test(message)) {
    meanReply("普查结果比13亿多就从你妈开始杀");
  }
  if (patternArray.nm[6].test(message)) {
    meanReply("早八算个屁的压力啊？又不是吃不上饭");
  }
  if (patternArray.nm[7].test(message)) {
    meanReply("我说，是时候把这人解决了吧？");
  }
  if (patternArray.nm[8].test(message)) {
    meanReply("懂了，开学去上海大学屠城");
  }
  if (patternArray.nm[9].test(message)) {
    meanReply("你再绷？");
    var shuffle = Math.floor(Math.random()*100);
    if (shuffle < 50) {return;}
    meanReply("我是看透你们这帮人了");
    meanReply("打着红旗反红旗");
  }

  var shuffle = Math.floor(Math.random()*100);
  if (isWithAt && sendAmount == 0) {
    if (shuffle < 30) {
      meanReplyFull(true, "你好🤗🤗");
    }
    else if (shuffle < 60) {
      meanReplyFull(true, "你好呀");
    }
    else {
      meanReplyFull(true, "你好");
    }
    return;
  }
  if (shuffle < 25 && sendAmount != 0) {
    meanReply("各位说是不是啊");
  }
}

function meanReply(reply) {
  meanReplyFull(false, reply);
}
function meanReplyFull(isReply, reply) {
  if (isMuted) {
    return;
  }

  var response = sendMessage(isReply, reply);
  messageLog.push(JSON.parse(response).result);
  sendAmount++;

  if (sendAmount == 5)
  {
    deleteMessageList();
    var shuffle = Math.floor(Math.random()*10);
    if (shuffle < 6) {
      sendMessage(false, "抱歉，失态了");
    }
    else {
      sendMessage(false, "管理给我禁个言，让我冷静一下");
    }
    isMuted = true;
  }
}

function sendMessage(isReply, reply) {
  if (isReply && isGroup) {
    var payload = {
      "chat_id": clientID,
      "text": reply,
      "parse_mode": "HTML",
      "reply_to_message_id": messageID
    };
  }
  else {
    var payload = {
      "chat_id": clientID,
      "text": reply,
      "parse_mode": "HTML"
    };
  }
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  
  return UrlFetchApp.fetch(TelegramBotAPI + "sendMessage", options).getContentText();
}

function sendMessageWithButton(reply, keyboard) {
  var payload = {
    "chat_id": clientID,
    "text": reply,
    "parse_mode": "HTML",
    "reply_markup": {
      inline_keyboard: keyboard
    }
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  return UrlFetchApp.fetch(TelegramBotAPI + "sendMessage", options).getContentText();
}

function deleteMessageList() {
  for (var times = 0; times < messageLog.length; times++) {
      var payload = {
        "chat_id": clientID,
        "message_id": messageLog[times].message_id
      };
      var options = {
        "method": "post",
        "contentType": "application/json",
        "payload": JSON.stringify(payload)
      };
      UrlFetchApp.fetch(TelegramBotAPI + "deleteMessage", options);
    }
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}