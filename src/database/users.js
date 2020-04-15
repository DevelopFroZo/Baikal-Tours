"use strict";

import { transliterate } from "transliteration";
import Foundation from "./helpers/foundation";
import saltNHash from "./helpers/saltNHash";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Users" );
  }

  async get( search ){
    const params = [];

    if( typeof search === "string" && search !== "" ){
      params.push( `%${search}%` );
      search = "where name || surname || phone || email ilike $1";
    }
    else search = "";

    const rows = ( await super.query(
      `select id, name, surname, phone, email, image_path, password_confirmed, role
      from users
      ${search}
      order by id`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getById( id ){
    const rows = ( await super.query(
      `select id, name, surname, phone, email, image_path, password_confirmed, role
      from users
      where id = $1`,
      [ id ]
    ) ).rows;

    if( rows.length === 0 )
      return super.success();

    return super.success( 0, rows[0] );
  }

  async edit( id, { name, surname, phone, email, oldPassword, newPassword, role } ){
    const dbHashAndSalt = ( await super.query(
      `select password
      from users
      where id = $1`,
      [ id ]
    ) ).rows;

    if( dbHashAndSalt.length === 0 )
      return false;

    const [ dbHash, dbSalt ] = dbHashAndSalt[0].password.split( ";" );
    let sets = [];
    const params = [ id ];
    let i = 2;

    if( typeof name === "string" && name !== "" ){
      sets.push( `name = $${i++}` );
      params.push( name );
    }

    if( typeof surname === "string" && surname !== "" ){
      sets.push( `surname = $${i++}` );
      params.push( surname );
    }

    if( typeof phone === "string" && phone !== "" ){
      sets.push( `phone = $${i++}` );
      params.push( phone );
    }

    if( typeof email === "string" && email !== "" ){
      sets.push( `email = $${i++}` );
      params.push( email );
    }

    if(
      typeof oldPassword === "string" &&
      typeof newPassword === "string" && newPassword !== ""
    ){
      const { hash: oldHash } = saltNHash( oldPassword, {
        salt: dbSalt,
        hashAlgorithm: process.env.HASH_ALGORITHM
      } );

      if( oldHash === dbHash ){
        const { hashAndSalt: newHashAndSalt } = saltNHash( newPassword, {
          saltLength: process.env.SALT_LENGTH,
          hashAlgorithm: process.env.HASH_ALGORITHM
        } );

        sets.push( `password = $${i++}` );
        params.push( newHashAndSalt );
      }
    }

    if( typeof role === "string" && role !== "" ){
      sets.push( `role = $${i++}` );
      params.push( role );
    }

    if( sets.length > 0 ){
      sets = sets.join( "," );

      await super.query(
        `update users
        set ${sets}
        where id = $1`,
        params
      );
    }

    return true;
  }

  async del( id ){
    await super.query(
      `delete from users
      where id = $1`,
      [ id ]
    );

    return super.success();
  }
}
