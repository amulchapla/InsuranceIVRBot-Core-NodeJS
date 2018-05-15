import { Connection, ConnectionConfig, Request } from 'tedious';

export type ReadyCallback = (err: Error, connection: Connection) => void;
// export type RowsCallback = (err: Error, rows: {[key: string]: any});

export class SqlClient {
  private queue: ReadyCallback[] = [];
  private connection: Connection;
  private connected: boolean;
  private connecting: boolean;
  private connectionError: Error;

  constructor(private options: ConnectionConfig) {
  }

  ready(callback: ReadyCallback): void {
    if (this.connected) {
      this.onReady(callback);
    } else {
      if (!this.connecting) {
        this.init();
      }
      this.queue.push(callback);
    }
  }

  // requestRows(request: Request, callback: RowsCallback): void {
  //   this.ready((err, conn) => {
  //     if (err) {
  //       return callback(err, null);
  //     }
  //     request.on('row')
  //   });
  // }

  close(): void {
    if (this.connected) {
      this.connection.close();
      this.connected = false;
    }
  }

  private init() {
    if (this.connection) {
      this.connection.close();
    }
    this.connecting = true;
    this.connection = new Connection(this.options);
    this.connection.on('connect', (err: Error) => this.onConnected(err));
    this.connection.on('error', (err: Error) => this.onError(err));
  }

  private onConnected(err: Error): void {
    this.connecting = false;
    this.connectionError = err;
    if (!err) {
      this.connected = true;
    }
    if (this.queue.length) {
      this.queue.forEach((x) => this.onReady(x));
      this.queue.length = 0;
    }
  }

  private onError(err: Error): void {
    console.error(err);
    // tslint:disable-next-line:no-string-literal
    if (err['code'] === 'ESOCKET') {
      this.connected = false;
      return;
    }

  }

  private onReady(callback: ReadyCallback): void {
    if (this.connectionError instanceof Error) {
      setImmediate(callback, this.connectionError, null);
    } else {
      setImmediate(callback, null, this.connection);
    }
  }
}
