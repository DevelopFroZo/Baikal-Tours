"use strict";

import Foundation from "./helpers/foundation";
import crypto from "crypto";
import saltNHash from "./helpers/saltNHash";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Auth" );
  }

  createPassword(){
    const password = crypto.randomBytes( 10 ).toString( "hex" );
    const { hashAndSalt } = saltNHash( password, {
      hashAlgorithm: process.env.HASH_ALGORITHM,
      saltLength: process.env.SALT_LENGTH
    } );

    return { password, hashAndSalt };
  }

  async signup( name, surname, phone, email ){
    email = email.toLowerCase();

    const { password, hashAndSalt } = this.createPassword();
    const row = ( await super.query(
      `insert into users( name, surname, phone, email, password )
      values( $1, $2, $3, $4, $5 )
      on conflict do nothing
      returning 1`,
      [ name, surname, phone, email, hashAndSalt ]
    ) ).rows[0];

    if( row !== undefined ) return super.success( 0, password );

    return super.error( 2 );
  }

  async signin( phoneOrEmail, password ){
    phoneOrEmail = phoneOrEmail.toLowerCase();

    const row = ( await super.query(
      `select id, name, email, password, password_confirmed, role
      from users
      where
        phone = $1 or
        email = $1`,
      [ phoneOrEmail ]
    ) ).rows[0];

    if( row === undefined ) return super.error( 3 );

    const password_ = row.password.split( ";" );
    const { hash } = saltNHash( password, {
      hashAlgorithm: process.env.HASH_ALGORITHM,
      salt: password_[1]
    } );

    if( password_[0] !== hash ) return super.error( 4 );
    if( !row.password_confirmed ) await super.query(
      `update users
      set password_confirmed = true
      where id = $1`,
      [ row.id ]
    );

    return super.success( 0, {
      userId: row.id,
      role: row.role,
      name: row.name,
      email: row.email
    } );
  }
}
