"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliation Dates" );
  }

  async create( client, compiliationId, dates ){
    let values = [];
    const params = [ compiliationId ];
    let i = 2;

    dates.map( ( { dateStart, dateEnd, timeStart, timeEnd, days } ) => {
      const values_ = [ "$1" ];

      if( typeof dateStart === "string" && dateStart !== "" ){
        values_.push( `$${i++}` );
        params.push( dateStart );
      }
      else values_.push( "null" );

      if( typeof dateEnd === "string" && dateEnd !== "" ){
        values_.push( `$${i++}` );
        params.push( dateEnd );
      }
      else values_.push( "null" );

      if( typeof timeStart === "string" && timeStart !== "" ){
        values_.push( `$${i++}` );
        params.push( timeStart );
      }
      else values_.push( "null" );

      if( typeof timeEnd === "string" && timeEnd !== "" ){
        values_.push( `$${i++}` );
        params.push( timeEnd );
      }
      else values_.push( "null" );

      if( Array.isArray( days ) ){
        values_.push( `$${i++}::int[]` );
        params.push( days );
      }
      else values_.push( "null" );

      if( values_.length > 0 )
        values.push( `(${values_.join( "," )})` );
    } );

    values = values.join( "," );

    await client.query(
      `insert into compiliation_dates( compiliation_id, date_start, date_end, time_start, time_end, days )
      values ${values}`,
      params
    );
  }

  async edit( client, { id, dateStart, dateEnd, timeStart, timeEnd, days } ){
    let sets = [];
    const params = [ id ];
    let i = 2;

    if( typeof dateStart === "string" && dateStart !== "" ){
      sets.push( `date_start = $${i++}` );
      params.push( dateStart );
    }

    if( typeof dateEnd === "string" && dateEnd !== "" ){
      sets.push( `date_end = $${i++}` );
      params.push( dateEnd );
    }

    if( typeof timeStart === "string" && timeStart !== "" ){
      sets.push( `time_start = $${i++}` );
      params.push( timeStart );
    }

    if( typeof timeEnd === "string" && timeEnd !== "" ){
      sets.push( `time_end = $${i++}` );
      params.push( timeEnd );
    }

    if( days !== null && typeof days === "object" && Array.isArray( days ) ){
      sets.push( `days = $${i++}` );
      params.push( days );
    }

    if( sets.length > 0 ){
      sets = sets.join( "," );

      await client.query(
        `update compiliation_dates
        set ${sets}
        where id = $1`,
        params
      );
    }
  }
}
