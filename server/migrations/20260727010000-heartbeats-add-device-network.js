"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, callback) {
  db.runSql(
    `
    ALTER TABLE Heartbeats
      ADD COLUMN DeviceId VARCHAR(100) NOT NULL AFTER Id,
      ADD COLUMN Network  VARCHAR(100) NOT NULL AFTER DeviceId;
  `,
    callback,
  );
};

exports.down = function (db, callback) {
  db.runSql(
    `
    ALTER TABLE Heartbeats
      DROP COLUMN DeviceId,
      DROP COLUMN Network;
  `,
    callback,
  );
};

exports._meta = {
  version: 1,
};
