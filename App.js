/** Importing neccessary modules */
import React, {useState,useEffect} from 'react';
import {TouchableOpacity, VirtualizedList, Button, StyleSheet, Text, View } from 'react-native';
import {loadList,saveList} from './components/RemoteUtils'
import MapView from 'react-native-maps';
import {Marker} from 'react-native-maps';
import { useWindowDimensions } from 'react-native';
import DialogInput from 'react-native-dialog-input';
import Geocoder from 'react-native-geocoding';
import * as Location from 'expo-location';

/** Defining design styles for the app (CSS like things) */
const styles = StyleSheet.create({
  /** Background / Layout (Portrait) */
  portrait_container: {
    flex: 1,
    backgroundColor: '#d45059',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 5,
  },
  /** Background / Layout (Landscape) */
  landscape_container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: '#d45059',
    alignItems: 'center',
  }, 
  /** Setting up the row for the buttons */
  rowblock: {
    height: 80,
    width: 300,
    padding: 10,
  },
  /** Styles for the actual buttons */
  buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 5,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      padding: 0,
      paddingTop: 0
  },
  /** Styles for text */
  item: {
    padding: 8,
    fontSize: 12,
    height: 44,
    borderRadius: '10px',
  },
  /** Styles for titles */
  title: {
    fontSize: 22,
  },
});

/** Represents each item in the list */
const Item = ({ item, onPress, backgroundColor, textColor }) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, backgroundColor]}>
    <Text style={[styles.title, textColor]}>{item.key}</Text>
  </TouchableOpacity>
);

Geocoder.init("AIzaSyDqW8jK0xxnIRKTKXACxIK-q3UerQTiCsA");

