declare function openDatabase(connectionString: string, version: string, database: string, memorySize: number): DB;

export interface TransactionResultSet {
  length: number;
  item: (int : number) => any;
}

export interface TransactionResults {
  rows: TransactionResultSet;
}

export interface Transaction {
  executeSql: (statement: string, args?: any[], callback?: (t: any, results : TransactionResults) => void) => void;
}

export interface DB {
  transaction: (callback: (transaction: Transaction) => void) => void;
}

export class WebSQLWorker {
  public db: DB;

  constructor() {
    const DB_NAME = '999 local cache';
    this.db = openDatabase('mydb', '1.0', DB_NAME, 2 * 1024 * 1024);
    this.db.transaction( t => {
      t.executeSql('CREATE TABLE IF NOT EXISTS pages (url unique, data)');
    });
  }

  find_url(url: string, cb: Function) : void {
    this.db.transaction( t => {
      t.executeSql('SELECT * FROM pages WHERE url = ?', [url], function (t, results) {
        if (results.rows.length) {
          cb(JSON.parse(results.rows.item(0).data));
        } else {
          return cb(false);
        }
      });
    });
  }

  delete_all():void {
    this.db.transaction( t => {
      t.executeSql('DELETE FROM pages');
    });
  }

  delete_url(url: string): void {
    this.db.transaction( t => {
      t.executeSql('DELETE FROM pages WHERE url = ?', [url]);
    });
  }

  add_url(url: string, data: object) {
    this.db.transaction( t => {
      t.executeSql('INSERT INTO pages (url, data) VALUES (?, ?)', [url, JSON.stringify(data)]);
    });
  }
}
