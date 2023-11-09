import React from "react";
import {
  View,
  Text,
  Pressable,
  Button,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ActivityCard from "../components/ActivityCard";
import CreateActivity from "./CreateActivity";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { db, auth } from "../firebaseConfig";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import Carousel from "react-native-snap-carousel"; //NEW
import MyCarousel from "../components/MyCarousel"; //NEW

export default function Activities({ navigation }) {
  const { width, height } = Dimensions.get("window");
  ///Variables
  //Location State
  const [userActivityList, setUserActivityList] = useState([]);
  const [deviceLocation, setDeviceLocation] = useState(null);
  const [activityDataList, setActivityDataList] = useState([]);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    country: "",
    postalCode: "",
    imageUrl: "",
  });
  const [filterList, setFilterList] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(null); // State to keep track of the selected filter
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false); // State to control the visibility of the filter modal

  const toggleFilterModal = () => {
    setIsFilterModalVisible(!isFilterModalVisible);
  };

  const applyFilter = (sportType) => {
    setSelectedFilter(sportType);
    toggleFilterModal();
  };

  const clearFilter = () => {
    setSelectedFilter(null);
    toggleFilterModal();
  };

  async function getFilters() {
    let sportsTypes = new Set();
    const eventsSnapshot = await getDocs(collection(db, "events"));

    for (let userDoc of eventsSnapshot.docs) {
      const userId = userDoc.id;
      const sportsSnapshot = await getDocs(
        collection(db, "events", userId, "sports")
      );

      for (let sportDoc of sportsSnapshot.docs) {
        sportsTypes.add(sportDoc.data().sportType);
      }
    }

    setFilterList([...sportsTypes]);
  }

  const getFilteredActivities = () => {
    if (!selectedFilter) {
      return activityDataList; // No filter selected, return all activities
    }
    return activityDataList.filter(
      (activity) => activity.sportType === selectedFilter
    );
  };

  const FilterModal = () => {
    return (
      <Modal visible={isFilterModalVisible} onBackdropPress={toggleFilterModal}>
        <View
          style={{ backgroundColor: "white", padding: 22, borderRadius: 4 }}
        >
          <ScrollView>
            {filterList.map((sport, index) => (
              <Button
                key={index}
                title={sport}
                onPress={() => applyFilter(sport)}
              />
            ))}
            <Button title="No Filter" onPress={clearFilter} />
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Current Location
  // const getCurrentLocation = async () => {
  //   try {
  //     //1. Permissions
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== "granted") {
  //       alert("Permission not granted");
  //       return;
  //     }
  //     console.log("Permission granted");
  //     //2. Permission Accepted
  //     let location = await Location.getCurrentPositionAsync();
  //     console.log("Current location is:");
  //     console.log(location);
  //     // alert(JSON.stringify(location.coords.altitude, location.coords.longitude))
  //     setDeviceLocation({
  //       lat: location.coords.latitude,
  //       lng: location.coords.longitude,
  //     });
  //     console.log("User location:", deviceLocation.lat, deviceLocation.lng);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  //Use effect State
  useEffect(() => {
    // getCurrentLocation();
    retrieveFromDb();
    retrieveUserDataFromDb();
    getUserEvents();
    getFilters();
  }, []);

  // const retrieveFromDb = async () => {
  //   const allSportsEvents = [];
  //   const querySnapshot = await getDocs(collection(db, "events"));
  //   querySnapshot.forEach(async (doc) => {
  //     const userId = doc.id
  //     const querySnapshot = await getDocs(collection(db, "events", userId, "sports"));
  //     querySnapshot.forEach((doc) => {
  //       // doc.data() is never undefined for query doc snapshots
  //       console.log(doc.id, " => ", doc.data());
  //       allSportsEvents.push(doc.data());
  //     });
  //   });
  //   setActivityData(allSportsEvents)
  // }

  const retrieveUserDataFromDb = async () => {
    const docRef = doc(db, "userProfiles", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`docSnap ${JSON.stringify(docSnap.data().imageUrl)}`);
      setUser(docSnap.data());
    } else {
      console.log("No such document!");
    }
  };

  const retrieveFromDb = async () => {
    const allSportsEvents = [];
    const querySnapshot = await getDocs(collection(db, "events"));

    // Using for...of loop to handle asynchronous operations
    for (let userDoc of querySnapshot.docs) {
      console.log(`userDoc => ${userDoc.id}`);
      const userId = userDoc.id;
      const sportsSnapshot = await getDocs(
        collection(db, "events", userId, "sports")
      );

      for (let sportDoc of sportsSnapshot.docs) {
        console.log(sportDoc.id, " => ", sportDoc.data());
        const sportData = sportDoc.data();
        // Combine the retrieved data with the docId and eventCollectionId
        const combinedData = {
          ...sportData,
          docId: sportDoc.id,
          eventCollectionId: userId,
        };

        // setActivityData(combinedData)
        allSportsEvents.push(combinedData);
      }
    }

    setActivityDataList(allSportsEvents);
  };

  //NEW Function

  const getUserEvents = async () => {
    const allSportsEvents = [];
    const currentUserId = auth.currentUser.uid;
    const userEventsRef = doc(db, "events", currentUserId);
    const sportsSnapshot = await getDocs(collection(userEventsRef, "sports"));
    for (let sportDoc of sportsSnapshot.docs) {
      console.log(sportDoc.id, " => ", sportDoc.data());
      const sportData = sportDoc.data();
      const combinedData = {
        ...sportData,
        docId: sportDoc.id,
        eventCollectionId: currentUserId,
      };

      allSportsEvents.push(combinedData);
    }

    setUserActivityList(allSportsEvents);
  };

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView className="bg-primary flex-1 h-full">
      <View className="flex-row justify-between items-center px-6 pb-5">
        <Ionicons
          name="filter"
          size={24}
          color="black"
          onPress={toggleFilterModal}
        />
        <Text className="font-urbanistBold text-2xl">Sportlyst</Text>
        <Ionicons name="notifications" size={24} color="black" />
      </View>
      <FilterModal />
      <ScrollView className="h-fit">
        <View className="px-3">
          <Text className="font-urbanist text-xl text-start pl-3">
            Hello, {user.firstName}
          </Text>
          <View className="flex-row items-baseline">
            <Text className="font-urbanistBold text-2xl text-start pl-3">
              Your Activities
            </Text>
            <Ionicons name="chevron-forward" size={21} color="black" />
          </View>
        </View>

        <View>
          <MyCarousel data={userActivityList} navigation={navigation} />
        </View>
        <View className="flex-row items-baseline px-3">
          <Text className="font-urbanistBold text-2xl text-start pl-3">
            Discover Activities
          </Text>
          <Ionicons name="chevron-forward" size={21} color="black" />
        </View>

        {getFilteredActivities().map((activity, index) => (
          <ActivityCard
            key={index}
            title={activity.eventName}
            description={activity.description}
            img={require("../assets/cherry.jpg")}
            location={activity.venue}
            date={activity.date}
            time={activity.time}
            navigation={navigation}
            price={activity.payment}
            players={activity.players}
            sportType={activity.sportType}
            venue={activity.venue}
            venueAddress={activity.venueAddress}
            joinedPlayers={activity.joinedPlayers}
            pendingUsers={activity.pendingUsers ? activity.pendingUsers : []}
            joinedUsers={activity.joinedUsers ? activity.joinedUsers : []}
            docId={activity.docId}
            eventCollectionId={activity.eventCollectionId}
            isUserActivity={activity.eventCollectionId === auth.currentUser.uid}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: "black",
          alignItems: "center",
          justifyContent: "center",
          width: 65,
          position: "absolute",
          bottom: height * 0.03,
          right: width * 0.05,
          height: 65,
          backgroundColor: "black",
          borderRadius: 100,
        }}
        onPress={() => {
          //NAVIGATE HERE
          navigation.navigate('CreateActivity', {
            activity: "Activities"
          });
        }}
      >
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
