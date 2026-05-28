/**
 * ============================================================================
 * FILE NAME        : OnboardingScreen.tsx
 * WHAT THIS FILE DOES : 4-slide onboarding shown ONCE on first app launch
 * HOW IT DOES IT   : Reads/writes AsyncStorage key 'onboarding_complete'.
 *                    Uses lottie-react-native for animations and a custom
 *                    FlatList-based swiper for slide transitions.
 * PRINCIPLE APPLIED: SOLID — single responsibility, isolated from AuthFlow
 * ============================================================================
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  ViewToken,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Constants ────────────────────────────────────────────────────────────────

export const ONBOARDING_KEY = 'inkingi_onboarding_complete';

// Mobile-capped width: even on tablet/web the onboarding stays in a 420-wide
// mobile column so it always looks native.
const MOBILE_MAX_WIDTH = 420;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SLIDE_W = Math.min(SCREEN_W, MOBILE_MAX_WIDTH);

// ─── Brand Tokens ─────────────────────────────────────────────────────────────

const BRAND = {
  // Backgrounds
  bg:            '#FFFFFF',
  bgSurface:     '#F5F7FA',
  bgCard:        '#EEF1F6',
  // Navy (text + UI)
  navy:          '#0B1628',
  navyMid:       '#1A2D4A',
  navyLight:     '#2E4166',
  navyA15:       'rgba(11,22,40,0.12)',
  navyA08:       'rgba(11,22,40,0.06)',
  // Gold accent
  gold:          '#C89A2A',
  goldLight:     '#E8B84B',
  goldDim:       'rgba(200,154,42,0.14)',
  goldBorder:    'rgba(200,154,42,0.35)',
  // Teal accent
  teal:          '#007E6E',
  tealDim:       'rgba(0,126,110,0.12)',
  // Text
  textPrimary:   '#0B1628',
  textSub:       '#3D4F6B',
  textMuted:     '#7A8BA6',
  // Misc
  border:        '#DDE3EC',
};

// ─── Slide Data ───────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  lottieSrc: any;
  accentColor: string;
  tag: string;
  title: string;
  subtitle: string;
  lottieSpeed: number;
}

const SLIDES: Slide[] = [
  {
    id: 's1',
    lottieSrc: require('../../../assets/lottie/secure_payment.json'),
    accentColor: BRAND.gold,
    tag: 'ESCROW PROTECTION',
    title: 'Secure Construction\nEscrow',
    subtitle:
      'Funds are held safely and released only after verified milestone approval — giving diaspora investors total confidence.',
    lottieSpeed: 0.7,
  },
  {
    id: 's2',
    lottieSrc: require('../../../assets/lottie/construction_progress.json'),
    accentColor: BRAND.teal,
    tag: 'REAL-TIME VISIBILITY',
    title: 'Track Every\nStage',
    subtitle:
      'Monitor construction progress with live updates, daily photos, and transparent timeline reports from anywhere in the world.',
    lottieSpeed: 0.8,
  },
  {
    id: 's3',
    lottieSrc: require('../../../assets/lottie/inspection_checklist.json'),
    accentColor: '#5B8DEF',
    tag: 'QUALITY ASSURANCE',
    title: 'Verified Site\nInspections',
    subtitle:
      'Independent supervisors with GPS-validated check-ins validate project quality before any payment is ever released.',
    lottieSpeed: 0.65,
  },
  {
    id: 's4',
    lottieSrc: require('../../../assets/lottie/construction_team_work.json'),
    accentColor: BRAND.goldLight,
    tag: 'ONE PLATFORM',
    title: 'Connected\nConstruction Ecosystem',
    subtitle:
      'Collaborate seamlessly with engineers, suppliers, and supervisors in one secure, trusted platform built for Rwanda.',
    lottieSpeed: 0.75,
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Per-slide animated values for the dot pulse
  const dotScale = useRef(SLIDES.map(() => new Animated.Value(1))).current;

  // Fade-in mount animation
  const mountOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mountOpacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse active dot
  useEffect(() => {
    SLIDES.forEach((_, i) => {
      Animated.spring(dotScale[i], {
        toValue: i === activeIndex ? 1.5 : 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
    });
  }, [activeIndex]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 55 }).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (_) {}
    onComplete();
  };

  const isLast = activeIndex === SLIDES.length - 1;

  // ─── Render Slide ──────────────────────────────────────────────────────────

  const renderSlide = ({ item, index }: { item: Slide; index: number }) => (
    <View style={[styles.slide, { width: SLIDE_W }]}>
      {/* Lottie animation */}
      <View style={styles.lottieContainer}>
        <LottieView
          source={item.lottieSrc}
          autoPlay
          loop
          speed={item.lottieSpeed}
          style={styles.lottie}
          resizeMode="contain"
        />
        {/* Radial glow behind animation */}
        <View
          style={[
            styles.lottieGlow,
            { backgroundColor: item.accentColor + '18' },
          ]}
        />
      </View>

      {/* Text content */}
      <View style={styles.textBlock}>
        {/* Tag pill */}
        <View
          style={[
            styles.tagPill,
            {
              backgroundColor: item.accentColor + '20',
              borderColor: item.accentColor + '50',
            },
          ]}
        >
          <Text style={[styles.tagText, { color: item.accentColor }]}>
            {item.tag}
          </Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>{item.title}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>{item.subtitle}</Text>
      </View>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BRAND.bg} />

      {/* Background: clean white with very subtle accent blobs */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: BRAND.bg }]} />
        {/* Top-right accent blob */}
        <View style={styles.blobTopRight} />
        {/* Bottom-left accent blob */}
        <View style={styles.blobBottomLeft} />
      </View>

      <Animated.View style={[styles.container, { opacity: mountOpacity }]}>
        <SafeAreaView style={styles.safeArea}>

          {/* ── Header ── */}
          <View style={[styles.header, { paddingTop: insets.top > 0 ? 8 : 20 }]}>
            {/* Brand mark */}
            <View style={styles.brandRow}>
              <View style={styles.brandDot} />
              <Text style={styles.brandName}>InkingiPro</Text>
            </View>

            {/* Skip button */}
            {!isLast && (
              <TouchableOpacity
                onPress={finishOnboarding}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.skipBtn}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Slider ── */}
          {/* Outer centering wrapper — keeps slides at mobile width on wide screens */}
          <View style={styles.sliderWrapper}>
            <FlatList
              ref={flatRef}
              data={SLIDES}
              keyExtractor={(item) => item.id}
              renderItem={renderSlide}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(_, index) => ({
                length: SLIDE_W,
                offset: SLIDE_W * index,
                index,
              })}
              style={{ width: SLIDE_W }}
              contentContainerStyle={{ flexGrow: 0 }}
            />
          </View>

          {/* ── Footer ── */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>

            {/* Pagination dots */}
            <View style={styles.dotsRow}>
              {SLIDES.map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === activeIndex ? BRAND.gold : BRAND.border,
                      width: i === activeIndex ? 24 : 8,
                      transform: [{ scale: dotScale[i] }],
                    },
                  ]}
                />
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actionsRow}>
              {/* Previous — only show if not first */}
              {activeIndex > 0 ? (
                <TouchableOpacity
                  onPress={() =>
                    flatRef.current?.scrollToIndex({
                      index: activeIndex - 1,
                      animated: true,
                    })
                  }
                  style={styles.prevBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.prevText}>← Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {/* Next / Get Started */}
              <TouchableOpacity
                onPress={goNext}
                style={[
                  styles.nextBtn,
                  isLast && styles.nextBtnLast,
                ]}
                activeOpacity={0.85}
              >
                <Text style={[styles.nextText, isLast && styles.nextTextLast]}>
                  {isLast ? 'Get Started →' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Progress indicator text */}
            <Text style={styles.progressText}>
              {activeIndex + 1} of {SLIDES.length}
            </Text>
          </View>

        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },

  // Decorative background blobs
  blobTopRight: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: BRAND.goldDim,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: BRAND.tealDim,
  },

  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND.gold,
  },
  brandName: {
    color: BRAND.navy,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
    backgroundColor: BRAND.bgCard,
  },
  skipText: {
    color: BRAND.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Slider ──
  sliderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  lottie: {
    width: '85%',
    aspectRatio: 1,
    maxWidth: 320,
    // Lottie must be capped so it doesn't overflow on tall phones
    maxHeight: SCREEN_H * 0.36,
  },
  lottieGlow: {
    position: 'absolute',
    width: '80%',
    aspectRatio: 1,
    borderRadius: 9999,
    zIndex: -1,
  },

  // ── Text block ──
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tagPill: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  titleText: {
    color: BRAND.navy,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  subtitleText: {
    color: BRAND.textSub,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    maxWidth: 340,
  },

  // ── Footer ──
  footer: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    gap: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: MOBILE_MAX_WIDTH - 56,
    gap: 12,
  },
  prevBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
    backgroundColor: BRAND.bgCard,
  },
  prevText: {
    color: BRAND.textSub,
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: BRAND.navy,
    borderWidth: 1,
    borderColor: BRAND.navy,
  },
  nextBtnLast: {
    backgroundColor: BRAND.gold,
    borderColor: BRAND.gold,
    flex: 1,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  nextTextLast: {
    color: BRAND.navy,
  },
  progressText: {
    color: BRAND.textMuted,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
