// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportBloodglucose = require('../../../app/service/bloodglucose');
import ExportBloodpressure = require('../../../app/service/bloodpressure');
import ExportFhistory = require('../../../app/service/fhistory');
import ExportHeartrate = require('../../../app/service/heartrate');
import ExportHms = require('../../../app/service/hms');
import ExportHuawei = require('../../../app/service/huawei');
import ExportOxyhemoglobin = require('../../../app/service/oxyhemoglobin');
import ExportPressure = require('../../../app/service/pressure');
import ExportSleep = require('../../../app/service/sleep');
import ExportSportrecord = require('../../../app/service/sportrecord');
import ExportStep = require('../../../app/service/step');
import ExportTemperature = require('../../../app/service/temperature');
import ExportUser = require('../../../app/service/user');
import ExportWeight = require('../../../app/service/weight');

declare module 'egg' {
  interface IService {
    bloodglucose: AutoInstanceType<typeof ExportBloodglucose>;
    bloodpressure: AutoInstanceType<typeof ExportBloodpressure>;
    fhistory: AutoInstanceType<typeof ExportFhistory>;
    heartrate: AutoInstanceType<typeof ExportHeartrate>;
    hms: AutoInstanceType<typeof ExportHms>;
    huawei: AutoInstanceType<typeof ExportHuawei>;
    oxyhemoglobin: AutoInstanceType<typeof ExportOxyhemoglobin>;
    pressure: AutoInstanceType<typeof ExportPressure>;
    sleep: AutoInstanceType<typeof ExportSleep>;
    sportrecord: AutoInstanceType<typeof ExportSportrecord>;
    step: AutoInstanceType<typeof ExportStep>;
    temperature: AutoInstanceType<typeof ExportTemperature>;
    user: AutoInstanceType<typeof ExportUser>;
    weight: AutoInstanceType<typeof ExportWeight>;
  }
}
