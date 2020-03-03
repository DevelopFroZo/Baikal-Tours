"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Locations" );
  }

  async create( actionId, data, client ){
    if( !Array.isArray( data ) || data.length === 0 )
      return;

    const values = [];
    const params = [ actionId ];
    let i = 2;

    data.forEach( ( { id, address } ) => {
      const values2 = [ "$1", `$${i++}` ];

      params.push( id );

      if( address === null || typeof address === "string" ){
        values2.push( `$${i++}` )
        params.push( address );
      }
      else values2.push( "null" );

      values.push( `(${values2.join( "," )})` );
    } );

    if( client === undefined ) client = this.modules.pool;

    await client.query(
      `insert into actions_locations( action_id, location_id, address )
      values ${values}`,
      params
    );
  }

  async edit( actionId, { oldLocationId, newLocationId, address }, client ){
    let sets = [];
    const params = [ actionId, oldLocationId ];
    let i = 3;

    if( typeof newLocationId === "number" ){
      sets.push( `location_id = $${i++}` );
      params.push( newLocationId );
    }

    if( address === null || typeof address === "string" ){
      sets.push( `address = $${i++}` );
      params.push( address );
    }

    if( sets.length === 0 ) return;
    if( client === undefined ) client = this.modules.pool;

    sets = sets.join( "," );

    await client.query(
      `update actions_locations
      set ${sets}
      where
        action_id = $1 and
        location_id = $2`,
      params
    );
  }

  async del( actionId, locationIds, client ){
    if( !Array.isArray( locationIds ) || locationIds.length === 0 ) return;

    if( client === undefined ) client = this.modules.pool;

    await client.query(
      `delete from actions_locations
      where
        action_id = $1 and
        location_id = any( $2::int[] )`,
      [ actionId, locationIds ]
    );
  }
}
