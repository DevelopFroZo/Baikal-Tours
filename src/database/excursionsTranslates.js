"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Excursions Translates" );
  }

  async create( client, excursionId, locale, name ){
    await client.query(
      `insert into excursions_translates( excursion_id, locale, name )
      values( $1, $2, $3 )`,
      [ excursionId, locale, name ]
    );
  }
}
