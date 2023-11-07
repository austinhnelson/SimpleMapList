import {Marker} from 'react-native-maps';

/** Function to load a list from a remote URL */
async function loadList(aurl,alist,asetlist,asetm) {
  console.log("Preparing to load...");

  /** Establishing Connection */
  const response = await fetch(aurl);  // connecting can take a while, use await
  console.log(response)

  /** Parse JSON */
  const names = await response.json(); // parse the returned json object
  console.log(names);

  /** Store each name into the list */
  names.forEach((item ) => {
     alist.push(item)
  })
  
   const newList = alist.map((item) => {return item})

   const mList = alist.map((item) => {
                      var newm = <Marker
                                  coordinate={{latitude: item.latitude, longitude: item.longitude}}
                                  title={item.key}
                                  description={"Airport"}
                                  />
                      return newm})
                      
   asetlist(newList);
   asetm(mList)
}

/** Function to save a list to a URL */
async function saveList(aurl, list) {
    const requestOptions = {
        method: 'POST', // we are writing
        headers: { 'Content-Type': 'application/json' }, // using JSON
        body: JSON.stringify(list) // converting data to JSON to be used
    };
    const response = await fetch(aurl, requestOptions); // connecting can take a while, so use await
    console.log(response);
    console.log("Save worked");
}

/** Export functions for use */
export {loadList}
export {saveList}