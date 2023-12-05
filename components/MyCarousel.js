import React from 'react';
import Carousel from 'react-native-snap-carousel';
import { Dimensions } from 'react-native';
import MyActivityCard from './MyActivityCard';

const { width: viewportWidth } = Dimensions.get('window');

const MyCarousel = ({ data, navigation }) => {
  const _renderItem = ({ item, index }) => {
    return (
      <MyActivityCard
        key={index}
        title={item.eventName}
        description={item.description}
        activityImage={item.activityImage}
        activityDetailsImage={item.activityDetailsImage}
        location={item.venue}
        date={item.date}
        navigation={navigation}
        price={item.payment}
        players={item.players}
        sportType={item.sportType}
        venue={item.venue}
        venueAddress={item.venueAddress}
        joinedPlayers={item.joinedPlayers}
        joinedUsers={item.joinedUsers ? item.joinedUsers : []}
        pendingUsers={item.pendingUsers ? item.pendingUsers : []}
        docId={item.docId}
        eventCollectionId={item.eventCollectionId}
        isUserActivity={true}
      />
    );
  };

  return (
    <Carousel
      data={data}
      renderItem={_renderItem}
      sliderWidth={viewportWidth}
      itemWidth={viewportWidth}
      // inactiveSlideScale={0.9}
      // inactiveSlideOpacity={0.9}
      layout={'stack'}
      
    />

  );
};

export default MyCarousel;
