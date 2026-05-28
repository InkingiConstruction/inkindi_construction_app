/**
 * FILE NAME   : EngineersTab.tsx
 * WHAT THIS FILE DOES : Premium search-driven Engineer Directory with filter chips,
 *                       rich profile cards, rating badges, and favourites management.
 */
import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  allEngineers: any[];
  favoriteEngineers: string[];
  colors: DashColors;
  onToggleFavorite: (id: string) => void;
}

const FILTER_OPTIONS = ['All', 'Favorites', 'Structural', 'Electrical', 'Plumbing'];

export default function EngineersTab({
  allEngineers,
  favoriteEngineers,
  colors,
  onToggleFavorite,
}: Props) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(() => {
    return allEngineers.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Favorites' && favoriteEngineers.includes(e.id)) ||
        (e.specialty || '').toLowerCase().includes(activeFilter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [allEngineers, search, activeFilter, favoriteEngineers]);

  return (
    <View className="flex-1 space-y-5 pb-6">
      {/* Screen Title + Description */}
      <View className="space-y-1">
        <Text className={`${colors.text} text-2xl font-extrabold tracking-tight`}>Engineer Directory</Text>
        <Text className={`${colors.textMuted} text-xs leading-relaxed`}>
          Browse and assign Rwanda Utilities Regulatory Authority (RURA) licensed engineers to your build.
        </Text>
      </View>

      {/* Search + Filter Row */}
      <View className="space-y-3">
        {/* Search Input */}
        <View className={`flex-row items-center gap-3 px-4 py-3 rounded-xl border ${colors.inputBg}`}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput
            placeholder="Search engineers by name..."
            value={search}
            onChangeText={setSearch}
            className={`flex-1 text-sm ${colors.text}`}
            placeholderTextColor="#94a3b8"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} className="active:opacity-70">
              <Ionicons name="close-circle" size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            className={`ml-1 p-1.5 rounded-lg ${colors.card} border border-slate-100 dark:border-slate-800`}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={14} color="#007E6E" />
          </TouchableOpacity>
        </View>

        {/* Specialty Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-0.5">
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`mr-2 px-3.5 py-1.5 rounded-full border ${
                  isActive
                    ? 'bg-primary-600 border-primary-600'
                    : `${colors.card} border-slate-100 dark:border-slate-800`
                }`}
              >
                <Text className={`text-xs font-bold ${isActive ? 'text-white' : colors.textMuted}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Count */}
      <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>
        {filtered.length} Engineer{filtered.length !== 1 ? 's' : ''} Found
      </Text>

      {/* Engineer Cards */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {filtered.length === 0 ? (
          <View className="py-16 items-center justify-center">
            <View className={`w-16 h-16 rounded-2xl items-center justify-center ${colors.card}`}>
              <Ionicons name="people-outline" size={30} color="#94a3b8" />
            </View>
            <Text className={`${colors.text} font-semibold mt-4`}>No Engineers Found</Text>
            <Text className={`${colors.textMuted} text-xs mt-1 text-center`}>
              Try adjusting your search term or filter selection.
            </Text>
          </View>
        ) : (
          filtered.map((eng) => {
            const isFav = favoriteEngineers.includes(eng.id);
            const rating = eng.rating ?? 4.8;
            const specialty = eng.specialty ?? 'Structural Engineering';
            const projects = eng.completedProjects ?? 24;

            return (
              <View key={eng.id} className={`p-4 rounded-2xl border ${colors.card} mb-3`}>
                {/* Top Row: Avatar + Info + Fav */}
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
                  <View className="flex-1 space-y-1">
                    <Text className={`${colors.text} font-bold text-sm tracking-tight`}>{eng.name}</Text>
                    <Text className={`${colors.textMuted} text-[11px]`}>{specialty}</Text>
                    <Text className={`${colors.textMuted} text-[10px]`}>Lic: {eng.licenseNumber || 'RURA-ENG-4021'}</Text>

                    {/* Rating + Status Row */}
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <View className="flex-row items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Ionicons name="star" size={10} color="#f59e0b" />
                        <Text className="text-amber-500 text-[10px] font-bold">{rating}</Text>
                      </View>
                      <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Text className="text-emerald-500 text-[10px] font-extrabold uppercase tracking-wider">
                          Licensed
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Favorite Toggle */}
                  <TouchableOpacity
                    onPress={() => onToggleFavorite(eng.id)}
                    className={`p-2 rounded-xl active:opacity-70 ${
                      isFav ? 'bg-rose-500/10' : colors.card
                    }`}
                  >
                    <Ionicons
                      name={isFav ? 'heart' : 'heart-outline'}
                      size={20}
                      color={isFav ? '#e11d48' : '#94a3b8'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="h-px bg-slate-100 dark:bg-slate-800/60 my-3" />

                {/* Stats Row */}
                <View className="flex-row justify-between items-center">
                  <View className="items-center">
                    <Text className={`${colors.text} font-extrabold text-sm`}>{projects}</Text>
                    <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider mt-0.5`}>Projects</Text>
                  </View>
                  <View className="items-center">
                    <Text className={`${colors.text} font-extrabold text-sm`}>
                      {eng.yearsExperience ?? 8}y
                    </Text>
                    <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider mt-0.5`}>Experience</Text>
                  </View>
                  <View className="items-center">
                    <Text className={`${colors.text} font-extrabold text-sm`}>
                      {eng.district ?? 'Gasabo'}
                    </Text>
                    <Text className={`${colors.textMuted} text-[9px] font-bold uppercase tracking-wider mt-0.5`}>District</Text>
                  </View>

                  {/* Hire CTA */}
                  <TouchableOpacity className="bg-primary-600 active:bg-primary-700 px-4 py-2 rounded-xl flex-row items-center gap-1.5 shadow-md shadow-primary-500/10">
                    <Ionicons name="add-circle-outline" size={12} color="white" />
                    <Text className="text-white font-bold text-[11px]">Hire</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
