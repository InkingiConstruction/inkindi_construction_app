/**
 * FILE NAME   : EngineersTab.tsx
 * WHAT THIS FILE DOES : Premium search-driven Engineer Directory with filter chips,
 *                       rich profile cards, rating badges, and engineer detail modal
 *                       with ratings & reviews system.
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

// Types
interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  projectName: string;
}

interface Engineer {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  rating: number;
  completedProjects: number;
  yearsExperience: number;
  district: string;
  profilePic?: string;
  email?: string;
  phone?: string;
  bio?: string;
  reviews?: Review[];
}

interface Props {
  allEngineers: Engineer[];
  favoriteEngineers: string[];
  colors: DashColors;
  onToggleFavorite: (id: string) => void;
  onRateEngineer?: (engineerId: string, rating: number, comment: string) => void;
  onInviteEngineer?: (id: string) => void;
}

const FILTER_OPTIONS = ['All', 'Favorites', 'Structural', 'Electrical', 'Plumbing'];

// Engineer Detail Modal Component with Ratings & Reviews
const EngineerDetailModal = ({
  engineer,
  visible,
  onClose,
  onToggleFavorite,
  isFavorite,
  colors,
  onRateEngineer,
  onInvite,
}: {
  engineer: Engineer | null;
  visible: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
  colors: DashColors;
  onRateEngineer?: (engineerId: string, rating: number, comment: string) => void;
  onInvite?: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews' | 'rate'>('profile');
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  if (!engineer) return null;

  const handleSubmitReview = () => {
    if (ratingValue === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }
    if (onRateEngineer) {
      onRateEngineer(engineer.id, ratingValue, reviewComment);
      Alert.alert('Thank You!', 'Your review has been submitted successfully.');
      setRatingValue(0);
      setReviewComment('');
      setActiveTab('reviews');
    }
  };

  const averageRating = engineer.reviews && engineer.reviews.length > 0
    ? engineer.reviews.reduce((sum, r) => sum + r.rating, 0) / engineer.reviews.length
    : (engineer.rating ?? 4.8);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
        {/* Header with Back Button */}
        <View className="px-5 pt-12 pb-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
          <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-slate-800">Engineer Profile</Text>
          <TouchableOpacity onPress={() => onToggleFavorite(engineer.id)} className="p-2">
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#E11D48' : '#94A3B8'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View className="bg-white px-5 pt-6 pb-4 border-b border-slate-100">
            <View className="items-center">
              {/* Avatar */}
              {engineer.profilePic ? (
                <Image
                  source={{ uri: engineer.profilePic }}
                  className="w-24 h-24 rounded-full border-2 border-primary-500"
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-primary-600 items-center justify-center shadow-md">
                  <Text className="text-white font-extrabold text-3xl">
                    {engineer.name.charAt(0)}
                  </Text>
                </View>
              )}
              
              <Text className="text-xl font-bold text-slate-800 mt-3">{engineer.name}</Text>
              <Text className="text-sm text-primary-600 font-semibold mt-1">
                {engineer.specialty}
              </Text>
              
              {/* Rating Summary */}
              <TouchableOpacity 
                onPress={() => setActiveTab('reviews')}
                className="flex-row items-center mt-2 bg-amber-50 px-3 py-1.5 rounded-full"
              >
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="text-amber-600 font-bold ml-1">{averageRating.toFixed(1)}</Text>
                <Text className="text-slate-400 text-xs ml-1">
                  ({engineer.reviews?.length || 0} reviews)
                </Text>
                <Ionicons name="chevron-forward" size={12} color="#94A3B8" className="ml-1" />
              </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-around mt-6 pt-4 border-t border-slate-100">
              <View className="items-center">
                <Text className="text-slate-800 font-bold text-lg">{engineer.completedProjects}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Projects</Text>
              </View>
              <View className="items-center">
                <Text className="text-slate-800 font-bold text-lg">{engineer.yearsExperience}+</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">Years Exp</Text>
              </View>
              <View className="items-center">
                <Text className="text-slate-800 font-bold text-lg">{engineer.district}</Text>
                <Text className="text-slate-400 text-[10px] font-bold uppercase">District</Text>
              </View>
            </View>
          </View>

          {/* Tab Bar */}
          <View className="flex-row px-5 pt-4 bg-white">
            {[
              { key: 'profile', label: 'Profile', icon: 'person-outline' },
              { key: 'reviews', label: 'Reviews', icon: 'star-outline' },
              { key: 'rate', label: 'Rate', icon: 'chatbubble-outline' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex-row items-center justify-center gap-2 py-3 border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary-600'
                    : 'border-transparent'
                }`}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.key ? '#007E6E' : '#94A3B8'}
                />
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === tab.key ? 'text-primary-600' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab Content */}
          <View className="p-5">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <View className="gap-4">
                <View className="bg-white p-4 rounded-2xl border border-slate-100">
                  <Text className="text-slate-800 font-bold text-md mb-2">Professional Bio</Text>
                  <Text className="text-slate-600 text-sm leading-5">
                    {engineer.bio || `${engineer.name} is a licensed ${engineer.specialty} with ${engineer.yearsExperience}+ years of experience in ${engineer.district}. Specialized in delivering quality engineering solutions for residential and commercial projects.`}
                  </Text>
                </View>

                <View className="bg-white p-4 rounded-2xl border border-slate-100">
                  <Text className="text-slate-800 font-bold text-md mb-3">License & Contact</Text>
                  <View className="gap-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-500 text-sm">License Number</Text>
                      <Text className="text-slate-800 font-semibold">{engineer.licenseNumber}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-500 text-sm">Email</Text>
                      <Text className="text-slate-800 font-semibold">{engineer.email || 'Not provided'}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-slate-500 text-sm">Phone</Text>
                      <Text className="text-slate-800 font-semibold">{engineer.phone || 'Not provided'}</Text>
                    </View>
                  </View>
                </View>

                {/* Hire Button */}
                <TouchableOpacity
                  onPress={() => onInvite && engineer && onInvite(engineer.id)}
                  className="bg-primary-600 py-4 rounded-xl flex-row items-center justify-center gap-2 mt-2"
                >
                  <Ionicons name="mail-outline" size={18} color="white" />
                  <Text className="text-white font-bold text-base">Invite to Project</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <View className="gap-4">
                {/* Rating Overview */}
                <View className="bg-white p-4 rounded-2xl border border-slate-100 items-center">
                  <Text className="text-slate-500 text-sm mb-2">Overall Rating</Text>
                  <Text className="text-4xl font-bold text-slate-800">{averageRating.toFixed(1)}</Text>
                  <View className="flex-row items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(averageRating) ? 'star' : 'star-outline'}
                        size={18}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text className="text-slate-400 text-xs mt-2">
                    Based on {engineer.reviews?.length || 0} client reviews
                  </Text>
                </View>

                {/* Reviews List */}
                {engineer.reviews && engineer.reviews.length > 0 ? (
                  engineer.reviews.map((review) => (
                    <View key={review.id} className="bg-white p-4 rounded-2xl border border-slate-100">
                      <View className="flex-row justify-between items-start mb-2">
                        <View>
                          <Text className="text-slate-800 font-bold text-sm">{review.clientName}</Text>
                          <Text className="text-slate-400 text-[10px] mt-0.5">{review.date}</Text>
                        </View>
                        <View className="flex-row items-center gap-0.5">
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <Text className="text-amber-600 font-bold text-sm ml-0.5">{review.rating}</Text>
                        </View>
                      </View>
                      <Text className="text-slate-600 text-sm mt-1">{review.comment}</Text>
                      <Text className="text-slate-400 text-[10px] mt-2 italic">Project: {review.projectName}</Text>
                    </View>
                  ))
                ) : (
                  <View className="bg-white p-8 rounded-2xl border border-slate-100 items-center">
                    <Ionicons name="chatbubbles-outline" size={40} color="#94A3B8" />
                    <Text className="text-slate-600 font-semibold mt-3">No Reviews Yet</Text>
                    <Text className="text-slate-400 text-sm text-center mt-1">
                      Be the first to rate and review this engineer
                    </Text>
                    <TouchableOpacity
                      onPress={() => setActiveTab('rate')}
                      className="mt-4 bg-primary-600 px-6 py-2 rounded-full"
                    >
                      <Text className="text-white font-semibold text-sm">Write a Review</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Rate Tab */}
            {activeTab === 'rate' && (
              <View className="bg-white p-5 rounded-2xl border border-slate-100">
                <Text className="text-slate-800 font-bold text-lg text-center mb-4">
                  Rate {engineer.name}
                </Text>
                
                {/* Star Rating */}
                <View className="items-center mb-6">
                  <Text className="text-slate-500 text-sm mb-3">Your Rating</Text>
                  <View className="flex-row gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRatingValue(star)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={star <= ratingValue ? 'star' : 'star-outline'}
                          size={36}
                          color="#F59E0B"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  {ratingValue > 0 && (
                    <Text className="text-slate-600 text-sm mt-2">
                      You selected {ratingValue} star{ratingValue !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>

                {/* Review Comment */}
                <View className="mb-6">
                  <Text className="text-slate-500 text-sm mb-2">Your Review</Text>
                  <RNTextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Share your experience working with this engineer..."
                    multiline
                    numberOfLines={4}
                    className="border border-slate-200 rounded-xl p-3 text-slate-800 text-sm"
                    style={{ textAlignVertical: 'top', minHeight: 100 }}
                  />
                </View>

                {/* Project Selection (optional) */}
                <View className="mb-6">
                  <Text className="text-slate-500 text-sm mb-2">Project Name (Optional)</Text>
                  <RNTextInput
                    placeholder="e.g., Kigali Heights Construction"
                    className="border border-slate-200 rounded-xl p-3 text-slate-800 text-sm"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  className="bg-primary-600 py-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold text-base">Submit Review</Text>
                </TouchableOpacity>

                <Text className="text-slate-400 text-xs text-center mt-4">
                  Your review helps other clients make informed decisions
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default function EngineersTab({
  allEngineers,
  favoriteEngineers,
  colors,
  onToggleFavorite,
  onRateEngineer,
  onInviteEngineer,
}: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filtered = useMemo(() => {
    return allEngineers.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.specialty || '').toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Favorites' && favoriteEngineers.includes(e.id)) ||
        (e.specialty || '').toLowerCase().includes(activeFilter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [allEngineers, search, activeFilter, favoriteEngineers]);

  const handleOpenEngineer = (engineer: Engineer) => {
    setSelectedEngineer(engineer);
    setModalVisible(true);
  };

  const isFavorite = (id: string) => favoriteEngineers.includes(id);

  return (
    <>
      <View className="flex-1 px-5 pt-4 pb-6 bg-slate-50">
        {/* Screen Title + Description */}
        <View className="mb-5">
          <Text className={`${colors.text} text-2xl font-extrabold tracking-tight`}>
            Engineers
          </Text>
          <Text className={`${colors.textMuted} text-xs leading-relaxed mt-1`}>
            Browse RURA-licensed professionals for your project
          </Text>
        </View>

        {/* Normal Search Bar */}
        <View className="mb-4">
          <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput
              placeholder="Search by name or specialty..."
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94A3B8"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-4"
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  isActive
                    ? 'bg-primary-600 border-primary-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Results Count */}
        <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">
          {filtered.length} Engineer{filtered.length !== 1 ? 's' : ''} Available
        </Text>

        {/* Engineer Cards */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 30 }}
          className="flex-1"
        >
          {filtered.length === 0 ? (
            <View className="py-16 items-center justify-center">
              <View className="w-16 h-16 rounded-2xl bg-white items-center justify-center border border-slate-200">
                <Ionicons name="people-outline" size={30} color="#94A3B8" />
              </View>
              <Text className={`${colors.text} font-semibold mt-4`}>No Engineers Found</Text>
              <Text className={`${colors.textMuted} text-xs mt-1 text-center`}>
                Try adjusting your search or filter
              </Text>
            </View>
          ) : (
            filtered.map((eng) => {
              const isFav = favoriteEngineers.includes(eng.id);
              const rating = eng.rating ?? 4.8;
              const avgRating = eng.reviews && eng.reviews.length > 0
                ? eng.reviews.reduce((sum, r) => sum + r.rating, 0) / eng.reviews.length
                : rating;

              return (
                <TouchableOpacity
                  key={eng.id}
                  activeOpacity={0.9}
                  onPress={() => handleOpenEngineer(eng)}
                  className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm"
                >
                  {/* Top Row */}
                  <View className="flex-row items-start gap-3">
                    {/* Avatar */}
                    {eng.profilePic ? (
                      <Image
                        source={{ uri: eng.profilePic }}
                        className="w-14 h-14 rounded-xl border border-primary-500/10"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-xl bg-primary-600 items-center justify-center">
                        <Text className="text-white font-extrabold text-xl">{eng.name.charAt(0)}</Text>
                      </View>
                    )}

                    {/* Details */}
                    <View className="flex-1">
                      <Text className="text-slate-800 font-bold text-base tracking-tight">
                        {eng.name}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5">
                        {eng.specialty || 'Structural Engineering'}
                      </Text>
                      <Text className="text-slate-400 text-[10px] mt-0.5">
                        Lic: {eng.licenseNumber || 'RURA-ENG-4021'}
                      </Text>

                      {/* Rating Row */}
                      <View className="flex-row items-center gap-2 mt-1.5">
                        <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Ionicons name="star" size={10} color="#F59E0B" />
                          <Text className="text-amber-600 text-[10px] font-bold">{avgRating.toFixed(1)}</Text>
                        </View>
                        <View className="bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Text className="text-emerald-600 text-[9px] font-bold uppercase">
                            Licensed
                          </Text>
                        </View>
                        {eng.reviews && eng.reviews.length > 0 && (
                          <Text className="text-slate-400 text-[9px]">
                            ({eng.reviews.length} reviews)
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Favorite Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(eng.id);
                      }}
                      className="p-2 rounded-xl bg-slate-50"
                    >
                      <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFav ? '#E11D48' : '#94A3B8'}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Divider */}
                  <View className="h-px bg-slate-100 my-3" />

                  {/* Stats Row */}
                  <View className="flex-row justify-between items-center">
                    <View className="items-center">
                      <Text className="text-slate-800 font-extrabold text-sm">
                        {eng.completedProjects ?? 24}
                      </Text>
                      <Text className="text-slate-400 text-[9px] font-bold uppercase mt-0.5">
                        Projects
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-slate-800 font-extrabold text-sm">
                        {eng.yearsExperience ?? 8}y
                      </Text>
                      <Text className="text-slate-400 text-[9px] font-bold uppercase mt-0.5">
                        Experience
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-slate-800 font-extrabold text-sm">
                        {eng.district ?? 'Gasabo'}
                      </Text>
                      <Text className="text-slate-400 text-[9px] font-bold uppercase mt-0.5">
                        District
                      </Text>
                    </View>

                    {/* View Profile Button */}
                    <View className="bg-primary-600 px-4 py-2 rounded-xl flex-row items-center gap-1">
                      <Ionicons name="eye-outline" size={12} color="white" />
                      <Text className="text-white font-bold text-[11px]">View</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Engineer Detail Modal */}
      <EngineerDetailModal
        engineer={selectedEngineer}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onToggleFavorite={onToggleFavorite}
        isFavorite={selectedEngineer ? isFavorite(selectedEngineer.id) : false}
        colors={colors}
        onRateEngineer={onRateEngineer}
        onInvite={(id) => {
          setModalVisible(false);
          onInviteEngineer && onInviteEngineer(id);
        }}
      />
    </>
  );
}