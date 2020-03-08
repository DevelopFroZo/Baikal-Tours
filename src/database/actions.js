"use strict";

import fetch from "node-fetch";
import { transliterate } from "transliteration";
import Foundation from "./helpers/foundation";
import Translator from "/helpers/translator/index";
import yandexEngineBuilder from "/helpers/translator/engines/yandex";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions" );
  }

  async createEmpty(){
    const id = ( await super.query(
      `insert into actions( price_min, price_max, site_payment, is_favorite )
      values( 0, 0, false, false )
      returning id`
    ) ).rows[0].id;

    return super.success( 0, id );
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

    if( search && search !== "" ){
      search = search.split( "," ).map( item => `%${item}%` );

      filters.push(
        `(
          coalesce( ae.title, '' ) ||
          ae.name ||
          ae.tagline ||
          ae.short_description ||
          ae.full_description
        ) ilike any( $${i++}::character varying[] )`
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
          a.id, a.status, a.is_favorite, at.locale, at.title, at.name, at.tagline, at.short_description, at.full_description, a.price_min, a.price_max,
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
        group by a.id, a.status, a.is_favorite, at.locale, at.title, at.name, at.tagline, at.short_description, at.full_description, a.price_min, a.price_max
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

  async getOne( allStatuses, id, locale, getSubscribers ){
    const status = allStatuses ? "" : "a.status = 'active' and";
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

    main.dates = ( await transaction.query(
      `select id, date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.images = ( await transaction.query(
      `select id, image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.companions = ( await transaction.query(
      `select c.id, c.name
      from
        actions_companions as ac,
        companions as c
      where
        ac.action_id = $1 and
        c.locale = $2 and
        c.id = ac.companion_id`,
      [ id, locale ]
    ) ).rows;

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

    if( getSubscribers ){
      main.subscribers = ( await transaction.query(
        `select u.name, u.surname, u.phone, u.email, u.image_path, u.role
        from
          actions_subscribers as asu,
          users as u
        where
          action_id = $1 and
          asu.user_id = u.id`,
        [ id ]
      ) ).rows;
    }

    await transaction.end();

    if( locale !== "ru" ) main.locations = main.locations.map( location => {
      if( location.address ) location.address = transliterate( location.address );

      return location;
    } );

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

  async edit( id, {
    status, price_min, price_max, organizer_id,
    site_payment, organizer_payment, emails, phones,
    websites, vk_link, facebook_link, instagram_link,
    twitter_link, is_favorite, title, name, tagline,
    short_description, full_description,
    organizer_name, contact_faces, dates, companions,
    locations, subjects, transfers
  } ){
    let set = [];
    const params = [ id ];
    let sc = 2;
    const transaction = await super.transaction();
    let translated = {};
    const yandexEngine = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch );
    const translator = new Translator( yandexEngine );
    const promises = [];

    if( status ){
      set.push( `status = $${sc++}` );
      params.push( status );
    }

    if( typeof price_min === "number" ){
      set.push( `price_min = $${sc++}` );
      params.push( price_min );
    }

    if( typeof price_max === "number" ){
      set.push( `price_max = $${sc++}` );
      params.push( price_max );
    }

    if( organizer_id === null || typeof organizer_id === "number" ){
      set.push( `organizer_id = $${sc++}` );
      params.push( organizer_id );
    }

    if( typeof site_payment === "boolean" ){
      set.push( `site_payment = $${sc++}` );
      params.push( site_payment );
    }

    if( organizer_payment !== undefined && organizer_payment !== "" ){
      set.push( `organizer_payment = $${sc++}` );
      params.push( organizer_payment );
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

    if( vk_link === null || vk_link ){
      set.push( `vk_link = $${sc++}` );
      params.push( vk_link );
    }

    if( facebook_link === null || facebook_link ){
      set.push( `facebook_link = $${sc++}` );
      params.push( facebook_link );
    }

    if( instagram_link === null || instagram_link ){
      set.push( `instagram_link = $${sc++}` );
      params.push( instagram_link );
    }

    if( twitter_link === null || twitter_link ){
      set.push( `twitter_link = $${sc++}` );
      params.push( twitter_link );
    }

    if( typeof is_favorite === "boolean" ){
      set.push( `is_favorite = $${sc++}` );
      params.push( is_favorite );
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

    // #fix move to "actionsTranslates.js" EDIT operations
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

    if( short_description ){
      const locale = short_description.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].short_description = short_description.text;

      if( short_description.autoTranslate === true )
        translator.add( "short_description", short_description.text, locale, short_description.toLocales );
    }

    if( full_description ){
      const locale = full_description.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].full_description = full_description.text;

      if( full_description.autoTranslate === true )
        translator.add( "full_description", full_description.text, locale, full_description.toLocales );
    }

    if( organizer_name ){
      const locale = organizer_name.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].organizer_name = organizer_name.text;

      if( organizer_name.autoTranslate === true ){
        const translited = transliterate( organizer_name.text );

        organizer_name.toLocales.forEach( toLocale => {
          if( translated[ toLocale ] === undefined )
            translated[ toLocale ] = {};

          translated[ toLocale ].organizer_name = translited;
        } );
      }
    }

    if( contact_faces ){
      const locale = contact_faces.locale;

      if( translated[ locale ] === undefined )
        translated[ locale ] = {};

      translated[ locale ].contact_faces = contact_faces.source;

      if( contact_faces.autoTranslate === true ){
        const translited = contact_faces.source.map( contactFace => transliterate( contactFace ) );

        contact_faces.toLocales.forEach( toLocale => {
          if( translated[ toLocale ] === undefined )
            translated[ toLocale ] = {};

          translated[ toLocale ].contact_faces = translited;
        } );
      }
    }

    await translator.translate();
    translator.transform();

    for( let key in translator.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
      else
        translated[ key ] = translator.transformed[ key ];

    for( let key in translated )
      promises.push( this.modules.actionsTranslates.createOrEdit( transaction, id, key, translated[ key ] ) );

    // Action dates
    if( dates ){
      if( dates.del )
        promises.push( this.modules.actionDates.del( dates.del, transaction ) );
      if( dates.edit )
        for( let item of dates.edit )
          promises.push( this.modules.actionDates.edit( item.id, item, transaction ) );
      if( dates.create )
        promises.push( this.modules.actionDates.create( id, dates.create, transaction ) );
    }

    // Actions companions
    if( companions ){
      if( companions.del )
        promises.push( this.modules.actionsCompanions.del( id, companions.del, transaction ) );
      if( companions.edit )
        for( let item of companions.edit )
          promises.push( this.modules.actionsCompanions.edit( id, item.oldCompanionId, item.newCompanionId, transaction ) );
      if( companions.create )
        promises.push( this.modules.actionsCompanions.create( id, companions.create, transaction ) );
    }

    // Actions locations
    if( locations ){
      if( locations.del )
        promises.push( this.modules.actionsLocations.del( id, locations.del, transaction ) );
      if( locations.edit )
        for( let item of locations.edit )
          promises.push( this.modules.actionsLocations.edit( id, item, transaction ) );
      if( locations.create )
        promises.push( this.modules.actionsLocations.create( id, locations.create, transaction ) );
    }

    // Actions subjects
    if( subjects ){
      if( subjects.del )
        promises.push( this.modules.actionsSubjects.del( id, subjects.del, transaction ) );
      if( subjects.edit )
        for( let item of subjects.edit )
          promises.push( this.modules.actionsSubjects.edit( id, item.oldSubjectId, item.newSubjectId, transaction ) );
      if( subjects.create )
        promises.push( this.modules.actionsSubjects.create( id, subjects.create, transaction ) );
    }

    // Actions transfers
    if( transfers ){
      if( transfers.del )
        promises.push( this.modules.actionsTransfers.del( id, transfers.del, transaction ) );
      if( transfers.edit )
        for( let item of transfers.edit )
          promises.push( this.modules.actionsTransfers.edit( id, item.oldTransferId, item.newTransferId, transaction ) );
      if( transfers.create )
        promises.push( this.modules.actionsTransfers.create( id, transfers.create, transaction ) );
    }

    await Promise.all( promises );
    await transaction.end();

    return super.success();
  }
}
