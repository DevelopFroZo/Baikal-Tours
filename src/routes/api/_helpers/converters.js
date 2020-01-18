export function toInt( st ){
  if( st === undefined || st === "" )
    return null;

  const int = parseInt( st.replace( / +/g, "" ) );

  if( isNaN( int ) || typeof int !== "number" )
    return null;

  return int;
}

export function toIntArray( st ){
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
