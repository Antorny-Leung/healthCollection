// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportHms = require('../../../app/controller/hms');
import ExportHome = require('../../../app/controller/home');
import ExportHuawei = require('../../../app/controller/huawei');
import ExportOauth = require('../../../app/controller/oauth');
import ExportUser = require('../../../app/controller/user');

declare module 'egg' {
  interface IController {
    hms: ExportHms;
    home: ExportHome;
    huawei: ExportHuawei;
    oauth: ExportOauth;
    user: ExportUser;
  }
}