/** Main function that is responsible for the design, logic and drawing of the app */
const MapList = () => {

  /** State variables for controlling "moving pieces" */
  const [list, setlist] = useState([]);
  const [ashowme,setshowme] = useState(false);
  const [firsttime, setfirst] = useState(true);

  /** Empty data placeholder */
  var emptydata = [];

  const [markers,setMarks] = useState();

  /** Necessary functions for VirtualizedList */

  /** Return total number of items in the list */
  const getItemCount = (data) => list.length; // ignore data

  /** Get a single item for the list */
  const getItem = (data, index) => (list[index]); // ignore data

  /* Using a hook to tell the screen to do "stuff" after the screen renders, in this case it will auto load a list on startup */
  useEffect(() => {
    if (firsttime)
      {
        var url = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/loadjson.php?user=austinnelson445"
        loadList(url, list, setlist, setMarks);
        setfirst(false);
      }
    }, [list, firsttime])

  /** Adding item to the list */
  function plusButton() {
    setshowme(true);
  }

  /** Remove an item from the list */
  function delButton() {
    const newList = [];
    /** Loop through list to find selected item */
    list.forEach((item) =>
    {
        /** Add to list if it is not selected */
        if (!item.selected) {
          newList.push(item);
        }
    })

    setlist(newList);
  }

  /** Function to load a saved list from URL */
  function loadButton() {
    var url = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/loadjson.php?user=austinnelson445"
    loadList(url,list,setlist,setMarks)
  }

  /** Function to save list to remote URL */
  function saveButton() {
    var url = "https://cs.boisestate.edu/~scutchin/cs402/codesnips/savejson.php?user=austinnelson445"
    saveList(url,list)
  }

/** Gets the current device location using Expo's Location module */
async function getCurrentLocation() {
  try {
    /** Attempt to get the permissions to grab the location of the user */
    const { status } = await Location.requestForegroundPermissionsAsync();

    /** Error checking */
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    /** Get the location and store the coords */
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    /** Use reverse geocoding to get the full address of the device */
    Geocoder.from({ latitude, longitude })
      .then(async (json) => {
        /** Get the full address from the returned JSON */
        const address = json.results[0].formatted_address;

        /** using helper function, get the city from the full address */
        const city = getCity(address);

        // Use your addLocation function to add the city to your list
        addLocation(city);
      })
      .catch((error) => {
        console.error('Error reverse geocoding:', error);
      });
  } catch (error) {
    console.error('Error getting location:', error);
  }
}

/** Function to get a city from the full address */
function getCity(fullAddress) {
  /** Split up the full address */
  const parts = fullAddress.split(', ');
  if (parts.length >= 2) {
    /** City is the second part in how the location is pulled */
    return parts[1];
  }
  return fullAddress;
}
   
  /** Gets Geoinformation about a location */ 
  function addLocation(alocation) { 
    
    /** Object to store the location data */
    var location = {};
    
    /** Fetch the location info */
    Geocoder.from(alocation)
      .then(json => {
        /** Get the latitude and longitude */
        location = json.results[0].geometry.location;

        /** Create a new list with the selected info */
        var newList = [
          {
            key: alocation, 
            selected: false, 
            longitude: location.lng, 
            latitude: location.lat 
          },
        ];

        /** Create a Marker component for the location */
        var amark = (
          <Marker
            coordinate={{
              latitude: location.lat, 
              longitude: location.lng,
              }}
              title={alocation}
              description={"Airport"}
          />
        );

        /** Concatenate the new list with the old list */
        newList = newList.concat(list)
      
        /** Add the new marker to the old marker list */
        var marklist = markers.concat(amark);

        /** Update states */
        setlist(newList);
        setMarks(marklist);
      })
      .catch(error => console.warn(error)); // handle any errors 
  }
 
  /** Handles the selecting logic as well as the animating to the region on the map */
  function toggleSelect(aindex){
    /** Loop through list to find specified item */
    const newList = list.map((item,index) => {    
      if (aindex == index)
      {
        /** If the item is already highlighted, unselect it */
        if (item.selected)
        {
          item.selected = false;
        }
        /** If it isn't selected, handle the logic of moving the map and selecting it */
        else
        {
          mapref.current.animateToRegion({latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.1, longitudeDelta: 0.1});
          item.selected = true;
        }
      }
      /** Make sure only selected item is highlighted */
      else{
        item.selected = false;
      }
      return item;
    })

    setlist(newList);
  }

  /** Responsible for drawing / updating components */
  const renderItem = ({ item,index }) => {
    const backgroundColor = item.selected ? '#4d494a' : '#d45059';
    const color = 'white';
    /** Gets item to draw */
    return (
      <Item item={item} 
        onPress={() => {toggleSelect(index)}}
        backgroundColor={{ backgroundColor }}
        textColor={{ color }}
      />
    );
  };

  /** Displays how the operations bar is laid out */
  var buttonrow = 
                <View style={styles.rowblock} >
                  <View style={styles.buttonContainer}>
                    <Button color='white' title="+" onPress={() => plusButton()}  />
                    <Button color='white' title="-" onPress={() => delButton()}/>
                    <Button color='white' title="Load" onPress={() => loadButton()}/>
                    <Button color='white' title="Save" onPress={() => saveButton()}/>
                    <Button color='white' title="Current" onPress={() => getCurrentLocation()}/>
                    </View>
                </View>

  /** Handles the actual data list */
  var avirtlist =<VirtualizedList styles={styles.list}
      data={emptydata}
      initialNumToRender={4}
      renderItem={renderItem}
      keyExtractor={(item,index) => index}
      getItem={getItem}
      getItemCount={getItemCount}
    />

  /** Handling display of the map */
  const mapref = React.createRef();
  const SCREEN_WIDTH = useWindowDimensions().width;
  const SCREEN_HEIGHT = useWindowDimensions().height;
  var smaps = {width: SCREEN_WIDTH, height: SCREEN_HEIGHT/2}
  
  /** Handling the display of the map in portrait vs landscape */
  if (SCREEN_WIDTH > SCREEN_HEIGHT)
  {
    smaps = {width: SCREEN_WIDTH, height: SCREEN_HEIGHT}

  }

  /** Define a MapView component */
  var mymap=<MapView ref={mapref} style={smaps} >
             {markers} 
            </MapView >

  /** Handling adding a location display logic */
  var alist=<View style={styles.portrait_container} >
    {mymap}
    {buttonrow}
    {avirtlist} 
    <DialogInput isDialogVisible={ashowme} 
        title="Enter Address"
        message="Enter The Address To Add"
        submitInput={ (inputText) =>{setshowme(false); addLocation(inputText)}}
        closeDialog={() => {setshowme(false)}}
        >
    <Text>Something</Text>
    </DialogInput>
    </View>

  /** Adding the location but for landscape mode */
  var ablist=<View style={styles.landscape_container} >
    <View >
    {buttonrow}
    {avirtlist} 
    <DialogInput isDialogVisible={ashowme} 
        title="Enter Address"
        message="Enter The Address To Add"
        submitInput={ (inputText) =>{setshowme(false); addLocation(inputText)}}
        closeDialog={() => {setshowme(false)}}
        >
    <Text>Something</Text>
    </DialogInput>
    </View >
    {mymap}
    </View>

  /** Handling display of the pop-up screen when in portrait vs landscape */
  if (SCREEN_WIDTH > SCREEN_HEIGHT)
  {
    return ablist;
  }    
  return (alist) 
}

export default MapList;