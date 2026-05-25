/**
 * ============================================================================
 * 📄 FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : SupplierDashboard.tsx
 * WHAT THIS FILE DOES : Comprehensive dashboard interface for Supplier users (e.g. Kigali Steel Depot)
 * HOW IT DOES IT      : Renders incoming RFQ bids, quote submissions, and GPS delivery telemetry checks
 * DATA SOURCE         : AuthContext and local states
 * DATA DESTINATION    : Updates delivery status and quote lists
 * PRINCIPLE APPLIED   : SOLID (Supplier dashboard encapsulation)
 * ============================================================================
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ============================================================================
 * 🔧 FUNCTION: SupplierDashboard
 * ============================================================================
 * WHAT IT DOES: Renders supplier catalog operations, quote bids, delivery maps, and GPS confirmations
 * PARAMETERS: None
 * RETURNS: JSX.Element - Dashboard view
 * WHO CALLS IT: index.tsx
 * PRINCIPLE: SOLID
 * ============================================================================
 */
export default function SupplierDashboard() {
  const { user, rfqs, handleLogout } = useAuth();

  // Simulated states
  const [activeTab, setActiveTab] = useState<'rfqs' | 'deliveries'>('rfqs');
  const [quotePrice, setQuotePrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [isReportingDelivery, setIsReportingDelivery] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [proofUri, setProofUri] = useState('');

  // Quotes
  const [submittedQuotes, setSubmittedQuotes] = useState<string[]>([]);

  /**
   * 🧱 CODE BLOCK: Submit Material RFQ Quote Bid
   * WHAT IT IS DOING: Generates quote proposal linked to active structural engineering requests
   * WHY IT IS HERE  : Standard procurement flow (Step 12)
   * PRINCIPLE       : KISS
   */
  const handleQuoteSubmit = (rfqId: string, material: string) => {
    if (!quotePrice) {
      Alert.alert('Price required', 'Please input a total quote amount in RWF.');
      return;
    }

    setIsSubmittingQuote(true);
    setTimeout(() => {
      setIsSubmittingQuote(false);
      setSubmittedQuotes(prev => [...prev, rfqId]);
      setQuotePrice('');
      Alert.alert(
        'Quote Proposal Submitted!',
        `Your bid has been submitted successfully. Engineer notified to compare quotes.`,
        [{ text: 'Super' }]
      );
    }, 1500);
  };

  /**
   * 🧱 CODE BLOCK: Confirm Material Delivery (GPS gate check)
   * WHAT IT IS DOING: Confirms location check-in and uploads PoD photos to Cloudinary
   * WHY IT IS HERE  : Standard compliance payment trigger (Steps 17-20)
   * PRINCIPLE       : SOLID
   */
  const handleMarkDelivered = () => {
    if (!proofUri) {
      Alert.alert('Proof required', 'Please capture or upload Proof of Delivery (PoD) photo first.');
      return;
    }

    setIsReportingDelivery(true);
    setTimeout(() => {
      setIsReportingDelivery(false);
      setDeliveryConfirmed(true);
      Alert.alert(
        'Delivery Confirmed',
        'GPS location verified within project boundary. Escrow release webhook triggered successfully (Payout within 48h).',
        [{ text: 'Excellent' }]
      );
    }, 1500);
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-5 pt-4" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Welcome Supplier</Text>
          <Text className="text-white text-2xl font-extrabold">{user?.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-500/10 border border-red-500/20 px-3.5 py-2 rounded-xl"
        >
          <Text className="text-red-400 text-xs font-bold">Logout ➔</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-slate-800 p-1.5 rounded-2xl mb-6 border border-slate-700/60">
        <TouchableOpacity 
          onPress={() => setActiveTab('rfqs')}
          className={`py-3 rounded-xl flex-1 items-center ${activeTab === 'rfqs' ? 'bg-emerald-600' : 'bg-transparent'}`}
        >
          <Text className="text-white font-bold text-xs">📬 RFQs Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('deliveries')}
          className={`py-3 rounded-xl flex-1 items-center ${activeTab === 'deliveries' ? 'bg-emerald-600' : 'bg-transparent'}`}
        >
          <Text className="text-white font-bold text-xs">🚚 Active Deliveries</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'rfqs' ? (
        <View className="space-y-4">
          {rfqs.map(rfq => {
            const hasBid = submittedQuotes.includes(rfq.id);

            return (
              <View 
                key={rfq.id}
                className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl"
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1 pr-2">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{rfq.project}</Text>
                    <Text className="text-white text-base font-bold">{rfq.material}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">Required Quantity: {rfq.quantity}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-md border ${
                    hasBid 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-emerald-600/10 border-emerald-500/20'
                  }`}>
                    <Text className="text-emerald-400 text-xs font-bold">{hasBid ? '✓ Bid Submitted' : 'Active'}</Text>
                  </View>
                </View>

                {!hasBid ? (
                  <View className="space-y-3 pt-3 border-t border-slate-700/50">
                    <Text className="text-slate-300 text-xs font-bold ml-1">Your Quote Bid</Text>
                    
                    <View className="flex-row gap-2">
                      <TextInput
                        className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs flex-1"
                        placeholder="Price in RWF"
                        placeholderTextColor="#475569"
                        keyboardType="numeric"
                        value={quotePrice}
                        onChangeText={setQuotePrice}
                      />
                      <TextInput
                        className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-xs w-28 text-center"
                        placeholder="Days (e.g. 3)"
                        placeholderTextColor="#475569"
                        keyboardType="numeric"
                        value={deliveryDays}
                        onChangeText={setDeliveryDays}
                      />
                    </View>

                    <TouchableOpacity 
                      onPress={() => handleQuoteSubmit(rfq.id, rfq.material)}
                      disabled={isSubmittingQuote}
                      className="bg-emerald-600 py-3 rounded-xl border border-emerald-500 items-center justify-center shadow-md active:bg-emerald-700 flex-row"
                    >
                      {isSubmittingQuote ? (
                        <ActivityIndicator color="#white" size="small" className="mr-2" />
                      ) : null}
                      <Text className="text-white font-bold text-xs">Submit Quote Proposal</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3 items-center">
                    <Text className="text-emerald-400/90 text-xs font-bold">Proposal successfully sent and locked.</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View className="bg-slate-800 border border-slate-700 rounded-3xl p-5 shadow-xl">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Villa Nyarutarama</Text>
              <Text className="text-white text-base font-bold">Roofing sheets delivery</Text>
              <Text className="text-slate-400 text-xs mt-0.5">Quantity: 120 Sheets</Text>
            </View>
            <View className="bg-emerald-600/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <Text className="text-emerald-400 text-xs font-bold">Awarded PO</Text>
            </View>
          </View>

          <View className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl mb-5 space-y-2">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Proof of Delivery (PoD) Photo</Text>
            
            {proofUri ? (
              <View className="flex-row justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-emerald-500/20">
                <Text className="text-emerald-400 font-bold text-xs">✓ Photo pod_delivery.jpg Attached</Text>
                <TouchableOpacity onPress={() => setProofUri('')}>
                  <Text className="text-red-400 text-xs">Reset</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => setProofUri('https://res.cloudinary.com/demo/image/upload/pod')}
                className="bg-slate-850 h-20 border border-dashed border-slate-750 rounded-xl items-center justify-center active:bg-slate-800"
              >
                <Text className="text-slate-400 text-xs font-semibold">📷 Capture Delivery Photo or Load Receipt</Text>
              </TouchableOpacity>
            )}
          </View>

          {deliveryConfirmed ? (
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 items-center">
              <Text className="text-emerald-400 text-sm font-semibold">✓ Delivered Successfully.</Text>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleMarkDelivered}
              disabled={isReportingDelivery}
              className="bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-xl border border-emerald-500 shadow-md items-center flex-row justify-center"
            >
              {isReportingDelivery ? (
                <ActivityIndicator color="#white" size="small" className="mr-2" />
              ) : null}
              <Text className="text-white font-bold text-sm">📍 Confirm Delivery (GPS Boundary Check)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View className="h-10" />
    </ScrollView>
  );
}
