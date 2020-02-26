import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions Translates" );
  }

  async saveOrUpdate( client, actionId, locale, {
    title, name, tagline, shortDescription,
    fullDescription, organizerName, contactFaces
  } ){
    let values = [ "$1", "$2" ];
    let sets = [];
    let params = [ actionId, locale ];
    let i = 3;

    if( title ){
      values.push( `$${i++}` );
      sets.push( `title = excluded.title` );
      params.push( title );
    }
    else values.push( "null" );

    if( name ){
      values.push( `$${i++}` );
      sets.push( `name = excluded.name` );
      params.push( name );
    }
    else values.push( "''" );

    if( tagline ){
      values.push( `$${i++}` );
      sets.push( `tagline = excluded.tagline` );
      params.push( tagline );
    }
    else values.push( "''" );

    if( shortDescription ){
      values.push( `$${i++}` );
      sets.push( `short_description = excluded.short_description` );
      params.push( shortDescription );
    }
    else values.push( "''" );

    if( fullDescription ){
      values.push( `$${i++}` );
      sets.push( `full_description = excluded.full_description` );
      params.push( fullDescription );
    }
    else values.push( "''" );

    if( organizerName ){
      values.push( `$${i++}` );
      sets.push( `organizer_name = excluded.organizer_name` );
      params.push( organizerName );
    }
    else values.push( "''" );

    if( contactFaces ){
      values.push( `$${i++}` );
      sets.push( `contact_faces = excluded.contact_faces` );
      params.push( contactFaces );
    }
    else values.push( "null" );

    values = values.join( "," );
    sets = sets.join( "," );

    await client.query(
      `insert into actions_translates( action_id, locale, title, name, tagline, short_description, full_description, organizer_name, contact_faces )
      values( ${values} )
      on conflict ( action_id, locale ) do update
      set ${sets}`,
      params
    );
  }
}
