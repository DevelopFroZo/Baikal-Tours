"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Locations" );
  }

  async getAll(){
    const rows = ( await super.query(
      `select id, name
      from locations`
    ) ).rows;

    return super.success( 0, rows );
  }

  async edit( id, location2Id ){
    try{
      const { rowCount } = await super.query(
        `update locations
        set location2_id = $1
        where id = $2`,
        [ location2Id, id ]
      );

      if( rowCount === 0 )
        return `Invalid ID (${id})`;

      return true;
    } catch( e ) {
      if( e.code === "23503" )
        return `Invalid location2 ID (${location2Id})`;

      throw e;
    }
  }
}
