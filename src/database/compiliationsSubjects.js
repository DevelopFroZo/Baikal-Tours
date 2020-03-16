"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations Subjects" );
  }

  async create( client, compiliationId, subjectIds ){
    let values = [];
    const params = [ compiliationId ];
    let i = 2;

    subjectIds.forEach( subjectId => {
      values.push( `($1,$${i++})` );
      params.push( subjectId );
    } );

    if( values.length > 0 ){
      values = values.join( "," );

      await client.query(
        `insert into compiliations_subjects( compiliation_id, subject_id )
        values ${values}`,
        params
      );
    }
  }
}
