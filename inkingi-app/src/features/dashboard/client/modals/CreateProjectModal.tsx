/**
 * FILE NAME   : CreateProjectModal.tsx
 * WHAT THIS FILE DOES : Modal for creating a new custom construction project,
 *                       setting budget, and choosing a certified engineer.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DashColors } from '../utils/colors';

interface Props {
  visible: boolean;
  engineers: any[];
  colors: DashColors;
  onClose: () => void;
  onSubmit: (name: string, location: string, budget: number, engineerId: string) => void;
}

export default function CreateProjectModal({
  visible,
  engineers,
  colors,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedEngId, setSelectedEngId] = useState('');

  const handleSubmit = () => {
    if (!name || !location || !budget || !selectedEngId) {
      alert('Please fill out all fields.');
      return;
    }
    onSubmit(name, location, parseInt(budget), selectedEngId);
    setName('');
    setLocation('');
    setBudget('');
    setSelectedEngId('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className={`border-t rounded-t-[32px] p-6 space-y-6 ${colors.card}`} style={{ maxHeight: '85%' }}>
          {/* Header */}
          <View className="flex-row justify-between items-center pb-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="construct" size={20} color="#007E6E" />
              <Text className={`${colors.text} text-lg font-bold tracking-tight`}>Create Escrow Contract</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <Ionicons name="close" size={20} color={colors.text === 'text-white' ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="space-y-4 pr-1" showsVerticalScrollIndicator={false}>
            {/* Project Name */}
            <View className="space-y-1">
              <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Project Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="E.g., Kimironko Residential Villa"
                className={`rounded-2xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Location */}
            <View className="space-y-1">
              <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Location</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="E.g., Gasabo, Kigali"
                className={`rounded-2xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Budget */}
            <View className="space-y-1">
              <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Escrow Budget (RWF)</Text>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                placeholder="E.g., 15000000"
                keyboardType="numeric"
                className={`rounded-2xl px-4 py-3 border text-sm ${colors.inputBg} ${colors.text}`}
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Choose Engineer */}
            <View className="space-y-2">
              <Text className={`${colors.textMuted} text-[10px] font-bold uppercase tracking-wider`}>Assign Licensed Engineer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                {engineers.map((eng) => {
                  const isSelected = selectedEngId === eng.id;
                  return (
                    <TouchableOpacity
                      key={eng.id}
                      onPress={() => setSelectedEngId(eng.id)}
                      className={`p-3 rounded-2xl border mr-3 items-center space-y-2 ${
                        isSelected ? 'bg-primary-500/10 border-primary-500' : colors.card
                      }`}
                      style={{ width: 100 }}
                    >
                      <Image source={{ uri: eng.profilePic }} className="w-10 h-10 rounded-full" />
                      <Text className={`${colors.text} text-[10px] font-bold text-center`} numberOfLines={1}>
                        {eng.name.split(' ')[0]}
                      </Text>
                      <Text className="text-slate-400 text-[8px]" numberOfLines={1}>{eng.licenseNumber.split('-')[1]}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleSubmit}
              className="bg-primary-600 active:bg-primary-700 py-4 rounded-2xl items-center shadow-lg shadow-primary-500/10 flex-row justify-center gap-2 mt-4"
            >
              <Ionicons name="shield-checkmark" size={18} color="white" />
              <Text className="text-white font-bold text-base">Lock Escrow & Deploy</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
