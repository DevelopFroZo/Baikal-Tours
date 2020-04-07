"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Tours" );
  }

  async create( site, dateStart, dateEnd, locationIds, price ){
    const transaction = await super.transaction();

    const id = ( await transaction.query(
      `insert into tours( site, date_start, date_end, location_ids, price )
      values( $1, $2, $3, $4, $5 )
      returning id`,
      [ site, dateStart, dateEnd, locationIds, price ]
    ) ).rows[0].id;

    return { transaction, id };
  }

  async getAll( locale ){
    const rows = ( await super.query(
      `select t.id, t.image_url, t.price, tt.name
      from
        excursions as t,
        excursions_translates as tt
      where
        tt.locale = $1 and
        t.id = tt.excursion_id
      order by date_start`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( locale, dateStart, dateEnd, locationIds ){
    let filters = [];
    const params = [ locale ];
    let i = 2;

    if( typeof dateStart === "string" && dateStart !== "" ){
      filters.push( `t.date_start >= $${i++}` );
      params.push( dateStart );
    }

    if( typeof dateEnd === "string" && dateEnd !== "" ){
      filters.push( `t.date_end <= $${i++}` );
      params.push( dateEnd );
    }

    if( Array.isArray( locationIds ) ){
      filters.push( `$${i++}::int[] && t.location_ids` );
      params.push( locationIds );
    }

    if( filters.length > 0 )
      filters = `${filters.join( " and " )} and`;
    else
      filters = "";

    const rows = ( await super.query(
      `select t.id, t.image_url, t.price, tt.name
      from
        excursions as t,
        excursions_translates as tt
      where
        tt.locale = $1 and
        ${filters}
        t.id = tt.excursion_id
      order by date_start`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }
}
