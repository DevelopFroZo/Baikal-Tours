"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Companions" );
  }

  async getAll(){
    const rows = ( await super.query(
      `select *
      from companions`
    ) ).rows;

    return super.success( 0, rows );
  }
}
