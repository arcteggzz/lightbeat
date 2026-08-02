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
    CREATE TABLE IF NOT EXISTS OutageEvents (
      Id              INT          NOT NULL AUTO_INCREMENT,
      StartedAt       TIMESTAMP(6) NOT NULL,
      EndedAt         TIMESTAMP(6) NOT NULL,
      DurationSeconds INT          NOT NULL,
      DateCreated     TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (Id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE PROCEDURE DetectOutage(IN p_heartbeat_id INT, IN p_date_created TIMESTAMP(6))
    BEGIN
      DECLARE prev_date TIMESTAMP(6);
      DECLARE gap_seconds INT;

      SELECT MAX(DateCreated) INTO prev_date
      FROM Heartbeats
      WHERE Id <> p_heartbeat_id AND DateCreated < p_date_created;

      IF prev_date IS NOT NULL THEN
        SET gap_seconds = TIMESTAMPDIFF(SECOND, prev_date, p_date_created);
        IF gap_seconds > 90 THEN
          -- DateCreated uses p_date_created (app-supplied) rather than NOW(6) —
          -- this DB host's clock has been observed to drift from true UTC.
          INSERT INTO OutageEvents (StartedAt, EndedAt, DurationSeconds, DateCreated)
          VALUES (prev_date, p_date_created, gap_seconds, p_date_created);
        END IF;
      END IF;
    END;

    CREATE TRIGGER trg_heartbeats_after_insert
    AFTER INSERT ON Heartbeats
    FOR EACH ROW
    CALL DetectOutage(NEW.Id, NEW.DateCreated);
  `,
    callback,
  );
};

exports.down = function (db, callback) {
  db.runSql(
    `
    DROP TRIGGER IF EXISTS trg_heartbeats_after_insert;
    DROP PROCEDURE IF EXISTS DetectOutage;
    DROP TABLE IF EXISTS OutageEvents;
  `,
    callback,
  );
};

exports._meta = {
  version: 1,
};
