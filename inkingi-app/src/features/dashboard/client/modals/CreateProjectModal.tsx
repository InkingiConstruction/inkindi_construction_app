/**
 * FILE NAME   : CreateProjectModal.tsx
 * WHAT THIS FILE DOES :
 * Full enterprise-grade project creation workflow modal with:
 * - Basic info
 * - Budget setup
 * - GPS boundary section
 * - Cloudinary upload sections
 * - Engineer assignment
 * - Validation-ready structure
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { DashColors } from '../utils/colors';

interface Props {
  visible: boolean;
  engineers: any[];
  colors: DashColors;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onOpenMapBoundary?: () => void;
  projectToEdit?: any;
}

/* ===================== STEPS ===================== */
const STEPS = ['Basic Info', 'Budget', 'Location', 'Documents', 'Engineer'];

export default function CreateProjectModal({
  visible,
  engineers,
  colors,
  onClose,
  onSubmit,
  onOpenMapBoundary,
  projectToEdit,
}: Props) {
  const [step, setStep] = useState(0);

  /* ===================== BASIC INFO ===================== */
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Residential');

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  /* ===================== BUDGET ===================== */
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('RWF');

  /* ===================== LOCATION ===================== */
  const [gpsBoundaryAdded, setGpsBoundaryAdded] = useState(false);

  /* ===================== FILES ===================== */
  const [sitePhotos, setSitePhotos] = useState<string[]>([]);
  const [plans, setPlans] = useState<string[]>([]);

  /* ===================== ENGINEER ===================== */
  const [selectedEngineer, setSelectedEngineer] = useState('');

  React.useEffect(() => {
    if (projectToEdit) {
      setProjectName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
      setCategory(projectToEdit.category || 'Residential');
      setStartDate(projectToEdit.startDate ? new Date(projectToEdit.startDate) : null);
      setEndDate(projectToEdit.endDate ? new Date(projectToEdit.endDate) : null);
      setBudget(String(projectToEdit.budget || ''));
      setCurrency(projectToEdit.currency || 'RWF');
      setGpsBoundaryAdded(true);
      setSelectedEngineer(projectToEdit.engineerId || '');
      if (projectToEdit.documents) {
        const docPhotos = projectToEdit.documents.filter((d: any) => d.type === 'photo').map((d: any) => d.name);
        const docPlans = projectToEdit.documents.filter((d: any) => d.type === 'document').map((d: any) => d.name);
        setSitePhotos(docPhotos.length > 0 ? docPhotos : ['site_photo_1.jpg', 'site_photo_2.jpg', 'site_photo_3.jpg']);
        setPlans(docPlans);
      } else {
        setSitePhotos(['site_photo_1.jpg', 'site_photo_2.jpg', 'site_photo_3.jpg']);
        setPlans([]);
      }
    } else {
      setStep(0);
      setProjectName('');
      setDescription('');
      setCategory('Residential');
      setStartDate(null);
      setEndDate(null);
      setBudget('');
      setCurrency('RWF');
      setSitePhotos([]);
      setPlans([]);
      setSelectedEngineer('');
      setGpsBoundaryAdded(false);
    }
  }, [projectToEdit, visible]);

  const categories = ['Residential', 'Commercial', 'Industrial', 'Infrastructure'];

  /* ===================================================== */
  /* VALIDATION PER STEP */
  /* ===================================================== */
  const validateStep = () => {
    switch (step) {
      case 0:
        if (!projectName || !description || !startDate || !endDate) {
          Alert.alert('Missing fields', 'Complete all basic info fields');
          return false;
        }
        return true;

      case 1:
        if (!budget) {
          Alert.alert('Missing budget', 'Enter project budget');
          return false;
        }
        return true;

      case 2:
        if (!gpsBoundaryAdded) {
          Alert.alert('Missing location', 'Draw GPS boundary');
          return false;
        }
        return true;

      case 3:
        if (sitePhotos.length < 3) {
          Alert.alert('Photos required', 'Upload at least 3 site photos');
          return false;
        }
        return true;

      case 4:
        if (!selectedEngineer) {
          Alert.alert('Engineer required', 'Select a licensed engineer');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  /* ===================================================== */
  /* FILE PICKERS */
  /* ===================================================== */

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setSitePhotos(prev => [...prev, ...uris]);
    }
  };

  const pickPlans = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf'],
      multiple: true,
    });

    if (result.assets) {
      const files = result.assets.map(f => f.name);
      setPlans(prev => [...prev, ...files]);
    }
  };

  /* ===================================================== */
  /* NAVIGATION */
  /* ===================================================== */

  const next = () => {
    if (!validateStep()) return;
    setStep(prev => prev + 1);
  };

  const back = () => setStep(prev => prev - 1);

  /* ===================================================== */
  /* SUBMIT */
  /* ===================================================== */

  const handleSubmit = () => {
    if (!validateStep()) return;

    onSubmit({
      projectName,
      description,
      category,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      budget: Number(budget),
      currency,
      engineerId: selectedEngineer,
      sitePhotos,
      plans,
      gpsBoundary: true,
      status: 'draft',
    });

    // RESET
    setStep(0);
    setProjectName('');
    setDescription('');
    setBudget('');
    setSitePhotos([]);
    setPlans([]);
    setSelectedEngineer('');
    setGpsBoundaryAdded(false);

    onClose();
  };

  /* ===================================================== */
  /* UI */
  /* ===================================================== */

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className={`rounded-t-[32px] p-5 ${colors.card}`} style={{ maxHeight: '95%' }}>

          {/* HEADER */}
          <View className="flex-row justify-between mb-4">
            <Text className={`${colors.text} font-bold text-lg`}>
              Step {step + 1} / {STEPS.length} — {STEPS[step]}
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>

          {/* ================= STEP CONTENT ================= */}

          <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingBottom: 40,
  }}
