var amapKey = "baec6630734ffbb1fb4432d4e9e80dd5";
var weatherAddress = "https://restapi.amap.com/v3/weather/weatherInfo?key=";
var adAddress = "https://restapi.amap.com/v3/config/district?key=";
var covidAPIUS = "http://corona-api.com/countries/US";
// var cityCode = [
//   {"name":"北京市", "code": 110000},
//   {"name":"海淀区", "code": 110108},
//   {"name":"房山区", "code": 110111},
//   {"name":"上海市", "code": 310000},
//   {"name":"深圳市", "code": 440300},
//   {"name":"武汉市", "code": 420100},
//   {"name":"重庆市", "code": 500000},
//   {"name":"成都市", "code": 510100},
// ]

function test(){
  var ad = "闵行区";
  var result = weatherQuery(ad, true);
  console.info(result);
  console.info(result[0]);
  // var ad = "朝阳区";
  // console.info(adQuery(ad));
}

function weatherQuery(adString, isImmediate) {
  /*========ABOUT CITY CODE========*/
  var code = -1;
  if (/^\d{6}$/.test(adString)) {
    code = adString;
  }
  else {
    // var target = new RegExp(adString.toString());
    // for (var i in cityCode) {
    //   if (target.test(cityCode[i].name)) {
    //     code = cityCode[i].code;
    //     break;
    //   }
    // }
    var adArray = adQuery(adString);
    if (adArray.length == 1) {
      code = adArray[0].adcode;
    } else if (adArray.length > 5) {
      adArray.unshift(1);
      return adArray;
    } else if (adArray.length > 1) {
      adArray.unshift(0);
      return adArray;
    }
  }
  if (code == -1) {
    return [-1];
  }

  /*========ABOUT QUERY MODE========*/
  var queryMode;
  if (isImmediate) {
    queryMode = "base";
  } else {
    queryMode = "all"
  }

  /*========ABOUT API REQUEST========*/
  var options = weatherAddress + amapKey + "&city=" + code + "&extensions=" + queryMode + "&output=JSON";
  var result = UrlFetchApp.fetch(options).getContentText();

  if (isImmediate) {
    return JSON.parse(result).lives[0];
  } else {
    return JSON.parse(result).forecasts[0];
  }
}

function adQuery(adString) {
  var result = adQueryTodo(adString);
  if (result.length == 1 || result.length > 5) {
    return result;
  }
  /*========IF MORE THAN 1 LESS THAN 6 RESULT========*/
  var adArray = new Array();
  for(var i in result) {
    var province = [{"name": ""}];
    var city = [{"name": ""}];
    if (!/0{4}$/g.test(result[i].adcode)) {
      province = adQueryTodo(result[i].adcode.replace(/\d{4}$/g, "0000"));
    }
    if (!/0{2}$/g.test(result[i].adcode)) {
      city = adQueryTodo(result[i].adcode.replace(/\d{2}$/g, "00"));
    }
    adArray.push({
      "adcode": result[i].adcode,
      "name": province[0].name + city[0].name + result[i].name 
    });
  }
  return adArray;
}
function adQueryTodo(adString) {
  var options = adAddress + amapKey + "&keywords=" + adString + "&subdistrict=0";
  return JSON.parse(UrlFetchApp.fetch(options).getContentText()).districts;
}

function covid19Query() {
  var result = JSON.parse(UrlFetchApp.fetch(covidAPIUS).getContentText());
  var dataSheet = {};
  var date = result.data.updated_at;
  var dateReg = /^\d{4}-0?(\d{1,2})-0?(\d{1,2})T(\d{2}):(\d{2})/g;
  var dateSheet = dateReg.exec(date);
  dataSheet.date = "美国东部时间" + dateSheet[1] + "月" + dateSheet[2] + "日" + dateSheet[3] + "时" + dateSheet[4] + "分";
  dataSheet.death = result.data.latest_data.deaths;
  dataSheet.deathW = JSON.stringify(dataSheet.death).replace(/\d{4}$/g, "");
  dataSheet.confirm = result.data.latest_data.confirmed;
  dataSheet.confirmW = JSON.stringify(dataSheet.confirm).replace(/\d{4}$/g, "");
  dataSheet.newDeath = result.data.today.deaths;
  dataSheet.newConfirm = result.data.today.confirmed;
  console.info(dataSheet);
  return dataSheet;

  // updated_at: '2021-04-24T13:50:29.528Z',today: { deaths: 0, confirmed: 0 }, latest_data: {"deaths":189947,"confirmed":16684985,"recovered":13898510,"critical":2596528,"calculated":{"death_rate":1.1384307507618376,"recovery_rate":83.29950551349012,"recovered_vs_death_ratio":null,"cases_per_million_population":8944}}
  //【美国新冠肺炎确诊病例超3196万例】根据美国约翰斯·霍普金斯大学于美国东部时间4月23日16时20分统计的数据，美国新冠肺炎累计确诊病例已超过3196万例，达到31968306例。累计死亡病例超过57万例，达到570977例。
}
