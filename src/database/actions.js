import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions" );
  }

  async getAll( locale, allStatus, count, offset ){
    const status = allStatus ? "" : "a.status = 'active' and";
    const limit = count && count > 0 ? `limit ${count}` : "";
    const offset_ = offset && offset > -1 ? `offset ${offset}` : "";

    const rows = ( await super.query(
      `select
        a.id, a.status, at.name,
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
      group by a.id, a.status, at.name, ai.image_url, a.price_min, a.price_max
      order by a.id
      ${limit}
      ${offset_}`,
      [ locale ]
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( locale, dateStart, dateEnd, locations, companions, subjects, priceMin, priceMax, count, offset ){
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
          a.id, at.locale, at.name, a.price_min, a.price_max,
          array_agg( l.id ) as locations_ids,
          array_agg( l.name ) as locations
        from
          actions as a,
          actions_translates as at,
          actions_locations as al,
          locations as l
        where
          a.status = 'active' and
          at.locale = $1 and
          a.id = at.action_id and
          l.locale = at.locale and
          a.id = al.action_id and
          al.location_id = l.id
        group by a.id, at.locale, at.name, a.price_min, a.price_max
      )
      select
        tmp.*,
        array_agg( ad.date_start ) as date_starts,
        array_agg( ad.date_end ) as date_ends,
        ai.image_url,
        count( 1 ) over ()
      from (
        select
          ae.id, ae.name, ae.price_min, ae.price_max, ae.locations,
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
        group by ae.id, ae.name, ae.price_min, ae.price_max, ae.locations ) as tmp
        left join action_dates as ad
        on ad.action_id = tmp.id
        left join action_images as ai
        on ai.action_id = tmp.id and ai.is_main = true
      ${datesFilter}
      group by tmp.id, tmp.name, tmp.price_min, tmp.price_max, tmp.locations, tmp.companions, tmp.subjects, ai.image_url
      order by tmp.id
      ${limit}
      ${offset_}`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getOne( id, locale ){
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
        a.status = 'active' and
        a.id = $1 and
        a.id = at.action_id and
        at.locale = $2`,
      [ id, locale ]
    ) ).rows[0];

    if( main === undefined ){
      await transaction.end();

      return super.error( 10 );
    }

    delete main.organizer_id;
    delete main.action_id;

    main.images = ( await transaction.query(
      `select image_url, is_main
      from action_images
      where action_id = $1`,
      [ id ]
    ) ).rows;
    main.dates = ( await transaction.query(
      `select date_start, date_end, time_start, time_end, days
      from action_dates
      where action_id = $1`,
      [ id ]
    ) ).rows;
    // #fix локаль для адреса локации
    main.locations = ( await transaction.query(
      `select l.name, al.address
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
      `select t.name
      from
        actions_transfers as at,
        transfers as t
      where
        at.action_id = $1 and
        t.locale = $2 and
        t.id = at.transfer_id`,
      [ id, locale ]
    ) ).rows.map( transfer => transfer.name );
    main.subjects = ( await transaction.query(
      `select s.name
      from
        actions_subjects as acsu,
        subjects as s
      where
        acsu.action_id = $1 and
        s.locale = $2 and
        s.id = acsu.subject_id`,
      [ id, locale ]
    ) ).rows.map( transfer => transfer.name );
    await transaction.end();

    delete main.locale;

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
    status, priceMin, priceMax, organizerId,
    sitePaymant, organizerPayment, emails, phones,
    websites, vkLink, facebookLink, instagramLink,
    twitterLink, isFavorite
  } ){
    let set = [];
    const params = [ id ];
    let sc = 2;

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

      await super.query(
        `update actions
        set ${set}
        where id = $1`,
        params
      );
    }

    return super.success();
  }
}
