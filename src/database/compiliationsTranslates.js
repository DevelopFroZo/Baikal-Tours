"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations Translates" );
  }

  async create( client, compiliationId, locale, { title, name, tagline, description } ){
    await client.query(
      `insert into compiliations_translates( compiliation_id, locale, title, name, tagline, description )
      values( $1, $2, $3, $4, $5, $6 )`,
      [ compiliationId, locale, title, name, tagline, description ]
    );
  }
}
