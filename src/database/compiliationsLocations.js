"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations Locations" );
  }

  async create( client, compiliationId, locationIds ){
    let values = [];
    const params = [ compiliationId ];
    let i = 2;

    locationIds.forEach( locationId => {
      values.push( `($1,$${i++})` );
      params.push( locationId );
    } );

    if( values.length > 0 ){
      values = values.join( "," );

      await client.query(
        `insert into compiliations_locations( compiliation_id, location_id )
        values ${values}`,
        params
      );
    }
  }

  async edit( client, compiliationId, oldLocationId, newLocationId ){
    await client.query(
      `update compiliations_locations
      set location_id = $1
      where
        compiliation_id = $2 and
        location_id = $3`,
      [ newLocationId, compiliationId, oldLocationId ]
    );
  }
}
