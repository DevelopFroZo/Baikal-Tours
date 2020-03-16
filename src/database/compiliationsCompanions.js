"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations Companions" );
  }

  async create( client, compiliationId, companionIds ){
    let values = [];
    const params = [ compiliationId ];
    let i = 2;

    companionIds.forEach( companionId => {
      values.push( `($1,$${i++})` );
      params.push( companionId );
    } );

    if( values.length > 0 ){
      values = values.join( "," );

      await client.query(
        `insert into compiliations_companions( compiliation_id, companion_id )
        values ${values}`,
        params
      );
    }
  }
}
