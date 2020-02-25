"use strict";

import Foundation from "./helpers/foundation";
import Translator from "/helpers/translator/index";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions" );
  }

  async getAll( allStatuses, locale, count, offset ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";

    const rows = ( await super.query(
      `select
        a.id, a.status, a.is_favorite, at.name,
        array_agg( distinct ad.date_start ) as date_starts,
        array_agg( distinct ad.date_end ) as date_ends,
        ai.image_url, a.price_min, a.price_max,
        array_agg( distinct s.name ) as subjects,
        array_agg( distinct l.name ) as locations,
        count( 1 ) over ()
      from
        actions as a
        left join action_dates as ad
        on a.id = ad.action_id
        left join action_images as ai
        on a.id = ai.action_id and ai.is_main = true
        left join actions_subjects as acsu
        on a.id = acsu.action_id
        left join subjects as s
        on acsu.subject_id = s.id and s.locale = $1
        left join actions_locations as al
        on a.id = al.action_id
        left join locations as l
        on al.location_id = l.id and l.locale = $1,
        actions_translates as at
      where
        ${status}
        a.id = at.action_id and
        at.locale = $1
      group by a.id, a.status, a.is_favorite, at.name, ai.image_url, a.price_min, a.price_max
      order by a.id
      ${limit}
      ${offset_}`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( allStatuses, locale, dateStart, dateEnd, locations, companions, subjects, search, priceMin, priceMax, count, offset ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";
    let filters = [];
    const params = [ locale ];
    let i = params.length + 1;
    let datesFilter = [];

    // #fix добавить фильтр на цену
    // if( priceMin ){
    //   filters.push( `a.price >= $${i++}` );
    //   params.push( priceMin );
    //   i++;
    // }
    // if( priceMax ){
    //   filters.push( `a.price <= $${i++}` );
    //   params.push( priceMax );
    //   i++;
    // }
    if( locations ){
      filters.push( `ae.locations_ids @> $${i++}::int[]` );
      params.push( locations );
    }

    if( companions ){
      filters.push( `c.id = any( $${i++}::int[] )` );
      params.push( companions );
    }

    if( subjects ){
      filters.push( `s.id = any( $${i++}::int[] )` );
      params.push( subjects );
    }

    // #fix по ключевым словам
    if( search && search !== "" ){
      filters.push(
        `( ae.name || ' ' ||
        ae.full_description ) ilike $${i++}`
      );
      params.push( search );
    }

    if( dateStart ){
      datesFilter.push( `( ad.date_start is null or ad.date_start >= $${i++} )` );
      params.push( dateStart );
    }

    if( dateEnd ){
      datesFilter.push( `( ad.date_end is null or ad.date_end <= $${i} )` );
      params.push( dateEnd );
    }

    if( filters.length === 0 ) filters = "";
    else filters = `${filters.join( " and " )} and`;

    if( datesFilter.length === 0 ) datesFilter = "";
    else datesFilter = `where ${datesFilter.join( " and " )}`;

    // #fix переделать на хранимку
    const rows = ( await super.query(
      `with actions_extended as (
        select
          a.id, a.status, a.is_favorite, at.locale, at.name, at.full_description, a.price_min, a.price_max,
          array_agg( l.id ) as locations_ids,
          array_agg( l.name ) as locations
        from
          actions as a,
          actions_translates as at,
          actions_locations as al,
          locations as l
        where
          ${status}
          at.locale = $1 and
          a.id = at.action_id and
          l.locale = at.locale and
          a.id = al.action_id and
          al.location_id = l.id
        group by a.id, a.status, a.is_favorite, at.locale, at.name, at.full_description, a.price_min, a.price_max
      )
      select
        tmp.*,
        array_agg( ad.date_start ) as date_starts,
        array_agg( ad.date_end ) as date_ends,
        ai.image_url,
        count( 1 ) over ()
      from (
        select
          ae.id, ae.status, ae.is_favorite, ae.name, ae.price_min, ae.price_max, ae.locations,
          array_agg( distinct c.name ) as companions,
          array_agg( distinct s.name ) as subjects
        from
          actions_extended as ae,
          actions_companions as ac,
          companions as c,
          actions_subjects as acsu,
          subjects as s
        where
          c.locale = ae.locale and
          s.locale = ae.locale and
          ${filters}
          ac.companion_id = c.id and
          ac.action_id = ae.id and
          acsu.subject_id = s.id and
          acsu.action_id = ae.id
        group by ae.id, ae.status, ae.is_favorite, ae.name, ae.price_min, ae.price_max, ae.locations ) as tmp
        left join action_dates as ad
        on ad.action_id = tmp.id
        left join action_images as ai
        on ai.action_id = tmp.id and ai.is_main = true
      ${datesFilter}
      group
        by tmp.id,
        tmp.status,
        tmp.is_favorite,
        tmp.name,
        tmp.price_min,
        tmp.price_max,
        tmp.locations,
        tmp.companions,
        tmp.subjects,
        ai.image_url
      order by tmp.id
      ${limit}
      ${offset_}`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getOne( isAdmin, id, locale, getSubscribers ){
    const status = isAdmin ? "" : "a.status = 'active' and";
    const transaction = await super.transaction();
    const main = ( await transaction.query(
      `select
        a.*,
        u.email as organizer_email, u.phone as organizer_phone,
        at.*
      from
        actions as a
        left join users as u
        on a.organizer_id = u.id,
        actions_translates as at
      where
        ${status}
        a.id = $1 and
        a.id = at.action_id and
        at.locale = $2`,
      [ id, locale ]
    ) ).rows[0];

    if( main === undefined ){
      await transaction.end();

      return super.error( 10 );
    }

    delete main.locale;
    delete main.action_id;

    main.images = ( await transaction.query(
      `select id, image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.dates = ( await transaction.query(
      `select id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = $1`,
      [ id ]
    ) ).rows;

    // #fix локаль для адреса локации
    main.locations = ( await transaction.query(
      `select l.id, l.name, al.address
      from
        actions_locations as al,
        locations as l
      where
        al.action_id = $1 and
        l.locale = $2 and
        l.id = al.location_id`,
      [ id, locale ]
    ) ).rows;

    main.transfers = ( await transaction.query(
      `select t.id, t.name
      from
        actions_transfers as at,
        transfers as t
      where
        at.action_id = $1 and
        t.locale = $2 and
        t.id = at.transfer_id`,
      [ id, locale ]
    ) ).rows;

    main.subjects = ( await transaction.query(
      `select s.id, s.name
      from
        actions_subjects as acsu,
        subjects as s
      where
        acsu.action_id = $1 and
        s.locale = $2 and
        s.id = acsu.subject_id`,
      [ id, locale ]
    ) ).rows;

    if( getSubscribers ){
      main.subscribers = ( await transaction.query(
        `select u.name, u.surname, u.phone, u.email, u.image_path
        from
          actions_subscribers as asu,
          users as u
        where
          asu.user_id = u.id`
      ) ).rows;
    }

    await transaction.end();

    return super.success( 0, main );
  }

  async getOneForEmail( id, locale ){
    const result = ( await super.query(
      `select
        at.name, at.short_description, a.emails, a.phones,
        a.price_min, a.price_max, at.contact_faces
      from
        actions as a,
        actions_translates as at
      where
        a.status = 'active' and
        id = $1 and
        at.locale = $2 and
        a.id = at.action_id`,
      [ id, locale ]
    ) ).rows[0];

    return result !== undefined ? result : null;
  }

  async saveOrUpdateActionsTranslates( client, actionId, locale, {
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

    values.push( "''" );
    values = values.join( "," );
    sets = sets.join( "," );

    await client.query(
      `insert into actions_translates( action_id, locale, title, name, tagline, short_description, full_description, organizer_name )
      values( ${values} )
      on conflict ( action_id, locale ) do update
      set ${sets}`,
      params
    );
  }

  async edit( id, {
    status, priceMin, priceMax, organizerId,
    sitePaymant, organizerPayment, emails, phones,
    websites, vkLink, facebookLink, instagramLink,
    twitterLink, isFavorite, title, name, tagline,
    shortDescription, fullDescription,
    organizerName, contactFaces
  } ){
    let set = [];
    const params = [ id ];
    let sc = 2;
    const transaction = await super.transaction();
    let translated = {};
    const translator = new Translator( process.env.YANDEX_TRANSLATE_API_KEY );
    const promises = [];

    if( status ){
      set.push( `status = $${sc++}` );
      params.push( status );
    }

    if( priceMin ){
      set.push( `price_min = $${sc++}` );
      params.push( priceMin );
    }

    if( priceMax ){
      set.push( `price_max = $${sc++}` );
      params.push( priceMax );
    }

    if( organizerId === null || typeof organizerId === "number" ){
      set.push( `organizer_id = $${sc++}` );
      params.push( organizerId );
    }

    if( typeof sitePaymant === "boolean" ){
      set.push( `site_payment = $${sc++}` );
      params.push( sitePaymant );
    }

    if( organizerPayment !== undefined && organizerPayment !== "" ){
      set.push( `organizer_payment = $${sc++}` );
      params.push( organizerPayment );
    }

    if( emails === null || Array.isArray( emails ) ){
      set.push( `emails = $${sc++}::character varying[]` );
      params.push( emails );
    }

    if( phones === null || Array.isArray( phones ) ){
      set.push( `phones = $${sc++}::character varying[]` );
      params.push( phones );
    }

    if( websites === null || Array.isArray( websites ) ){
      set.push( `websites = $${sc++}::character varying[]` );
      params.push( websites );
    }

    if( vkLink === null || vkLink ){
      set.push( `vk_link = $${sc++}` );
      params.push( vkLink );
    }

    if( facebookLink === null || facebookLink ){
      set.push( `facebook_link = $${sc++}` );
      params.push( facebookLink );
    }

    if( instagramLink === null || instagramLink ){
      set.push( `instagram_link = $${sc++}` );
      params.push( instagramLink );
    }

    if( twitterLink === null || twitterLink ){
      set.push( `twitter_link = $${sc++}` );
      params.push( twitterLink );
    }

    if( typeof isFavorite === "boolean" ){
      set.push( `is_favorite = $${sc++}` );
      params.push( isFavorite );
    }

    if( set.length > 0 ){
      set = set.join( "," );

      await transaction.query(
        `update actions
        set ${set}
        where id = $1`,
        params
      );
    }

    if( title ){
      const locale = title.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].title = title.text;

      if( title.autoTranslate === true )
        translator.add( "title", title.text, locale, title.toLocales );
    }

    if( name ){
      const locale = name.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].name = name.text;

      if( name.autoTranslate === true )
        translator.add( "name", name.text, locale, name.toLocales );
    }

    if( tagline ){
      const locale = tagline.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].tagline = tagline.text;

      if( tagline.autoTranslate === true )
        translator.add( "tagline", tagline.text, locale, tagline.toLocales );
    }

    if( shortDescription ){
      const locale = shortDescription.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].shortDescription = shortDescription.text;

      if( shortDescription.autoTranslate === true )
        translator.add( "shortDescription", shortDescription.text, locale, shortDescription.toLocales );
    }

    if( fullDescription ){
      const locale = fullDescription.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].fullDescription = fullDescription.text;

      if( fullDescription.autoTranslate === true )
        translator.add( "fullDescription", fullDescription.text, locale, fullDescription.toLocales );
    }

    await translator.translate();
    translator.transform();

    for( let key in translator.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
      else
        translated[ key ] = translator.transformed[ key ];

    for( let key in translated )
      promises.push( this.saveOrUpdateActionsTranslates( transaction, id, key, translated[ key ] ) );

    await Promise.all( promises );
    await transaction.end();

    return super.success();
  }
}
