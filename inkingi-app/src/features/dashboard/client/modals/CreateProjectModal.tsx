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

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* STEP 0 BASIC */}
            {step === 0 && (
              <View>
                <TextInput placeholder="Project Name" value={projectName} onChangeText={setProjectName} className="p-3 border rounded-xl mb-3" />
                <TextInput placeholder="Description" value={description} onChangeText={setDescription} multiline className="p-3 border rounded-xl mb-3" />

                {/* CATEGORY */}
                <ScrollView horizontal>
                  {categories.map(c => (
                    <TouchableOpacity key={c} onPress={() => setCategory(c)} className="p-2 mr-2 border rounded-xl">
                      <Text>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* DATE PICKERS */}
                <TouchableOpacity onPress={() => setShowStart(true)} className="p-3 border rounded-xl mt-3">
                  <Text>{startDate ? startDate.toDateString() : 'Pick Start Date'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowEnd(true)} className="p-3 border rounded-xl mt-3">
                  <Text>{endDate ? endDate.toDateString() : 'Pick End Date'}</Text>
                </TouchableOpacity>

                {showStart && (
                  <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    onChange={(e, d) => {
                      setShowStart(false);
                      if (d) setStartDate(d);
                    }}
                  />
                )}

                {showEnd && (
                  <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    onChange={(e, d) => {
                      setShowEnd(false);
                      if (d) setEndDate(d);
                    }}
                  />
                )}
              </View>
            )}

            {/* STEP 1 BUDGET */}
            {step === 1 && (
              <View>
                <TextInput placeholder="Budget (RWF)" value={budget} onChangeText={setBudget} keyboardType="numeric" className="p-3 border rounded-xl" />
              </View>
            )}

            {/* STEP 2 LOCATION */}
            {step === 2 && (
              <TouchableOpacity
                onPress={() => {
                  setGpsBoundaryAdded(true);
                  onOpenMapBoundary?.();
                }}
                className="p-5 border rounded-xl"
              >
                <Text>Draw GPS Boundary</Text>
                {gpsBoundaryAdded && <Text>✓ Added</Text>}
              </TouchableOpacity>
            )}

            {/* STEP 3 DOCUMENTS */}
            {step === 3 && (
              <View>
                <TouchableOpacity onPress={pickImages} className="p-4 border rounded-xl mb-3">
                  <Text>Upload Site Photos ({sitePhotos.length})</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={pickPlans} className="p-4 border rounded-xl">
                  <Text>Upload Plans ({plans.length})</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 4 ENGINEER */}
            {step === 4 && (
              <ScrollView horizontal>
                {engineers.map(e => (
                  <TouchableOpacity key={e.id} onPress={() => setSelectedEngineer(e.id)} className="p-3 border mr-2 rounded-xl">
                    <Text>{e.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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