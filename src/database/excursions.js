"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Excursions" );
  }

  async create( site, date_start, date_end, locationId, price ){
    const transaction = await super.transaction();

    const id = ( await transaction.query(
      `insert into excursions( site, date_start, date_end, location_id, price )
      values( $1, $2, $3, $4, $5 )
      returning id`,
      [ site, date_start, date_end, locationId, price ]
    ) ).rows[0].id;

    return { transaction, id };
  }
}
