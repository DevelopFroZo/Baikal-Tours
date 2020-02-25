"use strict";

import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Users" );
  }

  async getAll(){
    const rows = ( await super.query(
      `select id, name, surname, phone, email, image_path, password_confirmed, is_admin
      from users`
    ) ).rows;

    return super.success( 0, rows );
  }
}
