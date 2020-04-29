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
      `insert into actions( price_min, price_max, site_payment )
      values( 0, 0, false )
      returning id`
    ) ).rows[0].id;

    return super.success( 0, id );
  }

  async getAll( allStatuses, locale, count, offset, favoritesOnly ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";
    let favoritesColumn = "";
    let favoritesTable = "";
    let favoritesWhere = "";
    let group = "";
    let order = "date_starts, a.id";

    if( favoritesOnly ){
      favoritesColumn = "f.id as favorite_id,";
      favoritesTable = "favorites as f,";
      favoritesWhere = "f.action_id = a.id and";
      group = ", f.subject_id, f.number, favorite_id";
      order = "f.subject_id, f.number";
    }

    const rows = ( await super.query(
      `select
        a.id, a.status, at.name, ${favoritesColumn}
        array_agg( distinct ad.date_start ) as date_starts,
        array_agg( distinct ad.date_end ) as date_ends,
        ai.image_url, a.price_min, a.price_max,
        array_agg( distinct s.name ) as subjects,
        array_agg( distinct l.name ) as locations,
        coalesce( min( ab.price ), 0 ) as price_min_,
        coalesce( max( ab.price ), 0 ) as price_max_,
        count( 1 ) over ()
      from
        ${favoritesTable}
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
        on al.location_id = l.id and l.locale = $1
        left join action_buyable as ab
        on a.id = ab.action_id and ab.type = 'ticket',
        actions_translates as at
      where
        ${favoritesWhere}
        ${status}
        a.id = at.action_id and
        at.locale = $1
      group by a.id, a.status, at.name, ai.image_url, a.price_min, a.price_max${group}
      order by ${order}
      ${limit}
      ${offset_}`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( allStatuses, locale, dateStart, dateEnd, locations, companions, subjects, search, priceMin, priceMax, count, offset, favoritesOnly ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";
    let filters = [];
    const params = [ locale ];
    let i = params.length + 1;
    let datesFilter = [];
    let favoritesColumns0 = "";
    let favoritesColumns1 = "";
    let favoritesColumns2 = "";
    let favoritesColumns3 = "";
    let favoritesTable = "";
    let favoritesWhere = "";
    let order = "date_starts, tmp.id";

    if( favoritesOnly ){
      favoritesColumns0 = "f.id as favorite_id, f.subject_id as fsi, f.number as fn,";
      favoritesColumns1 = "favorite_id, fsi, fn,";
      favoritesColumns2 = "ae.favorite_id, ae.fsi, ae.fn,";
      favoritesColumns3 = "tmp.favorite_id, tmp.fsi, tmp.fn,";
      favoritesTable = "favorites as f,";
      favoritesWhere = "f.action_id = a.id and";
      order = "tmp.fsi, tmp.fn";
    }

    if( typeof priceMin === "number" && priceMin >= 0 ){
      filters.push( `ae.price_min_ >= $${i++}` );
      params.push( priceMin );
      i++;
    }

    if( typeof priceMax === "number" && priceMax <= 0 ){
      filters.push( `ae.price_max_ <= $${i++}` );
      params.push( priceMax );
      i++;
    }

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
          ae.name ||
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
          a.id, a.status, at.locale, at.title,
          at.name, at.tagline, at.short_description,
          at.full_description, a.price_min, a.price_max,
          ${favoritesColumns0}
          array_agg( l.id ) as locations_ids,
          array_agg( l.name ) as locations,
          coalesce( min( ab.price ), 0 ) as price_min_,
          coalesce( max( ab.price ), 0 ) as price_max_
        from
          ${favoritesTable}
          actions as a
          left join action_buyable as ab
          on a.id = ab.action_id and ab.type = 'ticket',
          actions_translates as at,
          actions_locations as al,
          locations as l
        where
          ${status}
          at.locale = $1 and
          ${favoritesWhere}
          a.id = at.action_id and
          l.locale = at.locale and
          a.id = al.action_id and
          al.location_id = l.id
        group by
          a.id,
          a.status,
          at.locale,
          at.title,
          at.name,
          at.tagline,
          at.short_description,
          at.full_description,
          a.price_min,
          ${favoritesColumns1}
          a.price_max
      )
      select
        tmp.*,
        array_agg( ad.date_start ) as date_starts,
        array_agg( ad.date_end ) as date_ends,
        ai.image_url,
        count( 1 ) over ()
      from (
        select
          ae.id, ae.status, ae.name, ae.price_min, ae.price_max, ae.locations,
          ${favoritesColumns2}
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
        group by ae.id, ae.status, ae.name, ae.price_min, ae.price_max, ${favoritesColumns2} ae.locations ) as tmp
        left join action_dates as ad
        on ad.action_id = tmp.id
        left join action_images as ai
        on ai.action_id = tmp.id and ai.is_main = true
      ${datesFilter}
      group by
        tmp.id,
        tmp.status,
        tmp.name,
        tmp.price_min,
        tmp.price_max,
        tmp.locations,
        tmp.companions,
        tmp.subjects,
        ${favoritesColumns3}
        ai.image_url
      order by ${order}
      ${limit}
      ${offset_}`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getOne( allStatuses, id, locale ){
    const status = allStatuses ? "" : "a.status = 'active' and";
    const transaction = await super.transaction();

    const main = ( await transaction.query(
      `select
        a.*, at.*
      from
        actions as a,
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
      where action_id = $1
      order by date_start`,
      [ id ]
    ) ).rows;

    main.images = ( await transaction.query(
      `select id, image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;

    main.partners = ( await transaction.query(
      `select id, name, image_url
      from action_partners
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
      `select l.name, al.id, al.address, al.coords
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

    main.excursions = ( await transaction.query(
      `select e.*, et.name
      from
        actions_excursions as ae,
        excursions as e,
        excursions_translates as et
      where
        ae.action_id = $1 and
        et.locale = $2 and
        ae.excursion_id = e.id and
        e.id = et.excursion_id
      order by ae.number`,
      [ id, locale ]
    ) ).rows;

    main.tours = ( await transaction.query(
      `select t.*, tt.name
      from
        actions_tours as at,
        tours as t,
        tours_translates as tt
      where
        at.action_id = $1 and
        tt.locale = $2 and
        at.tour_id = t.id and
        t.id = tt.tour_id
      order by at.number`,
      [ id, locale ]
    ) ).rows;

    main.buyable = ( await transaction.query(
      `select ab.id, ab.type, ab.price, abt.name
      from
        action_buyable as ab,
        action_buyable_translates as abt
      where
        ab.action_id = $1 and
        abt.locale = $2 and
        ab.id = abt.action_buyable_id`,
      [ id, locale ]
    ) ).rows;

    await transaction.end();

    if( locale !== "ru" ){
      main.locations = main.locations.map( location => {
        if( location.address ) location.address = transliterate( location.address );

        return location;
      } );

      main.partners = main.partners.map( partner => {
        partner.name = transliterate( partner.name );

        return partner;
      } );
    }

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
    status, price_min, price_max, organizer_ids,
    site_payment, organizer_payment, emails, phones,
    websites, vk_link, facebook_link, instagram_link,
    twitter_link, title, name, tagline,
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
    const yandexEngineHTML = yandexEngineBuilder( process.env.YANDEX_TRANSLATE_API_KEY, fetch, { format: "html" } );
    const translator = new Translator( yandexEngine );
    const translatorHTML = new Translator( yandexEngineHTML );
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

    if( organizer_ids === null || Array.isArray( organizer_ids ) ){
      set.push( `organizer_ids = $${sc++}::int[]` );
      params.push( organizer_ids );
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
        translatorHTML.add( "full_description", full_description.text, locale, full_description.toLocales );
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
    await translatorHTML.translate();
    translator.transform();
    translatorHTML.transform();

    for( let key in translator.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translator.transformed[ key ] };
      else
        translated[ key ] = translator.transformed[ key ];

    for( let key in translatorHTML.transformed )
      if( translated[ key ] !== undefined )
        translated[ key ] = { ...translated[ key ], ...translatorHTML.transformed[ key ] };
      else
        translated[ key ] = translatorHTML.transformed[ key ];

    promises.push( ( async () => {
      for( let key in translated )
        await this.modules.actionsTranslates.createOrEdit( transaction, id, key, translated[ key ] );
    } )() );

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
        promises.push( this.modules.actionsLocations.del( locations.del, transaction ) );
      if( locations.edit )
        for( let item of locations.edit )
          promises.push( this.modules.actionsLocations.edit( item, transaction ) );
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
