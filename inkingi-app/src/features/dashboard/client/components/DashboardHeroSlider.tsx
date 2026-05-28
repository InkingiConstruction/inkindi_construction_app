import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDE_WIDTH = width - 24; // tighter padding than before

interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText?: string;
  icon: any;
  image: string;
}

interface Props {
  slides: Slide[];
  onPressSlide?: (slide: Slide) => void;
}

export default function DashboardHeroSlider({
  slides,
  onPressSlide,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        activeIndex === slides.length - 1 ? 0 : activeIndex + 1;

      scrollRef.current?.scrollTo({
        x: nextIndex * SLIDE_WIDTH,
        animated: true,
      });

      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / SLIDE_WIDTH
    );
    setActiveIndex(slideIndex);
  };

  return (
    <View>
      {/* SLIDER */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{ width: SLIDE_WIDTH }}
          >
            <ImageBackground
              source={{ uri: slide.image }}
              imageStyle={{ borderRadius: 15 }}
              className="h-[180px] overflow-hidden rounded-[10px]"
            >
              {/* DARK OVERLAY */}
              <View className="flex-1 bg-black/50 p-2 justify-between">
                
                {/* TOP CONTENT */}
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-2">
                    <Text className="text-white text-xl font-extrabold">
                      {slide.title}
                    </Text>

                    <Text className="text-slate-200 text-xs mt-2 leading-5">
                      {slide.description}
                    </Text>
                  </View>

                  <View className="bg-white/20 p-2 rounded-xl">
                    <Ionicons name={slide.icon} size={20} color="#fff" />
                  </View>
                </View>

                {/* BUTTON */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onPressSlide?.(slide)}
                  className="self-start bg-white px-2 py-2 rounded-xl flex-row items-center"
                >   
                  <Text className="text-slate-900 font-bold text-xs mr-2">
                    {slide.buttonText || 'Explore'}
                  </Text>

                  <Ionicons name="arrow-forward" size={14} color="#0f172a" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* PAGINATION */}
      <View className="flex-row justify-center mt-3 gap-2">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`rounded-full ${
              activeIndex === index
                ? 'w-5 h-2 bg-primary-500'
                : 'w-2 h-2 bg-slate-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
}