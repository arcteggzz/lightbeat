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
    CREATE TABLE IF NOT EXISTS Heartbeats (
      Id          INT          NOT NULL AUTO_INCREMENT,
      DateCreated TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (Id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
    callback,
  );
};

exports.down = function (db, callback) {
  db.runSql("DROP TABLE IF EXISTS Heartbeats;", callback);
};

exports._meta = {
  version: 1,
};