>

  {/* ====================================================== */}
  {/* STEP 0 — BASIC INFORMATION */}
  {/* ====================================================== */}

  {step === 0 && (
    <View>

      {/* SECTION HEADER */}
      <View className="mb-6">
        <Text className={`${colors.text} text-xl font-extrabold`}>
          Basic Information
        </Text>

        <Text className={`${colors.textMuted} text-sm mt-1`}>
          Configure the core details of your construction project.
        </Text>
      </View>

      {/* PROJECT NAME */}
      <View className="mb-5">

        <Text className={`${colors.text} text-sm font-bold mb-2`}>
          Project Name *
        </Text>

        <View className={`border rounded-2xl px-4 py-4 flex-row items-center ${colors.inputBg}`}>
          <Ionicons
            name="business-outline"
            size={18}
            color="#64748b"
          />

          <TextInput
            value={projectName}
            onChangeText={setProjectName}
            placeholder="Kimironko Smart Residence"
            placeholderTextColor="#94a3b8"
            className={`flex-1 ml-3 text-sm ${colors.text}`}
          />
        </View>

      </View>

      {/* PROJECT DESCRIPTION */}
      <View className="mb-5">

        <Text className={`${colors.text} text-sm font-bold mb-2`}>
          Project Description *
        </Text>

        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          placeholder="Describe the construction project scope, objectives, timelines, and expectations..."
          placeholderTextColor="#94a3b8"
          className={`border rounded-2xl px-4 py-4 min-h-[140px] text-sm ${colors.inputBg} ${colors.text}`}
        />

      </View>

      {/* PROJECT CATEGORY */}
      <View className="mb-6">

        <Text className={`${colors.text} text-sm font-bold mb-3`}>
          Project Category *
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((c) => {
            const active = category === c;

            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                activeOpacity={0.9}
                className={`mr-3 px-5 py-3 rounded-2xl border ${
                  active
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    active
                      ? 'text-white'
                      : colors.text
                  }`}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

      </View>

      {/* DATES */}
      <View className="flex-row gap-4">

        {/* START DATE */}
        <View className="flex-1">

          <Text className={`${colors.text} text-sm font-bold mb-2`}>
            Start Date *
          </Text>

          <TouchableOpacity
            onPress={() => setShowStart(true)}
            activeOpacity={0.8}
            className={`border rounded-2xl px-4 py-4 flex-row items-center justify-between ${colors.inputBg}`}
          >

            <View className="flex-row items-center flex-1">

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#64748b"
              />

              <Text
                className={`ml-3 text-sm ${
                  startDate
                    ? colors.text
                    : 'text-slate-400'
                }`}
                numberOfLines={1}
              >
                {startDate
                  ? startDate.toDateString()
                  : 'Select date'}
              </Text>

            </View>

          </TouchableOpacity>

        </View>

        {/* END DATE */}
        <View className="flex-1">

          <Text className={`${colors.text} text-sm font-bold mb-2`}>
            End Date *
          </Text>

          <TouchableOpacity
            onPress={() => setShowEnd(true)}
            activeOpacity={0.8}
            className={`border rounded-2xl px-4 py-4 flex-row items-center justify-between ${colors.inputBg}`}
          >

            <View className="flex-row items-center flex-1">

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#64748b"
              />

              <Text
                className={`ml-3 text-sm ${
                  endDate
                    ? colors.text
                    : 'text-slate-400'
                }`}
                numberOfLines={1}
              >
                {endDate
                  ? endDate.toDateString()
                  : 'Select date'}
              </Text>

            </View>

          </TouchableOpacity>

        </View>

      </View>

      {/* START DATE PICKER */}
      {showStart && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowStart(false);

            if (selectedDate) {
              setStartDate(selectedDate);
            }
          }}
        />
      )}

      {/* END DATE PICKER */}
      {showEnd && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          minimumDate={startDate || new Date()}
          onChange={(event, selectedDate) => {
            setShowEnd(false);

            if (selectedDate) {
              setEndDate(selectedDate);
            }
          }}
        />
      )}

    </View>
  )}

  {/* ====================================================== */}
  {/* STEP 1 — BUDGET */}
  {/* ====================================================== */}

  {step === 1 && (
    <View>

      <View className="mb-6">
        <Text className={`${colors.text} text-xl font-extrabold`}>
          Budget Configuration
        </Text>

        <Text className={`${colors.textMuted} text-sm mt-1`}>
          Define the total secured escrow project budget.
        </Text>
      </View>

      {/* BUDGET */}
      <View className="mb-5">

        <Text className={`${colors.text} text-sm font-bold mb-2`}>
          Total Budget *
        </Text>

        <View className={`border rounded-2xl px-4 py-4 flex-row items-center ${colors.inputBg}`}>

          <Ionicons
            name="wallet-outline"
            size={18}
            color="#64748b"
          />

          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            placeholder="15,000,000"
            placeholderTextColor="#94a3b8"
            className={`flex-1 ml-3 text-sm ${colors.text}`}
          />

        </View>

      </View>

      {/* CURRENCY */}
      <View>

        <Text className={`${colors.text} text-sm font-bold mb-3`}>
          Currency
        </Text>

        <View className="flex-row">

          {['RWF', 'USD'].map((curr) => {
            const active = currency === curr;

            return (
              <TouchableOpacity
                key={curr}
                onPress={() => setCurrency(curr)}
                className={`flex-1 py-4 rounded-2xl border items-center mr-3 ${
                  active
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <Text
                  className={`font-bold ${
                    active
                      ? 'text-white'
                      : colors.text
                  }`}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            );
          })}

        </View>

      </View>

    </View>
  )}

  {/* ====================================================== */}
  {/* STEP 2 — LOCATION */}
  {/* ====================================================== */}

  {step === 2 && (
    <View>

      <View className="mb-6">
        <Text className={`${colors.text} text-xl font-extrabold`}>
          Site Location
        </Text>

        <Text className={`${colors.textMuted} text-sm mt-1`}>
          Draw the legal GPS construction perimeter on the map.
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setGpsBoundaryAdded(true);
          onOpenMapBoundary?.();
        }}
        className="border border-primary-500/20 bg-primary-500/5 rounded-3xl p-5"
      >

        <View className="flex-row items-center justify-between">

          <View className="flex-row items-center flex-1">

            <View className="w-14 h-14 rounded-2xl bg-primary-500/10 items-center justify-center">
              <Ionicons
                name="map-outline"
                size={24}
                color="#14b8a6"
              />
            </View>

            <View className="ml-4 flex-1">
              <Text className={`${colors.text} font-bold text-base`}>
                Draw GPS Boundary
              </Text>

              <Text className={`${colors.textMuted} text-xs mt-1`}>
                Use Google Maps to mark the exact property polygon.
              </Text>
            </View>

          </View>

          {gpsBoundaryAdded && (
            <Ionicons
              name="checkmark-circle"
              size={26}
              color="#10b981"
            />
          )}

        </View>

      </TouchableOpacity>

    </View>
  )}

  {/* ====================================================== */}
  {/* STEP 3 — DOCUMENTS */}
  {/* ====================================================== */}

  {step === 3 && (
    <View>

      <View className="mb-6">
        <Text className={`${colors.text} text-xl font-extrabold`}>
          Site Documents
        </Text>

        <Text className={`${colors.textMuted} text-sm mt-1`}>
          Upload site photos and construction plans.
        </Text>
      </View>

      {/* SITE PHOTOS */}
      <TouchableOpacity
        onPress={pickImages}
        activeOpacity={0.9}
        className="border border-dashed border-primary-500/30 rounded-3xl p-5 mb-5"
      >

        <View className="flex-row items-center">

          <View className="w-14 h-14 rounded-2xl bg-primary-500/10 items-center justify-center">
            <Ionicons
              name="images-outline"
              size={24}
              color="#14b8a6"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className={`${colors.text} font-bold text-base`}>
              Upload Site Photos
            </Text>

            <Text className={`${colors.textMuted} text-xs mt-1`}>
              Minimum 3 high quality construction site images.
            </Text>
          </View>

          <Text className="text-emerald-500 font-bold text-xs">
            {sitePhotos.length} Files
          </Text>

        </View>

      </TouchableOpacity>

      {/* PLANS */}
      <TouchableOpacity
        onPress={pickPlans}
        activeOpacity={0.9}
        className="border border-dashed border-primary-500/30 rounded-3xl p-5"
      >

        <View className="flex-row items-center">

          <View className="w-14 h-14 rounded-2xl bg-primary-500/10 items-center justify-center">
            <Ionicons
              name="document-text-outline"
              size={24}
              color="#14b8a6"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className={`${colors.text} font-bold text-base`}>
              Upload Architectural Plans
            </Text>

            <Text className={`${colors.textMuted} text-xs mt-1`}>
              PDF or DWG architectural documentation.
            </Text>
          </View>

          <Text className="text-emerald-500 font-bold text-xs">
            {plans.length} Files
          </Text>

        </View>

      </TouchableOpacity>

    </View>
  )}

  {/* ====================================================== */}
  {/* STEP 4 — ENGINEER */}
  {/* ====================================================== */}

  {step === 4 && (
    <View>

      <View className="mb-6">
        <Text className={`${colors.text} text-xl font-extrabold`}>
          Assign Engineer
        </Text>

        <Text className={`${colors.textMuted} text-sm mt-1`}>
          Select a certified engineer for this construction project.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >

        {engineers.map((e) => {
          const active = selectedEngineer === e.id;

          return (
            <TouchableOpacity
              key={e.id}
              onPress={() => setSelectedEngineer(e.id)}
              activeOpacity={0.9}
              className={`w-[150px] rounded-3xl p-4 mr-4 border items-center ${
                active
                  ? 'bg-primary-500/10 border-primary-500'
                  : 'border-slate-300 dark:border-slate-700'
              }`}
            >

              <Image
                source={{ uri: e.profilePic }}
                className="w-16 h-16 rounded-full"
              />

              <Text
                numberOfLines={1}
                className={`${colors.text} font-bold text-sm mt-3`}
              >
                {e.name}
              </Text>

              <Text
                numberOfLines={1}
                className="text-slate-400 text-[10px] mt-1"
              >
                {e.licenseNumber}
              </Text>

              {active && (
                <View className="mt-3 bg-primary-500 px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold">
                    Selected
                  </Text>
                </View>
              )}

            </TouchableOpacity>
          );
        })}

      </ScrollView>

    </View>
  )}

</ScrollView>

          {/* ================= NAVIGATION ================= */}

          <View className="flex-row justify-between mt-5">
            {step > 0 && (
              <TouchableOpacity onPress={back} className="p-3 border rounded-xl">
                <Text>Back</Text>
              </TouchableOpacity>
            )}

            {step < STEPS.length - 1 ? (
              <TouchableOpacity onPress={next} className="p-3 bg-primary-500 rounded-xl">
                <Text className="text-white">Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleSubmit} className="p-3 bg-green-600 rounded-xl">
                <Text className="text-white">Create Project</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
} 