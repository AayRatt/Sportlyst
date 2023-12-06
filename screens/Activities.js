import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
  StyleSheet,
} from "react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import ActivityCard from "../components/ActivityCard";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { db, auth } from "../firebaseConfig";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import Carousel from "react-native-snap-carousel"; //NEW
import MyCarousel from "../components/MyCarousel"; //NEW
import { RefreshControl } from "react-native";

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
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [temporarySelectedFilters, setTemporarySelectedFilters] = useState(
    new Set()
  );
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const toggleFilter = (sportType) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(sportType)) {
      newFilters.delete(sportType);
    } else {
      newFilters.add(sportType);
    }
    setSelectedFilters(newFilters);
  };

  const [refreshing, setRefreshing] = useState(false);

  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelPosition = useRef(
    new Animated.Value(Dimensions.get("window").width)
  ).current;

  const openPanel = () => {
    setIsPanelVisible(true);
    Animated.timing(panelPosition, {
      toValue: 0, // Adjust as needed to slide in the panel
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(panelPosition, {
      toValue: Dimensions.get("window").width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsPanelVisible(false)); // Hide the panel after the animation
  };

  const toggleFilterModal = () => {
    setIsFilterModalVisible((prevVisible) => !prevVisible);
    if (!isFilterModalVisible) {
      setTemporarySelectedFilters(new Set(selectedFilters));
    }
  };

  const applyFilters = () => {
    setSelectedFilters(new Set(temporarySelectedFilters));
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
    return activityDataList.filter(
      (activity) =>
        selectedFilters.size === 0 || selectedFilters.has(activity.sportType)
    );
  };

  const FilterModal = () => {
    const toggleTemporaryFilter = (sportType) => {
      setTemporarySelectedFilters((prevFilters) => {
        const newFilters = new Set(prevFilters);
        if (newFilters.has(sportType)) {
          newFilters.delete(sportType);
        } else {
          newFilters.add(sportType);
        }
        return newFilters;
      });
    };

    return (
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View className="flex-1 justify-end">
          <View className="w-full h-4/5 bg-primary rounded-lg">
            <View className="flex-row justify-between mt-3 align-center px-3 pt-2">
              <Text className="font-urbanistBold text-3xl text-start">
                Filters
              </Text>
              <Ionicons
                name="close"
                size={35}
                color="black"
                onPress={toggleFilterModal}
              />
            </View>
            <ScrollView className="max-h-screen mt-5">
              {filterList.map((sport, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleTemporaryFilter(sport)}
                >
                  <View className="border mx-5"></View>
                  <View className="flex-row justify-between align-center px-5 py-3">
                    <Text className="font-urbanist text-xl">{sport}</Text>
                    {temporarySelectedFilters.has(sport) && (
                      <Ionicons name="checkmark" size={25} color="black" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <View className="w-full items-center justify-center">
                <Pressable
                  className="bg-gray rounded-lg w-11/12 h-14 items-center justify-center"
                  onPress={() => setTemporarySelectedFilters(new Set())}
                >
                  <Text className="text-lg font-urbanistBold">
                    Clear Filters
                  </Text>
                </Pressable>
                <Pressable
                  className="bg-secondary rounded-lg w-11/12 h-14 mt-6 items-center justify-center"
                  onPress={applyFilters}
                >
                  <Text className="text-lg font-urbanistBold text-primary">
                    Apply Filters
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  //----------------------------------------------->
  //Function Pending Players into Notification Panel
  const pendPlayersNot = async () => {
    try {
      let allPendingUsers = [];

      const pendPla = collection(db, "events", auth.currentUser.uid, "sports");
      const pendPlaSnapshot = await getDocs(pendPla);

      for (const players of pendPlaSnapshot.docs) {
        const playersData = players.data();
        if (playersData.pendingUsers && playersData.pendingUsers.length > 0) {
          //Get all the data of the Player
          const playerProfiles = await Promise.all(
            playersData.pendingUsers.map((playerID) =>
              getPendingPlayerProfile(playerID)
            )
          );
          const playersWithEventName = playerProfiles
            .filter(Boolean)
            .map((playerProfile) => ({
              ...playerProfile,
              eventName: playersData.eventName,
            }));

          allPendingUsers.push(...playersWithEventName);
        }
      }
      return allPendingUsers;
    } catch (error) {
      console.log("Error, getting Pending Players", error);
      return [];
    }
  };

  //Get Pending Player Data
  const getPendingPlayerProfile = async (playerID) => {
    try {
      const playerDocRef = doc(db, "userProfiles", playerID);
      const playerDocSnap = await getDoc(playerDocRef);
      if (playerDocSnap.exists()) {
        return playerDocSnap.data();
      } else {
        // If the User does not exist
        console.error("No profile found for player with ID:", playerID);
        return null;
      }
    } catch (error) {
      console.error("Error getting player profile:", error);
      return null;
    }
  };

  //Variable Store Data of the Pending Users
  const [pendingUsersProfiles, setPendingUsersProfiles] = useState([]);

  //Show Notifications when the user click the Icon bell notification
  const showNotifications = async () => {
    const profiles = await pendPlayersNot();
    setPendingUsersProfiles(profiles);
    openPanel();
  };

  //Norification Panel with Pending Users Data
  const NotificationPanel = () => {
    return (
      <Animated.View
        visible={isPanelVisible}
        style={[
          styles.panel,
          {
            transform: [{ translateX: panelPosition }],
            backgroundColor: "rgba(0,0,0,0.5)",
          },
        ]}
      >
        {/* Your notification content here */}
        <Text
          style={{ color: "#FFFFFF", fontSize: 16 }}
          className="font-urbanist"
        >
          Notifications{"\n"}
        </Text>
        {pendingUsersProfiles.length > 0 ? (
          pendingUsersProfiles.map((profile, index) => (
            <View key={index}>
              <Text style={{ color: "#FFFFFF" }} className="font-urbanist">
                - {profile.firstName} {profile.lastName} wants to Join to your
                event: "{profile.eventName}"
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#FFFFFF" }} className="font-urbanist">
            No Notifications
          </Text>
        )}
        <TouchableOpacity
          onPress={closePanel}
          style={{
            padding: 10,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "transparent",
            alignSelf: "left",
            marginTop: 15,
          }}
        >
          <Text style={{ color: "#FFFFFF" }} className="font-urbanist">
            Close
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  //----------------------------------------------->

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

  const retrieveUserDataFromDb = async () => {
    const docRef = doc(db, "userProfiles", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // console.log(`docSnap ${JSON.stringify(docSnap.data().imageUrl)}`);
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

      //skip the iteration if events are by the current logged in user
      if (userId == auth.currentUser.uid) {
        continue;
      }

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
      console.log(sportDoc.id, " User events!!! => ", sportDoc.data());
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await retrieveFromDb();
      await getUserEvents();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  //Use effect State
  useEffect(() => {
    // getCurrentLocation();
    retrieveFromDb();
    retrieveUserDataFromDb();
    getUserEvents();
    getFilters();
  }, []);

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
        <Ionicons
          name="notifications"
          size={24}
          color="black"
          onPress={showNotifications}
        />
      </View>
      <FilterModal />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="h-fit"
      >
        <View className="px-3">
          <Text className="font-urbanist text-xl text-start pl-3">
            Hello, {user.firstName}
          </Text>
          {userActivityList && userActivityList.length > 0 && (
            <View className="flex-row items-baseline">
              <Text className="font-urbanistBold text-2xl text-start pl-3">
                Your Activities
              </Text>
              <Ionicons name="chevron-forward" size={21} color="black" />
            </View>
          )}
        </View>
        <NotificationPanel />

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
            activityImage={activity.activityImage}
            activityDetailsImage={activity.activityDetailsImage}
            location={activity.venue}
            date={activity.date}
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
          navigation.navigate("CreateActivity", {
            activity: "Activities",
          });
        }}
      >
        <Ionicons name="add" size={35} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    // bottom: 0,
    width: "60%", // Adjust width as needed
    // height: '100%',
    backgroundColor: "grey",
    padding: 20,
    zIndex: 1000,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    // Additional styling for the panel
  },
  // ... (other styles)
});
