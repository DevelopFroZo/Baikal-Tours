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
         ai.image_url, a.price,
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
       group by a.id, a.name, ai.image_url, a.price
       ${limit}`
    ) ).rows;

    console.log( rows );

    return super.success( 0, rows );
  }

  async filter( dateStart, dateEnd, locations, companions, subjects, price_min, price_max, count ){
    const limit = count ? `limit ${count}` : "";
    let filters = [];
    const params = [];
    let i = 1;
    let locations_filter = "";

    if( dateStart ){
      filters.push( `( ad.date_start is null or ad.date_start >= $${i} )` );
      params.push( dateStart );
      i++;
    }
    if( dateEnd ){
      filters.push( `( ad.date_end is null or ad.date_end <= $${i} )` );
      params.push( dateEnd );
      i++;
    }
    if( locations ){
      locations_filter = `where tmp.location_ids @> $${i}::int[]`;
      params.push( locations );
      i++;
    }
    if( price_min ){
      filters.push( `a.price >= $${i}` );
      params.push( price_min );
      i++;
    }
    if( price_max ){
      filters.push( `a.price <= $${i}` );
      params.push( price_max );
      i++;
    }
    if( companions ){
      filters.push( `( ac.companion_id is null or ac.companion_id = any( $${i}::int[] ) )` );
      params.push( companions );
      i++;
    }
    if( subjects ){
      filters.push( `( acsu.subject_id is null or acsu.subject_id = any( $${i}::int[] ) )` );
      params.push( subjects );
    }

    if( filters.length === 0 ) filters = "";
    else filters = `where ${filters.join( " and\n" )}`;

    const rows = ( await super.query(
      `select id, name, date_starts, date_ends, image_url, price, subjects, locations from (
      	select
      		a.id, a.name,
      		array_agg( distinct ad.date_start ) as date_starts,
      		array_agg( distinct ad.date_end ) as date_ends,
      		ai.image_url, a.price,
      		array_agg( distinct al.location_id ) as location_ids,
      		array_agg( distinct s.name ) as subjects,
      		array_agg( distinct l.name ) as locations
      	from
      		actions as a
      		left join action_dates as ad
      		on a.id = ad.action_id
      		left join action_images as ai
      		on a.id = ai.action_id
      		left join actions_locations as al
      		on a.id = al.action_id
      		left join locations as l
      		on al.location_id = l.id
      		left join actions_companions as ac
      		on a.id = ac.action_id
      		left join actions_subjects as acsu
      		on a.id = acsu.action_id
      		left join subjects as s
      		on acsu.subject_id = s.id
      	${filters}
        group by a.id, a.name, a.price, ai.image_url ) as tmp
      ${locations_filter}
      ${limit}`,
      params
    ) ).rows;

    return super.success( 0, rows );
  }

  // #fix передать нужные значения
  async getOne( id ){
    const row = ( await super.query(
      `select *
      from actions
      where id = $1`,
      [ id ]
    ) ).rows[0];

    if( row === undefined ) return super.error( 10 );

    return super.success( 0, row );
  }
}
