import React, { useState, useRef } from 'react';
import { Modal, TextInput, TouchableOpacity, View, Text, StyleSheet, Button, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_IP from '../../constants/apiConfig';

const stages = [
  'Seed', 'Bootstrap', 'Early Stage', 'Growth Stage', 'Late Stage'
];

interface Startup {
  id: string;
  name: string;
  funding_total_usd: number;
  funding_rounds: number;
  stage_of_business: string;
  team_size: number;
  revenue_usd: number;
  consumer_base: number;
  image: string | null;
}

interface EditStartupFormProps {
  visible: boolean;
  onClose: () => void;
  startup: Startup;
}

const EditStartupForm: React.FC<EditStartupFormProps> = ({ visible, onClose, startup }) => {
  const [name, setName] = useState(startup?.name || '');
  const [funding_total_usd, setFundingTotalUsd] = useState(startup?.funding_total_usd?.toString() || '0');
  const [funding_rounds, setFundingRounds] = useState(startup?.funding_rounds?.toString() || '0');
  const [stage_of_business, setStageOfBusiness] = useState(startup?.stage_of_business || '');
  const [team_size, setTeamSize] = useState(startup?.team_size?.toString() || '0');
  const [revenue_usd, setRevenueUsd] = useState(startup?.revenue_usd?.toString() || '0');
  const [consumer_base, setConsumerBase] = useState(startup?.consumer_base?.toString() || '0');
  const [showStageModal, setShowStageModal] = useState(false);

  // Add refs for each input field
  const nameRef = useRef<TextInput>(null);
  const fundingTotalRef = useRef<TextInput>(null);
  const fundingRoundsRef = useRef<TextInput>(null);
  const teamSizeRef = useRef<TextInput>(null);
  const revenueRef = useRef<TextInput>(null);
  const consumerBaseRef = useRef<TextInput>(null);

  const handleStageSelection = (stage: string) => {
    setStageOfBusiness(stage);
    setShowStageModal(false);
  };

  const handleSubmit = async () => {
    if (!startup?.id) {
      console.error('Startup ID is missing');
      return;
    }

    const updatedStartup = {
      ...startup,
      name: name || '',
      funding_total_usd: Number(funding_total_usd) || 0,
      funding_rounds: Number(funding_rounds) || 0,
      stage_of_business: stage_of_business || '',
      team_size: Number(team_size) || 0,
      revenue_usd: Number(revenue_usd) || 0,
      consumer_base: Number(consumer_base) || 0,
    };

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        console.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_IP}/api/startups/${startup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedStartup),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Startup updated:', data);
        onClose();  // Close the form on successful update
      } else {
        const errorText = await response.text();
        console.error('Failed to update startup:', errorText);
      }
    } catch (error) {
      console.error('Error during update:', error);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard}>
            <View style={styles.modalBackground}>
              <ScrollView 
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.title}>Edit Startup</Text>

                  <TextInput
                    ref={nameRef}
                    placeholder="Startup Name"
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setTimeout(() => {
                        fundingTotalRef.current?.focus();
                      }, 0);
                    }}
                  />
                  <TextInput
                    ref={fundingTotalRef}
                    placeholder="Total Funding"
                    value={funding_total_usd}
                    onChangeText={setFundingTotalUsd}
                    keyboardType="numbers-and-punctuation"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setTimeout(() => {
                        fundingRoundsRef.current?.focus();
                      }, 0);
                    }}
                  />
                  <TextInput
                    ref={fundingRoundsRef}
                    placeholder="Funding Rounds"
                    value={funding_rounds}
                    onChangeText={setFundingRounds}
                    keyboardType="numbers-and-punctuation"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setTimeout(() => {
                        teamSizeRef.current?.focus();
                      }, 0);
                    }}
                  />
                  
                  {/* Stage of Business Dropdown */}
                  <TouchableOpacity onPress={() => {
                    dismissKeyboard();
                    setShowStageModal(true);
                  }} style={styles.dropdown}>
                    <Text style={styles.dropdownText}>Stage of Business</Text>
                    <Text style={styles.selectedItemsText}>{stage_of_business || 'Select Stage'}</Text>
                  </TouchableOpacity>

                  {/* Stage Modal */}
                  {showStageModal && (
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalContent}>
                        <Text style={styles.title}>Select Stage of Business</Text>
                        {stages.map(stage => (
                          <TouchableOpacity
                            key={stage}
                            style={styles.optionButton}
                            onPress={() => handleStageSelection(stage)}
                          >
                            <Text style={[styles.optionText, stage_of_business === stage && styles.optionTextSelected]}>
                              {stage}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        <Button title="Close" onPress={() => setShowStageModal(false)} color="#FF6347" />
                      </View>
                    </View>
                  )}

                  <TextInput
                    ref={teamSizeRef}
                    placeholder="Team Size"
                    value={team_size}
                    onChangeText={setTeamSize}
                    keyboardType="numbers-and-punctuation"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setTimeout(() => {
                        revenueRef.current?.focus();
                      }, 0);
                    }}
                  />
                  <TextInput
                    ref={revenueRef}
                    placeholder="Revenue in USD"
                    value={revenue_usd}
                    onChangeText={setRevenueUsd}
                    keyboardType="numbers-and-punctuation"
                    style={styles.input}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setTimeout(() => {
                        consumerBaseRef.current?.focus();
                      }, 0);
                    }}
                  />
                  <TextInput
                    ref={consumerBaseRef}
                    placeholder="Consumer Base"
                    value={consumer_base}
                    onChangeText={setConsumerBase}
                    keyboardType="numbers-and-punctuation"
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={dismissKeyboard}
                  />

                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.roundButton} onPress={handleSubmit}>
                      <Text style={styles.buttonText}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton} onPress={onClose}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    maxHeight: '90%',
    zIndex: 2,
    alignSelf: 'center',
    marginVertical: 20,
  },
  title: {
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#FFFFFF',
    backgroundColor: '#333333',
    fontSize: 16,
    paddingHorizontal: 15,
    width: '100%',
    zIndex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#1DB954',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#333333',
    zIndex: 2,
    width: '100%',
  },
  dropdownText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  selectedItemsText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
  },
  optionButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    width: '100%',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    zIndex: 1,
    width: '100%',
  },
  roundButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: '#1DB954',
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditStartupForm;
