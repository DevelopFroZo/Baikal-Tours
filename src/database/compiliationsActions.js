"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Compiliations Actions" );
  }

  async create( client, compiliationId, actionId, locale, description ){
    await client.query(
      `insert into compiliations_actions( compiliation_id, action_id, locale, description )
      values( $1, $2, $3, $4 )`,
      [ compiliationId, actionId, locale, description ]
    );
  }
}
