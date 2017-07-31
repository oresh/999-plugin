"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebSQLWorker = (function () {
    function WebSQLWorker() {
        var DB_NAME = '999 local cache';
        this.db = openDatabase('mydb', '1.0', DB_NAME, 2 * 1024 * 1024);
        this.db.transaction(function (t) {
            t.executeSql('CREATE TABLE IF NOT EXISTS pages (url unique, data)');
        });
    }
    WebSQLWorker.prototype.find_url = function (url, cb) {
        this.db.transaction(function (t) {
            t.executeSql('SELECT * FROM pages WHERE url = ?', [url], function (t, results) {
                if (results.rows.length) {
                    cb(JSON.parse(results.rows.item(0).data));
                }
                else {
                    return cb(false);
                }
            });
        });
    };
    WebSQLWorker.prototype.delete_all = function () {
        this.db.transaction(function (t) {
            t.executeSql('DELETE FROM pages');
        });
    };
    WebSQLWorker.prototype.delete_url = function (url) {
        this.db.transaction(function (t) {
            t.executeSql('DELETE FROM pages WHERE url = ?', [url]);
        });
    };
    WebSQLWorker.prototype.add_url = function (url, data) {
        this.db.transaction(function (t) {
            t.executeSql('INSERT INTO pages (url, data) VALUES (?, ?)', [url, JSON.stringify(data)]);
        });
    };
    return WebSQLWorker;
}());
exports.WebSQLWorker = WebSQLWorker;
