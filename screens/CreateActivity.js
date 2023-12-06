import React from "react";
import { StyleSheet } from "react-native";
import {
  Text,
  View,
  Pressable,
  Button,
  TextInput,
  Modal,
} from "react-native";
import {
  useFonts,
  Urbanist_600SemiBold,
  Urbanist_500Medium,
} from "@expo-google-fonts/urbanist";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useState, useEffect } from "react";

// import { Picker } from 'react-native-wheel-pick';
import { Picker } from "@react-native-picker/picker";

import DateTimePickerModal from "react-native-modal-datetime-picker";

// Import firebase auth/db
import { db, auth } from "../firebaseConfig";
import { setDoc, doc, collection, updateDoc } from "firebase/firestore";

import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export default function CreateActivity({ route, navigation }) {
  const { activity } = route.params
  const { title } = route.params
  const { description } = route.params
  const { players } = route.params
  const { price } = route.params
  const { date } = route.params
  const { venue } = route.params
  const { venueAddress } = route.params
  const { sportType } = route.params
  const { joinedUsers } = route.params
  const { pendingUsers } = route.params
  const { activityImage } = route.params
  const { activityDetailsImage } = route.params
  const { eventCollectionId } = route.params
  const { docId } = route.params

  const [imageUrls, setImageUrls] = useState([]); // State to hold image URLs
  const [adImageUrls, setAdImageUrls] = useState([]); // State to hold activity details image URLs

  const [pickerVisible, setPickerVisible] = useState(false);
  const [sportPickerVisible, setSportPickerVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (datetime) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    const datePart = datetime.toLocaleDateString("en-US", options);
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timePart = `${formattedHours}:${formattedMinutes} ${period}`;
    const formattedDateTime = `${datePart} ${timePart}`;
    formChanged("date", formattedDateTime);
    hideDatePicker();
  };

  const [isTimePickerVisible, setTimePickerVisivility] = useState(false);
  const showTimePicker = () => {
    setTimePickerVisivility(true);
  };
  const hideTimePicker = () => {
    setTimePickerVisivility(false);
  };
  const handleTimeConfirm = (time) => {
    const hours = `${time.getHours()}`;
    const minutes = `${time.getMinutes()}`;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
    formChanged("time", formattedTime);
    hideTimePicker();
  };

  const [userEventField, setUserEventField] = useState({
    eventName: title,
    description: description,
    sportType: sportType,
    players: players,
    payment: price,
    date: date,
    venue: venue,
    venueAddress: venueAddress,
    joinedUsers: joinedUsers,
    pendingUsers: pendingUsers,
    activityImage: activityImage,
    activityDetailsImage: activityDetailsImage
  });

  const onCreateEvent = async () => {
    //Read Data
    const outData = `
EventName: ${userEventField.eventName},
Description: ${userEventField.description},
SportType: ${userEventField.sportType},
players: ${userEventField.players},
Payment: ${userEventField.payment},
Date: ${userEventField.date},
Time: ${userEventField.time},
Location: ${userEventField.location}
`;
    console.log(outData);

    try {
      if (!userEventField.eventName) {
        alert("Please Type your Event Name");
      } else {
        //Create a Firestore Collection
        //1. Add data Object
        const eventData = {
          eventName: userEventField.eventName,
          description: userEventField.description,
          sportType: userEventField.sportType,
          players: userEventField.players,
          payment: userEventField.payment,
          date: userEventField.date,
          venue: userEventField.venue,
          venueAddress: userEventField.venueAddress,
          joinedUsers: [],
          pendingUsers: [],
          activityImage: retrieveImageUrl(userEventField.sportType),
          activityDetailsImage: retrieveAdImageUrl(userEventField.sportType)
        };

        const userDocRef = doc(db, "events", auth.currentUser.uid); // 'userId' is the ID for the user

        await setDoc(userDocRef, {
          // Set at least one field, e.g., a timestamp or a placeholder value
          createdAt: new Date(),
        });

        const randomId = doc(
          collection(db, "events", auth.currentUser.uid, "sports")
        ).id;
        await setDoc(
          doc(db, "events", auth.currentUser.uid, "sports", randomId),
          eventData
        );

        console.log("Event created");
        alert("Event created");
        //Clean Field
        setUserEventField({
          eventName: "",
          description: "",
          sportType: "",
          players: "",
          payment: "",
          date: "",
          time: "",
          location: ""
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const [venueData, setVenueData] = useState([]);
  const [sportsData, setSportsData] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const onInputChange = (text) => {
    formChanged("location", text);

    if (text.trim().length > 0) {
      setFilteredVenues(
        venueData.filter((item) =>
          item.toLowerCase().includes(text.toLowerCase())
        )
      );
    } else {
      setFilteredVenues([]);
    }
  };

  const updateDb = async () => {
    // update data in firestore
    try {
      const eventsRef = doc(db, "events", eventCollectionId, "sports", docId)
      await updateDoc(eventsRef, userEventField);
      alert("Activity Updated");
    } catch (err) {
      console.log(err);
    }
  };

  const fetchVenues = async () => {
    const response = await fetch(
      "https://sportlystapi.onrender.com/sportlyst/getVenues"
    );
    const results = await response.json();

    if (Array.isArray(results.venues)) {
      const venueNames = results.venues.map((item) => item.venue);
      setVenueData(venueNames);
    } else {
      console.error(
        'API did not return an array in the "venues" key:',
        results
      );
    }
  };

  const fetchSports = async () => {
    const response = await fetch(
      "https://sportlystapi.onrender.com/sportlyst/getSports"
    );
    const results = await response.json();

    if (Array.isArray(results.sports)) {
      const sports = results.sports.map((item) => item.sportsType);
      setSportsData(sports);
    } else {
      console.error(
        'API did not return an array in the "sports" key:',
        results
      );
    }
  };

  //function to retrieve image url from firebase storage
  const fetchImage = () => {
    const tmpSportsArr = [];
    const tmpAdSportsArr = [];

    for (let sport of sportsData) {
      console.log("sportType url is : ", sport)

      const storage = getStorage();
      const imagePath = `/${sport}.jpg`; // The path of your image in Firebase Storage
      const adImagePath = `/${sport}-ad.jpg`; // The path of your image in Firebase Storage
      const imageRef = ref(storage, imagePath);
      const adImageRef = ref(storage, adImagePath);

      getDownloadURL(imageRef)
        .then((url) => {
          // console.log("Image url is : ", url)

          const combinedData = {
            imageUrl: url,
            // sportType: sport.sportType
            sportType: sport
          };

          tmpSportsArr.push(combinedData)
        })
        .catch((error) => {
          // Handle any errors
          console.log("Error retrieving image url :", error)
        });

      getDownloadURL(adImageRef)
        .then((url) => {
          // console.log("Image url is : ", url)

          const combinedData = {
            imageUrl: url,
            // sportType: sport.sportType
            sportType: sport
          };

          tmpAdSportsArr.push(combinedData)
        })
        .catch((error) => {
          // Handle any errors
          console.log("Error retrieving image url :", error)
        });
    }
    setImageUrls(tmpSportsArr)
    setAdImageUrls(tmpAdSportsArr)
  };

  const retrieveImageUrl = (sportType) => {
    for (let image of imageUrls) {
      if (image.sportType == sportType) {
        return image.imageUrl
      }
    }
  }

  const retrieveAdImageUrl = (sportType) => {
    for (let image of adImageUrls) {
      if (image.sportType == sportType) {
        return image.imageUrl
      }
    }
  }

  useEffect(() => {
    fetchVenues();
    fetchSports();
  }, []);

  useEffect(() => {
    fetchImage();
  }, [sportsData])

  // Function for Updating form fields
  const formChanged = (key, updatedValue) => {
    const temp = { ...userEventField };
    temp[key] = updatedValue;
    setUserEventField(temp);
  };

  let [fontsLoaded] = useFonts({
    Urbanist_600SemiBold,

    Urbanist_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const SportsPickerModal = () => {
    return (
      <Modal
        visible={sportPickerVisible}
        animationType="slide"
        // presentationStyle="pageSheet"
        transparent={true}
      >
        <View className="flex-1 justify-end">
          <View className="w-full h-1/2 bg-primary rounded-lg">
            <View className="flex-row justify-between mt-3 align-center px-3 pt-2">
              <Text className="font-urbanistBold text-3xl text-start">
                Select Sport
              </Text>
              <Ionicons
                name="close"
                size={35}
                color="black"
                onPress={() => setSportPickerVisible(false)}
              />
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View style={{ backgroundColor: "white", height: "100%" }}>
                <Picker
                  selectedValue={userEventField.sportType}
                  onValueChange={(value) => {
                    formChanged("sportType", value);
                    setSportPickerVisible(false);
                  }}
                >
                  {sportsData.map((sport) => (
                    <Picker.Item
                      key={sport}
                      label={sport}
                      value={sport}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="bg-white pl-3 pr-3">
        <View className="flex-row justify-between items-baseline inline-flex">
          {activity == 'Activities' ? (
            <Text className="mt-5 font-urbanistBold text-3xl text-start pl-3">
              Create Activity
            </Text>
          ) : (
            <Text className="mt-5 font-urbanistBold text-3xl text-start pl-3">
              Update Activity
            </Text>
          )}
          <Pressable className="pr-3" onPress={() => navigation.goBack()}>
            <AntDesign name="close" size={30} color="black" />
          </Pressable>
        </View>
        <View className="mt-5">
          {/* <TextInput
            className="bg-gray h-12 rounded-lg w=11/12 p-4 mb-5 font-urbanist"
            placeholder="Activity Name"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            value={userEventField.eventName}
            onChangeText={(account) => {
              formChanged("eventName", account);
            }}
          ></TextInput> */}
          <View className="flex-row inline-flex items-baseline pl-1 justify-center">
            <TextInput
              className="h-17 w=11/12 mb-5 font-urbanistBold text-3xl"
              placeholder="Activity Name"
              placeholderTextColor={"#000"}
              value={userEventField.eventName}
              onChangeText={(account) => {
                formChanged("eventName", account);
              }}
            ></TextInput>
            <AntDesign name="edit" size={23} color="#999" />
          </View>

          <TextInput
            className="bg-gray h-20 rounded-lg w=11/12 p-4 mb-3 font-urbanist"
            placeholder="Activity Description"
            placeholderTextColor={"#666"}
            autoCapitalize="none"
            multiline={true}
            value={userEventField.description}
            onChangeText={(account) => {
              formChanged("description", account);
            }}
          ></TextInput>

          <SportsPickerModal />
          <View className="flex-row gap-3 mb-3">
            <Pressable
              className="bg-secondary rounded-lg h-12 mt-1 items-center justify-center flex-1"
              onPress={() => setSportPickerVisible(true)}
            >
              <Text className="text-lg font-urbanistBold text-primary">
                {userEventField.sportType ? userEventField.sportType : "Sport Type"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row bg-gray h-15 rounded-lg w=11/12 p-4 mb-3 justify-between">
            <TextInput
              className="font-urbanist"
              placeholder="Venue"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              value={userEventField.venue}
              onChangeText={(account) => {
                formChanged("venue", account);
              }}
            ></TextInput>
          </View>

          <View className="flex-row bg-gray h-15 rounded-lg w=11/12 p-4 mb-3 justify-between">
            <TextInput
              className="font-urbanist"
              placeholder="Venue Address"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              value={userEventField.venueAddress}
              onChangeText={(account) => {
                formChanged("venueAddress", account);
              }}
            ></TextInput>
          </View>

          <View className="flex-row bg-gray h-15 rounded-lg w=11/12 p-4 mb-3 justify-between">
            <Text className="font-urbanist text-[#666]">Start</Text>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
              minimumDate={new Date()}
            />
            <Pressable onPress={showDatePicker}>
              <Text className=" font-urbanist text-[#666]">
                {userEventField.date
                  ? userEventField.date
                  : "Select Date and Time"}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Quantity of Players"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              keyboardType="numeric"
              value={userEventField.players}
              onChangeText={(account) => {
                formChanged("players", account);
              }}
            ></TextInput>
            <TextInput
              className="bg-gray h-12 rounded-lg w-1/2 p-4 mb-5 flex-1 font-urbanist"
              placeholder="Price per person"
              placeholderTextColor={"#666"}
              autoCapitalize="none"
              keyboardType="numeric"
              value={userEventField.payment}
              onChangeText={(account) => {
                formChanged("payment", account);
              }}
            ></TextInput>
          </View>

          {/* <Autocomplete
            autoCapitalize="none"
            autoCorrect={false}
            // containerStyle={styles.container}
            data={filteredVenues}
            defaultValue={userEventField.location}
            onChangeText={onInputChange}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  formChanged("location", item);
                }}
              >
                <Text style={{ padding: 10 }}>{item}</Text>
              </TouchableOpacity>
            )}
          /> */}

          <Modal
            animationType="slide"
            transparent={true}
            visible={pickerVisible}
            onRequestClose={() => {
              setPickerVisible(false);
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View style={{ backgroundColor: "white", height: 350 }}>
                <Picker
                  selectedValue={userEventField.sportType}
                  onValueChange={(value) => {
                    formChanged("sportType", value);
                    setPickerVisible(false);
                  }}
                >
                  <Picker.Item label="Soccer" value="Soccer" />
                  <Picker.Item label="Basket" value="Basket" />
                  <Picker.Item label="Baseball" value="Baseball" />
                  <Picker.Item label="Tennis" value="Tennis" />
                  <Picker.Item label="Ping Pong" value="Ping Pong" />
                </Picker>
                <Button
                  title="Close Picker"
                  onPress={() => setPickerVisible(false)}
                />
              </View>
            </View>
          </Modal>

          {/* <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={() => setPickerVisible(true)}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.sportType
                ? `Selected Sport: ${userEventField.sportType}`
                : "Choose your Sport"}
            </Text>
          </Pressable>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />
          <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={showDatePicker}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.date
                ? `Selected Date: ${userEventField.date}`
                : "Choose your Date"}
            </Text>
          </Pressable>

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleTimeConfirm}
            onCancel={hideTimePicker}
          />
          <Pressable
            className="bg-secondary rounded-lg h-10 mt-1 items-center justify-center"
            onPress={showTimePicker}
          >
            <Text className="text-lg font-urbanistBold text-primary">
              {userEventField.time
                ? `Selected Time: ${userEventField.time}`
                : "Choose your Time"}
            </Text>
          </Pressable> */}

          {activity == 'Activities' ? (
            <Pressable
              className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
              onPress={onCreateEvent}
            >
              <Text className="text-lg font-urbanistBold text-primary">
                Create Event
              </Text>
            </Pressable>
          ) : (
            <Pressable
              className="bg-secondary rounded-lg h-14 mt-5 items-center justify-center"
              onPress={updateDb}
            >
              <Text className="text-lg font-urbanistBold text-primary">
                Update Event
              </Text>
            </Pressable>
          )}
        </View>
        <StatusBar barStyle="dark-content"></StatusBar>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "gray", // This is a generic gray. Use a specific shade if needed.
    height: 48,
    borderRadius: 10,
    width: "91.666%",
    padding: 16,
    marginBottom: 20,
    flex: 1,
    fontFamily: "Urbanist", // Ensure you have this font linked in your React Native project.
  },
});