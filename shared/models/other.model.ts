/* OkPacket is returned by various mysql calls. (See https://dev.mysql.com/doc/internals/en/packet-OK_Packet.html)
 * Theoretically, we should find this in @types/mysql but it's not currently there. The definition below has been
 * constructed by reference to mysql\lib\protocol\packets\OkPacket.js. */
export interface OkPacket
   {
//   fieldCount  : number;
   affectedRows: number;
   changedRows : number;
   insertId    : number;
//   serverStatus: number;
//   warningCount: number;
//   message     : string;
   }

export class UpImgRes
{
   id: number;
   url: string;

   constructor (id: number, url: string)
      {
      this.id = id;
      this.url = url;
      }
}


export enum EmailAvailabilityStatus {
   NOT_AVAILABLE,
   AVAILABLE,
   INVITED
}