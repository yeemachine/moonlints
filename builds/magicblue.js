//MagicBlue Bluetooth LED Controller V.1.0.2
//https://github.com/yeemachine
(a => {
  
//Private Property ---------------------------------------------------
  
  //Bluetooth Hexcodes
   const DICT = {
    //BLE Services/Characteristics
    service_lightcontrol:0xffe5,
    char_lightcontrol:0xffe9,
    service_lightnotif:0xffe0,
    char_lightnotif: 0xffe4,
    //Request Notification
    request_status: [0xef, 0x01, 0x77],
    request_schedule:[0x24, 0x2a, 0x2b, 0x42],
    //Status Decode
    status_header:0x66,
    status_lightOn:0x23,
    status_lightOff:0x24,
    //Schedule Decode/Encode
    schedule_decode_header:0x25,
    schedule_decode_footer:[0x00, 0x52],
    schedule_encode_header:0x23,
    schedule_encode_footer:[0x00, 0x32],
    schedule_active_header:0xf0,
    schedule_active_footer:0xf0,
    schedule_inactive_header:0x0f,
    schedule_inactive_footer:0x0f,
    weekList:{
      sunday:0x80,
      monday:0x02,
      tuesday:0x04,
      wednesday:0x08,
      thursday:0x10,
      friday:0x20,
      saturday:0x40
    },
    weekday:0x3e,
    weekend:0xc0,
    everyday:0xfe,
    mode_sunrise:0xa1,
    mode_sunset:0xa2,
    mode_rgb:0x41,
    //Turn On/Off
    action_lightOn:[0xcc, 0x23, 0x33],
    action_lightOff:[0xcc, 0x24, 0x33],
    //Set Color
    setColorHeader:0x56,
    setColorRGBFooter:[0xf0, 0xaa],
    setColorWWFooter:[0x0f, 0xaa],
    //Set Preset
    presetHeader:0xbb,
    presetFooter:[0x44, 0x0A, 0x150722],
    v1Presets:{
      turnOff:0x0f,
      turnOn:0xf0
    },
    presetList:{
      seven_color_cross_fade:0x25,
      red_gradual_change:0x26,
      green_gradual_change:0x27,
      blue_gradual_change:0x28,
      yellow_gradual_change:0x29,
      cyan_gradual_change:0x2a,
      purple_gradual_change:0x2b,
      white_gradual_change:0x2c ,
      red_green_cross_fade:0x2d,
      red_blue_cross_fade:0x2e,
      green_blue_cross_fade:0x2f,
      seven_color_stobe_flash:0x30,
      red_strobe_flash:0x31 ,
      green_strobe_flash:0x32,
      blue_strobe_flash:0x33,
      yellow_strobe_flash:0x34,
      cyan_strobe_flash:0x35,
      purple_strobe_flash:0x36,
      white_strobe_flash:0x37,
      seven_color_jumping_change:0x38
    }
  },
  logBreaker = '-------------------------',
  //Library Event Handler
  eventHandler = (() => {
    let __sym = Symbol('eClass');
    class eClass {
      constructor() {
        this[__sym] = {};
      }
      on(event, callback) {
        this[__sym][event] = { callback: callback }
      }
      connecting(deviceName) {
        let event = this[__sym].connecting;
        if (event && event.callback) {
            event.callback(deviceName);
        }
      }
      connected(deviceName) {
        let event = this[__sym].connected;
        if (event && event.callback) {
            event.callback(deviceName);
        }
      }
      disconnected(deviceName) {
        let event = this[__sym].disconnected;
        if (event && event.callback) {
          event.callback(deviceName);
        }
      }
      receiveNotif(deviceName,type) {
        let event = this[__sym].receiveNotif;
        if (event && event.callback) {
          event.callback({
            'device':deviceName,
            'type':type
          });
        }
      }
    }
    return eClass;
  })();   
  let readBuffer = [], //Current Buffer Store from Notification
  event = new eventHandler()
  
//Public Property ---------------------------------------------------
  
  a.dict = DICT; //Copy of Bluetooth Hexcodes
  a.devices = {}; //Object of Connected Devices
  a.chars = {}; //Object of Connected Characteristics
  a.status = {}; //Object of all Device Statuses
  a.schedule = {}; //Object of all Device Schedules
  a.reconnect = false; //Option to Reconnect after being Disconnected
  a.DEBUG=false; // Enable/Disable console logging

//Private Method ---------------------------------------------------
  
  //Helper Functions
  const log = function(){
    if(a.DEBUG){
      console.log.apply(console, arguments);
    }
  },
  getKeyByValue = (object,value) => {
    return Object.keys(object).find(key => object[key] === value);
  },
  subset = (arr,target) => {
    let result = []
    const recursiveSum = (numbers,target,partial) => {
      let s, n, remaining;
      partial = partial || [];
      s = partial.reduce((a,b) => {
        return a + b;
      }, 0);
      if (s === target) {
        result = partial
      }
      if(s >= target){
        return
      }
      numbers.forEach((element,i) => {
        n = element
        remaining = numbers.slice(i+1);
        recursiveSum(remaining,target,[...partial,n]);
      })
    }
    recursiveSum(arr,target);
    return result
  },
  waitFor = (ms) => new Promise(r => setTimeout(r,ms)),
  asyncForEach = async(arr,callback) => {
    for (let i = 0; i < arr.length; i++) {
      await callback(arr[i],i,arr);
    }
  },
  returnArray = (e,defVal) => {
    e = (typeof e !== 'undefined') ? e : defVal
    e = (Array.isArray(e)) ? e : [e]
    return e
  },
  //Connecting + Decoding + Encoding Bluetooth
  connect = (device) => {
    const toTry = () => {
      event.connecting(device.name.trim()); 
      return device.gatt.connect()
    },
    success = (server) => {
      device.addEventListener('gattserverdisconnected', onDisconnected);
      onConnected(server)
    },
    fail = () => {
      log('Connection Failed.')
    };
    exponentialBackoff(3,2,toTry,success,fail)
  },
  //Retry Connection on Fail
  exponentialBackoff = (max,delay,toTry,success,fail) => {
    toTry().then(result => success(result))
    .catch(error => {
      log(error)
      if (max === 0) {
        return fail();
      }
      log('Retrying in ' + delay + 's... (' + max + ' tries left)');
      setTimeout(() => {
        exponentialBackoff(--max, delay * 2, toTry, success, fail);
      }, delay * 1000);
    });
  },
  //On Device Notif and Characteristics Connected      
  onConnected = (server) => {
    return (getNotif(server))
    .then(() => {
      return getChar(server)
    })
    .then(ch => {
      let deviceName = ch.service.device.name.trim()
      return event.connected(deviceName);   
    })
    .catch(error => {
    log('Argh! ' + error);
    }); 
  },
  //On Device Disconnected     
  onDisconnected = (device) => {
    let deviceName = device.target.name.trim()
    let deviceObj = a.devices[deviceName]
    log('> '+ deviceName+' disconnected');
    let objs = ['devices','chars','status','schedule']
    objs.forEach((e,i) => {
      delete a[e][deviceName]
    })
    event.disconnected(deviceName)
    if (a.reconnect === true){
      connect(deviceObj)
    }
    return 
  },  
  //Setup Notification with Bulb
  getNotif = (server) => {
    return (server.getPrimaryService(DICT.service_lightnotif))
    .then(service =>{
      return service.getCharacteristic(DICT.char_lightnotif)
    })
    .then(ch => {
      ch.addEventListener('characteristicvaluechanged', chValChanged);
      return ch;
    })
    .then(ch => {
      return ch.startNotifications() 
    })
    .catch(error => {
      log('Notification not set ' + error);
    });
  },
  //Return Bluetooth Characteristics
  getChar = (server) => {
    return (server.getPrimaryService(DICT.service_lightcontrol))
    .then(service => {
      return service.getCharacteristic(DICT.char_lightcontrol)
    })
    .then(ch => {
      let deviceName = ch.service.device.name.trim()
      if (!Object.values(a.devices).includes(deviceName)) {
        a.devices[deviceName]=ch.service.device
        a.chars[deviceName]=ch
      }
      return ch
    })
  },
  //Handle Received Notifications (Received in 20 byte chunks)      
  chValChanged = (e) => {
    let deviceName = e.target.service.device.name.trim()
    let value = e.target.value
    let firstValue = value.getUint8(0)
    ///Returns General Status    
    if(firstValue===DICT.status_header && value.byteLength < 20){
      log('【'+deviceName+'--STATUS】')
      readBuffer = Array.from(new Uint8Array(value.buffer))
      decodeStatus(readBuffer,deviceName);
      event.receiveNotif(deviceName,'status')
      return
    }
    /// Load Timer Schedule - Consolidate Buffer (20 bytelength ea)
    else if(firstValue===DICT.schedule_decode_header && value.byteLength === 20){
      readBuffer = Array.from(new Uint8Array(value.buffer))
    }else{
      readBuffer = [...readBuffer, ...Array.from(new Uint8Array(value.buffer))]
    }
    /// Returns Timer Schedule - Finished Loading (87 bytes total)
    if(readBuffer[0]===DICT.schedule_decode_header && readBuffer.length === 87){
      log('【'+deviceName+'--SCHEDULE】')
      decodeSchedule(readBuffer,deviceName);
      event.receiveNotif(deviceName,'schedule')
      return
    }
  },
  // Decode Device Status
  decodeStatus = (buffer,deviceName) => { 
    let deviceStatus = a.status[deviceName] = {},
    power = deviceStatus.on = (buffer[2] === DICT['status_lightOn']) ? true : false,
    mode = deviceStatus.mode = buffer[3] === DICT.mode_sunrise ? 'sunrise'
              : (Object.values(DICT.presetList).includes(buffer[3])) ? 'effect'
              : (buffer[9]/255  > 0) ? 'white' 
              : 'rgb',
    rgb = deviceStatus.rgb = (mode === 'rgb') ? [buffer[6],buffer[7],buffer[8]] : null,
    white = deviceStatus.white = (mode === 'white') ? buffer[9] : null,
    effect = deviceStatus.effect = (mode === 'effect') ? (getKeyByValue(DICT.presetList,buffer[3])) : null,
    speed = deviceStatus.speed = (mode === 'effect') ? buffer[5] : null,
    version = deviceStatus.version = buffer[10]
    
    log('Light is '+power+'. Mode:'+mode)
    if(mode === 'white'){
      log('White Brightness:'+Math.round(white/255*100)+'%')
    }else if(mode === 'effect'){
      log('Effect:'+effect+', Speed:'+speed)
    }else if(mode === 'rgb'){
      log('RGB:('+rgb.join(',')+')')
    }
  },
  //Decode Device Schedule     
  decodeSchedule = (buffer,deviceName) => {
    let schedules = (() => {
      //Divide Schedule Buffer into 6, 14byte Schedules
      let arr = [];
      for (let i=0; i<buffer.slice(1,85).length; i+=14) {
       arr = [...arr,...[buffer.slice(1,85).slice(i,i+14)]];
      }
      return arr
    })()
    let scheduleList = [];
    //Decode Schedule
    schedules.forEach((e,i) => {
      log(logBreaker)
      if(e[0]===DICT.schedule_active_header){
        let scheduleItem = {
          hr:e[4],
          min:e[5],
          sec:e[6]
        }
        let repeat = scheduleItem.repeat = (e[7]>0) ? true : false
        let repeatCodes = (repeat === true) ? subset(Object.values(DICT.weekList),e[7]) : null
        scheduleItem.repeatDays = (repeat === true && repeatCodes != null) ? 
                              repeatCodes.reduce(function(arr, v) {
                                arr.push(getKeyByValue(DICT.weekList,v))
                                return arr
                              }, []) : null
        scheduleItem.year = (repeat === false) ? e[1]+2000 : null
        scheduleItem.month = (repeat === false) ? e[2] : null
        scheduleItem.day = (repeat === false) ? e[3] : null
        let mode = scheduleItem.mode = (e[8] === DICT.mode_sunrise || e[8] === DICT.mode_sunset) ? 'white'
                                        : (e[8] === DICT.mode_rgb) ? 'rgb'
                                        : 'effect';
        scheduleItem.start = (mode === 'white') ? e[10] : null
        scheduleItem.end = (mode === 'white') ? e[11] : null
        scheduleItem.speed = (mode != 'rgb') ? e[9] : null
        scheduleItem.rgb = (mode === 'rgb') ? [e[9],e[10],e[11]] : null
        scheduleItem.effect = (mode === 'effect' && getKeyByValue(DICT['presetList'],e[8])!==undefined) ? getKeyByValue(DICT['presetList'],e[8]) 
                              : (deviceName.includes('LEDBLE') && getKeyByValue(DICT['v1Presets'],e[13])!==undefined) ? getKeyByValue(DICT['v1Presets'],e[13])
                              : null
        scheduleItem.dateTime = new Date(scheduleItem.year, scheduleItem.month, scheduleItem.day, scheduleItem.hr, scheduleItem.min, scheduleItem.sec)
        if (repeat === true){
          log('Schedule #'+(i+1)+' every ['+scheduleItem.repeatDays.join(',')+']')
        }else{
          log('Schedule #'+(i+1)+' on '+scheduleItem.month+'-'+scheduleItem.day+'-'+(scheduleItem.year))
        }
        if (mode === 'white'){
          let start = Math.round(scheduleItem.start/255*100)
          let end = Math.round(scheduleItem.end/255*100)
          log('From '+start+'% to '+end+'% brightness in '+scheduleItem.speed+' minutes.')
        }else if(mode === 'rgb'){
          log('RGB('+scheduleItem.rgb.join(',')+')')
        }else if(mode === 'effect'){
          if (deviceName.includes('LEDBLE')){
            
          }
          log('Preset Effect:'+scheduleItem.effect+' at Speed:'+scheduleItem.speed)
        }
        scheduleList = [...scheduleList,scheduleItem]
      }else{
        log('Schedule #'+(i+1)+' is not set.')
      }
    })
    a.schedule[deviceName] = scheduleList
  },
  //Encode Device Schedule     
  encodeSchedule = (obj,deviceName) => {
    let fullArray = []
    let max = 6 //6 schedule limit
    for (let i=0; i<max; i++){
      let schedule = obj[i]
      let active = (obj[i]) ? true : false
      //Active Schedules
      if(active === true){
        let year = schedule['year']-2000 || 0,
            month = schedule['month'] || 0,
            day = schedule['day'] || 0,
            hr = schedule['hr'] || 0,
            min = schedule['min'] || 0,
            sec = schedule['sec'] || 0,
            repeat = (typeof schedule['repeatDays'] !== 'undefined' && schedule['repeatDays'] !== null) ? 
              schedule['repeatDays'].reduce(function(acc, v) {
              acc += DICT.weekList[v]
              return acc
              }, 0) : 0,
            timerArray = [year,month,day,hr,min,sec,repeat]
        let actionArray = [],  
            mode = schedule['mode']

        if(mode === 'rgb'){
          let rgb = schedule['rgb']
          actionArray = [DICT.mode_rgb, ...rgb]
        }else if(mode === 'effect'){
            let speed = schedule['speed'] || 0, //31 to 1, 1 fastest
            effect = DICT.presetList[schedule['effect']] || 0,
            start = 0,
            end = 0
            actionArray = [effect,speed,start,end]
        }else if(mode ==='white'){
          let speed = schedule['speed'], //in minutes
              start = schedule['start'],
              end = schedule['end'],
              sunMode = (start < end) ? DICT.mode_sunrise : DICT.mode_sunset
          actionArray = [sunMode,speed,start,end]
        }
        let activeArray = [DICT.schedule_active_header,...timerArray,...actionArray] 
        
        if(schedule['effect'] !=='turnOn' || schedule['effect'] !=='turnOff'){
          //For Device Model V6-10
          activeArray = [...activeArray,0,DICT.schedule_active_footer]
        }else{
          //For Device Model V1
          let v1effect = DICT.v1presets[schedule['effect']] || 0
          activeArray = [...activeArray,v1effect,DICT.schedule_active_footer]
        }
        fullArray = [...fullArray,...activeArray]
      }
      //Inactive Schedules
      else{
        const inactiveArray = [DICT.schedule_inactive_header,0,0,0,0,0,0,0,0,0,0,0,0,DICT.schedule_inactive_footer]
        fullArray = [...fullArray,...inactiveArray]
      }
    }
    let encodedArray = [DICT.schedule_encode_header,...fullArray,...DICT.schedule_encode_footer]
    return encodedArray
  }  
//Public Method ---------------------------------------------------  
  //Public Event Handler
  a.on = (e,cb) => {
    event.on(e,cb)
  };
  //Adds search() to Dom Elements
  a.init = (e) => {
    let buttons = document.querySelectorAll(e)
    buttons.forEach((e,i) => {
      e.addEventListener('click', a.search);
    })
  }; 
  //Opens up Chrome Request Device
  a.search = () => {
    log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice({
      filters: [{
        namePrefix: 'LED'
          // services: [DICT.service_lightnotif],
          // services:[DICT.service_lightcontrol,DICT.service_lightnotif],
      }],
      optionalServices: [DICT.service_lightcontrol,DICT.service_lightnotif]
      // acceptAllDevices:true
    })
    .then(device => {
      log('Found ' + device.name.trim());
      log('Connecting to GATT Server...');
      connect(device)
    })
    .catch(error => {
      let message = (error.name === 'NotFoundError') ? 'Canceled requesting device.' : error.message
      log(message);
    });
  };
  //Requests a Status or Schedule for Devices
  a.request = (e,arr) => {
    let protocols = e.split(',') || ['status','schedule']
    let deviceNames = returnArray(arr,Object.keys(a.devices))
    asyncForEach(deviceNames, async (deviceName) => {
      let ch = a.chars[deviceName]
      await waitFor(200);
      asyncForEach(protocols, async (protocol) => {
        await waitFor(50);
        let data = new Uint8Array(DICT['request_'+protocol.trim()]);
        return (ch.writeValue(data))
      })
    }) 
  };
  //Disconnects Device
  a.disconnect = (arr) => {
    let deviceNames = returnArray(arr,Object.keys(a.devices))
    deviceNames.forEach((e,i) => {
        a.devices[e].gatt.disconnect()
    })
  };
  //Turns Connected Light On
  a.turnOn = (arr) => {
    let deviceNames = returnArray(arr,Object.keys(a.devices))
    let data = new Uint8Array(DICT.action_lightOn);
    return deviceNames.forEach((e,i) => {
      a.chars[e].writeValue(data)
      .catch(err => log('Error when turning on. ', err))
      .then(() => {
        a.status[e].on = true
      })
    })
  };
  //Turns Connected Light Off
  a.turnOff = (arr) => {
    let deviceNames = returnArray(arr,Object.keys(a.devices))
    let data = new Uint8Array(DICT.action_lightOff);
    return deviceNames.forEach((e,i) => {
      a.chars[e].writeValue(data)
      .catch(err => log('Error when turning off. ', err))
      .then(() => {
        a.status[e].on = false
      })
    })
  };
  //Toggles Device On/Off Based on State of First Device Added
  a.turnOnOff = (arr) => {
    let deviceNames = returnArray(arr,Object.keys(a.devices)),
        power = a.status[deviceNames[0]].on
    if(power === true){
      a.turnOff(deviceNames)
    }else{
      a.turnOn(deviceNames)
    }
  };
  //Sets the RGB of Light
  a.setRGB = (e,arr) => {
    let rgb = e.split(',').map(Number),
    deviceNames = returnArray(arr,Object.keys(a.devices)),
    data = new Uint8Array([DICT.setColorHeader,...rgb,0,...DICT.setColorRGBFooter]);
    return deviceNames.forEach((e,i) => {
      a.chars[e].writeValue(data)
      .catch(err => log('Error when setting RGB! ', err))
      .then(() => {
         a.status[e]={
          on : true,
          mode :'rgb',
          rgb : rgb,
          speed : null,
          effect : null,
          white : null
        }
      })
    })
  };
  //Sets the Warm White Brightness of Light
  a.setWhite = (e,arr) => {
    let intensity = (e !== undefined) ? e : 255, //0-255
    deviceNames = returnArray(arr,Object.keys(a.devices)),
    data = new Uint8Array([DICT.setColorHeader,0,0,0,intensity,...DICT.setColorWWFooter]);
    return deviceNames.forEach((e,i) => {
      a.chars[e].writeValue(data)
      .catch(err => log('Error when setting Warm White. ', err))
      .then(() => {
        a.status[e]={
          on : true,
          mode :'white',
          rgb : null,
          speed : null,
          effect : null,
          white : intensity
        }
      })
    })
  };
  //Sets a factory preset effect
  a.setEffect = (e,s,arr) => {
    let preset = (Object.keys(DICT.presetList).includes(e)) ? e : 'seven_color_cross_fade',
    effect =  DICT.presetList[preset],
    speed = s || 1, //1-20
    deviceNames = returnArray(arr,Object.keys(a.devices)),
    data = new Uint8Array([DICT.presetHeader,effect,speed,...DICT.presetFooter]);
    return deviceNames.forEach((e,i) => {
      a.chars[e].writeValue(data)
      .catch(err => log('Error when setting effect. ', err))
      .then(() => {
        a.status[e]={
          on : true,
          mode :'effect',
          rgb : null,
          speed : speed,
          effect : preset,
          white : null
        }
      })
    })
  };
  //Set a Schedule - Max 6
  a.setSchedule = (arr1,arr2) => {
    if(typeof arr1 !== 'undefined'){
      let deviceNames = returnArray(arr2,Object.keys(a.devices))
      return deviceNames.forEach((e,i) => {
        let schedule = returnArray(arr1,a.schedule[e])
        let encodedSchedule = encodeSchedule(schedule,e)
        let data = new Uint8Array(encodedSchedule)
        a.chars[e].writeValue(data)
        .catch(err => log('Error when setting schedule.',err))
        .then(() => {
          a.schedule[e] = schedule
          log('Schedule for '+e+'set!')
        })
      })
    }else{
      log('No schedule to set.')
    }
  };
})(window.magicblue = window.magicblue || {})


