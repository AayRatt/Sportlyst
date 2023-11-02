import React from 'react';
import Carousel from 'react-native-snap-carousel';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import ActivityCard from "../components/ActivityCard";

const { width: viewportWidth } = Dimensions.get('window');

const MyCarousel = ({ data,navigation }) => {
  const _renderItem = ({ item, index }) => {
    return (
      // <View style={styles.slide}>
      //   <Text style={styles.title}>{item.title}</Text>
      // </View>

      <ActivityCard
        key={index} // use a unique key, if there's an id in the data, prefer to use that
        title={item.eventName}
        img={require("../assets/cherry.jpg")}
        location={item.venue}
        // location="Cherry Sports Field"
        date={item.date}
        time={item.time}
        navigation={navigation}
        price={item.payment}
        players={item.players}
        sportType={item.sportType}
        venue={item.venue}
        venueAddress={item.venueAddress}
        joinedPlayers={item.joinedPlayers}
        joinedUsers={item.joinedUsers ? item.joinedUsers : []}
        docId={item.docId}
        eventCollectionId={item.eventCollectionId}
      />


    );
  };

  return (
    <Carousel
      data={data}
      renderItem={_renderItem}
      sliderWidth={viewportWidth}
      itemWidth={viewportWidth}
      layout={'default'}
    />
  );
};

export default MyCarousel;
