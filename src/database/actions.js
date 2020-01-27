import Foundation from "./helpers/foundation";

export default class extends Foundation{
  constructor( modules ){
    super( modules, "Actions" );
  }

  async getAll( count ){
    const limit = count ? `limit ${count}` : "";
    const rows = ( await super.query(
      `select
         a.id, a.name,
         array_agg( distinct ad.date_start ) as date_starts,
         array_agg( distinct ad.date_end ) as date_ends,
         ai.image_url, a.price_min, a.price_max,
         array_agg( distinct s.name ) as subjects,
         array_agg( distinct l.name ) as locations
       from
         actions as a
         left join action_dates as ad
         on a.id = ad.action_id
         left join action_images as ai
         on a.id = ai.action_id and ai.is_main = true
         left join actions_subjects as acsu
         on a.id = acsu.action_id
         left join subjects as s
         on acsu.subject_id = s.id
         left join actions_locations as al
         on a.id = al.action_id
         left join locations as l
         on al.location_id = l.id
       group by a.id, a.name, ai.image_url, a.price_min, a.price_max
       order by a.id
       ${limit}`
    ) ).rows;

    return super.success( 0, rows );
  }

  async filter( dateStart, dateEnd, locations, companions, subjects, price_min, price_max, count ){
    const limit = count ? `limit ${count}` : "";
    let filters = [];
    const params = [];
    let i = 1;
    let datesFilter = [];

    // #fix добавить фильтр на цену
    // if( price_min ){
    //   filters.push( `a.price >= $${i}` );
    //   params.push( price_min );
    //   i++;
    // }
    // if( price_max ){
    //   filters.push( `a.price <= $${i}` );
    //   params.push( price_max );
    //   i++;
    // }
    if( locations ){
      filters.push( `la.ids @> $${i}::int[]` );
      params.push( locations );
      i++;
    }
    if( companions ){
      filters.push( `c.id = any( $${i}::int[] )` );
      params.push( companions );
      i++;
    }
    if( subjects ){
      filters.push( `s.id = any( $${i}::int[] )` );
      params.push( subjects );
      i++
    }
    if( dateStart ){
      datesFilter.push( `( ad.date_start is null or ad.date_start >= $${i} )` );
      params.push( dateStart );
      i++;
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
      `with locations_arrays as (
      	select
      		a.id,
      		array_agg( l.id ) as ids,
      		array_agg( l.name ) as names
      	from
      		actions as a,
      		actions_locations as al,
      		locations as l
      	where
      		a.id = al.action_id and
      		al.location_id = l.id
      	group by a.id
      )
      select
      	tmp.*,
      	array_agg( ad.date_start ) as date_starts,
      	array_agg( ad.date_end ) as date_ends,
        ai.image_url
      from (
      	select
      		a.id, a.name, a.price_min, a.price_max,
      		la.names as locations,
      		array_agg( distinct c.name ) as companions,
      		array_agg( distinct s.name ) as subjects
      	from
      		actions as a,
      		locations_arrays as la,
      		actions_companions as ac,
      		companions as c,
      		actions_subjects as acsu,
      		subjects as s
      	where
      		${filters}
      		a.id = la.id and
      		ac.companion_id = c.id and
      		ac.action_id = a.id and
      		acsu.subject_id = s.id and
      		acsu.action_id = a.id
      	group by a.id, a.name, a.price_min, a.price_max, la.names ) as tmp
      	left join action_dates as ad
      	on ad.action_id = tmp.id
        left join action_images as ai
      	on ai.action_id = tmp.id and ai.is_main = true
      ${datesFilter}
      group by tmp.id, tmp.name, tmp.price_min, tmp.price_max, tmp.locations, tmp.companions, tmp.subjects, ai.image_url
      order by tmp.id
      ${limit}`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  async getOne( id ){
    const transaction = await super.transaction();
    const main = ( await transaction.query(
      `select a.*, u.email as organizer_email, u.phone as organizer_phone
      from
        actions as a
        left join users as u
        on a.organizer_id = u.id
      where a.id = $1`,
      [ id ]
    ) ).rows[0];

    if( main === undefined ){
      await transaction.end();

      return super.error( 10 );
    }

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
    main.locations = ( await transaction.query(
      `select l.name
      from
        actions_locations as al,
        locations as l
      where
        al.action_id = $1 and
        l.id = al.location_id`,
      [ id ]
    ) ).rows;
    main.transfers = ( await transaction.query(
      `select t.name
      from
        actions_transfers as at,
        transfers as t
      where
        at.action_id = $1 and
        t.id = at.transfer_id`,
      [ id ]
    ) ).rows;
    main.subjects = ( await transaction.query(
      `select s.name
      from
        actions_subjects as acsu,
        subjects as s
      where
        acsu.action_id = $1 and
        s.id = acsu.subject_id`,
      [ id ]
    ) ).rows;

    return super.success( 0, main );
  }
}
