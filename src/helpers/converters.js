export {
  contactsToString,
  dateToString
};

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

function parseDays( days ){
  if( days === null ) return null;

  let sum = 0;

  days.forEach( day => sum += day );

  if( sum === 21 ) return "каждый день";

  let st = "";

  days.forEach( ( day, i ) => {
    switch( day ){
      case 0: st += "ПН"; break;
      case 1: st += "ВТ"; break;
      case 2: st += "СР"; break;
      case 3: st += "ЧТ"; break;
      case 4: st += "ПТ"; break;
      case 5: st += "СБ"; break;
      case 6: st += "ВС";
    }

    if( i < days.length - 2 ) st += ", ";
    else if( i < days.length - 1 ) st += " и ";
  } );

  return `по ${st}`;
}

function upperFirst( st ){
  return st[0].toUpperCase() + st.slice( 1, st.length );
}

// #fix переделать на НОРМАЛЬНУЮ логику
function dateToString( date ){
  let result = "";

  if( date.date_start ) result += `С ${parseDate( date.date_start )}`;

  if( date.days ){
    const parsedDays = parseDays( date.days );

    if( result !== "" ) result += ` ${parsedDays}`;
    else result += upperFirst( parsedDays );
  }

  if( date.time_start ){
    if( result !== "" ) result += ` с ${date.time_start}`;
    else result += `С ${date.time_start}`;
  }

  if( date.date_end ){
    const parsedDate = parseDate( date.date_end );

    if( result !== "" ) result += ` до ${parsedDate}`;
    else result += `До ${parsedDate}`;
  }

  if( date.time_end ){
    if( result !== "" ) result += ` до ${date.time_end}`;
    else result += `До ${date.time_end}`;
  }

  return result;
}
