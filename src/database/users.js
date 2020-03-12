"use strict";

import { transliterate } from "transliteration";
import Foundation from "./helpers/foundation";
import saltNHash from "./helpers/saltNHash";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Users" );
  }

  async get(){
    const rows = ( await super.query(
      `select id, name, surname, phone, email, image_path, password_confirmed, role
      from users
      order by id`
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

  async getSubscribedActions( id, locale ){
    const rows = ( await super.query(
      `select
        at.action_id, at.name,
        array_agg( array[ l.name, al.address ] ) as locations,
        array_agg( ad.date_start ) as date_starts,
        array_agg( ad.date_end ) as date_ends,
        ai.image_url
      from
        actions_subscribers as asu
        left join action_images as ai
        on ai.action_id = asu.action_id and is_main = true,
        actions_translates as at,
        actions_locations as al,
        locations as l,
        action_dates as ad
      where
        asu.user_id = $1 and
        at.locale = $2 and
        l.locale = at.locale and
        asu.action_id = at.action_id and
        asu.action_id = al.action_id and
        al.location_id = l.id and
        asu.action_id = ad.action_id
      group by at.action_id, at.name, ai.image_url
      order by date_starts`,
      [ id, locale ]
    ) ).rows;

    if( locale !== "ru" ){
      rows.forEach( row => {
        row.locations = row.locations.map( location => {
          if( location[1] ) location[1] = transliterate( location[1] );

          return location;
        } );
      } );
    }

    return super.success( 0, rows );
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
