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

  async edit( client, compiliationId, oldSubjectId, newSubjectId ){
    await client.query(
      `update compiliations_subjects
      set subject_id = $1
      where
        compiliation_id = $2 and
        subject_id = $3`,
      [ newSubjectId, compiliationId, oldSubjectId ]
    );
  }
}
