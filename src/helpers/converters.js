"use strict";

export {
  toInt,
  toIntArray,
  contactsToString,
  dateToString
};

function toInt( st ){
  if( st === undefined || st === "" )
    return null;

  if( typeof st === "number" )
    return st;

  const int = parseInt( st.replace( / +/g, "" ) );

  if( isNaN( int ) || typeof int !== "number" )
    return null;

  return int;
}

function toIntArray( st ){
  if( st === undefined || st === "" )
    return null;

  const arr = st.replace( / +/g, "" ).split( "," );

  for( let i = 0; i < arr.length; i++ ){
    arr[i] = toInt( arr[i] );

    if( arr[i] === null )
      return null;
  }

  return arr;
}

function contactsToString( contact_faces, emails, phones ){
  contact_faces = contact_faces ? contact_faces : [];
  emails = emails ? emails : [];
  phones = phones ? phones : [];

  const maxCount = Math.max( Math.max( contact_faces.length, emails.length ), phones.length );
  let contacts = [];

  for( let i = 0; i < maxCount; i++ ){
    contacts[i] = [];

    if( contact_faces[i] !== undefined )
      contacts[i].push( contact_faces[i] );
    if( emails[i] !== undefined )
      contacts[i].push( emails[i] );
    if( phones[i] !== undefined )
      contacts[i].push( phones[i] );

    contacts[i] = contacts[i].join( ", " );
  }

  return contacts;
}

function parseDate( dateString ){
  if( dateString === null ) return null;

  const date = new Date( dateString );
  let day = "" + date.getDate();
  let month = "" + date.getMonth();
  let year = date.getFullYear();

  if( day.length === 1 ) day = "0" + day;
  if( month.length === 1 ) month = "0" + month;

  return `${day}.${month}.${year}`;
}

function parseDays( days, _ ){
  if( days === null ) return null;

  let sum = 0;

  days.forEach( day => sum += day );

  if( sum === 21 ) return _( "every_day" );

  let st = "";

  days.forEach( ( day, i ) => {
    switch( day ){
      case 0: st += _( "monday.short" ); break;
      case 1: st += _( "tuesday.short" ); break;
      case 2: st += _( "wednesday.short" ); break;
      case 3: st += _( "thursday.short" ); break;
      case 4: st += _( "friday.short" ); break;
      case 5: st += _( "saturday.short" ); break;
      case 6: st += _( "sunday.short" );
    }

    if( i < days.length - 2 ) st += ", ";
    else if( i < days.length - 1 ) st += ` ${_( "and" )} `;
  } );

  return `${_( "days_parser.by_days" )} ${st}`;
}

function upperFirst( st ){
  return st[0].toUpperCase() + st.slice( 1, st.length );
}

// #fix переделать на НОРМАЛЬНУЮ логику
function dateToString( date, _ ){
  let result = "";

  // #fix убрать
  if( _ === undefined ) return null;

  if( date.date_start ) result += `${upperFirst( _( "date_to_string.start" ) )} ${parseDate( date.date_start )}`;

  if( date.days ){
    const parsedDays = parseDays( date.days, _ );

    if( result !== "" ) result += ` ${parsedDays}`;
    else result += upperFirst( parsedDays );
  }

  if( date.time_start ){
    if( result !== "" ) result += ` ${_( "date_to_string.start" )} ${date.time_start}`;
    else result += `${upperFirst( _( "date_to_string.start" ) )} ${date.time_start}`;
  }

  if( date.date_end ){
    const parsedDate = parseDate( date.date_end );

    if( result !== "" ) result += ` ${_( "date_to_string.end" )} ${parsedDate}`;
    else result += `${upperFirst( _( "date_to_string.end" ) )} ${parsedDate}`;
  }

  if( date.time_end ){
    if( result !== "" ) result += ` ${_( "date_to_string.end" )} ${date.time_end}`;
    else result += `${upperFirst( _( "date_to_string.end" ) )} ${date.time_end}`;
  }

  return result;
}
