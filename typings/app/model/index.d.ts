// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBloodglucose = require('../../../app/model/bloodglucose');
import ExportBloodpressure = require('../../../app/model/bloodpressure');
import ExportFhistory = require('../../../app/model/fhistory');
import ExportHeartrate = require('../../../app/model/heartrate');
import ExportOxyhemoglobin = require('../../../app/model/oxyhemoglobin');
import ExportPressure = require('../../../app/model/pressure');
import ExportSleep = require('../../../app/model/sleep');
import ExportSportrecord = require('../../../app/model/sportrecord');
import ExportStep = require('../../../app/model/step');
import ExportTemperature = require('../../../app/model/temperature');
import ExportUser = require('../../../app/model/user');
import ExportWeight = require('../../../app/model/weight');

declare module 'egg' {
  interface IModel {
    Bloodglucose: ReturnType<typeof ExportBloodglucose>;
    Bloodpressure: ReturnType<typeof ExportBloodpressure>;
    Fhistory: ReturnType<typeof ExportFhistory>;
    Heartrate: ReturnType<typeof ExportHeartrate>;
    Oxyhemoglobin: ReturnType<typeof ExportOxyhemoglobin>;
    Pressure: ReturnType<typeof ExportPressure>;
    Sleep: ReturnType<typeof ExportSleep>;
    Sportrecord: ReturnType<typeof ExportSportrecord>;
    Step: ReturnType<typeof ExportStep>;
    Temperature: ReturnType<typeof ExportTemperature>;
    User: ReturnType<typeof ExportUser>;
    Weight: ReturnType<typeof ExportWeight>;
  }
}
