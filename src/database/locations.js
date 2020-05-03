"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Locations" );
  }

  async getAll(){
    const rows = ( await super.query(
      `select id, name
      from locations`
    ) ).rows;

    return super.success( 0, rows );
  }
}
